/**
 * Browser Notification Manager
 */
const NotificationManager = {
  permission: 'default',
  checkInterval: null,

  async init() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
      if (this.permission === 'default') {
        this.permission = await Notification.requestPermission();
      }
    }

    // Check for alerts every 60 seconds
    this.startAlertCheck();
  },

  send(title, body, options = {}) {
    if (this.permission !== 'granted') return;

    try {
      const notification = new Notification(title, {
        body,
        icon: '/assets/icon.png',
        badge: '/assets/icon.png',
        silent: false,
        ...options
      });

      // Auto-close after 8 seconds
      setTimeout(() => notification.close(), 8000);
    } catch (e) {
      console.log('Notification error:', e);
    }
  },

  startAlertCheck() {
    // Check immediately
    this.checkAlerts();

    // Then every 60 seconds
    this.checkInterval = setInterval(() => this.checkAlerts(), 60000);
  },

  async checkAlerts() {
    try {
      // We'll check current timetable vs current time on client side
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const today = dayNames[now.getDay()];

      // Check classes
      const classes = await API.get(`/timetable/day/${today}`);
      classes.forEach(cls => {
        const minutesUntil = getMinutesBetween(currentTime, cls.start_time);
        if (minutesUntil === 10) {
          this.send(`📚 ${cls.subject} in 10 minutes`, `Room: ${cls.room || 'N/A'}`);
          App.showToast(`📚 ${cls.subject} starts in 10 min`, 'warning');
        }
      });

      // Check gym
      const gym = await API.get(`/gym/day/${today}`);
      gym.forEach(g => {
        if (g.is_rest_day || !g.alarm_enabled) return;
        const minutesUntil = getMinutesBetween(currentTime, g.time);
        if (minutesUntil === 10) {
          this.send('🏋️ Gym time in 10 minutes!', `Workout: ${g.workout_type || 'General'}`);
          App.showToast('🏋️ Gym time in 10 min!', 'warning');
        }
      });

      // Update notification badge
      const badge = document.getElementById('notification-badge');
      const exams = await API.get('/exams/upcoming?limit=5');
      const urgentExams = exams.filter(e => e.days_remaining <= 3 && e.days_remaining >= 0);
      if (badge) {
        if (urgentExams.length > 0) {
          badge.style.display = 'flex';
          badge.textContent = urgentExams.length;
        } else {
          badge.style.display = 'none';
        }
      }
    } catch (e) {
      // Silent fail — API might not be ready
    }
  }
};

function getMinutesBetween(from, to) {
  const [fH, fM] = from.split(':').map(Number);
  const [tH, tM] = to.split(':').map(Number);
  return (tH * 60 + tM) - (fH * 60 + fM);
}
