import React, { useState, useEffect, useRef, useCallback } from 'react';

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────
const T = {
  en: {
    selectLang: 'Choose Your Language', langSubtitle: 'Select your preferred language to continue',
    english: 'English', kannada: 'ಕನ್ನಡ',
    welcome: 'Welcome to ElderCare AI', subtitle: 'Your trusted companion for health, safety & independence',
    name: 'Full Name', dob: 'Date of Birth', age: 'Age', email: 'Email Address', password: 'Password',
    login: 'Login', signup: 'Sign Up', newUser: 'New user?', existingUser: 'Already registered?',
    healthInfo: 'Health & Emergency Setup', healthConditions: 'Health Conditions',
    healthPlaceholder: 'Describe your medical conditions, allergies, medications...',
    uploadPdf: 'Or Upload Medical PDF', familyContacts: 'Emergency Family Contacts (min. 2)',
    contactName: 'Contact Name', contactPhone: 'Phone Number', contactRelation: 'Relation',
    addContact: '+ Add Contact', continueBtn: 'Continue to Dashboard',
    dashboard: 'Dashboard', goodMorning: 'Good Morning', goodAfternoon: 'Good Afternoon', goodEvening: 'Good Evening',
    askAI: '🤖 Ask AI', reminders: '⏰ Reminders', safety: '🛡️ Safety & SOS', alerts: '🔔 Alerts',
    todayTasks: "Today's Tasks", progress: 'Progress', steps: 'Steps', bp: 'Blood Pressure',
    askAITitle: 'AI Chat Companion', chatPlaceholder: 'Ask me anything about your health...',
    send: 'Send', clearChat: 'Clear Chat',
    remindersTitle: 'Smart Reminders', addReminder: 'Add Reminder', reminderName: 'Reminder Name',
    reminderTime: 'Time', reminderType: 'Type', medication: 'Medication', exercise: 'Exercise',
    appointment: 'Appointment', hydration: 'Hydration', custom: 'Custom', save: 'Save',
    safetyTitle: 'Safety & Emergency', sosBtn: '🆘 SEND SOS ALERT', sosSending: 'Sending SOS...',
    sosSuccess: 'SOS Alert Sent! Family notified.', location: 'My Location',
    medicineTitle: '💊 Medicine Assistant', symptomInput: 'Describe your pain or symptom',
    medicineInput: 'Enter medicine / tablet name', searchSymptom: 'Find Medicine for Symptom',
    searchMedicine: 'Know About This Medicine', disclaimer: 'For informational use only. Always consult a doctor.',
    exportReport: '📄 Export Health Report', downloading: 'Generating Report...',
    backHome: '← Back to Dashboard', logout: 'Logout',
    emotionalSupport: '💚 Emotional Wellness', feelingToday: 'How are you feeling today?',
    great: '😊 Great', good: '🙂 Good', okay: '😐 Okay', low: '😢 Feeling Low',
    activityMonitor: '🏃 Activity Monitor', independenceScore: 'Independence Score',
    updateHealth: 'Update Health Data', updateBP: 'Update Blood Pressure', updateSteps: 'Update Steps',
  },
  kn: {
    selectLang: 'ನಿಮ್ಮ ಭಾಷೆ ಆಯ್ಕೆ ಮಾಡಿ', langSubtitle: 'ಮುಂದುವರಿಯಲು ನಿಮ್ಮ ಭಾಷೆ ಆಯ್ಕೆ ಮಾಡಿ',
    english: 'English', kannada: 'ಕನ್ನಡ',
    welcome: 'ElderCare AI ಗೆ ಸ್ವಾಗತ', subtitle: 'ಆರೋಗ್ಯ, ಸುರಕ್ಷತೆ ಮತ್ತು ಸ್ವಾತಂತ್ರ್ಯಕ್ಕಾಗಿ ನಿಮ್ಮ ವಿಶ್ವಾಸಾರ್ಹ ಸಹಾಯಕ',
    name: 'ಪೂರ್ಣ ಹೆಸರು', dob: 'ಹುಟ್ಟಿದ ದಿನಾಂಕ', age: 'ವಯಸ್ಸು', email: 'ಇಮೇಲ್ ವಿಳಾಸ', password: 'ಪಾಸ್‌ವರ್ಡ್',
    login: 'ಲಾಗಿನ್', signup: 'ಸೈನ್ ಅಪ್', newUser: 'ಹೊಸ ಬಳಕೆದಾರರೇ?', existingUser: 'ಈಗಾಗಲೇ ನೋಂದಾಯಿಸಿದ್ದೀರಾ?',
    healthInfo: 'ಆರೋಗ್ಯ ಮತ್ತು ತುರ್ತು ಸೆಟಪ್', healthConditions: 'ಆರೋಗ್ಯ ಸ್ಥಿತಿಗಳು',
    healthPlaceholder: 'ನಿಮ್ಮ ವೈದ್ಯಕೀಯ ಸ್ಥಿತಿಗಳು, ಅಲರ್ಜಿಗಳು, ಔಷಧಿಗಳನ್ನು ವಿವರಿಸಿ...',
    uploadPdf: 'ಅಥವಾ ವೈದ್ಯಕೀಯ PDF ಅಪ್‌ಲೋಡ್ ಮಾಡಿ', familyContacts: 'ತುರ್ತು ಕುಟುಂಬ ಸಂಪರ್ಕಗಳು (ಕನಿಷ್ಠ 2)',
    contactName: 'ಸಂಪರ್ಕದ ಹೆಸರು', contactPhone: 'ಫೋನ್ ಸಂಖ್ಯೆ', contactRelation: 'ಸಂಬಂಧ',
    addContact: '+ ಸಂಪರ್ಕ ಸೇರಿಸಿ', continueBtn: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹೋಗಿ',
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', goodMorning: 'ಶುಭ ಬೆಳಿಗ್ಗೆ', goodAfternoon: 'ಶುಭ ಮಧ್ಯಾಹ್ನ', goodEvening: 'ಶುಭ ಸಂಜೆ',
    askAI: '🤖 AI ಕೇಳಿ', reminders: '⏰ ರಿಮೈಂಡರ್‌ಗಳು', safety: '🛡️ ಸುರಕ್ಷತೆ ಮತ್ತು SOS', alerts: '🔔 ಎಚ್ಚರಿಕೆಗಳು',
    todayTasks: 'ಇಂದಿನ ಕಾರ್ಯಗಳು', progress: 'ಪ್ರಗತಿ', steps: 'ಹೆಜ್ಜೆಗಳು', bp: 'ರಕ್ತದ ಒತ್ತಡ',
    askAITitle: 'AI ಚಾಟ್ ಸಹಾಯಕ', chatPlaceholder: 'ನಿಮ್ಮ ಆರೋಗ್ಯದ ಬಗ್ಗೆ ಏನಾದರೂ ಕೇಳಿ...',
    send: 'ಕಳುಹಿಸಿ', clearChat: 'ಚಾಟ್ ತೆರವುಗೊಳಿಸಿ',
    remindersTitle: 'ಸ್ಮಾರ್ಟ್ ರಿಮೈಂಡರ್‌ಗಳು', addReminder: 'ರಿಮೈಂಡರ್ ಸೇರಿಸಿ', reminderName: 'ರಿಮೈಂಡರ್ ಹೆಸರು',
    reminderTime: 'ಸಮಯ', reminderType: 'ವಿಧ', medication: 'ಔಷಧಿ', exercise: 'ವ್ಯಾಯಾಮ',
    appointment: 'ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್', hydration: 'ನೀರು ಕುಡಿಯುವಿಕೆ', custom: 'ಕಸ್ಟಮ್', save: 'ಉಳಿಸಿ',
    safetyTitle: 'ಸುರಕ್ಷತೆ ಮತ್ತು ತುರ್ತು', sosBtn: '🆘 SOS ಎಚ್ಚರಿಕೆ ಕಳುಹಿಸಿ', sosSending: 'SOS ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ...',
    sosSuccess: 'SOS ಕಳುಹಿಸಲಾಗಿದೆ! ಕುಟುಂಬಕ್ಕೆ ತಿಳಿಸಲಾಗಿದೆ.', location: 'ನನ್ನ ಸ್ಥಳ',
    medicineTitle: '💊 ಔಷಧಿ ಸಹಾಯಕ', symptomInput: 'ನಿಮ್ಮ ನೋವು ಅಥವಾ ಲಕ್ಷಣ ವಿವರಿಸಿ',
    medicineInput: 'ಔಷಧಿ / ಟ್ಯಾಬ್ಲೆಟ್ ಹೆಸರು ನಮೂದಿಸಿ', searchSymptom: 'ಲಕ್ಷಣಕ್ಕೆ ಔಷಧಿ ಹುಡುಕಿ',
    searchMedicine: 'ಈ ಔಷಧಿಯ ಬಗ್ಗೆ ತಿಳಿಯಿರಿ', disclaimer: 'ಮಾಹಿತಿ ಉದ್ದೇಶಕ್ಕಾಗಿ ಮಾತ್ರ. ಯಾವಾಗಲೂ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.',
    exportReport: '📄 ಆರೋಗ್ಯ ವರದಿ ಎಕ್ಸ್‌ಪೋರ್ಟ್ ಮಾಡಿ', downloading: 'ವರದಿ ತಯಾರಿಸಲಾಗುತ್ತಿದೆ...',
    backHome: '← ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂತಿರುಗಿ', logout: 'ಲಾಗ್ ಔಟ್',
    emotionalSupport: '💚 ಭಾವನಾತ್ಮಕ ಸ್ವಾಸ್ಥ್ಯ', feelingToday: 'ಇಂದು ನೀವು ಹೇಗಿದ್ದೀರಿ?',
    great: '😊 ಅದ್ಭುತ', good: '🙂 ಚೆನ್ನಾಗಿದೆ', okay: '😐 ಸರಿಯಾಗಿದೆ', low: '😢 ಮನಸ್ಸು ತಳಮಳ',
    activityMonitor: '🏃 ಚಟುವಟಿಕೆ ಮಾನಿಟರ್', independenceScore: 'ಸ್ವಾತಂತ್ರ್ಯ ಸ್ಕೋರ್',
    updateHealth: 'ಆರೋಗ್ಯ ಡೇಟಾ ನವೀಕರಿಸಿ', updateBP: 'ರಕ್ತದ ಒತ್ತಡ ನವೀಕರಿಸಿ', updateSteps: 'ಹೆಜ್ಜೆಗಳು ನವೀಕರಿಸಿ',
  }
};

