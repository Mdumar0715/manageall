const { getDb, saveDatabase } = require('../config/database');

const ExpensesModel = {
  getAll(from = null, to = null) {
    const db = getDb();
    let sql = 'SELECT * FROM expenses';
    const params = [];
    const conditions = [];

    if (from) { conditions.push('date >= ?'); params.push(from); }
    if (to) { conditions.push('date <= ?'); params.push(to); }
    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY date DESC, created_at DESC';

    const stmt = db.prepare(sql);
    if (params.length) stmt.bind(params);
    const results = [];
    while (stmt.step()) results.push(stmt.getAsObject());
    stmt.free();
    return results;
  },

  create({ amount, category, description, date }) {
    const db = getDb();
    db.run(
      'INSERT INTO expenses (amount, category, description, date) VALUES (?, ?, ?, ?)',
      [amount, category, description || null, date || new Date().toISOString().split('T')[0]]
    );
    saveDatabase();
    const result = db.exec('SELECT last_insert_rowid() as id');
    return result[0]?.values[0][0];
  },

  /**
   * Bulk create from conversational input
   * e.g., { food: 150, transport: 50, drinks: 80 }
   */
  createFromConversational(entries, date) {
    const db = getDb();
    const expenseDate = date || new Date().toISOString().split('T')[0];
    const ids = [];

    for (const [category, amount] of Object.entries(entries)) {
      if (amount && amount > 0) {
        db.run(
          'INSERT INTO expenses (amount, category, description, date) VALUES (?, ?, ?, ?)',
          [amount, category, `Daily ${category} expense`, expenseDate]
        );
        const result = db.exec('SELECT last_insert_rowid() as id');
        ids.push(result[0]?.values[0][0]);
      }
    }

    saveDatabase();
    return ids;
  },

  delete(id) {
    const db = getDb();
    db.run('DELETE FROM expenses WHERE id = ?', [id]);
    saveDatabase();
  },

  getSummary(from = null, to = null) {
    const db = getDb();
    let whereClause = '';
    const params = [];
    const conditions = [];

    if (from) { conditions.push('date >= ?'); params.push(from); }
    if (to) { conditions.push('date <= ?'); params.push(to); }
    if (conditions.length) whereClause = 'WHERE ' + conditions.join(' AND ');

    // Category breakdown
    const categoryStmt = db.prepare(`SELECT category, SUM(amount) as total, COUNT(*) as count FROM expenses ${whereClause} GROUP BY category ORDER BY total DESC`);
    if (params.length) categoryStmt.bind(params);
    const categories = [];
    while (categoryStmt.step()) categories.push(categoryStmt.getAsObject());
    categoryStmt.free();

    // Daily totals
    const dailyStmt = db.prepare(`SELECT date, SUM(amount) as total FROM expenses ${whereClause} GROUP BY date ORDER BY date`);
    if (params.length) dailyStmt.bind(params);
    const daily = [];
    while (dailyStmt.step()) daily.push(dailyStmt.getAsObject());
    dailyStmt.free();

    // Grand total
    const totalResult = db.exec(`SELECT SUM(amount) as total FROM expenses ${whereClause}`, params);
    const grandTotal = totalResult[0]?.values[0][0] || 0;

    return { categories, daily, grandTotal };
  },

  // Get budget limits
  getBudgets() {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM budget_limits');
    const results = [];
    while (stmt.step()) results.push(stmt.getAsObject());
    stmt.free();
    return results;
  },

  setBudget(category, monthly_limit) {
    const db = getDb();
    db.run(
      'INSERT OR REPLACE INTO budget_limits (category, monthly_limit) VALUES (?, ?)',
      [category, monthly_limit]
    );
    saveDatabase();
  }
};

module.exports = ExpensesModel;
