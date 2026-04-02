const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'eldercare_secret_2024';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ─── IN-MEMORY DB ────────────────────────────────────────────────────────────
let users = [];
let reminders = [];
let healthLogs = [];
let chatHistory = [];
let emergencyAlerts = [];
let tasks = [];

// ─── MEDICINE DATASET ─────────────────────────────────────────────────────────
// Load the local dataset (place medicine_dataset.json in the same folder as server.js)
let medicineDataset = { symptoms: {}, medicines: {} };
try {
  const dataPath = path.join(__dirname, 'medicine_dataset.json');
  medicineDataset = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  console.log('✅ Medicine dataset loaded');
} catch (e) {
  console.warn('⚠️  medicine_dataset.json not found — AI-only mode for medicine lookups');
}

// ─── MULTER ───────────────────────────────────────────────────────────────────
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// ─── AUTH MIDDLEWARE ──────────────────────────────────────────────────────────
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

// ─── AUTH ROUTES ──────────────────────────────────────────────────────────────
app.post('/api/signup', async (req, res) => {
  const { name, dob, age, email, password, language, healthConditions, familyContacts } = req.body;
  if (users.find(u => u.email === email)) return res.status(400).json({ error: 'User already exists' });
  const hashed = await bcrypt.hash(password, 10);
  const user = {
    id: Date.now().toString(), name, dob, age, email, language,
    password: hashed, healthConditions: healthConditions || '',
    familyContacts: familyContacts || [], bp: '120/80', steps: 0,
    createdAt: new Date().toISOString()
  };
  users.push(user);
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  const { password: _, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ error: 'User not found' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: 'Invalid password' });
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  const { password: _, ...safeUser } = user;
  res.json({ token, user: safeUser });
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
  const log = { id: Date.now().toString(), userId: req.user.id, ...req.body, timestamp: new Date().toISOString() };
  healthLogs.push(log);
  const idx = users.findIndex(u => u.id === req.user.id);
  if (idx !== -1) {
    if (req.body.bp) users[idx].bp = req.body.bp;
    if (req.body.steps !== undefined) users[idx].steps = req.body.steps;
  }
  res.json(log);
});

app.get('/api/health/logs', authMiddleware, (req, res) => {
  res.json(healthLogs.filter(l => l.userId === req.user.id).slice(-30));
});

// ─── REMINDERS ────────────────────────────────────────────────────────────────
app.get('/api/reminders', authMiddleware, (req, res) => res.json(reminders.filter(r => r.userId === req.user.id)));

app.post('/api/reminders', authMiddleware, (req, res) => {
  const reminder = { id: Date.now().toString(), userId: req.user.id, ...req.body, createdAt: new Date().toISOString() };
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
    userTasks = defaults.map(t => ({ id: Date.now().toString() + Math.random(), userId: req.user.id, date: new Date().toISOString(), ...t }));
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
  const task = { id: Date.now().toString(), userId: req.user.id, date: new Date().toISOString(), ...req.body };
  tasks.push(task);
  res.json(task);
});

// ════════════════════════════════════════════════════════════════════════════
// 🔴 FEATURE 1 — IMPROVED AI CHATBOT (Context + Elder-tailored prompts)
// ════════════════════════════════════════════════════════════════════════════
/*
  HOW IT WORKS:
  - Full conversation history is kept per-session (passed from frontend)
  - System prompt is rich, role-specific, and tuned for elder-friendly responses
  - Claude is instructed to: speak slowly/simply, give health tips, escalate emergencies
  - Supports English and Kannada (ಕನ್ನಡ) responses
  - Detects emergency keywords and adds urgent guidance
*/

// Keywords that indicate a potential emergency
const EMERGENCY_KEYWORDS = [
  'chest pain', 'heart attack', 'can\'t breathe', 'cannot breathe', 'stroke',
  'fell down', 'bleeding', 'unconscious', 'severe pain', 'emergency',
  'help me', 'dying', 'fainted', 'ಎದೆನೋವು', 'ತುರ್ತು', 'ಬಿದ್ದೆ'
];

