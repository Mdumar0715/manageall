/**
 * Timetable Module — Frontend Logic
 */
const TimetableModule = {
  days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  colors: ['#6366f1', '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'],

  async load() {
    const grid = document.getElementById('timetable-grid');
    if (!grid) return;

    try {
      const classes = await API.get('/timetable');
      this.render(grid, classes);
    } catch (e) {
      grid.innerHTML = '<p class="empty-state">Failed to load timetable</p>';
    }
  },

  render(grid, classes) {
    grid.innerHTML = '';

    this.days.forEach(day => {
      const dayClasses = classes.filter(c => c.day === day);
      const col = document.createElement('div');
      col.className = 'timetable-day';
      col.innerHTML = `
        <div class="timetable-day-header">${day.substring(0, 3)}</div>
        <div class="timetable-day-body">
          ${dayClasses.length === 0 
            ? '<p class="empty-state" style="font-size:0.75rem;padding:8px;">No classes</p>'
            : dayClasses.map(c => `
              <div class="timetable-class" style="border-left-color: ${c.color || '#6366f1'}" data-id="${c.id}">
                <div class="class-time">${c.start_time} - ${c.end_time}</div>
                <div class="class-subject">${c.subject}</div>
                ${c.room ? `<div class="class-room">📍 ${c.room}</div>` : ''}
              </div>
            `).join('')
          }
        </div>
      `;
      grid.appendChild(col);
    });

    // Add click handlers for editing/deleting
    grid.querySelectorAll('.timetable-class').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.id;
        this.showEditModal(id, classes.find(c => c.id == id));
      });
    });
  },

  showAddModal() {
    App.showModal('Add Class', `
      <div class="form-group">
        <label>Day</label>
        <select id="class-day">
          ${this.days.map(d => `<option value="${d}">${d}</option>`).join('')}
        </select>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Start Time</label>
          <input type="time" id="class-start-time" value="09:00">
        </div>
        <div class="form-group">
          <label>End Time</label>
          <input type="time" id="class-end-time" value="10:00">
        </div>
      </div>
      <div class="form-group">
        <label>Subject</label>
        <input type="text" id="class-subject" placeholder="e.g., Mathematics">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Room</label>
          <input type="text" id="class-room" placeholder="e.g., A-201">
        </div>
        <div class="form-group">
          <label>Professor</label>
          <input type="text" id="class-professor" placeholder="e.g., Dr. Sharma">
        </div>
      </div>
      <div class="form-group">
        <label>Color</label>
        <input type="color" id="class-color" value="#6366f1" style="height:40px;">
      </div>
    `, async () => {
      const data = {
        day: document.getElementById('class-day').value,
        start_time: document.getElementById('class-start-time').value,
        end_time: document.getElementById('class-end-time').value,
        subject: document.getElementById('class-subject').value,
        room: document.getElementById('class-room').value,
        professor: document.getElementById('class-professor').value,
        color: document.getElementById('class-color').value
      };
      if (!data.subject) return App.showToast('Subject is required', 'error');
      await API.post('/timetable', data);
      App.showToast('Class added!', 'success');
      App.closeModal();
      this.load();
    });
  },

  showEditModal(id, cls) {
    App.showModal('Edit Class', `
      <div class="form-group">
        <label>Day</label>
        <select id="class-day">
          ${this.days.map(d => `<option value="${d}" ${d === cls.day ? 'selected' : ''}>${d}</option>`).join('')}
        </select>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Start Time</label>
          <input type="time" id="class-start-time" value="${cls.start_time}">
        </div>
        <div class="form-group">
          <label>End Time</label>
          <input type="time" id="class-end-time" value="${cls.end_time}">
        </div>
      </div>
      <div class="form-group">
        <label>Subject</label>
        <input type="text" id="class-subject" value="${cls.subject}">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Room</label>
          <input type="text" id="class-room" value="${cls.room || ''}">
        </div>
        <div class="form-group">
          <label>Professor</label>
          <input type="text" id="class-professor" value="${cls.professor || ''}">
        </div>
      </div>
      <div class="form-group">
        <label>Color</label>
        <input type="color" id="class-color" value="${cls.color || '#6366f1'}" style="height:40px;">
      </div>
      <button class="btn btn-danger" style="width:100%;margin-top:8px;" id="delete-class-btn">Delete Class</button>
    `, async () => {
      const data = {
        day: document.getElementById('class-day').value,
        start_time: document.getElementById('class-start-time').value,
        end_time: document.getElementById('class-end-time').value,
        subject: document.getElementById('class-subject').value,
        room: document.getElementById('class-room').value,
        professor: document.getElementById('class-professor').value,
        color: document.getElementById('class-color').value
      };
      await API.put(`/timetable/${id}`, data);
      App.showToast('Class updated!', 'success');
      App.closeModal();
      this.load();
    });

    // Bind delete
    setTimeout(() => {
      document.getElementById('delete-class-btn')?.addEventListener('click', async () => {
        await API.delete(`/timetable/${id}`);
        App.showToast('Class deleted', 'info');
        App.closeModal();
        this.load();
      });
    }, 100);
  }
};
