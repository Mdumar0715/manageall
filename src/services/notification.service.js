/**
 * Notification Service
 * Handles scheduling and checking for upcoming alerts
 * (Server-side: checks schedule and returns what needs alerting)
 */

const TimetableModel = require('../models/timetable.model');
const GymModel = require('../models/gym.model');
const ExamsModel = require('../models/exams.model');

const NotificationService = {
  /**
   * Get all upcoming events that need alerts
   */
  getUpcomingAlerts() {
    const now = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = dayNames[now.getDay()];
    const currentTime = now.toTimeString().substring(0, 5); // HH:MM

    const alerts = [];

    // Check upcoming classes (within next 15 minutes)
    try {
      const todayClasses = TimetableModel.getByDay(currentDay);
      todayClasses.forEach(cls => {
        const classTime = cls.start_time;
        const minutesUntil = getMinutesDifference(currentTime, classTime);
        if (minutesUntil > 0 && minutesUntil <= 15) {
          alerts.push({
            type: 'class',
            title: `📚 ${cls.subject} in ${minutesUntil} min`,
            body: `Room: ${cls.room || 'N/A'} | Prof: ${cls.professor || 'N/A'}`,
            time: cls.start_time,
            urgency: minutesUntil <= 5 ? 'high' : 'medium'
          });
        }
      });
    } catch (e) { /* ignore */ }

    // Check gym schedule
    try {
      const todayGym = GymModel.getByDay(currentDay);
      todayGym.forEach(gym => {
        if (gym.is_rest_day || !gym.alarm_enabled) return;
        const minutesUntil = getMinutesDifference(currentTime, gym.time);
        if (minutesUntil > 0 && minutesUntil <= 15) {
          alerts.push({
            type: 'gym',
            title: `🏋️ Gym time in ${minutesUntil} min`,
            body: `Workout: ${gym.workout_type || 'General'}`,
            time: gym.time,
            urgency: 'medium'
          });
        }
      });
    } catch (e) { /* ignore */ }

    // Check exams approaching (within 3 days)
    try {
      const upcomingExams = ExamsModel.getUpcoming(10);
      upcomingExams.forEach(exam => {
        if (exam.days_remaining <= 3 && exam.days_remaining >= 0) {
          alerts.push({
            type: 'exam',
            title: `⚠️ ${exam.name} in ${exam.days_remaining} day(s)`,
            body: `Type: ${exam.exam_type} | Subject: ${exam.subject || 'N/A'}`,
            time: exam.exam_date,
            urgency: exam.days_remaining <= 1 ? 'high' : 'medium'
          });
        }
      });
    } catch (e) { /* ignore */ }

    return alerts;
  }
};

/**
 * Calculate minutes between two HH:MM time strings
 */
function getMinutesDifference(from, to) {
  const [fH, fM] = from.split(':').map(Number);
  const [tH, tM] = to.split(':').map(Number);
  return (tH * 60 + tM) - (fH * 60 + fM);
}

module.exports = NotificationService;
