const express = require('express');
const router = express.Router();
const GoalsController = require('../controllers/goals.controller');

router.get('/', GoalsController.getAll);
router.get('/stats', GoalsController.getStats);
router.get('/:id', GoalsController.getById);
router.post('/', GoalsController.create);
router.put('/:id', GoalsController.update);
router.delete('/:id', GoalsController.delete);

module.exports = router;
