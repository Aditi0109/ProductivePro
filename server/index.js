const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Simple mock user for demo
const DEMO_USER_ID = 'demo-user';

// In-memory storage for the demo (for simplicity)
let currentSession = null;
let blockedSites = [
  { id: 1, url: 'facebook.com', category: 'social_media', isActive: true },
  { id: 2, url: 'twitter.com', category: 'social_media', isActive: true },
  { id: 3, url: 'youtube.com', category: 'entertainment', isActive: true },
  { id: 4, url: 'reddit.com', category: 'social_media', isActive: true }
];
let whitelistSites = [
  { id: 1, url: 'github.com', category: 'work', isActive: true },
  { id: 2, url: 'stackoverflow.com', category: 'work', isActive: true },
  { id: 3, url: 'docs.google.com', category: 'work', isActive: true }
];
let schedules = [
  { id: 1, name: 'Deep Work Morning', dayOfWeek: 1, startTime: '09:00', endTime: '12:00', isActive: true, blockingType: 'blacklist' },
  { id: 2, name: 'Focus Afternoon', dayOfWeek: 2, startTime: '14:00', endTime: '17:00', isActive: true, blockingType: 'whitelist' }
];
let pomodoroSessions = [];
let nudges = [
  { id: 1, type: 'focus_reminder', message: 'Time for a focused work session!', isRead: false, createdAt: new Date() },
  { id: 2, type: 'break_reminder', message: 'Take a 5-minute break to recharge.', isRead: false, createdAt: new Date() }
];

// Track daily stats
let dailyStats = {
  totalProductiveTime: 0, // in minutes
  totalDistractedTime: 0, // in minutes (pause time)
  sessionsCompleted: 0,
  lastResetDate: new Date().toDateString()
};

// API Routes

// Pomodoro Timer Routes
app.get('/api/pomodoro/current', (req, res) => {
  res.json(currentSession);
});

app.post('/api/pomodoro/start', (req, res) => {
  const { duration, type } = req.body;
  
  // Reset daily stats if it's a new day
  const today = new Date().toDateString();
  if (dailyStats.lastResetDate !== today) {
    dailyStats = {
      totalProductiveTime: 0,
      totalDistractedTime: 0,
      sessionsCompleted: 0,
      lastResetDate: today
    };
  }
  
  currentSession = {
    id: Date.now(),
    userId: DEMO_USER_ID,
    duration: duration || 25,
    type: type || 'work',
    startTime: new Date(),
    endTime: null,
    completed: false,
    timeRemaining: (duration || 25) * 60, // in seconds
    totalPauseTime: 0, // track total time paused
    lastPauseStart: null,
    actualWorkTime: 0 // actual focused time excluding pauses
  };
  
  pomodoroSessions.push(currentSession);
  res.json(currentSession);
});

app.post('/api/pomodoro/pause', (req, res) => {
  if (currentSession && !currentSession.lastPauseStart) {
    currentSession.lastPauseStart = new Date();
    res.json({ success: true, pausedAt: currentSession.lastPauseStart });
  } else {
    res.status(400).json({ error: 'No active session or already paused' });
  }
});

app.post('/api/pomodoro/resume', (req, res) => {
  if (currentSession && currentSession.lastPauseStart) {
    const pauseDuration = (new Date() - currentSession.lastPauseStart) / 1000 / 60; // in minutes
    currentSession.totalPauseTime += pauseDuration;
    currentSession.lastPauseStart = null;
    dailyStats.totalDistractedTime += pauseDuration;
    res.json({ success: true, totalPauseTime: currentSession.totalPauseTime });
  } else {
    res.status(400).json({ error: 'No session to resume' });
  }
});

app.post('/api/pomodoro/complete', (req, res) => {
  if (currentSession) {
    currentSession.endTime = new Date();
    currentSession.completed = true;
    currentSession.timeRemaining = 0;
    
    // Calculate actual work time (total duration minus pause time)
    const totalSessionTime = (currentSession.endTime - currentSession.startTime) / 1000 / 60; // in minutes
    currentSession.actualWorkTime = Math.max(0, currentSession.duration - currentSession.totalPauseTime);
    
    // Update daily stats
    dailyStats.totalProductiveTime += currentSession.actualWorkTime;
    dailyStats.sessionsCompleted += 1;
    
    // Update the session in the array
    const index = pomodoroSessions.findIndex(s => s.id === currentSession.id);
    if (index !== -1) {
      pomodoroSessions[index] = currentSession;
    }
    
    res.json(currentSession);
    currentSession = null;
  } else {
    res.status(400).json({ error: 'No active session' });
  }
});

app.post('/api/pomodoro/stop', (req, res) => {
  if (currentSession) {
    currentSession.endTime = new Date();
    currentSession.completed = false;
    
    // If there was an active pause, calculate final pause time
    if (currentSession.lastPauseStart) {
      const pauseDuration = (new Date() - currentSession.lastPauseStart) / 1000 / 60; // in minutes
      currentSession.totalPauseTime += pauseDuration;
      dailyStats.totalDistractedTime += pauseDuration;
      currentSession.lastPauseStart = null;
    }
    
    // Update the session in the array
    const index = pomodoroSessions.findIndex(s => s.id === currentSession.id);
    if (index !== -1) {
      pomodoroSessions[index] = currentSession;
    }
    
    res.json(currentSession);
    currentSession = null;
  } else {
    res.status(400).json({ error: 'No active session' });
  }
});

app.get('/api/pomodoro/history', (req, res) => {
  res.json(pomodoroSessions.slice(-10)); // Last 10 sessions
});

