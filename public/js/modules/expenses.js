/**
 * Expenses Module — Frontend Logic with Conversational Input
 */
const ExpensesModule = {
  categories: [],
  categoryEmojis: {
    food: '🍔', transport: '🚗', drinks: '🥤', entertainment: '🎮',
    groceries: '🛒', shopping: '🛍️', bills: '📄', education: '📚',
    health: '💊', other: '📦'
  },

  async load() {
    await this.loadCategories();
    this.loadExpenses();
    this.loadCharts();
    this.setupDailyInput();
  },

  async loadCategories() {
    try {
      this.categories = await API.get('/expenses/categories');
    } catch (e) {
      this.categories = Object.keys(this.categoryEmojis);
    }
  },

  async loadExpenses() {
    const list = document.getElementById('expenses-list');
    if (!list) return;

    try {
      const expenses = await API.get('/expenses');
      if (expenses.length === 0) {
        list.innerHTML = '<p class="empty-state">No expenses logged yet</p>';
        return;
      }

      list.innerHTML = expenses.slice(0, 20).map(e => `
        <div class="expense-item">
          <div class="expense-info">
            <div class="expense-category-icon">${this.categoryEmojis[e.category] || '📦'}</div>
            <div class="expense-details">
              <span class="expense-desc">${e.description || e.category}</span>
              <span class="expense-date">${e.date} • ${e.category}</span>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:12px;">
            <span class="expense-amount">-₹${e.amount}</span>
            <button class="btn btn-sm btn-danger" onclick="ExpensesModule.deleteExpense(${e.id})" style="padding:4px 8px;">✕</button>
          </div>
        </div>
      `).join('');
    } catch (e) {
      list.innerHTML = '<p class="empty-state">Failed to load expenses</p>';
    }
  },

  async loadCharts() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const summary = await API.get(`/expenses/summary?from=${weekAgo}&to=${today}`);

      if (summary.categories.length > 0) {
        ChartManager.createExpensePie('expense-pie-chart', summary.categories);
      }
      if (summary.daily.length > 0) {
        ChartManager.createExpenseBar('expense-line-chart', summary.daily);
      }
    } catch (e) { /* ignore */ }
  },

  setupDailyInput() {
    const card = document.getElementById('daily-input-card');
    const form = document.getElementById('daily-input-form');
    const btn = document.getElementById('daily-expense-btn');
    const closeBtn = document.getElementById('close-daily-input');
    const submitBtn = document.getElementById('submit-daily-expenses');

    if (!form) return;

    // Generate category input fields
    form.innerHTML = this.categories.map(cat => `
      <div class="daily-input-item">
        <span class="category-emoji">${this.categoryEmojis[cat] || '📦'}</span>
        <div class="category-info">
          <div class="category-name">How much on ${cat}?</div>
          <input type="number" id="daily-${cat}" placeholder="₹0" min="0" step="1">
        </div>
      </div>
    `).join('');

    // Toggle daily input
    if (btn) btn.onclick = () => {
      card.style.display = card.style.display === 'none' ? 'block' : 'none';
    };

    if (closeBtn) closeBtn.onclick = () => {
      card.style.display = 'none';
    };

    // Submit daily expenses
    if (submitBtn) submitBtn.onclick = async () => {
      const expenses = {};
      let hasAny = false;

      this.categories.forEach(cat => {
        const val = parseFloat(document.getElementById(`daily-${cat}`)?.value);
        if (val > 0) {
          expenses[cat] = val;
          hasAny = true;
        }
      });

      if (!hasAny) return App.showToast('Enter at least one expense', 'error');

      try {
        const result = await API.post('/expenses/daily', { expenses });
        App.showToast(`${result.message} — Total: ₹${result.total}`, 'success');
        card.style.display = 'none';

        // Clear inputs
        this.categories.forEach(cat => {
          const input = document.getElementById(`daily-${cat}`);
          if (input) input.value = '';
        });

        this.loadExpenses();
        this.loadCharts();
      } catch (e) {
        App.showToast('Failed to save expenses', 'error');
      }
    };
  },

  showAddModal() {
    App.showModal('Add Expense', `
      <div class="form-group">
        <label>Amount (₹)</label>
        <input type="number" id="expense-amount" placeholder="150" min="0" step="1">
      </div>
      <div class="form-group">
        <label>Category</label>
        <select id="expense-category">
          ${this.categories.map(c => `<option value="${c}">${this.categoryEmojis[c] || ''} ${c}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Description</label>
        <input type="text" id="expense-desc" placeholder="e.g., Lunch at canteen">
      </div>
      <div class="form-group">
        <label>Date</label>
        <input type="date" id="expense-date" value="${new Date().toISOString().split('T')[0]}">
      </div>
    `, async () => {
      const data = {
        amount: parseFloat(document.getElementById('expense-amount').value),
        category: document.getElementById('expense-category').value,
        description: document.getElementById('expense-desc').value,
        date: document.getElementById('expense-date').value
      };
      if (!data.amount) return App.showToast('Amount is required', 'error');
      await API.post('/expenses', data);
      App.showToast('Expense logged!', 'success');
      App.closeModal();
      this.load();
    });
  },

  async deleteExpense(id) {
    await API.delete(`/expenses/${id}`);
    App.showToast('Expense deleted', 'info');
    this.loadExpenses();
    this.loadCharts();
  }
};
