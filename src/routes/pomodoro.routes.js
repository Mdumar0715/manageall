const express = require('express');
const router = express.Router();
const PomodoroController = require('../controllers/pomodoro.controller');

router.post('/start', PomodoroController.start);
router.put('/:id/complete', PomodoroController.complete);
router.put('/:id/cancel', PomodoroController.cancel);
router.get('/stats', PomodoroController.getStats);
router.get('/recent', PomodoroController.getRecent);

module.exports = router;
