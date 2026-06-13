/**
 * Chart.js Configuration & Helpers
 */

// Set Chart.js defaults for dark theme
Chart.defaults.color = '#94a3b8';
Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.06)';
Chart.defaults.font.family = "'Inter', sans-serif";

const ChartManager = {
  instances: {},

  /**
   * Create or update a chart 
   */
  create(canvasId, config) {
    // Destroy existing chart instance
    if (this.instances[canvasId]) {
      this.instances[canvasId].destroy();
    }

    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    this.instances[canvasId] = new Chart(canvas, config);
    return this.instances[canvasId];
  },

  /**
   * Goal completion doughnut chart
   */
  createGoalsDoughnut(canvasId, stats) {
    return this.create(canvasId, {
      type: 'doughnut',
      data: {
        labels: ['Completed', 'In Progress', 'Pending'],
        datasets: [{
          data: [stats.completed, stats.in_progress, stats.pending],
          backgroundColor: ['#10b981', '#f59e0b', '#64748b'],
          borderWidth: 0,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { padding: 16, usePointStyle: true, pointStyleWidth: 8 }
          }
        }
      }
    });
  },

  /**
   * Spending line chart
   */
  createSpendingLine(canvasId, dailyData) {
    const labels = dailyData.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    });
    const values = dailyData.map(d => d.total);

    return this.create(canvasId, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Spending',
          data: values,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#ef4444',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { callback: v => '₹' + v }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  },

  /**
   * Expense category pie chart
   */
  createExpensePie(canvasId, categories) {
    const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'];
    
    return this.create(canvasId, {
      type: 'doughnut',
      data: {
        labels: categories.map(c => c.category),
        datasets: [{
          data: categories.map(c => c.total),
          backgroundColor: colors.slice(0, categories.length),
          borderWidth: 0,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: {
            position: 'right',
            labels: { padding: 12, usePointStyle: true, pointStyleWidth: 8 }
          },
          tooltip: {
            callbacks: {
              label: ctx => ` ₹${ctx.raw}`
            }
          }
        }
      }
    });
  },

  /**
   * Expense daily bar chart
   */
  createExpenseBar(canvasId, dailyData) {
    return this.create(canvasId, {
      type: 'bar',
      data: {
        labels: dailyData.map(d => {
          const date = new Date(d.date);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }),
        datasets: [{
          label: 'Spent',
          data: dailyData.map(d => d.total),
          backgroundColor: 'rgba(139, 92, 246, 0.6)',
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { callback: v => '₹' + v }
          },
          x: { grid: { display: false } }
        }
      }
    });
  },

  /**
   * Weight trend line chart
   */
  createWeightChart(canvasId, healthData) {
    const filtered = healthData.filter(h => h.weight);
    return this.create(canvasId, {
      type: 'line',
      data: {
        labels: filtered.map(h => new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
        datasets: [{
          label: 'Weight (kg)',
          data: filtered.map(h => h.weight),
          borderColor: '#06b6d4',
          backgroundColor: 'rgba(6, 182, 212, 0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: '#06b6d4',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: 'rgba(255,255,255,0.04)' } },
          x: { grid: { display: false } }
        }
      }
    });
  },

  /**
   * Sleep pattern bar chart
   */
  createSleepChart(canvasId, healthData) {
    const filtered = healthData.filter(h => h.sleep_hours);
    return this.create(canvasId, {
      type: 'bar',
      data: {
        labels: filtered.map(h => new Date(h.date).toLocaleDateString('en-US', { weekday: 'short' })),
        datasets: [{
          label: 'Hours',
          data: filtered.map(h => h.sleep_hours),
          backgroundColor: filtered.map(h => h.sleep_hours >= 7 ? 'rgba(16, 185, 129, 0.6)' : 'rgba(239, 68, 68, 0.6)'),
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            max: 12,
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { callback: v => v + 'h' }
          },
          x: { grid: { display: false } }
        }
      }
    });
  },

  /**
   * Pomodoro focus time chart
   */
  createPomodoroChart(canvasId, dailyStats) {
    return this.create(canvasId, {
      type: 'bar',
      data: {
        labels: dailyStats.map(d => new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })),
        datasets: [{
          label: 'Focus (min)',
          data: dailyStats.map(d => d.minutes),
          backgroundColor: 'rgba(139, 92, 246, 0.6)',
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { callback: v => v + 'm' }
          },
          x: { grid: { display: false } }
        }
      }
    });
  }
};
