const ExamsModel = require('../models/exams.model');

const ExamsController = {
  getAll(req, res, next) {
    try {
      const { type } = req.query;
      const rows = ExamsModel.getAll(type || null);
      res.json(rows);
    } catch (err) { next(err); }
  },

  getById(req, res, next) {
    try {
      const exam = ExamsModel.getById(parseInt(req.params.id));
      if (!exam) return res.status(404).json({ error: 'Exam not found' });
      res.json(exam);
    } catch (err) { next(err); }
  },

  create(req, res, next) {
    try {
      const { name, exam_date, exam_type, subject, notes } = req.body;
      if (!name || !exam_date || !exam_type) {
        return res.status(400).json({ error: 'name, exam_date, and exam_type are required' });
      }
      if (!['college', 'competitive'].includes(exam_type)) {
        return res.status(400).json({ error: 'exam_type must be "college" or "competitive"' });
      }
      const id = ExamsModel.create({ name, exam_date, exam_type, subject, notes });
      res.status(201).json({ id, message: 'Exam added successfully' });
    } catch (err) { next(err); }
  },

  update(req, res, next) {
    try {
      ExamsModel.update(parseInt(req.params.id), req.body);
      res.json({ message: 'Exam updated successfully' });
    } catch (err) { next(err); }
  },

  delete(req, res, next) {
    try {
      ExamsModel.delete(parseInt(req.params.id));
      res.json({ message: 'Exam deleted successfully' });
    } catch (err) { next(err); }
  },

  getUpcoming(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const rows = ExamsModel.getUpcoming(limit);
      res.json(rows);
    } catch (err) { next(err); }
  }
};

module.exports = ExamsController;
