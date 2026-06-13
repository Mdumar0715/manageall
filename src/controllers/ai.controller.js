const AIService = require('../services/ai.service');
const TimetableModel = require('../models/timetable.model');
const GoalsModel = require('../models/goals.model');
const ExamsModel = require('../models/exams.model');
const ExpensesModel = require('../models/expenses.model');
const HealthModel = require('../models/health.model');
const PomodoroModel = require('../models/pomodoro.model');
const SyllabusModel = require('../models/syllabus.model');

const AIController = {
  async analyze(req, res, next) {
    try {
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_api_key_here') {
        return res.status(400).json({
          error: 'Gemini API key not configured',
          message: 'Add your free API key to .env file. Get one at https://aistudio.google.com'
        });
      }

      // Gather all user data
      const timetableResult = TimetableModel.getAll();
      const timetable = timetableResult.length > 0
        ? timetableResult[0].values.map(row => {
            const obj = {};
            timetableResult[0].columns.forEach((col, i) => obj[col] = row[i]);
            return obj;
          })
        : [];

      const goals = GoalsModel.getAll();
      const exams = ExamsModel.getAll();
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const expenses = ExpensesModel.getSummary(weekAgo, today);
      const health = HealthModel.getAll(weekAgo, today);
      const pomodoro = PomodoroModel.getStats(weekAgo, today);

      // Get syllabus progress for upcoming exams
      const syllabusProgress = exams.slice(0, 5).map(exam => ({
        exam: exam.name,
        progress: SyllabusModel.getProgress(exam.id)
      }));

      const scheduleData = {
        timetable,
        goals,
        exams,
        expenses,
        health,
        pomodoro,
        syllabusProgress
      };

      const { prompt } = req.body;
      const analysis = await AIService.analyzeSchedule(scheduleData, prompt);

      res.json({ analysis });
    } catch (err) { next(err); }
  },

  async getSuggestions(req, res, next) {
    try {
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_api_key_here') {
        return res.json({
          suggestions: [
            '💡 Set up your Gemini API key for personalized AI insights',
            '📅 Add your college timetable to get started',
            '🎯 Create your first weekly goal',
            '📝 Add upcoming exams to track deadlines'
          ],
          isDefault: true
        });
      }

      // Quick suggestions based on current data
      const timetableResult = TimetableModel.getAll();
      const goals = GoalsModel.getAll();
      const exams = ExamsModel.getUpcoming(3);

      const context = { 
        hasClasses: timetableResult.length > 0,
        goalCount: goals.length,
        upcomingExams: exams.length
      };

      const suggestions = await AIService.getQuickSuggestions(context);
      res.json({ suggestions });
    } catch (err) { next(err); }
  }
};

module.exports = AIController;
