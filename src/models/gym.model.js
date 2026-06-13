const { getDb, saveDatabase } = require('../config/database');

const GymModel = {
  getAll() {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM gym_schedule ORDER BY CASE day WHEN "Monday" THEN 1 WHEN "Tuesday" THEN 2 WHEN "Wednesday" THEN 3 WHEN "Thursday" THEN 4 WHEN "Friday" THEN 5 WHEN "Saturday" THEN 6 WHEN "Sunday" THEN 7 END');
    const results = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      if (row.exercises) row.exercises = JSON.parse(row.exercises);
      results.push(row);
    }
    stmt.free();
    return results;
  },

  getByDay(day) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM gym_schedule WHERE day = ?');
    stmt.bind([day]);
    const results = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      if (row.exercises) row.exercises = JSON.parse(row.exercises);
      results.push(row);
    }
    stmt.free();
    return results;
  },

  create({ day, time, workout_type, exercises, is_rest_day, alarm_enabled }) {
    const db = getDb();
    const exercisesJson = exercises ? JSON.stringify(exercises) : null;
    db.run(
      'INSERT INTO gym_schedule (day, time, workout_type, exercises, is_rest_day, alarm_enabled) VALUES (?, ?, ?, ?, ?, ?)',
      [day, time, workout_type || null, exercisesJson, is_rest_day ? 1 : 0, alarm_enabled !== false ? 1 : 0]
    );
    saveDatabase();
    const result = db.exec('SELECT last_insert_rowid() as id');
    return result[0]?.values[0][0];
  },

  update(id, fields) {
    const db = getDb();
    if (fields.exercises) fields.exercises = JSON.stringify(fields.exercises);
    const keys = Object.keys(fields);
    const sets = keys.map(k => `${k} = ?`).join(', ');
    const values = keys.map(k => fields[k]);
    db.run(`UPDATE gym_schedule SET ${sets} WHERE id = ?`, [...values, id]);
    saveDatabase();
  },

  delete(id) {
    const db = getDb();
    db.run('DELETE FROM gym_schedule WHERE id = ?', [id]);
    saveDatabase();
  }
};

module.exports = GymModel;
