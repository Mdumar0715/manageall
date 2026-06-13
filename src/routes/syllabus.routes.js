const express = require('express');
const router = express.Router();
const SyllabusController = require('../controllers/syllabus.controller');

router.get('/exam/:examId', SyllabusController.getByExam);
router.get('/progress/:examId', SyllabusController.getProgress);
router.post('/', SyllabusController.create);
router.put('/:id', SyllabusController.update);
router.delete('/:id', SyllabusController.delete);

module.exports = router;
