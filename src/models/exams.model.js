const { getDb, saveDatabase } = require('../config/database');

const ExamsModel = {
  getAll(type = null) {
    const db = getDb();
    let sql = 'SELECT * FROM exams';
    const params = [];
    if (type) {
      sql += ' WHERE exam_type = ?';
      params.push(type);
    }
    sql += ' ORDER BY exam_date ASC';

    const stmt = db.prepare(sql);
    if (params.length) stmt.bind(params);
    const results = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      // Calculate days remaining
      const examDate = new Date(row.exam_date);
      const now = new Date();
      row.days_remaining = Math.ceil((examDate - now) / (1000 * 60 * 60 * 24));
      results.push(row);
    }
    stmt.free();
    return results;
  },

  getById(id) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM exams WHERE id = ?');
    stmt.bind([id]);
    let result = null;
    if (stmt.step()) {
      result = stmt.getAsObject();
      const examDate = new Date(result.exam_date);
      result.days_remaining = Math.ceil((examDate - new Date()) / (1000 * 60 * 60 * 24));
    }
    stmt.free();
    return result;
  },

  create({ name, exam_date, exam_type, subject, notes }) {
    const db = getDb();
    db.run(
      'INSERT INTO exams (name, exam_date, exam_type, subject, notes) VALUES (?, ?, ?, ?, ?)',
      [name, exam_date, exam_type, subject || null, notes || null]
    );
    saveDatabase();
    const result = db.exec('SELECT last_insert_rowid() as id');
    return result[0]?.values[0][0];
  },

  update(id, fields) {
    const db = getDb();
    const keys = Object.keys(fields);
    const sets = keys.map(k => `${k} = ?`).join(', ');
    const values = keys.map(k => fields[k]);
    db.run(`UPDATE exams SET ${sets} WHERE id = ?`, [...values, id]);
    saveDatabase();
  },

  delete(id) {
    const db = getDb();
    db.run('DELETE FROM exams WHERE id = ?', [id]);
    saveDatabase();
  },

  getUpcoming(limit = 5) {
    const db = getDb();
    const today = new Date().toISOString().split('T')[0];
    const stmt = db.prepare('SELECT * FROM exams WHERE exam_date >= ? ORDER BY exam_date ASC LIMIT ?');
    stmt.bind([today, limit]);
    const results = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      const examDate = new Date(row.exam_date);
      row.days_remaining = Math.ceil((examDate - new Date()) / (1000 * 60 * 60 * 24));
      results.push(row);
    }
    stmt.free();
    return results;
  }
};

module.exports = ExamsModel;