function buildSystemPrompt(user, language) {
  const isKannada = language === 'kn';
  const langInstruction = isKannada
    ? 'IMPORTANT: Always respond in simple, clear Kannada (ಕನ್ನಡ). Use simple everyday words, not complex literary Kannada.'
    : 'IMPORTANT: Always respond in simple, clear English. Use short sentences. Avoid medical jargon.';

  return `You are ElderCare AI — a warm, patient, and compassionate health assistant built specifically for senior citizens aged 60 and above.

=== USER PROFILE ===
Name: ${user?.name || 'Friend'}
Age: ${user?.age || 'Senior citizen'}
Known health conditions: ${user?.healthConditions || 'Not specified'}
Language: ${isKannada ? 'Kannada (ಕನ್ನಡ)' : 'English'}

=== YOUR PERSONALITY ===
- Speak like a caring doctor or a trusted family member
- Use SHORT sentences — maximum 2 sentences per point
- Be WARM, REASSURING, and NEVER alarming unless truly urgent
- Use simple words that a 70-year-old can easily understand
- Always acknowledge the user's feelings first before giving advice
- Add encouraging words like "You are doing well", "Don't worry", "This is very common"

=== HOW TO RESPOND ===
1. GREET the user by name occasionally to feel personal
2. LISTEN — summarise what they said briefly to show you understood
3. GIVE 2–3 simple, clear tips or answers (use bullet points or numbered steps)
4. END with an encouraging line or reminder to stay safe

=== HEALTH GUIDANCE RULES ===
- For common symptoms (headache, cold, mild pain): give safe home remedies and common OTC medicine names
- For chronic conditions (BP, diabetes, arthritis): give lifestyle tips, remind them to take prescribed medicines
- For mental health (loneliness, anxiety, sadness): be extra warm, suggest family contact, gentle breathing exercises
- NEVER diagnose definitively — always end with "please consult your doctor for proper advice"
- NEVER suggest stopping prescribed medicines

=== EMERGENCY RULE (VERY IMPORTANT) ===
- If the user mentions chest pain, difficulty breathing, stroke symptoms, heavy bleeding, or loss of consciousness:
  → IMMEDIATELY say: "This sounds serious. Please call 112 right now or ask someone nearby to help you."
  → Also say: "Press the SOS button on this app to alert your family immediately."

=== MEDICINE QUERIES ===
- If asked about a specific medicine: explain what it's for, common dose for elderly, and 1 key precaution
- If asked what medicine to take for a symptom: suggest 1–2 common OTC options with dosage, always with "consult your doctor" reminder

${langInstruction}`;
}

app.post('/api/chat', authMiddleware, async (req, res) => {
  const { message, history = [], language = 'en' } = req.body;
  const user = users.find(u => u.id === req.user.id);

  // Check for emergency keywords — add urgent prefix to context
  const isEmergency = EMERGENCY_KEYWORDS.some(kw => message.toLowerCase().includes(kw));
  const processedMessage = isEmergency
    ? `[EMERGENCY CONTEXT DETECTED] ${message}`
    : message;

  // Build message array with full conversation history (memory)
  const messages = [
    ...history.map(h => ({ role: h.role, content: h.content })),
    { role: 'user', content: processedMessage }
  ];

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: buildSystemPrompt(user, language),
        messages
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    const reply = data.content[0].text;

    // Save to chat history
    chatHistory.push({
      id: Date.now().toString(),
      userId: req.user.id,
      userMessage: message,
      aiReply: reply,
      isEmergency,
      timestamp: new Date().toISOString()
    });

    res.json({ reply, isEmergency });
  } catch (err) {
    console.error('Chat error:', err);
    const fallback = language === 'kn'
      ? 'ಕ್ಷಮಿಸಿ, ಈಗ ಸಂಪರ್ಕ ಸಮಸ್ಯೆ ಇದೆ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ. ತುರ್ತು ಇದ್ದರೆ 112 ಕರೆ ಮಾಡಿ.'
      : 'I apologize, I am having connection issues. Please try again. If this is an emergency, call 112 immediately or press the SOS button.';
    res.json({ reply: fallback, isEmergency: false });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// 🔴 FEATURE 2 — SOS / ALERT SYSTEM (Email via Nodemailer + Console log)
// ════════════════════════════════════════════════════════════════════════════
/*
  HOW IT WORKS:
  1. User presses SOS → frontend calls POST /api/emergency/sos
  2. Backend finds user + their family contacts
  3. Sends email alert to all family contacts with email addresses
  4. Also supports Twilio SMS (commented below, just add credentials)
  5. Logs alert to console and saves in emergencyAlerts[]
  6. Returns success response to frontend with contact count

  EMAIL SETUP:
  - Uses Gmail via Nodemailer (free)
  - Set env vars: EMAIL_USER=yourgmail@gmail.com  EMAIL_PASS=your_app_password
  - Generate Gmail App Password: Google Account → Security → 2-Step Verification → App Passwords

  TWILIO SMS SETUP (Optional):
  - npm install twilio
  - Set env vars: TWILIO_SID, TWILIO_AUTH, TWILIO_FROM
  - Uncomment the Twilio block below
*/

// ── Nodemailer transporter setup ──
let emailTransporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });
  console.log('✅ Email alerts enabled via:', process.env.EMAIL_USER);
} else {
  console.warn('⚠️  EMAIL_USER / EMAIL_PASS not set — email alerts will be simulated (console only)');
}

