/**
 * Utility helper functions
 */

const helpers = {
  /**
   * Get the current date as YYYY-MM-DD
   */
  today() {
    return new Date().toISOString().split('T')[0];
  },

  /**
   * Get the start of the current week (Monday)
   */
  weekStart() {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.setDate(diff)).toISOString().split('T')[0];
  },

  /**
   * Get the start of the current month
   */
  monthStart() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  },

  /**
   * Format minutes into hours and minutes
   */
  formatDuration(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  },

  /**
   * Get day name from date string
   */
  getDayName(dateStr) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date(dateStr).getDay()];
  }
};

module.exports = helpers;
