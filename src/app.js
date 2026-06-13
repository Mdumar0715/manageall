const express = require('express');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const timetableRoutes = require('./routes/timetable.routes');
const gymRoutes = require('./routes/gym.routes');
const goalsRoutes = require('./routes/goals.routes');
const expensesRoutes = require('./routes/expenses.routes');
const healthRoutes = require('./routes/health.routes');
const examsRoutes = require('./routes/exams.routes');
const syllabusRoutes = require('./routes/syllabus.routes');
const pomodoroRoutes = require('./routes/pomodoro.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const aiRoutes = require('./routes/ai.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '..', 'public')));

// API Routes
app.use('/api/timetable', timetableRoutes);
app.use('/api/gym', gymRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/exams', examsRoutes);
app.use('/api/syllabus', syllabusRoutes);
app.use('/api/pomodoro', pomodoroRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);

// Catch-all: serve frontend for any non-API route
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