// Site Blocking Routes
app.get('/api/blocked-sites', (req, res) => {
  res.json(blockedSites.filter(site => site.isActive));
});

app.post('/api/blocked-sites', (req, res) => {
  const { url, category } = req.body;
  const newSite = {
    id: Date.now(),
    url,
    category: category || 'other',
    isActive: true
  };
  blockedSites.push(newSite);
  res.json(newSite);
});

app.delete('/api/blocked-sites/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = blockedSites.findIndex(site => site.id === id);
  if (index !== -1) {
    blockedSites[index].isActive = false;
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Site not found' });
  }
});

// Whitelist Routes
app.get('/api/whitelist-sites', (req, res) => {
  res.json(whitelistSites.filter(site => site.isActive));
});

app.post('/api/whitelist-sites', (req, res) => {
  const { url, category } = req.body;
  const newSite = {
    id: Date.now(),
    url,
    category: category || 'work',
    isActive: true
  };
  whitelistSites.push(newSite);
  res.json(newSite);
});

app.delete('/api/whitelist-sites/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = whitelistSites.findIndex(site => site.id === id);
  if (index !== -1) {
    whitelistSites[index].isActive = false;
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Site not found' });
  }
});

// Schedule Routes
app.get('/api/schedules', (req, res) => {
  res.json(schedules.filter(schedule => schedule.isActive));
});

app.post('/api/schedules', (req, res) => {
  const { name, dayOfWeek, startTime, endTime, blockingType } = req.body;
  const newSchedule = {
    id: Date.now(),
    name,
    dayOfWeek,
    startTime,
    endTime,
    blockingType,
    isActive: true
  };
  schedules.push(newSchedule);
  res.json(newSchedule);
});

app.delete('/api/schedules/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = schedules.findIndex(schedule => schedule.id === id);
  if (index !== -1) {
    schedules[index].isActive = false;
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Schedule not found' });
  }
});

// Usage Insights Routes
app.get('/api/insights', (req, res) => {
  // Reset daily stats if it's a new day
  const today = new Date().toDateString();
  if (dailyStats.lastResetDate !== today) {
    dailyStats = {
      totalProductiveTime: 0,
      totalDistractedTime: 0,
      sessionsCompleted: 0,
      lastResetDate: today
    };
  }
  
  // Calculate focus score: focused time vs total time (focused + distracted)
  const totalTime = dailyStats.totalProductiveTime + dailyStats.totalDistractedTime;
  const focusScore = totalTime > 0 ? Math.round((dailyStats.totalProductiveTime / totalTime) * 100) : 0;
  
  const insights = {
    totalProductiveTime: Math.round(dailyStats.totalProductiveTime), // in minutes
    totalDistractedTime: Math.round(dailyStats.totalDistractedTime), // in minutes (pause time)
    pomodoroCount: dailyStats.sessionsCompleted,
    sitesBlocked: blockedSites.filter(s => s.isActive).length,
    focusScore: focusScore,
    timeAway: Math.round(dailyStats.totalDistractedTime), // time paused
    currentSession: currentSession ? {
      totalPauseTime: Math.round(currentSession.totalPauseTime || 0),
      isPaused: !!currentSession.lastPauseStart
    } : null
  };
  
  res.json(insights);
});

// FocusFuel Routes
app.get('/api/focusfuel/quote', async (req, res) => {
  try {
    // In production, this would cache quotes and use a real API
    const fallbackQuotes = [
      { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
      { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
      { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
      { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
      { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
      { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
      { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
      { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
      { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
      { text: "Life is what happens to you while you're busy making other plans.", author: "John Lennon" }
    ];
    
    const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    res.json(randomQuote);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quote' });
  }
});

// SnapStudy Routes
app.post('/api/snapstudy/generate', (req, res) => {
  const { count = 10, difficulty = 'medium' } = req.body;
  
  // Mock flashcard generation (in production would use PDF extraction + AI)
  const mockFlashcards = [
    { question: "What is the main concept discussed in the document?", answer: "The document discusses productivity techniques and focus management strategies." },
    { question: "According to the text, what is the Pomodoro Technique?", answer: "A time management method using 25-minute focused work sessions followed by short breaks." },
    { question: "What are the benefits of website blocking mentioned?", answer: "Reduces distractions, improves focus, and increases overall productivity during work sessions." },
    { question: "How does the blocking schedule feature work?", answer: "It automatically activates website blocking during specified time periods and days of the week." },
    { question: "What metrics are tracked in the insights dashboard?", answer: "Productive time, distracted time, focus score, completed sessions, and blocked sites count." },
    { question: "What is the purpose of productivity tools?", answer: "To help users maintain focus, eliminate distractions, and track their work patterns for improvement." },
    { question: "How does time management affect productivity?", answer: "Proper time management helps structure work sessions, provides regular breaks, and maintains sustained focus." },
    { question: "What are the different timer preset options?", answer: "25 minutes for standard sessions, 15 minutes for shorter sessions, and 5 minutes for quick breaks." },
    { question: "How is focus score calculated?", answer: "As a percentage of productive time versus total time including breaks and distractions." },
    { question: "What happens during fullscreen timer mode?", answer: "The timer takes over the entire screen to minimize distractions and maximize focus." }
  ];
  
  const flashcards = mockFlashcards.slice(0, count).map((card, index) => ({
    id: index + 1,
    question: card.question,
    answer: card.answer,
    difficulty: difficulty
  }));
  
  res.json({ flashcards, count: flashcards.length });
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`ProductivePro server running on port ${PORT}`);
});