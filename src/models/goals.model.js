const { getDb, saveDatabase } = require('../config/database');

const GoalsModel = {
  getAll(type = null) {
    const db = getDb();
    let sql = 'SELECT * FROM goals';
    const params = [];
    if (type) {
      sql += ' WHERE type = ?';
      params.push(type);
    }
    sql += ' ORDER BY created_at DESC';
    const stmt = db.prepare(sql);
    if (params.length) stmt.bind(params);
    const results = [];
    while (stmt.step()) results.push(stmt.getAsObject());
    stmt.free();
    return results;
  },

  getById(id) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM goals WHERE id = ?');
    stmt.bind([id]);
    let result = null;
    if (stmt.step()) result = stmt.getAsObject();
    stmt.free();
    return result;
  },

  create({ title, description, type, category, target_date }) {
    const db = getDb();
    db.run(
      'INSERT INTO goals (title, description, type, category, target_date) VALUES (?, ?, ?, ?, ?)',
      [title, description || null, type, category || null, target_date || null]
    );
    saveDatabase();
    const result = db.exec('SELECT last_insert_rowid() as id');
    return result[0]?.values[0][0];
  },

  update(id, fields) {
    const db = getDb();
    if (fields.status === 'completed' && !fields.completed_at) {
      fields.completed_at = new Date().toISOString();
    }
    const keys = Object.keys(fields);
    const sets = keys.map(k => `${k} = ?`).join(', ');
    const values = keys.map(k => fields[k]);
    db.run(`UPDATE goals SET ${sets} WHERE id = ?`, [...values, id]);
    saveDatabase();
  },

  delete(id) {
    const db = getDb();
    db.run('DELETE FROM goals WHERE id = ?', [id]);
    saveDatabase();
  },

  getStats(type = null) {
    const db = getDb();
    let whereClause = '';
    const params = [];
    if (type) {
      whereClause = 'WHERE type = ?';
      params.push(type);
    }

    const total = db.exec(`SELECT COUNT(*) as count FROM goals ${whereClause}`, params);
    const completed = db.exec(`SELECT COUNT(*) as count FROM goals ${whereClause ? whereClause + ' AND' : 'WHERE'} status = 'completed'`, type ? [type] : []);
    const inProgress = db.exec(`SELECT COUNT(*) as count FROM goals ${whereClause ? whereClause + ' AND' : 'WHERE'} status = 'in_progress'`, type ? [type] : []);
    const pending = db.exec(`SELECT COUNT(*) as count FROM goals ${whereClause ? whereClause + ' AND' : 'WHERE'} status = 'pending'`, type ? [type] : []);

    return {
      total: total[0]?.values[0][0] || 0,
      completed: completed[0]?.values[0][0] || 0,
      in_progress: inProgress[0]?.values[0][0] || 0,
      pending: pending[0]?.values[0][0] || 0
    };
  }
};

module.exports = GoalsModel;
