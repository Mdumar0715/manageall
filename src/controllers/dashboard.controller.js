const GoalsModel = require('../models/goals.model');
const ExamsModel = require('../models/exams.model');
const ExpensesModel = require('../models/expenses.model');
const HealthModel = require('../models/health.model');
const PomodoroModel = require('../models/pomodoro.model');
const TimetableModel = require('../models/timetable.model');

const DashboardController = {
  getData(req, res, next) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const currentDay = dayNames[new Date().getDay()];

      // Today's classes
      const todayClasses = TimetableModel.getByDay(currentDay);

      // Goal stats
      const weeklyGoalStats = GoalsModel.getStats('weekly');
      const monthlyGoalStats = GoalsModel.getStats('monthly');

      // Upcoming exams
      const upcomingExams = ExamsModel.getUpcoming(3);

      // Today's expenses
      const todayExpenses = ExpensesModel.getAll(today, today);
      const todaySpend = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

      // This month's expense summary
      const monthStart = today.substring(0, 7) + '-01';
      const monthlySummary = ExpensesModel.getSummary(monthStart, today);

      // Today's health
      const todayHealth = HealthModel.getByDate(today);

      // Pomodoro stats (today)
      const pomodoroStats = PomodoroModel.getStats(today + 'T00:00:00', today + 'T23:59:59');

      res.json({
        today: {
          date: today,
          day: currentDay,
          classes: todayClasses,
          spend: todaySpend,
          expenses: todayExpenses,
          health: todayHealth,
          pomodoro: pomodoroStats
        },
        goals: {
          weekly: weeklyGoalStats,
          monthly: monthlyGoalStats
        },
        exams: upcomingExams,
        monthlySpend: monthlySummary
      });
    } catch (err) { next(err); }
  }
};

module.exports = DashboardController;
