const { getDb, saveDatabase } = require('../config/database');

const HealthModel = {
  getAll(from = null, to = null) {
    const db = getDb();
    let sql = 'SELECT * FROM health';
    const params = [];
    const conditions = [];

    if (from) { conditions.push('date >= ?'); params.push(from); }
    if (to) { conditions.push('date <= ?'); params.push(to); }
    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY date DESC';

    const stmt = db.prepare(sql);
    if (params.length) stmt.bind(params);
    const results = [];
    while (stmt.step()) results.push(stmt.getAsObject());
    stmt.free();
    return results;
  },

  getByDate(date) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM health WHERE date = ?');
    stmt.bind([date]);
    let result = null;
    if (stmt.step()) result = stmt.getAsObject();
    stmt.free();
    return result;
  },

  upsert({ date, weight, sleep_hours, water_intake, mood, notes }) {
    const db = getDb();
    const entryDate = date || new Date().toISOString().split('T')[0];

    // Check if entry exists for this date
    const existing = this.getByDate(entryDate);

    if (existing) {
      db.run(
        'UPDATE health SET weight = ?, sleep_hours = ?, water_intake = ?, mood = ?, notes = ? WHERE date = ?',
        [weight ?? existing.weight, sleep_hours ?? existing.sleep_hours, water_intake ?? existing.water_intake, mood ?? existing.mood, notes ?? existing.notes, entryDate]
      );
    } else {
      db.run(
        'INSERT INTO health (date, weight, sleep_hours, water_intake, mood, notes) VALUES (?, ?, ?, ?, ?, ?)',
        [entryDate, weight || null, sleep_hours || null, water_intake || null, mood || null, notes || null]
      );
    }

    saveDatabase();
    return this.getByDate(entryDate);
  },

  update(id, fields) {
    const db = getDb();
    const keys = Object.keys(fields);
    const sets = keys.map(k => `${k} = ?`).join(', ');
    const values = keys.map(k => fields[k]);
    db.run(`UPDATE health SET ${sets} WHERE id = ?`, [...values, id]);
    saveDatabase();
  }
};

module.exports = HealthModel;
