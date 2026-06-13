const PomodoroModel = require('../models/pomodoro.model');

const PomodoroController = {
  start(req, res, next) {
    try {
      const { duration_minutes, type, label } = req.body;
      const session = PomodoroModel.start({ duration_minutes, type, label });
      res.status(201).json({ ...session, message: 'Pomodoro session started' });
    } catch (err) { next(err); }
  },

  complete(req, res, next) {
    try {
      PomodoroModel.complete(parseInt(req.params.id));
      res.json({ message: 'Pomodoro session completed!' });
    } catch (err) { next(err); }
  },

  cancel(req, res, next) {
    try {
      PomodoroModel.cancel(parseInt(req.params.id));
      res.json({ message: 'Pomodoro session cancelled' });
    } catch (err) { next(err); }
  },

  getStats(req, res, next) {
    try {
      const { from, to } = req.query;
      const stats = PomodoroModel.getStats(from || null, to || null);
      res.json(stats);
    } catch (err) { next(err); }
  },

  getRecent(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const sessions = PomodoroModel.getRecent(limit);
      res.json(sessions);
    } catch (err) { next(err); }
  }
};

module.exports = PomodoroController;
