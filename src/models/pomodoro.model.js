const { getDb, saveDatabase } = require('../config/database');

const PomodoroModel = {
  start({ duration_minutes, type, label }) {
    const db = getDb();
    const started_at = new Date().toISOString();
    db.run(
      'INSERT INTO pomodoro_sessions (duration_minutes, type, label, started_at) VALUES (?, ?, ?, ?)',
      [duration_minutes || 25, type || 'work', label || null, started_at]
    );
    saveDatabase();
    const result = db.exec('SELECT last_insert_rowid() as id');
    return { id: result[0]?.values[0][0], started_at };
  },

  complete(id) {
    const db = getDb();
    const ended_at = new Date().toISOString();
    db.run(
      'UPDATE pomodoro_sessions SET completed = 1, ended_at = ? WHERE id = ?',
      [ended_at, id]
    );
    saveDatabase();
  },

  cancel(id) {
    const db = getDb();
    const ended_at = new Date().toISOString();
    db.run(
      'UPDATE pomodoro_sessions SET completed = 0, ended_at = ? WHERE id = ?',
      [ended_at, id]
    );
    saveDatabase();
  },

  getStats(from = null, to = null) {
    const db = getDb();
    let whereClause = "WHERE type = 'work' AND completed = 1";
    const params = [];

    if (from) { whereClause += ' AND started_at >= ?'; params.push(from); }
    if (to) { whereClause += ' AND started_at <= ?'; params.push(to); }

    // Total sessions and minutes
    const totalResult = db.exec(
      `SELECT COUNT(*) as sessions, COALESCE(SUM(duration_minutes), 0) as total_minutes FROM pomodoro_sessions ${whereClause}`,
      params
    );

    // Daily breakdown
    const dailyStmt = db.prepare(
      `SELECT DATE(started_at) as date, COUNT(*) as sessions, SUM(duration_minutes) as minutes FROM pomodoro_sessions ${whereClause} GROUP BY DATE(started_at) ORDER BY date`
    );
    if (params.length) dailyStmt.bind(params);
    const daily = [];
    while (dailyStmt.step()) daily.push(dailyStmt.getAsObject());
    dailyStmt.free();

    return {
      total_sessions: totalResult[0]?.values[0][0] || 0,
      total_minutes: totalResult[0]?.values[0][1] || 0,
      daily
    };
  },

  getRecent(limit = 10) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM pomodoro_sessions ORDER BY started_at DESC LIMIT ?');
    stmt.bind([limit]);
    const results = [];
    while (stmt.step()) results.push(stmt.getAsObject());
    stmt.free();
    return results;
  }
};

module.exports = PomodoroModel;
