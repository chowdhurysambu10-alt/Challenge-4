import bcrypt from 'bcryptjs';

// Relational database table mock representations for in-memory persistence
let usersTable = [];
let schedulesTable = [];
let concessionsTable = [];
let aiUsageTable = [];
let incidentsTable = [];

// Seed flag
let isSeeded = false;

export async function initDb() {
  if (isSeeded) return;

  // 1. Seed users with hashed passwords
  const salt = await bcrypt.genSalt(10);
  const fanHash = await bcrypt.hash('fan123', salt);
  const staffHash = await bcrypt.hash('staff123', salt);
  const adminHash = await bcrypt.hash('admin123', salt);

  usersTable = [
    { id: 1, email: 'fan@fifa.com', passwordHash: fanHash, role: 'fan', name: 'Diego Maradona' },
    { id: 2, email: 'staff@fifa.com', passwordHash: staffHash, role: 'staff', name: 'Staff Dispatcher' },
    { id: 3, email: 'admin@fifa.com', passwordHash: adminHash, role: 'admin', name: 'Stadium Director' }
  ];

  // 2. Seed match schedules for FIFA World Cup 2026 at Hard Rock Stadium
  schedulesTable = [
    { id: 101, match: 'Group A: USA vs Italy', date: '2026-06-15', time: '18:00', status: 'Scheduled' },
    { id: 102, match: 'Group C: Argentina vs Spain', date: '2026-06-18', time: '20:00', status: 'Scheduled' },
    { id: 103, match: 'Group F: Brazil vs France', date: '2026-06-22', time: '15:00', status: 'Scheduled' },
    { id: 104, match: 'Round of 16: Winner A vs Runner-up B', date: '2026-06-29', time: '17:00', status: 'Scheduled' }
  ];

  // 3. Seed concessions
  concessionsTable = [
    { id: 'food-1', name: 'Golden Goal Burgers', zone: 'Zone A', location: 'Concourse Level 1', type: 'food' },
    { id: 'food-2', name: 'Kickoff Tacos', zone: 'Zone B', location: 'Block 118 Concourse', type: 'food' },
    { id: 'food-3', name: 'Header Hotdogs', zone: 'Zone C', location: 'Block 204', type: 'food' },
    { id: 'food-4', name: 'World Cup Coffee', zone: 'Zone D', location: 'Level 2', type: 'food' }
  ];

  // 4. Seed incident log history
  incidentsTable = [
    { id: 1, timestamp: '10:15', type: 'gate-congestion', location: 'Gate 3', message: 'Gate wait time exceeded 25 mins' }
  ];

  // 5. Seed initial AI usage metrics
  aiUsageTable = [
    { id: 1, timestamp: Date.now() - 3600000, intent: 'Wayfinding', tokens: 180 },
    { id: 2, timestamp: Date.now() - 1800000, intent: 'Schedule', tokens: 210 },
    { id: 3, timestamp: Date.now(), intent: 'Emergency Exits', tokens: 195 }
  ];

  isSeeded = true;
  console.log(" FIFA Relational Database Simulation Engine Seeding Completed.");
}

// User Actions
export async function getUserByEmail(email) {
  await initDb();
  return usersTable.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function createUser(email, passwordHash, role, name) {
  await initDb();
  const newUser = {
    id: usersTable.length + 1,
    email,
    passwordHash,
    role,
    name: name || email.split('@')[0]
  };
  usersTable.push(newUser);
  return newUser;
}

// Telemetry & Concession Lists
export async function getSchedules() {
  await initDb();
  return schedulesTable;
}

export async function getConcessions() {
  await initDb();
  return concessionsTable;
}

// Incidents Logging
export async function getIncidents() {
  await initDb();
  return incidentsTable;
}

export async function logIncident(type, location, message) {
  await initDb();
  const newIncident = {
    id: incidentsTable.length + 1,
    timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    type,
    location,
    message
  };
  incidentsTable.push(newIncident);
  return newIncident;
}

// AI usage logging for Analytics charts
export async function getAiUsageStats() {
  await initDb();
  return aiUsageTable;
}

export async function logAiUsage(intent, tokens) {
  await initDb();
  const newLog = {
    id: aiUsageTable.length + 1,
    timestamp: Date.now(),
    intent,
    tokens
  };
  aiUsageTable.push(newLog);
  return newLog;
}
