const GymModel = require('../models/gym.model');

const GymController = {
  getAll(req, res, next) {
    try {
      const rows = GymModel.getAll();
      res.json(rows);
    } catch (err) { next(err); }
  },

  getByDay(req, res, next) {
    try {
      const rows = GymModel.getByDay(req.params.day);
      res.json(rows);
    } catch (err) { next(err); }
  },

  create(req, res, next) {
    try {
      const { day, time, workout_type, exercises, is_rest_day, alarm_enabled } = req.body;
      if (!day || !time) {
        return res.status(400).json({ error: 'day and time are required' });
      }
      const id = GymModel.create({ day, time, workout_type, exercises, is_rest_day, alarm_enabled });
      res.status(201).json({ id, message: 'Workout added successfully' });
    } catch (err) { next(err); }
  },

  update(req, res, next) {
    try {
      GymModel.update(parseInt(req.params.id), req.body);
      res.json({ message: 'Workout updated successfully' });
    } catch (err) { next(err); }
  },

  delete(req, res, next) {
    try {
      GymModel.delete(parseInt(req.params.id));
      res.json({ message: 'Workout deleted successfully' });
    } catch (err) { next(err); }
  }
};

module.exports = GymController;
