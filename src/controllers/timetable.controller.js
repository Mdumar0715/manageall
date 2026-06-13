const TimetableModel = require('../models/timetable.model');

const TimetableController = {
  getAll(req, res, next) {
    try {
      const result = TimetableModel.getAll();
      // sql.js exec returns array of { columns, values } 
      if (result.length === 0) return res.json([]);
      const columns = result[0].columns;
      const rows = result[0].values.map(row => {
        const obj = {};
        columns.forEach((col, i) => obj[col] = row[i]);
        return obj;
      });
      res.json(rows);
    } catch (err) { next(err); }
  },

  getByDay(req, res, next) {
    try {
      const rows = TimetableModel.getByDay(req.params.day);
      res.json(rows);
    } catch (err) { next(err); }
  },

  create(req, res, next) {
    try {
      const { day, start_time, end_time, subject, room, professor, color } = req.body;
      if (!day || !start_time || !end_time || !subject) {
        return res.status(400).json({ error: 'day, start_time, end_time, and subject are required' });
      }
      const id = TimetableModel.create({ day, start_time, end_time, subject, room, professor, color });
      res.status(201).json({ id, message: 'Class added successfully' });
    } catch (err) { next(err); }
  },

  update(req, res, next) {
    try {
      TimetableModel.update(parseInt(req.params.id), req.body);
      res.json({ message: 'Class updated successfully' });
    } catch (err) { next(err); }
  },

  delete(req, res, next) {
    try {
      TimetableModel.delete(parseInt(req.params.id));
      res.json({ message: 'Class deleted successfully' });
    } catch (err) { next(err); }
  }
};

module.exports = TimetableController;
