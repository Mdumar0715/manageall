const ExpensesModel = require('../models/expenses.model');

// Default expense categories for the conversational input
const EXPENSE_CATEGORIES = ['food', 'transport', 'drinks', 'entertainment', 'groceries', 'shopping', 'bills', 'education', 'health', 'other'];

const ExpensesController = {
  getAll(req, res, next) {
    try {
      const { from, to } = req.query;
      const rows = ExpensesModel.getAll(from || null, to || null);
      res.json(rows);
    } catch (err) { next(err); }
  },

  create(req, res, next) {
    try {
      const { amount, category, description, date } = req.body;
      if (!amount || !category) {
        return res.status(400).json({ error: 'amount and category are required' });
      }
      const id = ExpensesModel.create({ amount: parseFloat(amount), category, description, date });
      res.status(201).json({ id, message: 'Expense logged successfully' });
    } catch (err) { next(err); }
  },

  /**
   * Conversational expense input
   * Accepts: { food: 150, transport: 50, drinks: 80, ... }
   * Asks "How much did you spend on X today?" for each category
   */
  createFromConversational(req, res, next) {
    try {
      const { expenses, date } = req.body;
      if (!expenses || typeof expenses !== 'object') {
        return res.status(400).json({
          error: 'expenses object is required',
          example: { food: 150, transport: 50, drinks: 80 },
          categories: EXPENSE_CATEGORIES
        });
      }
      const ids = ExpensesModel.createFromConversational(expenses, date);
      res.status(201).json({
        ids,
        message: `${ids.length} expenses logged successfully`,
        total: Object.values(expenses).reduce((sum, val) => sum + (parseFloat(val) || 0), 0)
      });
    } catch (err) { next(err); }
  },

  delete(req, res, next) {
    try {
      ExpensesModel.delete(parseInt(req.params.id));
      res.json({ message: 'Expense deleted successfully' });
    } catch (err) { next(err); }
  },

  getSummary(req, res, next) {
    try {
      const { from, to } = req.query;
      const summary = ExpensesModel.getSummary(from || null, to || null);
      res.json(summary);
    } catch (err) { next(err); }
  },

  getCategories(req, res, next) {
    try {
      res.json(EXPENSE_CATEGORIES);
    } catch (err) { next(err); }
  },

  getBudgets(req, res, next) {
    try {
      const budgets = ExpensesModel.getBudgets();
      res.json(budgets);
    } catch (err) { next(err); }
  },

  setBudget(req, res, next) {
    try {
      const { category, monthly_limit } = req.body;
      if (!category || !monthly_limit) {
        return res.status(400).json({ error: 'category and monthly_limit are required' });
      }
      ExpensesModel.setBudget(category, parseFloat(monthly_limit));
      res.json({ message: 'Budget set successfully' });
    } catch (err) { next(err); }
  }
};

module.exports = ExpensesController;
