/**
 * Gym Module — Frontend Logic
 */
const GymModule = {
  days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],

  async load() {
    const grid = document.getElementById('gym-week-grid');
    if (!grid) return;

    try {
      const workouts = await API.get('/gym');
      this.render(grid, workouts);
    } catch (e) {
      grid.innerHTML = '<p class="empty-state">Failed to load gym schedule</p>';
    }
  },

  render(grid, workouts) {
    grid.innerHTML = '';

    this.days.forEach(day => {
      const workout = workouts.find(w => w.day === day);
      const card = document.createElement('div');
      card.className = `gym-day-card ${workout?.is_rest_day ? 'rest-day' : ''}`;
      card.innerHTML = `
        <div class="gym-day-name">${day}</div>
        ${workout ? `
          <div class="gym-workout-type">${workout.is_rest_day ? '😴 Rest Day' : (workout.workout_type || 'Workout')}</div>
          <div class="gym-time">⏰ ${workout.time}</div>
          ${workout.exercises && workout.exercises.length ? `
            <div style="margin-top:12px;font-size:0.78rem;color:var(--text-muted);text-align:left;">
              ${workout.exercises.map(e => `• ${e}`).join('<br>')}
            </div>
          ` : ''}
        ` : `
          <p style="color:var(--text-muted);font-size:0.8rem;margin-top:12px;">No schedule</p>
          <button class="btn btn-sm btn-secondary" style="margin-top:12px;" onclick="GymModule.showAddModal('${day}')">+ Add</button>
        `}
      `;

      if (workout) {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => this.showEditModal(workout));
      }

      grid.appendChild(card);
    });
  },

  showAddModal(day) {
    App.showModal('Add Workout', `
      <div class="form-group">
        <label>Day</label>
        <input type="text" id="gym-day" value="${day || ''}" readonly>
      </div>
      <div class="form-group">
        <label>Time</label>
        <input type="time" id="gym-time" value="06:00">
      </div>
      <div class="form-group">
        <label>Workout Type</label>
        <select id="gym-type">
          <option value="Push">Push</option>
          <option value="Pull">Pull</option>
          <option value="Legs">Legs</option>
          <option value="Cardio">Cardio</option>
          <option value="Full Body">Full Body</option>
          <option value="Upper Body">Upper Body</option>
          <option value="Lower Body">Lower Body</option>
          <option value="HIIT">HIIT</option>
          <option value="Yoga">Yoga</option>
        </select>
      </div>
      <div class="form-group">
        <label>Exercises (one per line)</label>
        <textarea id="gym-exercises" rows="4" placeholder="Bench Press 3x10\nIncline Dumbbell Press 3x12\nCable Flyes 3x15"></textarea>
      </div>
      <div class="form-group">
        <label>
          <input type="checkbox" id="gym-rest-day" style="width:auto;margin-right:8px;">
          Rest Day
        </label>
      </div>
    `, async () => {
      const exercises = document.getElementById('gym-exercises').value
        .split('\n').map(e => e.trim()).filter(Boolean);
      const data = {
        day: document.getElementById('gym-day').value,
        time: document.getElementById('gym-time').value,
        workout_type: document.getElementById('gym-type').value,
        exercises,
        is_rest_day: document.getElementById('gym-rest-day').checked
      };
      await API.post('/gym', data);
      App.showToast('Workout added!', 'success');
      App.closeModal();
      this.load();
    });
  },

  showEditModal(workout) {
    App.showModal('Edit Workout', `
      <div class="form-group">
        <label>Day</label>
        <input type="text" value="${workout.day}" readonly>
      </div>
      <div class="form-group">
        <label>Time</label>
        <input type="time" id="gym-time" value="${workout.time}">
      </div>
      <div class="form-group">
        <label>Workout Type</label>
        <input type="text" id="gym-type" value="${workout.workout_type || ''}">
      </div>
      <div class="form-group">
        <label>Exercises (one per line)</label>
        <textarea id="gym-exercises" rows="4">${(workout.exercises || []).join('\n')}</textarea>
      </div>
      <div class="form-group">
        <label>
          <input type="checkbox" id="gym-rest-day" ${workout.is_rest_day ? 'checked' : ''} style="width:auto;margin-right:8px;">
          Rest Day
        </label>
      </div>
      <button class="btn btn-danger" style="width:100%;margin-top:8px;" id="delete-workout-btn">Delete</button>
    `, async () => {
      const exercises = document.getElementById('gym-exercises').value
        .split('\n').map(e => e.trim()).filter(Boolean);
      await API.put(`/gym/${workout.id}`, {
        time: document.getElementById('gym-time').value,
        workout_type: document.getElementById('gym-type').value,
        exercises,
        is_rest_day: document.getElementById('gym-rest-day').checked
      });
      App.showToast('Workout updated!', 'success');
      App.closeModal();
      this.load();
    });

    setTimeout(() => {
      document.getElementById('delete-workout-btn')?.addEventListener('click', async () => {
        await API.delete(`/gym/${workout.id}`);
        App.showToast('Workout deleted', 'info');
        App.closeModal();
        this.load();
      });
    }, 100);
  }
};
