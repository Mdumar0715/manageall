/**
 * Exams Module — Frontend Logic
 */
const ExamsModule = {
  currentFilter: 'all',

  async load() {
    const grid = document.getElementById('exams-grid');
    if (!grid) return;

    try {
      const typeParam = this.currentFilter === 'all' ? '' : `?type=${this.currentFilter}`;
      const exams = await API.get(`/exams${typeParam}`);
      this.render(grid, exams);
    } catch (e) {
      grid.innerHTML = '<p class="empty-state">Failed to load exams</p>';
    }
  },

  render(grid, exams) {
    if (exams.length === 0) {
      grid.innerHTML = '<p class="empty-state">No exams added yet</p>';
      return;
    }

    grid.innerHTML = exams.map(exam => {
      const urgency = exam.days_remaining <= 3 ? 'urgent' : exam.days_remaining <= 14 ? 'warning' : 'safe';
      return `
        <div class="exam-card ${exam.exam_type}" data-id="${exam.id}">
          <div class="exam-name">${exam.name}</div>
          <span class="exam-type-badge ${exam.exam_type}">${exam.exam_type}</span>
          ${exam.subject ? `<div style="font-size:0.85rem;color:var(--text-muted);">${exam.subject}</div>` : ''}
          <div class="exam-countdown ${urgency}">
            <span class="days-number">${Math.max(0, exam.days_remaining)}</span>
            <span class="days-label">${exam.days_remaining === 1 ? 'day left' : 'days left'}</span>
          </div>
          <div style="font-size:0.8rem;color:var(--text-muted);">📅 ${exam.exam_date}</div>
          <div class="exam-progress-bar" id="exam-progress-${exam.id}">
            <div class="exam-progress-fill" style="width:0%;"></div>
          </div>
          <div class="exam-progress-label">
            <span>Syllabus Progress</span>
            <span id="exam-progress-pct-${exam.id}">Loading...</span>
          </div>
          <div style="display:flex;gap:8px;margin-top:12px;">
            <button class="btn btn-sm btn-secondary" onclick="SyllabusModule.showForExam(${exam.id}, '${exam.name.replace(/'/g, "\\'")}')">📚 Syllabus</button>
            <button class="btn btn-sm btn-danger" onclick="ExamsModule.deleteExam(${exam.id})">Delete</button>
          </div>
        </div>
      `;
    }).join('');

    // Load syllabus progress for each exam
    exams.forEach(exam => this.loadProgress(exam.id));
  },

  async loadProgress(examId) {
    try {
      const progress = await API.get(`/syllabus/progress/${examId}`);
      const bar = document.querySelector(`#exam-progress-${examId} .exam-progress-fill`);
      const label = document.getElementById(`exam-progress-pct-${examId}`);
      if (bar) bar.style.width = `${progress.percentage}%`;
      if (label) label.textContent = `${progress.percentage}% (${progress.completed}/${progress.total})`;
    } catch (e) { /* ignore */ }
  },

  showAddModal() {
    App.showModal('Add Exam', `
      <div class="form-group">
        <label>Exam Name</label>
        <input type="text" id="exam-name" placeholder="e.g., Data Structures Mid-Sem">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Exam Date</label>
          <input type="date" id="exam-date">
        </div>
        <div class="form-group">
          <label>Type</label>
          <select id="exam-type">
            <option value="college">College</option>
            <option value="competitive">Competitive</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label>Subject</label>
        <input type="text" id="exam-subject" placeholder="e.g., Computer Science">
      </div>
      <div class="form-group">
        <label>Notes</label>
        <textarea id="exam-notes" rows="2" placeholder="Any notes..."></textarea>
      </div>
    `, async () => {
      const data = {
        name: document.getElementById('exam-name').value,
        exam_date: document.getElementById('exam-date').value,
        exam_type: document.getElementById('exam-type').value,
        subject: document.getElementById('exam-subject').value,
        notes: document.getElementById('exam-notes').value
      };
      if (!data.name || !data.exam_date) return App.showToast('Name and date are required', 'error');
      await API.post('/exams', data);
      App.showToast('Exam added!', 'success');
      App.closeModal();
      this.load();
    });
  },

  async deleteExam(id) {
    await API.delete(`/exams/${id}`);
    App.showToast('Exam deleted', 'info');
    this.load();
  }
};