async function sendEmailAlert(contact, user, alertData) {
  if (!emailTransporter) {
    // SIMULATION MODE — print to console as if sent
    console.log(`\n📧 [SIMULATED EMAIL ALERT]`);
    console.log(`   To: ${contact.name} <${contact.email || 'no-email@provided.com'}>`);
    console.log(`   Subject: 🚨 EMERGENCY SOS from ${user.name}`);
    console.log(`   Body: ${user.name} (Age: ${user.age}) has triggered an SOS alert at ${alertData.location}`);
    console.log(`   Time: ${new Date().toLocaleString()}\n`);
    return { simulated: true };
  }

  const mailOptions = {
    from: `"ElderCare AI Alert" <${process.env.EMAIL_USER}>`,
    to: contact.email,
    subject: `🚨 EMERGENCY SOS from ${user.name} — Immediate Action Required`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 3px solid #e53e3e; border-radius: 12px; overflow: hidden;">
        <div style="background: #e53e3e; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🚨 SOS EMERGENCY ALERT</h1>
        </div>
        <div style="padding: 24px; background: #fff8f8;">
          <p style="font-size: 18px; color: #333; margin-bottom: 16px;">
            Dear <strong>${contact.name}</strong>,
          </p>
          <p style="font-size: 16px; color: #555; line-height: 1.6;">
            <strong>${user.name}</strong> (Age: ${user.age}) has triggered an <strong>Emergency SOS Alert</strong> 
            through the ElderCare AI app. Please respond immediately.
          </p>

          <div style="background: #fff0f0; border-left: 4px solid #e53e3e; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 15px;"><strong>📍 Location:</strong> ${alertData.location || 'Unknown'}</p>
            <p style="margin: 8px 0 0; font-size: 15px;"><strong>⏰ Time:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
            <p style="margin: 8px 0 0; font-size: 15px;"><strong>📋 Message:</strong> ${alertData.message || 'Emergency SOS triggered from ElderCare app'}</p>
          </div>

          <div style="background: #e6f7ff; border: 1px solid #91d5ff; padding: 16px; border-radius: 8px; margin-top: 20px;">
            <h3 style="color: #0050b3; margin: 0 0 10px;">Immediate Steps:</h3>
            <ol style="color: #333; line-height: 2; margin: 0; padding-left: 20px;">
              <li>Call ${user.name} right now at their phone number</li>
              <li>If no answer, go to their location immediately</li>
              <li>If needed, call Indian Emergency Services: <strong>112</strong></li>
              <li>Contact other family members listed below</li>
            </ol>
          </div>

          <p style="margin-top: 20px; font-size: 13px; color: #888; text-align: center;">
            This is an automated emergency alert from ElderCare AI. Do not ignore this message.
          </p>
        </div>
      </div>
    `
  };

  return emailTransporter.sendMail(mailOptions);
}

// ── Optional Twilio SMS (uncomment + npm install twilio to enable) ──
// const twilio = require('twilio');
// const twilioClient = process.env.TWILIO_SID
//   ? twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH)
//   : null;
//
// async function sendSmsAlert(phone, user, alertData) {
//   if (!twilioClient) { console.log(`[SIMULATED SMS] To: ${phone} — SOS from ${user.name}`); return; }
//   return twilioClient.messages.create({
//     body: `🚨 SOS ALERT! ${user.name} (Age: ${user.age}) has triggered an emergency at ${alertData.location}. Time: ${new Date().toLocaleString()}. Please contact them immediately or call 112.`,
//     from: process.env.TWILIO_FROM,
//     to: phone
//   });
// }

app.post('/api/emergency/sos', authMiddleware, async (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const alertData = {
    id: Date.now().toString(),
    userId: req.user.id,
    userName: user.name,
    type: req.body.type || 'SOS',
    message: req.body.message || 'Emergency SOS triggered from ElderCare app',
    location: req.body.location || 'Location unavailable',
    familyContacts: user.familyContacts,
    timestamp: new Date().toISOString(),
    status: 'sent'
  };
  emergencyAlerts.push(alertData);

  // Console alert (always shown)
  console.log('\n' + '═'.repeat(60));
  console.log(`🚨 SOS ALERT TRIGGERED`);
  console.log(`   User: ${user.name} (Age: ${user.age})`);
  console.log(`   Location: ${alertData.location}`);
  console.log(`   Time: ${new Date().toLocaleString()}`);
  console.log(`   Family contacts: ${user.familyContacts?.length || 0}`);
  console.log('═'.repeat(60) + '\n');

  // Send alerts to all family contacts
  const results = [];
  for (const contact of (user.familyContacts || [])) {
    // Email alert
    if (contact.email) {
      try {
        await sendEmailAlert(contact, user, alertData);
        results.push({ name: contact.name, method: 'email', status: 'sent' });
      } catch (err) {
        console.error(`Failed to send email to ${contact.name}:`, err.message);
        results.push({ name: contact.name, method: 'email', status: 'failed' });
      }
    } else {
      // No email — simulate
      await sendEmailAlert(contact, user, alertData);
      results.push({ name: contact.name, method: 'simulated', status: 'logged' });
    }

    // SMS via Twilio (uncomment if using Twilio)
    // if (contact.phone) { await sendSmsAlert(contact.phone, user, alertData); }
  }

  res.json({
    success: true,
    alert: alertData,
    notified: results.length,
    message: results.length > 0
      ? `SOS sent to ${results.length} family member(s). They will contact you shortly.`
      : 'SOS alert logged. Please add family contacts with email to enable automatic alerts.',
    results
  });
});

app.get('/api/emergency/history', authMiddleware, (req, res) => {
  res.json(emergencyAlerts.filter(a => a.userId === req.user.id));
});

// ════════════════════════════════════════════════════════════════════════════
// 🔴 FEATURE 3 — MEDICINE ASSISTANT (Dataset-first + Claude AI enhancement)
// ════════════════════════════════════════════════════════════════════════════
/*
  HOW IT WORKS:
  1. User submits symptom or medicine name
  2. Backend FIRST searches the local medicine_dataset.json (fast, no API cost)
  3. If found in dataset → return dataset result directly
  4. If NOT found → call Claude API to generate a structured response
  5. Claude response is forced into JSON format for consistent rendering

  DATASET KEYS are lowercase:
    Symptoms: "headache", "fever", "knee pain", "back pain", "cold", "dizziness",
              "stomach pain", "diabetes", "high blood pressure", "constipation"
    Medicines: "paracetamol", "metformin", "amlodipine", "aspirin", "omeprazole",
               "cetirizine", "glimepiride", "telmisartan"
*/

function findInDataset(query, type) {
  const q = query.toLowerCase().trim();
  if (type === 'symptom_to_medicine') {
    // Try exact match first, then partial match
    if (medicineDataset.symptoms[q]) return medicineDataset.symptoms[q];
    for (const [key, val] of Object.entries(medicineDataset.symptoms)) {
      if (q.includes(key) || key.includes(q)) return val;
    }
  } else {
    // medicine_to_symptom
    if (medicineDataset.medicines[q]) return medicineDataset.medicines[q];
    for (const [key, val] of Object.entries(medicineDataset.medicines)) {
      if (q.includes(key) || key.includes(q)) return val;
    }
  }
  return null;
}

app.post('/api/medicine/lookup', authMiddleware, async (req, res) => {
  const { query, type, language = 'en' } = req.body;
  if (!query?.trim()) return res.status(400).json({ error: 'Query is required' });

  // Step 1: Try local dataset first (instant, free)
  const localResult = findInDataset(query, type);
  if (localResult) {
    console.log(`✅ Medicine query "${query}" answered from local dataset`);
    return res.json(localResult);
  }

  // Step 2: Fall back to Claude AI for unknown queries
  console.log(`🤖 Medicine query "${query}" not in dataset — using Claude AI`);

  const isKannada = language === 'kn';
  const kannadadNote = isKannada ? 'Also include medicine names in Kannada where possible.' : '';

  const prompt = type === 'symptom_to_medicine'
    ? `A senior citizen (elderly person, 60+ years) describes this symptom or problem: "${query}".

List 2-3 commonly available OTC medicines suitable for elderly Indians. 
${kannadadNote}

Respond ONLY with this exact JSON format (no explanation, no markdown):
{
  "medicines": [
    {
      "name": "Medicine name (brand name in brackets)",
      "use": "What it helps with in 1 sentence",
      "dosage": "Exact dosage for elderly person",
      "warning": "Most important warning for elderly"
    }
  ],
  "disclaimer": "Always consult your doctor before taking any medicine. This is for general information only."
}`
    : `The medicine or tablet name is: "${query}".

Explain this medicine for a senior citizen (elderly, 60+ years) in India.
${kannadadNote}

Respond ONLY with this exact JSON format (no explanation, no markdown):
{
  "conditions": ["condition1", "condition2", "condition3"],
  "sideEffects": ["side effect 1 for elderly", "side effect 2", "side effect 3"],
  "precautions": ["precaution 1 for elderly", "precaution 2", "precaution 3"],
  "disclaimer": "Always consult your doctor before taking any medicine. This is for general information only."
}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    const text = data.content[0].text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (err) {
    console.error('Medicine AI error:', err.message);
    // Safe fallback
    if (type === 'symptom_to_medicine') {
      res.json({
        medicines: [{
          name: 'Please consult a doctor',
          use: `For "${query}" — a doctor can give the right medicine`,
          dosage: 'As prescribed by your doctor',
          warning: 'Do not self-medicate without professional advice'
        }],
        disclaimer: 'This service is for general information only. Always consult a licensed doctor for medical advice.'
      });
    } else {
      res.json({
        conditions: ['Please consult your doctor for accurate information about this medicine'],
        sideEffects: ['Your doctor will inform you about possible side effects'],
        precautions: ['Always take medicines as prescribed', 'Never stop or change dosage without consulting your doctor'],
        disclaimer: 'This service is for general information only. Always consult a licensed doctor.'
      });
    }
  }
});

