const GoalsModel = require('../models/goals.model');

const GoalsController = {
  getAll(req, res, next) {
    try {
      const { type } = req.query;
      const rows = GoalsModel.getAll(type || null);
      res.json(rows);
    } catch (err) { next(err); }
  },

  getById(req, res, next) {
    try {
      const goal = GoalsModel.getById(parseInt(req.params.id));
      if (!goal) return res.status(404).json({ error: 'Goal not found' });
      res.json(goal);
    } catch (err) { next(err); }
  },

  create(req, res, next) {
    try {
      const { title, description, type, category, target_date } = req.body;
      if (!title || !type) {
        return res.status(400).json({ error: 'title and type are required' });
      }
      if (!['weekly', 'monthly'].includes(type)) {
        return res.status(400).json({ error: 'type must be "weekly" or "monthly"' });
      }
      const id = GoalsModel.create({ title, description, type, category, target_date });
      res.status(201).json({ id, message: 'Goal created successfully' });
    } catch (err) { next(err); }
  },

  update(req, res, next) {
    try {
      GoalsModel.update(parseInt(req.params.id), req.body);
      res.json({ message: 'Goal updated successfully' });
    } catch (err) { next(err); }
  },

  delete(req, res, next) {
    try {
      GoalsModel.delete(parseInt(req.params.id));
      res.json({ message: 'Goal deleted successfully' });
    } catch (err) { next(err); }
  },

  getStats(req, res, next) {
    try {
      const { type } = req.query;
      const stats = GoalsModel.getStats(type || null);
      res.json(stats);
    } catch (err) { next(err); }
  }
};

module.exports = GoalsController;
