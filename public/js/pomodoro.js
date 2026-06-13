/**
 * Pomodoro Timer Logic
 */
const Pomodoro = {
  timer: null,
  totalSeconds: 25 * 60,
  remainingSeconds: 25 * 60,
  isRunning: false,
  isWorkSession: true,
  currentSessionId: null,

  workDuration: 25,
  breakDuration: 5,

  init() {
    this.workDuration = parseInt(document.getElementById('pomodoro-work-duration')?.value) || 25;
    this.breakDuration = parseInt(document.getElementById('pomodoro-break-duration')?.value) || 5;
    this.totalSeconds = this.workDuration * 60;
    this.remainingSeconds = this.totalSeconds;

    this.bindEvents();
    this.updateDisplay();
  },

  bindEvents() {
    const startBtn = document.getElementById('pomodoro-start-btn');
    const resetBtn = document.getElementById('pomodoro-reset-btn');
    const skipBtn = document.getElementById('pomodoro-skip-btn');
    const miniBtn = document.getElementById('mini-pomodoro-btn');
    const workInput = document.getElementById('pomodoro-work-duration');
    const breakInput = document.getElementById('pomodoro-break-duration');

    if (startBtn) startBtn.onclick = () => this.toggleTimer();
    if (resetBtn) resetBtn.onclick = () => this.reset();
    if (skipBtn) skipBtn.onclick = () => this.skip();
    if (miniBtn) miniBtn.onclick = () => {
      // Navigate to Pomodoro page and start
      document.querySelector('[data-page="pomodoro"]')?.click();
      setTimeout(() => this.toggleTimer(), 300);
    };

    if (workInput) workInput.onchange = () => {
      this.workDuration = parseInt(workInput.value) || 25;
      if (!this.isRunning && this.isWorkSession) {
        this.totalSeconds = this.workDuration * 60;
        this.remainingSeconds = this.totalSeconds;
        this.updateDisplay();
      }
    };

    if (breakInput) breakInput.onchange = () => {
      this.breakDuration = parseInt(breakInput.value) || 5;
      if (!this.isRunning && !this.isWorkSession) {
        this.totalSeconds = this.breakDuration * 60;
        this.remainingSeconds = this.totalSeconds;
        this.updateDisplay();
      }
    };
  },

  async toggleTimer() {
    if (this.isRunning) {
      this.pause();
    } else {
      await this.start();
    }
  },

  async start() {
    this.isRunning = true;
    this.updateButton();

    // Log session start to backend
    if (this.isWorkSession && !this.currentSessionId) {
      try {
        const label = document.getElementById('pomodoro-task-label')?.value || '';
        const result = await API.post('/pomodoro/start', {
          duration_minutes: this.workDuration,
          type: 'work',
          label
        });
        this.currentSessionId = result.id;
      } catch (e) { console.error(e); }
    }

    this.timer = setInterval(() => {
      this.remainingSeconds--;
      this.updateDisplay();

      if (this.remainingSeconds <= 0) {
        this.onComplete();
      }
    }, 1000);
  },

  pause() {
    this.isRunning = false;
    clearInterval(this.timer);
    this.updateButton();
  },

  reset() {
    this.pause();
    this.isWorkSession = true;
    this.totalSeconds = this.workDuration * 60;
    this.remainingSeconds = this.totalSeconds;
    this.currentSessionId = null;
    this.updateDisplay();
    this.updateLabel();
  },

  skip() {
    this.pause();
    this.switchSession();
  },

  async onComplete() {
    this.pause();

    // Complete session in backend
    if (this.isWorkSession && this.currentSessionId) {
      try {
        await API.put(`/pomodoro/${this.currentSessionId}/complete`);
      } catch (e) { console.error(e); }
      this.currentSessionId = null;
    }

    // Play notification sound
    this.playNotificationSound();

    // Show toast
    if (this.isWorkSession) {
      App.showToast('🎉 Focus session complete! Take a break.', 'success');
    } else {
      App.showToast('⏰ Break is over! Ready to focus?', 'info');
    }

    // Browser notification
    NotificationManager.send(
      this.isWorkSession ? '🍅 Pomodoro Complete!' : '☕ Break Over!',
      this.isWorkSession ? 'Great work! Time for a break.' : 'Ready to get back to work?'
    );

    this.switchSession();
  },

  switchSession() {
    this.isWorkSession = !this.isWorkSession;
    this.totalSeconds = (this.isWorkSession ? this.workDuration : this.breakDuration) * 60;
    this.remainingSeconds = this.totalSeconds;
    this.updateDisplay();
    this.updateLabel();
  },

  updateDisplay() {
    const minutes = Math.floor(this.remainingSeconds / 60);
    const seconds = this.remainingSeconds % 60;
    const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // Update all displays
    const mainDisplay = document.getElementById('pomodoro-time');
    const miniDisplay = document.getElementById('mini-pomodoro-display');
    if (mainDisplay) mainDisplay.textContent = timeStr;
    if (miniDisplay) miniDisplay.textContent = timeStr;

    // Update progress ring
    const progress = document.getElementById('pomodoro-progress');
    if (progress) {
      const circumference = 2 * Math.PI * 90; // r=90
      const offset = circumference * (1 - this.remainingSeconds / this.totalSeconds);
      progress.style.strokeDasharray = circumference;
      progress.style.strokeDashoffset = offset;
      progress.style.stroke = this.isWorkSession ? '#8b5cf6' : '#10b981';
    }
  },

  updateButton() {
    const startBtn = document.getElementById('pomodoro-start-btn');
    const miniBtn = document.getElementById('mini-pomodoro-btn');
    if (startBtn) {
      startBtn.innerHTML = this.isRunning
        ? '<i data-lucide="pause"></i> Pause'
        : '<i data-lucide="play"></i> Start';
      lucide.createIcons();
    }
    if (miniBtn) {
      miniBtn.textContent = this.isRunning ? 'Pause' : 'Start Focus';
    }
  },

  updateLabel() {
    const label = document.getElementById('pomodoro-label');
    if (label) {
      label.textContent = this.isWorkSession ? 'Focus Time' : 'Break Time';
      label.style.color = this.isWorkSession ? '#8b5cf6' : '#10b981';
    }
  },

  playNotificationSound() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);

      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.8);
    } catch (e) { /* Audio not supported */ }
  }
};