// ─── REPORT EXPORT ────────────────────────────────────────────────────────────
app.get('/api/report', authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  const userReminders = reminders.filter(r => r.userId === req.user.id);
  const userLogs = healthLogs.filter(l => l.userId === req.user.id).slice(-10);
  const userTasks = tasks.filter(t => t.userId === req.user.id).slice(-7);
  const userAlerts = emergencyAlerts.filter(a => a.userId === req.user.id);
  const { password: _, ...safeUser } = user;
  res.json({
    generatedAt: new Date().toISOString(),
    user: safeUser, healthLogs: userLogs, reminders: userReminders,
    recentTasks: userTasks, emergencyAlerts: userAlerts,
    summary: {
      totalReminders: userReminders.length,
      healthLogsCount: userLogs.length,
      sosAlertsCount: userAlerts.length,
      completedTasksToday: userTasks.filter(t => t.completed).length
    }
  });
});

// ─── PDF UPLOAD ───────────────────────────────────────────────────────────────
app.post('/api/upload/health-pdf', authMiddleware, upload.single('pdf'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const idx = users.findIndex(u => u.id === req.user.id);
  const extracted = `Medical document uploaded: ${req.file.originalname} (${(req.file.size / 1024).toFixed(1)}KB). Manual review recommended.`;
  if (idx !== -1) users[idx].healthConditions += '\n' + extracted;
  res.json({ success: true, message: 'Health document uploaded successfully', extracted });
});

app.get('/', (req, res) => res.json({ status: 'ElderCare AI Backend Running ✅', version: '2.0.0' }));

app.listen(PORT, () => {
  console.log(`🏥 ElderCare AI Server running on port ${PORT}`);
  console.log(`📊 Medicine dataset loaded: ${Object.keys(medicineDataset.symptoms).length} symptoms, ${Object.keys(medicineDataset.medicines).length} medicines`);
});

module.exports = app;
