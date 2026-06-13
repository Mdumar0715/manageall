/**
 * Goals Module — Frontend Logic
 */
const GoalsModule = {
  currentType: 'weekly',

  async load() {
    this.loadGoals();
    this.loadStats();
  },

  async loadGoals() {
    const list = document.getElementById('goals-list');
    if (!list) return;

    try {
      const goals = await API.get(`/goals?type=${this.currentType}`);
      this.renderGoals(list, goals);
    } catch (e) {
      list.innerHTML = '<p class="empty-state">Failed to load goals</p>';
    }
  },

  async loadStats() {
    const row = document.getElementById('goals-stats-row');
    if (!row) return;

    try {
      const stats = await API.get(`/goals/stats?type=${this.currentType}`);
      const rate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

      row.innerHTML = `
        <div class="stat-card stat-card-purple">
          <div class="stat-icon"><i data-lucide="list-todo"></i></div>
          <div class="stat-info">
            <span class="stat-value">${stats.total}</span>
            <span class="stat-label">Total</span>
          </div>
        </div>
        <div class="stat-card stat-card-green">
          <div class="stat-icon"><i data-lucide="check-circle-2"></i></div>
          <div class="stat-info">
            <span class="stat-value">${stats.completed}</span>
            <span class="stat-label">Completed</span>
          </div>
        </div>
        <div class="stat-card stat-card-orange">
          <div class="stat-icon"><i data-lucide="loader"></i></div>
          <div class="stat-info">
            <span class="stat-value">${stats.in_progress}</span>
            <span class="stat-label">In Progress</span>
          </div>
        </div>
        <div class="stat-card stat-card-red">
          <div class="stat-icon"><i data-lucide="percent"></i></div>
          <div class="stat-info">
            <span class="stat-value">${rate}%</span>
            <span class="stat-label">Completion</span>
          </div>
        </div>
      `;
      lucide.createIcons();
    } catch (e) { /* ignore */ }
  },

  renderGoals(list, goals) {
    if (goals.length === 0) {
      list.innerHTML = '<p class="empty-state">No goals yet. Create your first one!</p>';
      return;
    }

    list.innerHTML = goals.map(g => `
      <div class="goal-item" data-id="${g.id}">
        <div class="goal-checkbox ${g.status === 'completed' ? 'completed' : g.status === 'in_progress' ? 'in-progress' : ''}" 
             onclick="GoalsModule.cycleStatus(${g.id}, '${g.status}')">
          ${g.status === 'completed' ? '✓' : ''}
        </div>
        <div class="goal-info">
          <div class="goal-title ${g.status === 'completed' ? 'completed' : ''}">${g.title}</div>
          <div class="goal-meta">
            ${g.category ? `<span class="goal-category">${g.category}</span>` : ''}
            ${g.target_date ? `<span style="font-size:0.75rem;color:var(--text-muted);">📅 ${g.target_date}</span>` : ''}
          </div>
        </div>
        <div class="goal-actions">
          <button class="btn btn-sm btn-danger" onclick="GoalsModule.deleteGoal(${g.id})">✕</button>
        </div>
      </div>
    `).join('');
  },

  async cycleStatus(id, currentStatus) {
    const nextStatus = currentStatus === 'pending' ? 'in_progress'
      : currentStatus === 'in_progress' ? 'completed' : 'pending';
    
    await API.put(`/goals/${id}`, { status: nextStatus });
    this.load();
  },

  async deleteGoal(id) {
    await API.delete(`/goals/${id}`);
    App.showToast('Goal deleted', 'info');
    this.load();
  },

  showAddModal() {
    const categories = ['academic', 'fitness', 'personal', 'career', 'financial', 'social'];
    App.showModal('Add Goal', `
      <div class="form-group">
        <label>Goal Title</label>
        <input type="text" id="goal-title" placeholder="e.g., Complete Chapter 5">
      </div>
      <div class="form-group">
        <label>Description (optional)</label>
        <textarea id="goal-desc" rows="2" placeholder="Details about this goal..."></textarea>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Type</label>
          <select id="goal-type">
            <option value="weekly" ${this.currentType === 'weekly' ? 'selected' : ''}>Weekly</option>
            <option value="monthly" ${this.currentType === 'monthly' ? 'selected' : ''}>Monthly</option>
          </select>
        </div>
        <div class="form-group">
          <label>Category</label>
          <select id="goal-category">
            ${categories.map(c => `<option value="${c}">${c.charAt(0).toUpperCase() + c.slice(1)}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-group">
        <label>Target Date (optional)</label>
        <input type="date" id="goal-date">
      </div>
    `, async () => {
      const data = {
        title: document.getElementById('goal-title').value,
        description: document.getElementById('goal-desc').value,
        type: document.getElementById('goal-type').value,
        category: document.getElementById('goal-category').value,
        target_date: document.getElementById('goal-date').value || null
      };
      if (!data.title) return App.showToast('Title is required', 'error');
      await API.post('/goals', data);
      App.showToast('Goal created!', 'success');
      App.closeModal();
      this.load();
    });
  }
};
