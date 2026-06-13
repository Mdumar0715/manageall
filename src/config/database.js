const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

let db = null;

const DB_PATH = path.resolve(process.env.DB_PATH || './data/manageall.db');

/**
 * Initialize the SQLite database and create all tables
 */
async function initDatabase() {
  const SQL = await initSqlJs();
  const dbDir = path.dirname(DB_PATH);

  // Create data directory if it doesn't exist
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Load existing database or create new one
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
    console.log('📂 Loaded existing database');
  } else {
    db = new SQL.Database();
    console.log('🆕 Created new database');
  }

  // Create tables
  createTables();

  // Save to disk
  saveDatabase();

  console.log('✅ Database initialized successfully');
  return db;
}

/**
 * Create all tables if they don't exist
 */
function createTables() {
  db.run(`
    CREATE TABLE IF NOT EXISTS timetable (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      subject TEXT NOT NULL,
      room TEXT,
      professor TEXT,
      color TEXT DEFAULT '#6366f1',
      created_at DATETIME DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS gym_schedule (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day TEXT NOT NULL,
      time TEXT NOT NULL,
      workout_type TEXT,
      exercises TEXT,
      is_rest_day INTEGER DEFAULT 0,
      alarm_enabled INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL,
      category TEXT,
      status TEXT DEFAULT 'pending',
      target_date DATE,
      completed_at DATETIME,
      created_at DATETIME DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      date DATE DEFAULT (date('now')),
      created_at DATETIME DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS budget_limits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT UNIQUE NOT NULL,
      monthly_limit REAL NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS health (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date DATE UNIQUE DEFAULT (date('now')),
      weight REAL,
      sleep_hours REAL,
      water_intake REAL,
      mood TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS exams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      exam_date DATE NOT NULL,
      exam_type TEXT NOT NULL,
      subject TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS syllabus (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exam_id INTEGER NOT NULL,
      topic TEXT NOT NULL,
      status TEXT DEFAULT 'not_started',
      priority INTEGER DEFAULT 0,
      completed_at DATETIME,
      created_at DATETIME DEFAULT (datetime('now')),
      FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS pomodoro_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      duration_minutes INTEGER NOT NULL,
      type TEXT NOT NULL,
      label TEXT,
      started_at DATETIME NOT NULL,
      ended_at DATETIME,
      completed INTEGER DEFAULT 0
    )
  `);
}

/**
 * Save database to disk
 */
function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

/**
 * Get the database instance
 */
function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

module.exports = { initDatabase, getDb, saveDatabase };
