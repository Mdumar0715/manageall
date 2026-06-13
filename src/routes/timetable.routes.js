const express = require('express');
const router = express.Router();
const TimetableController = require('../controllers/timetable.controller');

router.get('/', TimetableController.getAll);
router.get('/day/:day', TimetableController.getByDay);
router.post('/', TimetableController.create);
router.put('/:id', TimetableController.update);
router.delete('/:id', TimetableController.delete);

module.exports = router;
