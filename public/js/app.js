/**
 * MANAGEALL — Main Application Logic
 * Handles navigation, modals, toasts, and initializes all modules
 */
const App = {
  currentPage: 'dashboard',

  init() {
    this.setupNavigation();
    this.setupModal();
    this.setupClock();
    this.setupModuleButtons();
    this.loadDashboard();

    // Initialize subsystems
    Pomodoro.init();
    NotificationManager.init();

    // Initialize Lucide icons
    lucide.createIcons();

    console.log('🚀 MANAGEALL initialized');
  },

  // ==========================================
  // NAVIGATION
  // ==========================================
  setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-page]');
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');

    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const page = item.dataset.page;
        this.navigateTo(page);

        // Update active nav
        navItems.forEach(n => n.classList.remove('active'));
        item.classList.add('active');

        // Close sidebar on mobile
        if (sidebar) sidebar.classList.remove('open');
      });
    });

    // Mobile menu toggle
    if (menuToggle) {
      menuToggle.addEventListener('click', () => {
        sidebar?.classList.toggle('open');
      });
    }

    // Setup tab groups
    document.querySelectorAll('.tab-group').forEach(group => {
      group.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
          group.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');

          const tabValue = tab.dataset.tab;
          this.handleTabChange(tabValue);
        });
      });
    });
  },

  navigateTo(page) {
    this.currentPage = page;

    // Hide all pages, show target
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const targetPage = document.getElementById(`page-${page}`);
    if (targetPage) targetPage.classList.add('active');

    // Update title
    const titles = {
      dashboard: ['Dashboard', 'Welcome back! Here\'s your overview.'],
      timetable: ['Timetable', 'Your weekly class schedule.'],
      goals: ['Goals', 'Track and crush your goals.'],
      exams: ['Exams', 'Countdown to your exams.'],
      expenses: ['Expenses', 'Track your spending.'],
      gym: ['Gym', 'Your workout schedule.'],
      health: ['Health', 'Monitor your wellbeing.'],
      pomodoro: ['Pomodoro', 'Focus with the Pomodoro technique.'],
      'ai-insights': ['AI Insights', 'Get AI-powered productivity suggestions.']
    };

    const [title, subtitle] = titles[page] || ['MANAGEALL', ''];
    document.getElementById('page-title').textContent = title;
    document.getElementById('page-subtitle').textContent = subtitle;

    // Load page data
    this.loadPageData(page);

    // Re-init icons
    lucide.createIcons();
  },

  loadPageData(page) {
    switch (page) {
      case 'dashboard': this.loadDashboard(); break;
      case 'timetable': TimetableModule.load(); break;
      case 'goals': GoalsModule.load(); break;
      case 'exams': ExamsModule.load(); break;
      case 'expenses': ExpensesModule.load(); break;
      case 'gym': GymModule.load(); break;
      case 'health': HealthModule.load(); break;
      case 'pomodoro': this.loadPomodoroPage(); break;
      case 'ai-insights': AIInsightsModule.load(); break;
    }
  },

  handleTabChange(value) {
    if (this.currentPage === 'goals') {
      GoalsModule.currentType = value;
      GoalsModule.load();
    } else if (this.currentPage === 'exams') {
      ExamsModule.currentFilter = value;
      ExamsModule.load();
    }
  },

  // ==========================================
  // DASHBOARD
  // ==========================================
  async loadDashboard() {
    try {
      const data = await API.get('/dashboard');

      // Next class
      const nextClass = data.today.classes?.find(c => c.start_time > new Date().toTimeString().substring(0, 5));
      document.getElementById('stat-next-class').textContent = nextClass ? nextClass.subject : 'None';

      // Goals rate
      const totalGoals = data.goals.weekly.total + data.goals.monthly.total;
      const completedGoals = data.goals.weekly.completed + data.goals.monthly.completed;
      const rate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
      document.getElementById('stat-goals-rate').textContent = `${rate}%`;

      // Next exam
      if (data.exams.length > 0) {
        document.getElementById('stat-exam-days').textContent = `${data.exams[0].days_remaining}d`;
      }

      // Today's spend
      document.getElementById('stat-today-spend').textContent = `₹${data.today.spend}`;

      // Goals doughnut chart
      const allGoalStats = {
        completed: completedGoals,
        in_progress: data.goals.weekly.in_progress + data.goals.monthly.in_progress,
        pending: data.goals.weekly.pending + data.goals.monthly.pending
      };
      if (totalGoals > 0) {
        ChartManager.createGoalsDoughnut('goals-chart', allGoalStats);
      }

      // Spending chart
      if (data.monthlySpend?.daily?.length > 0) {
        ChartManager.createSpendingLine('spending-chart', data.monthlySpend.daily.slice(-7));
      }

      // Exam countdowns
      const examList = document.getElementById('exam-countdown-list');
      if (examList && data.exams.length > 0) {
        examList.innerHTML = data.exams.map(exam => {
          const urgency = exam.days_remaining <= 3 ? 'urgent' : exam.days_remaining <= 14 ? 'warning' : 'safe';
          return `
            <div class="exam-countdown-item">
              <div class="exam-countdown-info">
                <span class="exam-countdown-name">${exam.name}</span>
                <span class="exam-countdown-type">${exam.exam_type} • ${exam.exam_date}</span>
              </div>
              <span class="exam-countdown-days ${urgency}">${exam.days_remaining}d</span>
            </div>
          `;
        }).join('');
      }

      // AI suggestions on dashboard
      AIInsightsModule.loadSuggestions();

    } catch (e) {
      console.error('Dashboard load error:', e);
    }

    lucide.createIcons();
  },

  async loadPomodoroPage() {
    try {
      const stats = await API.get('/pomodoro/stats');
      if (stats.daily?.length > 0) {
        ChartManager.createPomodoroChart('pomodoro-chart', stats.daily);
      }

      const recent = await API.get('/pomodoro/recent?limit=5');
      const recentDiv = document.getElementById('pomodoro-recent');
      if (recentDiv && recent.length > 0) {
        recentDiv.innerHTML = `
          <h4 style="font-size:0.85rem;font-weight:600;margin-bottom:8px;">Recent Sessions</h4>
          ${recent.map(s => `
            <div class="pomodoro-session-item">
              <span>${s.label || 'Focus'} (${s.duration_minutes}m)</span>
              <span style="color:${s.completed ? 'var(--accent-green)' : 'var(--accent-red)'}">${s.completed ? '✓ Done' : '✕ Cancelled'}</span>
            </div>
          `).join('')}
        `;
      }
    } catch (e) { /* ignore */ }
  },

  // ==========================================
  // MODULE BUTTONS
  // ==========================================
  setupModuleButtons() {
    // Timetable
    document.getElementById('add-class-btn')?.addEventListener('click', () => TimetableModule.showAddModal());

    // Goals
    document.getElementById('add-goal-btn')?.addEventListener('click', () => GoalsModule.showAddModal());

    // Exams
    document.getElementById('add-exam-btn')?.addEventListener('click', () => ExamsModule.showAddModal());

    // Expenses
    document.getElementById('add-expense-btn')?.addEventListener('click', () => ExpensesModule.showAddModal());

    // Gym
    document.getElementById('add-workout-btn')?.addEventListener('click', () => GymModule.showAddModal());

    // Health
    document.getElementById('log-health-btn')?.addEventListener('click', () => HealthModule.showLogModal());

    // AI
    document.getElementById('ai-analyze-btn')?.addEventListener('click', () => AIInsightsModule.analyze());
  },

  // ==========================================
  // MODAL SYSTEM
  // ==========================================
  modalCallback: null,

  setupModal() {
    document.getElementById('modal-close')?.addEventListener('click', () => this.closeModal());
    document.getElementById('modal-cancel')?.addEventListener('click', () => this.closeModal());
    document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'modal-overlay') this.closeModal();
    });
    document.getElementById('modal-save')?.addEventListener('click', () => {
      if (this.modalCallback) this.modalCallback();
    });
  },

  showModal(title, bodyHtml, onSave) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHtml;
    document.getElementById('modal-overlay').style.display = 'flex';

    // Hide save button if no callback (view-only modal)
    const saveBtn = document.getElementById('modal-save');
    const cancelBtn = document.getElementById('modal-cancel');
    if (onSave) {
      saveBtn.style.display = 'inline-flex';
      cancelBtn.textContent = 'Cancel';
    } else {
      saveBtn.style.display = 'none';
      cancelBtn.textContent = 'Close';
    }

    this.modalCallback = onSave;

    // Re-init icons inside modal
    lucide.createIcons();
  },

  closeModal() {
    document.getElementById('modal-overlay').style.display = 'none';
    this.modalCallback = null;
  },

  // ==========================================
  // TOAST NOTIFICATIONS
  // ==========================================
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}</span>
      <span>${message}</span>
    `;
    container.appendChild(toast);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  },

  // ==========================================
  // CLOCK
  // ==========================================
  setupClock() {
    const updateClock = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
      const el = document.getElementById('current-time');
      if (el) el.textContent = timeStr;
    };
    updateClock();
    setInterval(updateClock, 1000);
  }
};

// ============================================
// BOOT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
