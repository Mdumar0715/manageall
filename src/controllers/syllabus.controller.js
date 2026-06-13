const SyllabusModel = require('../models/syllabus.model');

const SyllabusController = {
  getByExam(req, res, next) {
    try {
      const examId = parseInt(req.params.examId);
      const topics = SyllabusModel.getByExam(examId);
      const progress = SyllabusModel.getProgress(examId);
      res.json({ topics, progress });
    } catch (err) { next(err); }
  },

  create(req, res, next) {
    try {
      const { exam_id, topic, status, priority } = req.body;
      if (!exam_id || !topic) {
        return res.status(400).json({ error: 'exam_id and topic are required' });
      }
      const id = SyllabusModel.create({ exam_id, topic, status, priority });
      res.status(201).json({ id, message: 'Topic added successfully' });
    } catch (err) { next(err); }
  },

  update(req, res, next) {
    try {
      SyllabusModel.update(parseInt(req.params.id), req.body);
      res.json({ message: 'Topic updated successfully' });
    } catch (err) { next(err); }
  },

  delete(req, res, next) {
    try {
      SyllabusModel.delete(parseInt(req.params.id));
      res.json({ message: 'Topic deleted successfully' });
    } catch (err) { next(err); }
  },

  getProgress(req, res, next) {
    try {
      const examId = parseInt(req.params.examId);
      const progress = SyllabusModel.getProgress(examId);
      res.json(progress);
    } catch (err) { next(err); }
  }
};

module.exports = SyllabusController;