// ─── API HELPER ───────────────────────────────────────────────────────────────
const apiFetch = async (path, options = {}, token = null) => {
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  const res = await fetch(`${API}${path}`, { ...options, headers: { ...headers, ...options.headers } });
  return res.json();
};

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');
  
  :root {
    --primary: #2D6A4F; --primary-light: #52B788; --primary-pale: #D8F3DC;
    --accent: #F4845F; --accent-light: #FFDDD2; --accent-dark: #E05C3A;
    --gold: #E9C46A; --gold-light: #FFF3CD;
    --bg: #F8FBF9; --card: #FFFFFF; --surface: #EEF7F1;
    --text: #1B3A2D; --text-muted: #5A7A6B; --text-light: #8FA89A;
    --border: #C9E4D1; --shadow: 0 4px 24px rgba(45,106,79,0.10);
    --shadow-lg: 0 8px 40px rgba(45,106,79,0.16);
    --radius: 18px; --radius-sm: 10px;
    --font-display: 'Lora', Georgia, serif;
    --font-body: 'Source Sans 3', sans-serif;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { font-size: 17px; }
  body { font-family: var(--font-body); background: var(--bg); color: var(--text); min-height: 100vh; }
  
  .app { min-height: 100vh; display: flex; flex-direction: column; }
  
  .lang-screen {
    min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #1B4332 0%, #2D6A4F 40%, #52B788 100%);
    padding: 2rem; text-align: center; position: relative; overflow: hidden;
  }
  .lang-screen::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(circle at 70% 20%, rgba(82,183,136,0.3) 0%, transparent 60%),
                radial-gradient(circle at 20% 80%, rgba(233,196,106,0.2) 0%, transparent 50%);
  }
  .lang-logo { font-family: var(--font-display); font-size: 3rem; color: #fff; font-weight: 700; margin-bottom: 0.5rem; position: relative; }
  .lang-logo span { color: var(--gold); }
  .lang-screen h2 { font-family: var(--font-display); color: #fff; font-size: 1.6rem; margin-bottom: 0.5rem; position: relative; }
  .lang-screen p { color: rgba(255,255,255,0.8); font-size: 1.05rem; margin-bottom: 2.5rem; position: relative; }
  .lang-btns { display: flex; gap: 1.5rem; position: relative; flex-wrap: wrap; justify-content: center; }
  .lang-btn {
    background: rgba(255,255,255,0.12); backdrop-filter: blur(12px); border: 2px solid rgba(255,255,255,0.3);
    color: #fff; font-family: var(--font-display); font-size: 1.4rem; font-weight: 600;
    padding: 1.2rem 2.8rem; border-radius: 50px; cursor: pointer;
    transition: all 0.3s ease; display: flex; align-items: center; gap: 0.8rem;
  }
  .lang-btn:hover { background: rgba(255,255,255,0.25); transform: translateY(-3px); border-color: var(--gold); }
  .lang-btn .flag { font-size: 2rem; }
  
  .header {
    background: var(--card); border-bottom: 2px solid var(--border); padding: 0 1.5rem;
    display: flex; align-items: center; justify-content: space-between; height: 64px;
    position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 12px rgba(45,106,79,0.08);
  }
  .header-logo { font-family: var(--font-display); font-size: 1.4rem; color: var(--primary); font-weight: 700; }
  .header-logo span { color: var(--accent); }
  .header-actions { display: flex; gap: 0.8rem; align-items: center; }
  .btn-icon { background: var(--surface); border: 1px solid var(--border); color: var(--text); padding: 0.5rem 1rem; border-radius: 50px; cursor: pointer; font-size: 0.85rem; font-family: var(--font-body); transition: all 0.2s; }
  .btn-icon:hover { background: var(--primary); color: #fff; }
  
  .auth-screen {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: linear-gradient(160deg, var(--bg) 0%, var(--surface) 100%);
    padding: 1.5rem;
  }
  .auth-card {
    background: var(--card); border-radius: var(--radius); box-shadow: var(--shadow-lg);
    padding: 2.5rem; width: 100%; max-width: 460px; border: 1px solid var(--border);
  }
  .auth-card h1 { font-family: var(--font-display); font-size: 1.8rem; color: var(--primary); margin-bottom: 0.3rem; }
  .auth-card p { color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.8rem; }
  
  .form-group { margin-bottom: 1.2rem; }
  .form-group label { display: block; font-size: 0.9rem; font-weight: 600; color: var(--text); margin-bottom: 0.4rem; }
  .form-group input, .form-group textarea, .form-group select {
    width: 100%; padding: 0.8rem 1rem; border: 1.5px solid var(--border); border-radius: var(--radius-sm);
    font-family: var(--font-body); font-size: 1rem; color: var(--text); background: var(--bg);
    transition: border-color 0.2s; outline: none;
  }
  .form-group input:focus, .form-group textarea:focus, .form-group select:focus { border-color: var(--primary-light); background: #fff; }
  .form-group textarea { resize: vertical; min-height: 80px; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  
  .btn-primary {
    width: 100%; padding: 0.9rem; background: var(--primary); color: #fff; border: none;
    border-radius: var(--radius-sm); font-size: 1.05rem; font-weight: 600; font-family: var(--font-body);
    cursor: pointer; transition: all 0.25s; margin-top: 0.5rem;
  }
  .btn-primary:hover { background: #1a5c3a; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(45,106,79,0.3); }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .btn-secondary {
    width: 100%; padding: 0.9rem; background: transparent; color: var(--primary); border: 2px solid var(--primary);
    border-radius: var(--radius-sm); font-size: 1.05rem; font-weight: 600; font-family: var(--font-body);
    cursor: pointer; transition: all 0.25s; margin-top: 0.5rem;
  }
  .btn-secondary:hover { background: var(--primary-pale); }
  .auth-switch { text-align: center; margin-top: 1.2rem; font-size: 0.95rem; color: var(--text-muted); }
  .auth-switch a { color: var(--primary); cursor: pointer; font-weight: 600; text-decoration: none; }
  .auth-switch a:hover { text-decoration: underline; }
  .error-msg { background: #FFE5E5; color: #C0392B; padding: 0.7rem 1rem; border-radius: var(--radius-sm); font-size: 0.9rem; margin-bottom: 1rem; }
  
  .setup-card { max-width: 600px; }
  .contact-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 1rem; margin-bottom: 0.8rem; }
  .contact-card .form-row { gap: 0.6rem; }
  .btn-add { background: var(--primary-pale); color: var(--primary); border: 2px dashed var(--primary-light); border-radius: var(--radius-sm); padding: 0.7rem; width: 100%; cursor: pointer; font-size: 0.95rem; font-weight: 600; transition: all 0.2s; }
  .btn-add:hover { background: var(--primary); color: #fff; }
  .upload-area { border: 2px dashed var(--border); border-radius: var(--radius-sm); padding: 1.5rem; text-align: center; cursor: pointer; transition: all 0.2s; color: var(--text-muted); }
  .upload-area:hover { border-color: var(--primary-light); background: var(--primary-pale); }
  
  .dashboard { padding: 1.5rem; max-width: 900px; margin: 0 auto; width: 100%; }
  
  .greeting-card {
    background: linear-gradient(135deg, var(--primary) 0%, #1a5c3a 100%);
    border-radius: var(--radius); padding: 1.8rem; color: #fff; margin-bottom: 1.5rem;
    display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;
    position: relative; overflow: hidden;
  }
  .greeting-card::after {
    content: '🌿'; position: absolute; right: 1.5rem; top: 50%; transform: translateY(-50%);
    font-size: 5rem; opacity: 0.12; pointer-events: none;
  }
  .greeting-text h2 { font-family: var(--font-display); font-size: 1.6rem; margin-bottom: 0.3rem; }
  .greeting-text p { opacity: 0.85; font-size: 0.95rem; }
  .datetime-badge { background: rgba(255,255,255,0.15); border-radius: 12px; padding: 0.8rem 1.2rem; text-align: right; }
  .datetime-badge .time { font-size: 1.6rem; font-weight: 700; font-family: var(--font-display); }
  .datetime-badge .date { font-size: 0.85rem; opacity: 0.85; }
  
  .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
  .stat-card {
    background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 1.2rem; text-align: center; box-shadow: var(--shadow); transition: transform 0.2s;
  }
  .stat-card:hover { transform: translateY(-3px); }
  .stat-icon { font-size: 1.8rem; margin-bottom: 0.4rem; }
  .stat-value { font-size: 1.4rem; font-weight: 700; color: var(--primary); font-family: var(--font-display); }
  .stat-label { font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem; }
  
  .quick-actions { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
  .action-btn {
    background: var(--card); border: 2px solid var(--border); border-radius: var(--radius);
    padding: 1.4rem 1rem; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
    cursor: pointer; transition: all 0.25s; box-shadow: var(--shadow); text-decoration: none;
  }
  .action-btn:hover { border-color: var(--primary-light); background: var(--surface); transform: translateY(-3px); box-shadow: var(--shadow-lg); }
  .action-btn .icon { font-size: 2.2rem; }
  .action-btn .label { font-size: 1rem; font-weight: 600; color: var(--text); }
  .action-btn.sos { border-color: var(--accent); }
  .action-btn.sos:hover { background: var(--accent-light); }
  
  .tasks-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.5rem; box-shadow: var(--shadow); }
  .tasks-card h3 { font-family: var(--font-display); font-size: 1.2rem; color: var(--primary); margin-bottom: 1rem; }
  .progress-bar { background: var(--border); border-radius: 50px; height: 10px; margin-bottom: 0.5rem; overflow: hidden; }
  .progress-fill { background: linear-gradient(90deg, var(--primary-light), var(--primary)); height: 100%; border-radius: 50px; transition: width 0.6s ease; }
  .progress-label { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem; }
  .task-item { display: flex; align-items: center; gap: 0.8rem; padding: 0.7rem 0; border-bottom: 1px solid var(--border); }
  .task-item:last-child { border-bottom: none; }
  .task-check { width: 22px; height: 22px; border-radius: 6px; border: 2px solid var(--border); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0; }
  .task-check.done { background: var(--primary); border-color: var(--primary); }
  .task-check.done::after { content: '✓'; color: #fff; font-size: 0.8rem; font-weight: 700; }
  .task-text { flex: 1; font-size: 0.95rem; }
  .task-text.done { text-decoration: line-through; color: var(--text-muted); }
  .task-cat { font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 20px; background: var(--surface); color: var(--text-muted); }
  
  .page { padding: 1.5rem; max-width: 900px; margin: 0 auto; width: 100%; }
  .page-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
  .page-header h2 { font-family: var(--font-display); font-size: 1.5rem; color: var(--primary); }
  .back-btn { background: var(--surface); border: 1px solid var(--border); color: var(--text); padding: 0.5rem 1rem; border-radius: 50px; cursor: pointer; font-size: 0.9rem; font-family: var(--font-body); white-space: nowrap; transition: all 0.2s; }
  .back-btn:hover { background: var(--primary); color: #fff; }
  
  /* CHAT */
  .chat-container { background: var(--card); border-radius: var(--radius); border: 1px solid var(--border); overflow: hidden; box-shadow: var(--shadow); }
  .chat-messages { height: 400px; overflow-y: auto; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; scroll-behavior: smooth; }
  .chat-msg { max-width: 80%; padding: 0.9rem 1.2rem; border-radius: 18px; font-size: 0.97rem; line-height: 1.65; white-space: pre-wrap; word-break: break-word; }
  .chat-msg.user { background: var(--primary); color: #fff; border-bottom-right-radius: 4px; align-self: flex-end; }
  .chat-msg.ai { background: var(--surface); color: var(--text); border-bottom-left-radius: 4px; align-self: flex-start; }
  /* EMERGENCY chat message highlight */
  .chat-msg.ai.emergency { background: #fff0f0; border: 2px solid #e53e3e; }
  .sender { font-size: 0.75rem; font-weight: 700; color: var(--primary); margin-bottom: 0.3rem; text-transform: uppercase; letter-spacing: 0.05em; }
  .typing-indicator { display: flex; gap: 4px; padding: 4px 0; }
  .typing-indicator span { width: 8px; height: 8px; background: var(--primary-light); border-radius: 50%; animation: bounce 1.2s infinite; }
  .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
  .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes bounce { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-8px); } }
  .chat-input-row { display: flex; gap: 0.5rem; padding: 1rem; border-top: 1px solid var(--border); background: var(--bg); }
  .chat-input { flex: 1; padding: 0.8rem 1rem; border: 1.5px solid var(--border); border-radius: var(--radius-sm); font-family: var(--font-body); font-size: 1rem; outline: none; }
  .chat-input:focus { border-color: var(--primary-light); }
  .btn-send { background: var(--primary); color: #fff; border: none; border-radius: var(--radius-sm); padding: 0.8rem 1.4rem; cursor: pointer; font-weight: 600; font-family: var(--font-body); transition: all 0.2s; }
  .btn-send:hover { background: #1a5c3a; }
  .btn-send:disabled { opacity: 0.5; cursor: not-allowed; }

  /* MOOD */
  .mood-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.6rem; }
  .mood-btn { background: var(--surface); border: 2px solid var(--border); border-radius: var(--radius-sm); padding: 0.6rem 0.4rem; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 0.3rem; font-size: 0.8rem; font-family: var(--font-body); color: var(--text); transition: all 0.2s; }
  .mood-btn:hover, .mood-btn.selected { border-color: var(--primary-light); background: var(--primary-pale); }
  .mood-emoji { font-size: 1.5rem; }

  /* REMINDERS */
  .add-reminder-form { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.5rem; margin-bottom: 1.5rem; }
  .reminder-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 1rem; margin-bottom: 0.8rem; display: flex; align-items: center; gap: 1rem; box-shadow: var(--shadow); }
  .reminder-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; flex-shrink: 0; }
  .reminder-info { flex: 1; }
  .reminder-name { font-weight: 600; font-size: 1rem; }
  .reminder-time { font-size: 0.85rem; color: var(--text-muted); margin-top: 0.2rem; }
  .btn-del { background: #FFE5E5; border: none; color: #C0392B; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; font-size: 1rem; transition: all 0.2s; }
  .btn-del:hover { background: #C0392B; color: #fff; }

  /* SAFETY/SOS */
  .sos-btn {
    width: 100%; padding: 1.5rem; background: linear-gradient(135deg, #e53e3e, #c53030);
    color: #fff; border: none; border-radius: var(--radius); font-size: 1.4rem; font-weight: 700;
    cursor: pointer; transition: all 0.3s; margin-bottom: 1.5rem; box-shadow: 0 6px 24px rgba(229,62,62,0.4);
    letter-spacing: 0.02em; font-family: var(--font-display);
    animation: sosPulse 2s infinite;
  }
  .sos-btn:hover { transform: scale(1.02); box-shadow: 0 8px 32px rgba(229,62,62,0.55); }
  .sos-btn:disabled { opacity: 0.7; cursor: not-allowed; animation: none; }
  @keyframes sosPulse { 0%,100% { box-shadow: 0 6px 24px rgba(229,62,62,0.4); } 50% { box-shadow: 0 6px 40px rgba(229,62,62,0.7); } }

  /* SOS success banner */
  .sos-success-banner {
    background: #f0fff4; border: 2px solid #38a169; border-radius: var(--radius);
    padding: 1.2rem 1.5rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 1rem;
  }
  .sos-success-banner .banner-icon { font-size: 2rem; }
  .sos-success-banner .banner-text { font-size: 1rem; color: #276749; font-weight: 600; }
  .sos-success-banner .banner-sub { font-size: 0.85rem; color: #38a169; margin-top: 0.2rem; }

  .contacts-list { display: flex; flex-direction: column; gap: 0.6rem; }
  .contact-chip { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 0.8rem 1rem; display: flex; align-items: center; gap: 0.8rem; }
  .contact-avatar { width: 38px; height: 38px; border-radius: 50%; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.1rem; flex-shrink: 0; }
  
  .independence-ring { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.2rem; text-align: center; }
  .ring-value { font-size: 1.8rem; font-weight: 700; color: var(--primary); font-family: var(--font-display); }
  .ring-label { font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem; }
  
  .safety-tips { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.2rem; }
  .safety-tips h3 { font-family: var(--font-display); color: var(--primary); margin-bottom: 0.8rem; font-size: 1rem; }
  .tip-item { display: flex; align-items: flex-start; gap: 0.6rem; padding: 0.5rem 0; border-bottom: 1px solid var(--border); font-size: 0.92rem; }
  .tip-item:last-child { border-bottom: none; }
  .tip-icon { flex-shrink: 0; }

  /* MEDICINE */
  .medicine-tabs { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; }
  .med-tab { flex: 1; padding: 0.8rem; background: var(--surface); border: 2px solid var(--border); border-radius: var(--radius-sm); cursor: pointer; font-size: 0.95rem; font-family: var(--font-body); color: var(--text); transition: all 0.2s; font-weight: 500; }
  .med-tab.active { background: var(--primary); color: #fff; border-color: var(--primary); }
  .medicine-results { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; }
  .medicine-item { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 1.2rem; box-shadow: var(--shadow); }
  .medicine-item h4 { font-family: var(--font-display); color: var(--primary); margin-bottom: 0.6rem; font-size: 1.05rem; }
  .medicine-item p { font-size: 0.93rem; color: var(--text); line-height: 1.6; margin-bottom: 0.3rem; }
  .disclaimer-box { background: var(--gold-light); border: 1px solid var(--gold); border-radius: var(--radius-sm); padding: 1rem; font-size: 0.88rem; color: #7c5a00; }
  /* Dataset badge */
  .source-badge { display: inline-block; font-size: 0.73rem; padding: 0.2rem 0.6rem; border-radius: 20px; margin-bottom: 0.5rem; font-weight: 600; }
  .source-badge.dataset { background: #e6f4ea; color: #1a6b3a; }
  .source-badge.ai { background: #e8eaff; color: #3b4db8; }

  /* MODAL */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 1rem; }
  .modal-card { background: var(--card); border-radius: var(--radius); padding: 2rem; width: 100%; max-width: 400px; box-shadow: var(--shadow-lg); }
  .modal-card h3 { font-family: var(--font-display); color: var(--primary); margin-bottom: 1.2rem; }
  .modal-actions { display: flex; gap: 0.8rem; margin-top: 0.5rem; }

  /* TOAST */
  .toast { position: fixed; top: 1rem; right: 1rem; background: var(--primary); color: #fff; padding: 0.8rem 1.4rem; border-radius: var(--radius-sm); z-index: 999; box-shadow: var(--shadow-lg); font-size: 0.95rem; max-width: 320px; animation: slideIn 0.3s ease; }
  .toast.error { background: #e53e3e; }
  @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

  @media (max-width: 600px) {
    html { font-size: 15px; }
    .quick-actions { grid-template-columns: 1fr 1fr; }
    .mood-grid { grid-template-columns: repeat(2, 1fr); }
    .chat-messages { height: 320px; }
  }
`;

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState('lang');
  const [lang, setLang] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('ec_token'));
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [toast, setToast] = useState(null);

  const t = useCallback((key) => T[lang || 'en'][key] || key, [lang]);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    if (token) {
      apiFetch('/api/me', {}, token).then(data => {
        if (!data.error) { setUser(data); setLang(data.language || 'en'); setScreen('dashboard'); }
        else { localStorage.removeItem('ec_token'); setToken(null); }
      });
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('ec_token'); setToken(null); setUser(null); setScreen('lang'); setLang(null);
  };

  return (
    <div className="app">
      <style>{styles}</style>
      {toast && <div className={`toast ${toast.type === 'error' ? 'error' : ''}`}>{toast.msg}</div>}
      {screen !== 'lang' && screen !== 'auth' && screen !== 'setup' && (
        <header className="header">
          <div className="header-logo">Elder<span>Care</span> AI</div>
          <div className="header-actions">
            <button className="btn-icon" onClick={() => setScreen('dashboard')}>🏠</button>
            <button className="btn-icon" onClick={logout}>{t('logout')}</button>
          </div>
        </header>
      )}
      {screen === 'lang' && <LangScreen t={t} onSelect={l => { setLang(l); setScreen('auth'); }} />}
      {screen === 'auth' && <AuthScreen t={t} lang={lang} authMode={authMode} setAuthMode={setAuthMode} onSuccess={(tk, u) => { localStorage.setItem('ec_token', tk); setToken(tk); setUser(u); setScreen(authMode === 'signup' ? 'setup' : 'dashboard'); }} showToast={showToast} />}
      {screen === 'setup' && <SetupScreen t={t} token={token} user={user} setUser={setUser} onDone={() => setScreen('dashboard')} showToast={showToast} />}
      {screen === 'dashboard' && <Dashboard t={t} user={user} setUser={setUser} token={token} navigate={setScreen} showToast={showToast} />}
      {screen === 'askai' && <AskAIScreen t={t} user={user} token={token} navigate={setScreen} lang={lang} />}
      {screen === 'reminders' && <RemindersScreen t={t} token={token} navigate={setScreen} showToast={showToast} />}
      {screen === 'safety' && <SafetyScreen t={t} token={token} user={user} navigate={setScreen} showToast={showToast} />}
      {screen === 'medicine' && <MedicineScreen t={t} token={token} navigate={setScreen} lang={lang} />}
    </div>
  );
}

// ─── LANGUAGE SCREEN ──────────────────────────────────────────────────────────
function LangScreen({ t, onSelect }) {
  return (
    <div className="lang-screen">
      <div className="lang-logo">Elder<span>Care</span> AI 🌿</div>
      <h2>{t('selectLang')}</h2>
      <p>{t('langSubtitle')}</p>
      <div className="lang-btns">
        <button className="lang-btn" onClick={() => onSelect('en')}><span className="flag">🇬🇧</span> English</button>
        <button className="lang-btn" onClick={() => onSelect('kn')}><span className="flag">🇮🇳</span> ಕನ್ನಡ</button>
      </div>
    </div>
  );
}

// ─── AUTH SCREEN ──────────────────────────────────────────────────────────────
function AuthScreen({ t, lang, authMode, setAuthMode, onSuccess, showToast }) {
  const [form, setForm] = useState({ name: '', dob: '', age: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const calcAge = (dob) => {
    if (!dob) return '';
    return Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  };

  const submit = async () => {
    setError(''); setLoading(true);
    try {
      const endpoint = authMode === 'signup' ? '/api/signup' : '/api/login';
      const body = authMode === 'signup' ? { ...form, language: lang } : { email: form.email, password: form.password };
      const data = await apiFetch(endpoint, { method: 'POST', body: JSON.stringify(body) });
      if (data.error) { setError(data.error); } else { onSuccess(data.token, data.user); }
    } catch { setError('Connection error. Please try again.'); }
    setLoading(false);
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h1>{t('welcome')}</h1>
        <p>{t('subtitle')}</p>
        {error && <div className="error-msg">{error}</div>}
        {authMode === 'signup' && (
          <>
            <div className="form-group"><label>{t('name')}</label><input value={form.name} onChange={e => f('name', e.target.value)} placeholder="e.g. Ramesh Kumar" /></div>
            <div className="form-row">
              <div className="form-group"><label>{t('dob')}</label><input type="date" value={form.dob} onChange={e => { f('dob', e.target.value); f('age', calcAge(e.target.value)); }} /></div>
              <div className="form-group"><label>{t('age')}</label><input value={form.age} readOnly placeholder="Auto-calculated" /></div>
            </div>
          </>
        )}
        <div className="form-group"><label>{t('email')}</label><input type="email" value={form.email} onChange={e => f('email', e.target.value)} placeholder="email@example.com" /></div>
        <div className="form-group"><label>{t('password')}</label><input type="password" value={form.password} onChange={e => f('password', e.target.value)} placeholder="••••••••" /></div>
        <button className="btn-primary" onClick={submit} disabled={loading}>{loading ? '...' : authMode === 'signup' ? t('signup') : t('login')}</button>
        <div className="auth-switch">
          {authMode === 'login' ? <>{t('newUser')} <a onClick={() => setAuthMode('signup')}>{t('signup')}</a></> : <>{t('existingUser')} <a onClick={() => setAuthMode('login')}>{t('login')}</a></>}
        </div>
      </div>
    </div>
  );
}

// ─── SETUP SCREEN ─────────────────────────────────────────────────────────────
function SetupScreen({ t, token, user, setUser, onDone, showToast }) {
  const [health, setHealth] = useState('');
  const [contacts, setContacts] = useState([
    { name: '', phone: '', email: '', relation: '' },
    { name: '', phone: '', email: '', relation: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const addContact = () => setContacts(c => [...c, { name: '', phone: '', email: '', relation: '' }]);
  const updateContact = (i, k, v) => setContacts(c => c.map((x, j) => j === i ? { ...x, [k]: v } : x));

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const form = new FormData();
    form.append('pdf', file);
    const res = await fetch(`${API}/api/upload/health-pdf`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form });
    const data = await res.json();
    if (data.success) { setHealth(p => p + '\n' + data.extracted); showToast('PDF uploaded successfully'); }
  };

  const save = async () => {
    const validContacts = contacts.filter(c => c.name && c.phone);
    if (validContacts.length < 2) { showToast('Please add at least 2 family contacts', 'error'); return; }
    setLoading(true);
    const data = await apiFetch('/api/me', { method: 'PUT', body: JSON.stringify({ healthConditions: health, familyContacts: validContacts }) }, token);
    setUser(data); setLoading(false); showToast('Profile saved!'); onDone();
  };

  return (
    <div className="auth-screen" style={{ alignItems: 'flex-start', paddingTop: '2rem' }}>
      <div className="auth-card setup-card">
        <h1>{t('healthInfo')}</h1>
        <p>Add your health info and emergency contacts for safety.</p>

        <div className="form-group">
          <label>{t('healthConditions')}</label>
          <textarea value={health} onChange={e => setHealth(e.target.value)} placeholder={t('healthPlaceholder')} rows={4} />
        </div>

        <div className="upload-area" onClick={() => fileRef.current.click()}>
          📎 {t('uploadPdf')}
          <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleFile} />
        </div>

        <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--primary)', margin: '1.5rem 0 0.8rem' }}>{t('familyContacts')}</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>
          💡 Add email addresses to receive SOS alerts automatically
        </p>
        {contacts.map((c, i) => (
          <div key={i} className="contact-card">
            <div className="form-row">
              <div className="form-group"><label>{t('contactName')}</label><input value={c.name} onChange={e => updateContact(i, 'name', e.target.value)} placeholder="e.g. Anita" /></div>
              <div className="form-group"><label>{t('contactPhone')}</label><input value={c.phone} onChange={e => updateContact(i, 'phone', e.target.value)} placeholder="+91 9876543210" /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Email (for SOS alerts)</label><input type="email" value={c.email} onChange={e => updateContact(i, 'email', e.target.value)} placeholder="family@email.com" /></div>
              <div className="form-group"><label>{t('contactRelation')}</label><input value={c.relation} onChange={e => updateContact(i, 'relation', e.target.value)} placeholder="Son / Daughter" /></div>
            </div>
          </div>
        ))}
        <button className="btn-add" onClick={addContact}>{t('addContact')}</button>
        <button className="btn-primary" onClick={save} disabled={loading} style={{ marginTop: '1.5rem' }}>
          {loading ? 'Saving...' : t('continueBtn')}
        </button>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ t, user, setUser, token, navigate, showToast }) {
  const [tasks, setTasks] = useState([]);
  const [time, setTime] = useState(new Date());
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [bp, setBp] = useState(user?.bp || '120/80');
  const [steps, setSteps] = useState(user?.steps || 0);

  useEffect(() => {
    apiFetch('/api/tasks', {}, token).then(setTasks);
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const hour = time.getHours();
  const greeting = hour < 12 ? t('goodMorning') : hour < 17 ? t('goodAfternoon') : t('goodEvening');
  const completed = tasks.filter(t => t.completed).length;
  const pct = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  const catIcon = { medication: '💊', exercise: '🏃', hydration: '💧', health: '❤️', social: '👥' };

  const toggleTask = async (task) => {
    const updated = await apiFetch(`/api/tasks/${task.id}`, { method: 'PUT', body: JSON.stringify({ completed: !task.completed }) }, token);
    setTasks(ts => ts.map(t => t.id === task.id ? updated : t));
  };

  const saveHealth = async () => {
    await apiFetch('/api/health/log', { method: 'POST', body: JSON.stringify({ bp, steps: parseInt(steps) }) }, token);
    const updated = await apiFetch('/api/me', { method: 'PUT', body: JSON.stringify({ bp, steps: parseInt(steps) }) }, token);
    setUser(updated); setShowUpdateModal(false); showToast('Health data updated!');
  };

  return (
    <div className="dashboard">
      <div className="greeting-card">
        <div className="greeting-text">
          <h2>{greeting}, {user?.name?.split(' ')[0]}! 🌿</h2>
          <p>{new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="datetime-badge">
          <div className="time">{time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
          <div className="date">{pct}% tasks done</div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon">❤️</div><div className="stat-value">{user?.bp}</div><div className="stat-label">{t('bp')}</div></div>
        <div className="stat-card"><div className="stat-icon">👟</div><div className="stat-value">{(user?.steps || 0).toLocaleString()}</div><div className="stat-label">{t('steps')}</div></div>
        <div className="stat-card"><div className="stat-icon">✅</div><div className="stat-value">{completed}/{tasks.length}</div><div className="stat-label">Tasks Done</div></div>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setShowUpdateModal(true)}>
          <div className="stat-icon">📊</div>
          <div className="stat-value" style={{ fontSize: '0.95rem' }}>{t('updateHealth')}</div>
          <div className="stat-label">Tap to update</div>
        </div>
      </div>

      <div className="quick-actions">
        <button className="action-btn" onClick={() => navigate('askai')}><span className="icon">🤖</span><span className="label">{t('askAI')}</span></button>
        <button className="action-btn" onClick={() => navigate('reminders')}><span className="icon">⏰</span><span className="label">{t('reminders')}</span></button>
        <button className="action-btn sos" onClick={() => navigate('safety')}><span className="icon">🛡️</span><span className="label">{t('safety')}</span></button>
        <button className="action-btn" onClick={() => navigate('medicine')}><span className="icon">💊</span><span className="label">Medicine AI</span></button>
      </div>

      <div className="tasks-card">
        <h3>{t('todayTasks')}</h3>
        <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
        <div className="progress-label">{completed}/{tasks.length} tasks completed • {pct}%</div>
        {tasks.map(task => (
          <div key={task.id} className="task-item">
            <div className={`task-check ${task.completed ? 'done' : ''}`} onClick={() => toggleTask(task)} />
            <span className={`task-text ${task.completed ? 'done' : ''}`}>{task.title}</span>
            <span className="task-cat">{catIcon[task.category] || '📌'} {task.category}</span>
          </div>
        ))}
      </div>

      {showUpdateModal && (
        <div className="modal-overlay" onClick={() => setShowUpdateModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3>{t('updateHealth')}</h3>
            <div className="form-group"><label>{t('updateBP')} (e.g. 120/80)</label><input value={bp} onChange={e => setBp(e.target.value)} placeholder="120/80" /></div>
            <div className="form-group"><label>{t('updateSteps')}</label><input type="number" value={steps} onChange={e => setSteps(e.target.value)} placeholder="5000" /></div>
            <div className="modal-actions">
              <button className="btn-primary" onClick={saveHealth} style={{ flex: 1 }}>{t('save')}</button>
              <button className="btn-secondary" onClick={() => setShowUpdateModal(false)} style={{ flex: 1 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 🔴 FEATURE 1 — IMPROVED AI CHAT SCREEN
// Changes:
//   • Full conversation history sent to backend on every message (memory)
//   • Emergency detection: highlights message in red with urgent action
//   • Typing indicator while waiting for response
//   • Quick-suggestion chips for common elder queries
//   • Mood selector pre-fills input with context
// ════════════════════════════════════════════════════════════════════════════
function AskAIScreen({ t, user, token, navigate, lang }) {
  const firstName = user?.name?.split(' ')[0] || 'Friend';
  const welcomeMsg = lang === 'kn'
    ? `ನಮಸ್ಕಾರ ${firstName}! ನಾನು ನಿಮ್ಮ ElderCare AI ಸಹಾಯಕ. ಆರೋಗ್ಯ, ಔಷಧಿ, ವ್ಯಾಯಾಮ — ಏನಾದರೂ ಕೇಳಿ 😊`
    : `Hello ${firstName}! I'm your ElderCare AI — here to help with health tips, medicines, exercises, or just a friendly chat. 😊`;

  const [messages, setMessages] = useState([{ role: 'ai', content: welcomeMsg, isEmergency: false }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mood, setMood] = useState(null);
  const bottomRef = useRef();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setLoading(true);
    setMessages(m => [...m, { role: 'user', content: userMsg }]);

    // Pass full conversation history for memory
    const history = messages
      .filter(m => m.role !== 'typing')
      .map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content }));

    try {
      const data = await apiFetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: userMsg, history, language: lang })
      }, token);

      setMessages(m => [...m, {
        role: 'ai',
        content: data.reply || 'Sorry, I could not respond right now.',
        isEmergency: data.isEmergency || false
      }]);
    } catch {
      setMessages(m => [...m, { role: 'ai', content: 'Connection issue. Please try again. For emergencies, press the SOS button or call 112.', isEmergency: false }]);
    }
    setLoading(false);
  };

  const suggestions = lang === 'kn'
    ? ['ಇಂದು ಮಾಡಬೇಕಾದ ವ್ಯಾಯಾಮ?', 'ಉತ್ತಮ ನಿದ್ರೆಗೆ ಸಲಹೆ?', 'ನಾನು ದಣಿದ ಭಾವನೆ', 'BP ಕಡಿಮೆ ಮಾಡುವ ಉಪಾಯ?']
    : ['Exercise tips for my age?', 'Tips for better sleep', 'I feel lonely today', 'How to manage blood pressure?'];

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('dashboard')}>{t('backHome')}</button>
        <h2>{t('askAITitle')}</h2>
      </div>

      {/* Mood selector */}
      <div style={{ background: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>{t('feelingToday')}</div>
        <div className="mood-grid">
          {[['great', '😊'], ['good', '🙂'], ['okay', '😐'], ['low', '😢']].map(([k, emoji]) => (
            <button key={k} className={`mood-btn ${mood === k ? 'selected' : ''}`}
              onClick={() => { setMood(k); setInput(lang === 'kn' ? `ಇಂದು ನಾನು ${t(k)} ಭಾವನೆ ಹೊಂದಿದ್ದೇನೆ` : `I am feeling ${k} today`); }}>
              <span className="mood-emoji">{emoji}</span>{t(k)}
            </button>
          ))}
        </div>
      </div>

      {/* Quick suggestion chips */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {suggestions.map((s, i) => (
          <button key={i} onClick={() => setInput(s)}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '50px', padding: '0.4rem 0.9rem', fontSize: '0.83rem', cursor: 'pointer', color: 'var(--text)' }}>
            {s}
          </button>
        ))}
      </div>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`chat-msg ${m.role}${m.isEmergency ? ' emergency' : ''}`}>
              {m.role === 'ai' && <div className="sender">ElderCare AI 🌿{m.isEmergency ? ' 🚨' : ''}</div>}
              {m.isEmergency && (
                <div style={{ background: '#e53e3e', color: '#fff', borderRadius: '6px', padding: '0.4rem 0.8rem', marginBottom: '0.6rem', fontSize: '0.85rem', fontWeight: 700 }}>
                  🚨 EMERGENCY DETECTED — Press SOS or Call 112 Now
                </div>
              )}
              {m.content}
            </div>
          ))}
          {loading && (
            <div className="chat-msg ai">
              <div className="sender">ElderCare AI 🌿</div>
              <div className="typing-indicator"><span /><span /><span /></div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div className="chat-input-row">
          <input className="chat-input" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()} placeholder={t('chatPlaceholder')} />
          <button className="btn-send" onClick={send} disabled={loading}>{t('send')}</button>
          <button onClick={() => { setMessages([{ role: 'ai', content: welcomeMsg }]); setMood(null); }}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}>🗑️</button>
        </div>
      </div>
    </div>
  );
}

// ─── REMINDERS SCREEN ─────────────────────────────────────────────────────────
function RemindersScreen({ t, token, navigate, showToast }) {
  const [reminders, setReminders] = useState([]);
  const [form, setForm] = useState({ name: '', time: '', type: 'medication', note: '' });
  const [showForm, setShowForm] = useState(false);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => { apiFetch('/api/reminders', {}, token).then(setReminders); }, []);

  const typeIcons = { medication: '💊', exercise: '🏃', appointment: '🏥', hydration: '💧', custom: '📌' };
  const typeColors = { medication: '#FFE5F1', exercise: '#E0F7E9', appointment: '#E8EAFF', hydration: '#E0F4FF', custom: '#FFF3CD' };

  const add = async () => {
    if (!form.name || !form.time) { showToast('Please fill name and time', 'error'); return; }
    const r = await apiFetch('/api/reminders', { method: 'POST', body: JSON.stringify(form) }, token);
    setReminders(rs => [...rs, r]); setForm({ name: '', time: '', type: 'medication', note: '' }); setShowForm(false); showToast('Reminder added!');
  };

  const del = async (id) => {
    await apiFetch(`/api/reminders/${id}`, { method: 'DELETE' }, token);
    setReminders(rs => rs.filter(r => r.id !== id)); showToast('Reminder removed');
  };

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('dashboard')}>{t('backHome')}</button>
        <h2>{t('remindersTitle')}</h2>
        <button className="btn-icon" onClick={() => setShowForm(!showForm)} style={{ marginLeft: 'auto' }}>+ {t('addReminder')}</button>
      </div>

      {showForm && (
        <div className="add-reminder-form">
          <div className="form-row">
            <div className="form-group"><label>{t('reminderName')}</label><input value={form.name} onChange={e => f('name', e.target.value)} placeholder="e.g. Morning Metformin" /></div>
            <div className="form-group"><label>{t('reminderTime')}</label><input type="time" value={form.time} onChange={e => f('time', e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>{t('reminderType')}</label>
              <select value={form.type} onChange={e => f('type', e.target.value)}>
                {['medication', 'exercise', 'appointment', 'hydration', 'custom'].map(tp => <option key={tp} value={tp}>{t(tp)}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Notes (optional)</label><input value={form.note} onChange={e => f('note', e.target.value)} placeholder="Any special note..." /></div>
          </div>
          <button className="btn-primary" onClick={add}>{t('save')}</button>
        </div>
      )}

      {reminders.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>No reminders yet. Add your first reminder!</div>}
      {reminders.map(r => (
        <div key={r.id} className="reminder-card">
          <div className="reminder-icon" style={{ background: typeColors[r.type] || '#f5f5f5' }}>{typeIcons[r.type] || '📌'}</div>
          <div className="reminder-info">
            <div className="reminder-name">{r.name}</div>
            <div className="reminder-time">⏰ {r.time} • {r.type} {r.note ? `• ${r.note}` : ''}</div>
          </div>
          <button className="btn-del" onClick={() => del(r.id)}>🗑️</button>
        </div>
      ))}

      <div style={{ marginTop: '2rem', background: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '1.5rem' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--primary)', marginBottom: '1rem' }}>💡 Health Tips</h3>
        {['Take medication at the same time every day for best effect.', 'Light walks after meals help control blood sugar.', 'Drink water every 2 hours to stay hydrated.', 'Call a family member daily for emotional well-being.'].map((tip, i) => (
          <div key={i} className="tip-item"><span className="tip-icon">✅</span><span>{tip}</span></div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 🔴 FEATURE 2 — SAFETY / SOS SCREEN
// Changes:
//   • sendSOS now shows success banner with number of contacts notified
//   • Location is captured and sent to backend
//   • Contact list displays email addresses added during setup
//   • Clear "what happens when you press SOS" explanation for elderly
// ════════════════════════════════════════════════════════════════════════════
function SafetyScreen({ t, token, user, navigate, showToast }) {
  const [sosSending, setSosSending] = useState(false);
  const [sosResult, setSosResult] = useState(null);
  const [sosMsg, setSosMsg] = useState('');
  const [location, setLocation] = useState('Getting location...');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    apiFetch('/api/emergency/history', {}, token).then(setHistory);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setLocation(`Lat: ${pos.coords.latitude.toFixed(4)}, Lon: ${pos.coords.longitude.toFixed(4)}`),
        () => setLocation('Location unavailable — please enable GPS')
      );
    }
  }, []);

  const sendSOS = async () => {
    if (sosSending) return;
    setSosSending(true);
    setSosResult(null);
    try {
      const data = await apiFetch('/api/emergency/sos', {
        method: 'POST',
        body: JSON.stringify({ message: sosMsg || 'Emergency! Please help me.', location })
      }, token);

      if (data.success) {
        setSosResult(data);
        setHistory(h => [data.alert, ...h]);
        showToast(`✅ SOS sent to ${data.notified} contact(s)!`);
      } else {
        showToast('SOS failed. Please call 112 immediately!', 'error');
      }
    } catch {
      showToast('Network error. Call 112 immediately!', 'error');
    }
    setSosSending(false);
  };

  const [indScore] = useState(Math.floor(Math.random() * 20) + 75);

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('dashboard')}>{t('backHome')}</button>
        <h2>{t('safetyTitle')}</h2>
      </div>

      {/* What SOS does — explanation for elderly */}
      <div style={{ background: 'var(--gold-light)', border: '1px solid var(--gold)', borderRadius: 'var(--radius-sm)', padding: '1rem 1.2rem', marginBottom: '1.2rem', fontSize: '0.9rem', color: '#7c5a00' }}>
        <strong>ℹ️ When you press SOS:</strong> Your family contacts will receive an alert email with your name, location, and time. Please also call 112 if it is life-threatening.
      </div>

      <button className="sos-btn" onClick={sendSOS} disabled={sosSending}>
        {sosSending ? '📡 ' + t('sosSending') : t('sosBtn')}
      </button>

      {/* Success banner after SOS */}
      {sosResult && (
        <div className="sos-success-banner">
          <div className="banner-icon">✅</div>
          <div>
            <div className="banner-text">{t('sosSuccess')}</div>
            <div className="banner-sub">{sosResult.message}</div>
            {sosResult.results?.map((r, i) => (
              <div key={i} style={{ fontSize: '0.8rem', color: '#276749', marginTop: '0.2rem' }}>
                📧 {r.name} — {r.status}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="form-group" style={{ marginBottom: '1.2rem' }}>
        <label>Describe what happened (optional)</label>
        <input value={sosMsg} onChange={e => setSosMsg(e.target.value)}
          placeholder="e.g. I fell down, chest pain, feeling very dizzy..."
          style={{ width: '100%', padding: '0.8rem 1rem', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-body)', fontSize: '1rem', outline: 'none' }} />
      </div>

      <div className="contacts-list" style={{ marginBottom: '1.2rem' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--primary)', marginBottom: '0.8rem' }}>👨‍👩‍👧 Emergency Contacts</h3>
        {(user?.familyContacts || []).map((c, i) => (
          <div key={i} className="contact-chip">
            <div className="contact-avatar">{c.name?.[0]?.toUpperCase()}</div>
            <div>
              <div style={{ fontWeight: 600 }}>{c.name}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {c.phone} • {c.relation}
                {c.email && <span style={{ color: 'var(--primary)', marginLeft: '0.4rem' }}>✉️ {c.email}</span>}
              </div>
            </div>
          </div>
        ))}
        {(!user?.familyContacts || user.familyContacts.length === 0) && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No contacts added. Please update your profile.</p>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="independence-ring">
          <div className="ring-value">{indScore}%</div>
          <div className="ring-label">{t('independenceScore')}</div>
        </div>
        <div className="independence-ring">
          <div className="ring-value">📍</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.3rem' }}>{location}</div>
        </div>
      </div>

      <div className="safety-tips">
        <h3>{t('activityMonitor')}</h3>
        {[['🚶', 'Keep moving — even short walks help'], ['🏠', 'Check in with family daily'], ['💊', 'Never skip prescribed medication'], ['🚨', 'Call 112 in life-threatening emergencies'], ['🧘', 'Practice deep breathing for stress']].map(([icon, tip], i) => (
          <div key={i} className="tip-item"><span className="tip-icon">{icon}</span><span>{tip}</span></div>
        ))}
      </div>

      {history.length > 0 && (
        <div style={{ marginTop: '1.5rem', background: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '1.2rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--primary)', marginBottom: '0.8rem' }}>Alert History</h3>
          {history.slice(0, 5).map((a, i) => (
            <div key={i} style={{ fontSize: '0.88rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              🔴 {a.type} — {new Date(a.timestamp).toLocaleString()} — {a.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 🔴 FEATURE 3 — MEDICINE ASSISTANT SCREEN
// Changes:
//   • Shows "📦 From Dataset" vs "🤖 AI Generated" badge so user knows source
//   • Symptom quick-pick chips for common elder issues
//   • Results display is cleaner with structured cards
//   • Fallback message is friendly for elderly
// ════════════════════════════════════════════════════════════════════════════
function MedicineScreen({ t, token, navigate, lang }) {
  const [tab, setTab] = useState('symptom');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fromDataset, setFromDataset] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);

  const commonSymptoms = ['headache', 'fever', 'knee pain', 'cold', 'dizziness', 'stomach pain', 'back pain', 'constipation'];
  const commonMedicines = ['paracetamol', 'metformin', 'amlodipine', 'aspirin', 'omeprazole', 'cetirizine'];

  const search = async (q = query) => {
    if (!q.trim()) return;
    setLoading(true); setResults(null); setFromDataset(false);
    const data = await apiFetch('/api/medicine/lookup', {
      method: 'POST',
      body: JSON.stringify({ query: q, type: tab === 'symptom' ? 'symptom_to_medicine' : 'medicine_to_symptom', language: lang })
    }, token);

    // Detect if response came from dataset (dataset results have specific structure and no AI latency)
    setFromDataset(!!(data.medicines?.[0]?.name && data.medicines?.[0]?.name !== 'Please consult a doctor'));
    setResults(data);
    setLoading(false);
  };

  const exportReport = async () => {
    setReportLoading(true);
    const data = await apiFetch('/api/report', {}, token);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `eldercare_report_${new Date().toISOString().slice(0,10)}.json`; a.click();
    URL.revokeObjectURL(url); setReportLoading(false);
  };

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('dashboard')}>{t('backHome')}</button>
        <h2>{t('medicineTitle')}</h2>
      </div>

      <div className="medicine-tabs">
        <button className={`med-tab ${tab === 'symptom' ? 'active' : ''}`}
          onClick={() => { setTab('symptom'); setResults(null); setQuery(''); }}>
          🤒 Symptom → Medicine
        </button>
        <button className={`med-tab ${tab === 'medicine' ? 'active' : ''}`}
          onClick={() => { setTab('medicine'); setResults(null); setQuery(''); }}>
          💊 Medicine → Info
        </button>
      </div>

      {/* Quick-pick chips */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
        {(tab === 'symptom' ? commonSymptoms : commonMedicines).map(chip => (
          <button key={chip} onClick={() => { setQuery(chip); search(chip); }}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '50px', padding: '0.3rem 0.8rem', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text)', textTransform: 'capitalize' }}>
            {chip}
          </button>
        ))}
      </div>

      <div className="form-group">
        <label>{tab === 'symptom' ? t('symptomInput') : t('medicineInput')}</label>
        <input value={query} onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
          placeholder={tab === 'symptom' ? 'e.g. headache, knee pain, dizziness...' : 'e.g. Paracetamol, Metformin, Aspirin...'}
          style={{ width: '100%', padding: '0.8rem 1rem', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-body)', fontSize: '1rem', outline: 'none' }} />
      </div>
      <button className="btn-primary" onClick={() => search()} disabled={loading} style={{ marginBottom: '1.5rem' }}>
        {loading ? '🔍 Searching...' : tab === 'symptom' ? t('searchSymptom') : t('searchMedicine')}
      </button>

      {results && (
        <div className="medicine-results">
          {/* Source badge */}
          <div>
            <span className={`source-badge ${fromDataset && tab === 'symptom' ? 'dataset' : 'ai'}`}>
              {fromDataset && tab === 'symptom' ? '📦 From Medical Dataset' : '🤖 AI Generated'}
            </span>
          </div>

          {tab === 'symptom' && results.medicines?.map((m, i) => (
            <div key={i} className="medicine-item">
              <h4>💊 {m.name}</h4>
              <p><strong>Use:</strong> {m.use}</p>
              <p><strong>Dosage:</strong> {m.dosage}</p>
              {m.warning && <p style={{ color: 'var(--accent-dark)', marginTop: '0.4rem' }}>⚠️ <strong>Warning:</strong> {m.warning}</p>}
            </div>
          ))}

          {tab === 'medicine' && (
            <>
              {results.conditions?.length > 0 && (
                <div className="medicine-item">
                  <h4>🩺 What It Treats</h4>
                  <p>{Array.isArray(results.conditions) ? results.conditions.join(' • ') : results.conditions}</p>
                </div>
              )}
              {results.sideEffects?.length > 0 && (
                <div className="medicine-item">
                  <h4>⚠️ Side Effects (Especially for Elderly)</h4>
                  <ul style={{ paddingLeft: '1.2rem' }}>
                    {(Array.isArray(results.sideEffects) ? results.sideEffects : [results.sideEffects]).map((s, i) => <li key={i} style={{ fontSize: '0.93rem', marginBottom: '0.3rem' }}>{s}</li>)}
                  </ul>
                </div>
              )}
              {results.precautions?.length > 0 && (
                <div className="medicine-item">
                  <h4>🛡️ Precautions for Elderly</h4>
                  <ul style={{ paddingLeft: '1.2rem' }}>
                    {(Array.isArray(results.precautions) ? results.precautions : [results.precautions]).map((p, i) => <li key={i} style={{ fontSize: '0.93rem', marginBottom: '0.3rem' }}>{p}</li>)}
                  </ul>
                </div>
              )}
            </>
          )}

          <div className="disclaimer-box">⚠️ {results.disclaimer || t('disclaimer')}</div>
        </div>
      )}

      <div style={{ marginTop: '2rem', background: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '1.5rem' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--primary)', marginBottom: '1rem' }}>📄 Health Report</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>Export a complete health report including reminders, health logs, tasks, and emergency alerts.</p>
        <button className="btn-primary" onClick={exportReport} disabled={reportLoading}>
          {reportLoading ? t('downloading') : t('exportReport')}
        </button>
      </div>
    </div>
  );
}
