/**
 * Health Module — Frontend Logic
 */
const HealthModule = {
  moodEmojis: { great: '😄', good: '🙂', okay: '😐', bad: '😞' },

  async load() {
    this.loadCharts();
    this.loadLog();
  },

  async loadCharts() {
    try {
      const weekAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];
      const data = await API.get(`/health?from=${weekAgo}&to=${today}`);

      if (data.length > 0) {
        const sorted = [...data].reverse();
        ChartManager.createWeightChart('weight-chart', sorted);
        ChartManager.createSleepChart('sleep-chart', sorted);
      }
    } catch (e) { /* ignore */ }
  },

  async loadLog() {
    const log = document.getElementById('health-log');
    if (!log) return;

    try {
      const data = await API.get('/health');
      if (data.length === 0) {
        log.innerHTML = '<p class="empty-state">No health entries yet. Log your first day!</p>';
        return;
      }

      log.innerHTML = data.slice(0, 14).map(h => `
        <div class="health-entry">
          <span class="date">${h.date}</span>
          <div class="health-metric">
            <span class="value">${h.weight ? h.weight + ' kg' : '—'}</span>
            <span class="label">Weight</span>
          </div>
          <div class="health-metric">
            <span class="value">${h.sleep_hours ? h.sleep_hours + 'h' : '—'}</span>
            <span class="label">Sleep</span>
          </div>
          <div class="health-metric">
            <span class="value">${h.water_intake ? h.water_intake + 'L' : '—'}</span>
            <span class="label">Water</span>
          </div>
          <span class="mood-emoji">${h.mood ? this.moodEmojis[h.mood] || '😐' : '—'}</span>
          <span style="font-size:0.78rem;color:var(--text-muted);">${h.notes || ''}</span>
        </div>
      `).join('');
    } catch (e) {
      log.innerHTML = '<p class="empty-state">Failed to load health data</p>';
    }
  },

  showLogModal() {
    const today = new Date().toISOString().split('T')[0];
    App.showModal('Log Health', `
      <div class="form-group">
        <label>Date</label>
        <input type="date" id="health-date" value="${today}">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Weight (kg)</label>
          <input type="number" id="health-weight" placeholder="70" step="0.1">
        </div>
        <div class="form-group">
          <label>Sleep (hours)</label>
          <input type="number" id="health-sleep" placeholder="7" step="0.5" max="24">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Water (liters)</label>
          <input type="number" id="health-water" placeholder="2" step="0.1" max="10">
        </div>
        <div class="form-group">
          <label>Mood</label>
          <select id="health-mood">
            <option value="">Select...</option>
            <option value="great">😄 Great</option>
            <option value="good">🙂 Good</option>
            <option value="okay">😐 Okay</option>
            <option value="bad">😞 Bad</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label>Notes</label>
        <textarea id="health-notes" rows="2" placeholder="How are you feeling today?"></textarea>
      </div>
    `, async () => {
      const data = {
        date: document.getElementById('health-date').value,
        weight: parseFloat(document.getElementById('health-weight').value) || null,
        sleep_hours: parseFloat(document.getElementById('health-sleep').value) || null,
        water_intake: parseFloat(document.getElementById('health-water').value) || null,
        mood: document.getElementById('health-mood').value || null,
        notes: document.getElementById('health-notes').value || null
      };
      await API.post('/health', data);
      App.showToast('Health logged!', 'success');
      App.closeModal();
      this.load();
    });
  }
};
