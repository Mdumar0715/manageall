const HealthModel = require('../models/health.model');

const HealthController = {
  getAll(req, res, next) {
    try {
      const { from, to } = req.query;
      const rows = HealthModel.getAll(from || null, to || null);
      res.json(rows);
    } catch (err) { next(err); }
  },

  getToday(req, res, next) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const entry = HealthModel.getByDate(today);
      res.json(entry || { date: today, weight: null, sleep_hours: null, water_intake: null, mood: null, notes: null });
    } catch (err) { next(err); }
  },

  upsert(req, res, next) {
    try {
      const { date, weight, sleep_hours, water_intake, mood, notes } = req.body;
      const entry = HealthModel.upsert({ date, weight, sleep_hours, water_intake, mood, notes });
      res.json({ entry, message: 'Health update saved' });
    } catch (err) { next(err); }
  },

  update(req, res, next) {
    try {
      HealthModel.update(parseInt(req.params.id), req.body);
      res.json({ message: 'Health update modified' });
    } catch (err) { next(err); }
  }
};

module.exports = HealthController;
