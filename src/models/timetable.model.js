const { getDb, saveDatabase } = require('../config/database');

const TimetableModel = {
  getAll() {
    const db = getDb();
    return db.exec('SELECT * FROM timetable ORDER BY CASE day WHEN "Monday" THEN 1 WHEN "Tuesday" THEN 2 WHEN "Wednesday" THEN 3 WHEN "Thursday" THEN 4 WHEN "Friday" THEN 5 WHEN "Saturday" THEN 6 WHEN "Sunday" THEN 7 END, start_time');
  },

  getByDay(day) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM timetable WHERE day = ? ORDER BY start_time');
    stmt.bind([day]);
    const results = [];
    while (stmt.step()) results.push(stmt.getAsObject());
    stmt.free();
    return results;
  },

  create({ day, start_time, end_time, subject, room, professor, color }) {
    const db = getDb();
    db.run(
      'INSERT INTO timetable (day, start_time, end_time, subject, room, professor, color) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [day, start_time, end_time, subject, room || null, professor || null, color || '#6366f1']
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
    db.run(`UPDATE timetable SET ${sets} WHERE id = ?`, [...values, id]);
    saveDatabase();
  },

  delete(id) {
    const db = getDb();
    db.run('DELETE FROM timetable WHERE id = ?', [id]);
    saveDatabase();
  }
};

module.exports = TimetableModel;
