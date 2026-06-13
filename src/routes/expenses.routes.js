const express = require('express');
const router = express.Router();
const ExpensesController = require('../controllers/expenses.controller');

router.get('/', ExpensesController.getAll);
router.get('/summary', ExpensesController.getSummary);
router.get('/categories', ExpensesController.getCategories);
router.get('/budgets', ExpensesController.getBudgets);
router.post('/', ExpensesController.create);
router.post('/daily', ExpensesController.createFromConversational);
router.post('/budget', ExpensesController.setBudget);
router.delete('/:id', ExpensesController.delete);

module.exports = router;
