const express = require('express');
const router = express.Router();
const ExamsController = require('../controllers/exams.controller');

router.get('/', ExamsController.getAll);
router.get('/upcoming', ExamsController.getUpcoming);
router.get('/:id', ExamsController.getById);
router.post('/', ExamsController.create);
router.put('/:id', ExamsController.update);
router.delete('/:id', ExamsController.delete);

module.exports = router;
