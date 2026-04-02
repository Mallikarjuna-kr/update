const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'eldercare_secret_2024';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// In-memory storage
let users = [];
let reminders = [];
let healthLogs = [];
let chatHistory = [];
let emergencyAlerts = [];
let tasks = [];

// Multer setup
const upload = multer({ 
  storage: multer.memoryStorage(), 
  limits: { fileSize: 10 * 1024 * 1024 } 
});

// Auth middleware
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Helper function to call Anthropic API
function callAnthropic(body, callback) {
  const data = JSON.stringify(body);
  const options = {
    hostname: 'api.anthropic.com',
    path: '/v1/messages',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  const req = https.request(options, (res) => {
    let responseData = '';
    res.on('data', (chunk) => { responseData += chunk; });
    res.on('end', () => {
      try {
        callback(null, JSON.parse(responseData));
      } catch (e) {
        callback(e, null);
      }
    });
  });

  req.on('error', (e) => callback(e, null));
  req.write(data);
  req.end();
}

// ─── AUTH ROUTES ─────────────────────────────────────────────────────────────

app.post('/api/signup', async (req, res) => {
  try {
    const { name, dob, age, email, password, language, healthConditions, familyContacts } = req.body;
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = {
      id: Date.now().toString(),
      name, dob, age, email, language,
      password: hashed,
      healthConditions: healthConditions || '',
      familyContacts: familyContacts || [],
      bp: '120/80',
      steps: 0,
      createdAt: new Date().toISOString()
    };
    users.push(user);
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: 'Signup failed' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (!user) return res.status(400).json({ error: 'User not found' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid password' });
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/me', authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password: _, ...safeUser } = user;
  res.json(safeUser);
});

app.put('/api/me', authMiddleware, (req, res) => {
  const idx = users.findIndex(u => u.id === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  const { password: _, ...updates } = req.body;
  users[idx] = { ...users[idx], ...updates };
  const { password: __, ...safeUser } = users[idx];
  res.json(safeUser);
});

// ─── HEALTH ROUTES ────────────────────────────────────────────────────────────

app.post('/api/health/log', authMiddleware, (req, res) => {
  const log = { 
    id: Date.now().toString(), 
    userId: req.user.id, 
    ...req.body, 
    timestamp: new Date().toISOString() 
  };
  healthLogs.push(log);
  const idx = users.findIndex(u => u.id === req.user.id);
  if (idx !== -1) {
    if (req.body.bp) users[idx].bp = req.body.bp;
    if (req.body.steps !== undefined) users[idx].steps = req.body.steps;
  }
  res.json(log);
});

app.get('/api/health/logs', authMiddleware, (req, res) => {
  const logs = healthLogs.filter(l => l.userId === req.user.id).slice(-30);
  res.json(logs);
});

// ─── REMINDERS ────────────────────────────────────────────────────────────────

app.get('/api/reminders', authMiddleware, (req, res) => {
  res.json(reminders.filter(r => r.userId === req.user.id));
});

app.post('/api/reminders', authMiddleware, (req, res) => {
  const reminder = { 
    id: Date.now().toString(), 
    userId: req.user.id, 
    ...req.body, 
    createdAt: new Date().toISOString() 
  };
  reminders.push(reminder);
  res.json(reminder);
});

app.put('/api/reminders/:id', authMiddleware, (req, res) => {
  const idx = reminders.findIndex(r => r.id === req.params.id && r.userId === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  reminders[idx] = { ...reminders[idx], ...req.body };
  res.json(reminders[idx]);
});

app.delete('/api/reminders/:id', authMiddleware, (req, res) => {
  reminders = reminders.filter(r => !(r.id === req.params.id && r.userId === req.user.id));
  res.json({ success: true });
});

// ─── TASKS ────────────────────────────────────────────────────────────────────

app.get('/api/tasks', authMiddleware, (req, res) => {
  const today = new Date().toDateString();
  let userTasks = tasks.filter(t => t.userId === req.user.id && new Date(t.date).toDateString() === today);
  if (userTasks.length === 0) {
    const defaults = [
      { title: 'Take morning medication', category: 'medication', completed: false },
      { title: 'Morning walk (30 mins)', category: 'exercise', completed: false },
      { title: 'Drink 8 glasses of water', category: 'hydration', completed: false },
      { title: 'Take BP reading', category: 'health', completed: false },
      { title: 'Call family member', category: 'social', completed: false },
    ];
    userTasks = defaults.map(t => ({ 
      id: Date.now().toString() + Math.random(), 
      userId: req.user.id, 
      date: new Date().toISOString(), 
      ...t 
    }));
    tasks.push(...userTasks);
  }
  res.json(userTasks);
});

app.put('/api/tasks/:id', authMiddleware, (req, res) => {
  const idx = tasks.findIndex(t => t.id === req.params.id && t.userId === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  tasks[idx] = { ...tasks[idx], ...req.body };
  res.json(tasks[idx]);
});

app.post('/api/tasks', authMiddleware, (req, res) => {
  const task = { 
    id: Date.now().toString(), 
    userId: req.user.id, 
    date: new Date().toISOString(), 
    ...req.body 
  };
  tasks.push(task);
  res.json(task);
});

// ─── EMERGENCY ────────────────────────────────────────────────────────────────

app.post('/api/emergency/sos', authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const alert = {
    id: Date.now().toString(),
    userId: req.user.id,
    userName: user.name,
    type: req.body.type || 'SOS',
    message: req.body.message || 'Emergency SOS triggered',
    location: req.body.location || 'Unknown',
    familyContacts: user.familyContacts,
    timestamp: new Date().toISOString(),
    status: 'sent'
  };
  emergencyAlerts.push(alert);
  console.log('SOS ALERT for ' + user.name);
  res.json({ 
    success: true, 
    alert, 
    message: 'Alert sent to ' + user.familyContacts.length + ' family members' 
  });
});

app.get('/api/emergency/history', authMiddleware, (req, res) => {
  res.json(emergencyAlerts.filter(a => a.userId === req.user.id));
});

// ─── AI CHAT ──────────────────────────────────────────────────────────────────

app.post('/api/chat', authMiddleware, (req, res) => {
  const { message, history = [], language = 'en' } = req.body;
  const user = users.find(u => u.id === req.user.id);

  const systemPrompt = 'You are ElderCare AI, a compassionate assistant for elderly users. ' +
    'User name: ' + (user?.name || 'Friend') + '. Age: ' + (user?.age || 'Senior') + '. ' +
    'Health conditions: ' + (user?.healthConditions || 'Not specified') + '. ' +
    (language === 'kn' ? 'Respond in Kannada language.' : 'Respond in simple clear English.') +
    ' Always be warm and encouraging. If user mentions emergency, advise calling 112.';

  const messages = [
    ...history.map(h => ({ role: h.role, content: h.content })),
    { role: 'user', content: message }
  ];

  const body = {
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    messages
  };

  callAnthropic(body, (err, data) => {
    if (err || data.error) {
      const fallback = language === 'kn'
        ? 'ಕ್ಷಮಿಸಿ, ಸಂಪರ್ಕ ಸಮಸ್ಯೆ ಇದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.