const { getDb, saveDatabase } = require('../config/database');

const SyllabusModel = {
  getByExam(examId) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM syllabus WHERE exam_id = ? ORDER BY priority DESC, id ASC');
    stmt.bind([examId]);
    const results = [];
    while (stmt.step()) results.push(stmt.getAsObject());
    stmt.free();
    return results;
  },

  create({ exam_id, topic, status, priority }) {
    const db = getDb();
    db.run(
      'INSERT INTO syllabus (exam_id, topic, status, priority) VALUES (?, ?, ?, ?)',
      [exam_id, topic, status || 'not_started', priority || 0]
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
    db.run(`UPDATE syllabus SET ${sets} WHERE id = ?`, [...values, id]);
    saveDatabase();
  },

  delete(id) {
    const db = getDb();
    db.run('DELETE FROM syllabus WHERE id = ?', [id]);
    saveDatabase();
  },

  getProgress(examId) {
    const db = getDb();
    const total = db.exec('SELECT COUNT(*) FROM syllabus WHERE exam_id = ?', [examId]);
    const completed = db.exec("SELECT COUNT(*) FROM syllabus WHERE exam_id = ? AND status = 'completed'", [examId]);
    const inProgress = db.exec("SELECT COUNT(*) FROM syllabus WHERE exam_id = ? AND status = 'in_progress'", [examId]);

    const totalCount = total[0]?.values[0][0] || 0;
    const completedCount = completed[0]?.values[0][0] || 0;
    const inProgressCount = inProgress[0]?.values[0][0] || 0;

    return {
      total: totalCount,
      completed: completedCount,
      in_progress: inProgressCount,
      not_started: totalCount - completedCount - inProgressCount,
      percentage: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
    };
  }
};

module.exports = SyllabusModel;
