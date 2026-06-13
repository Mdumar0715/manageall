/**
 * Syllabus Module — Frontend Logic
 */
const SyllabusModule = {
  async showForExam(examId, examName) {
    try {
      const data = await API.get(`/syllabus/exam/${examId}`);
      const { topics, progress } = data;

      App.showModal(`📚 Syllabus — ${examName}`, `
        <div style="margin-bottom:16px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
            <span style="font-size:0.85rem;color:var(--text-secondary);">Progress</span>
            <span style="font-size:0.85rem;font-weight:600;">${progress.percentage}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill green" style="width:${progress.percentage}%;"></div>
          </div>
          <div style="display:flex;gap:16px;margin-top:8px;font-size:0.78rem;color:var(--text-muted);">
            <span>✅ ${progress.completed} done</span>
            <span>🔄 ${progress.in_progress} in progress</span>
            <span>⬜ ${progress.not_started} not started</span>
          </div>
        </div>

        <div style="margin-bottom:16px;">
          <div style="display:flex;gap:8px;">
            <input type="text" id="new-topic-input" placeholder="Add a topic..." style="flex:1;padding:8px 12px;background:var(--bg-input);border:1px solid var(--border-color);border-radius:var(--border-radius-sm);color:var(--text-primary);font-family:var(--font-family);">
            <button class="btn btn-sm btn-primary" id="add-topic-btn">Add</button>
          </div>
        </div>

        <div id="topics-list" style="display:flex;flex-direction:column;gap:8px;max-height:300px;overflow-y:auto;">
          ${topics.length === 0 ? '<p class="empty-state">No topics added yet</p>' : 
            topics.map(t => `
              <div style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:var(--bg-glass);border-radius:var(--border-radius-sm);border:1px solid var(--border-color);">
                <div class="goal-checkbox ${t.status === 'completed' ? 'completed' : t.status === 'in_progress' ? 'in-progress' : ''}" 
                     onclick="SyllabusModule.cycleStatus(${t.id}, '${t.status}', ${examId}, '${examName.replace(/'/g, "\\'")}')">
                  ${t.status === 'completed' ? '✓' : ''}
                </div>
                <span style="flex:1;font-size:0.88rem;${t.status === 'completed' ? 'text-decoration:line-through;opacity:0.6;' : ''}">${t.topic}</span>
                <button class="btn btn-sm btn-danger" style="padding:2px 6px;font-size:0.7rem;" 
                        onclick="SyllabusModule.deleteTopic(${t.id}, ${examId}, '${examName.replace(/'/g, "\\'")}')">✕</button>
              </div>
            `).join('')
          }
        </div>
      `, null);

      // Bind add topic
      setTimeout(() => {
        const addBtn = document.getElementById('add-topic-btn');
        const input = document.getElementById('new-topic-input');
        
        const addTopic = async () => {
          const topic = input?.value?.trim();
          if (!topic) return;
          await API.post('/syllabus', { exam_id: examId, topic });
          this.showForExam(examId, examName);
        };

        if (addBtn) addBtn.onclick = addTopic;
        if (input) input.onkeydown = (e) => { if (e.key === 'Enter') addTopic(); };
      }, 100);

    } catch (e) {
      App.showToast('Failed to load syllabus', 'error');
    }
  },

  async cycleStatus(id, currentStatus, examId, examName) {
    const nextStatus = currentStatus === 'not_started' ? 'in_progress'
      : currentStatus === 'in_progress' ? 'completed' : 'not_started';
    await API.put(`/syllabus/${id}`, { status: nextStatus });
    this.showForExam(examId, examName);
  },

  async deleteTopic(id, examId, examName) {
    await API.delete(`/syllabus/${id}`);
    this.showForExam(examId, examName);
  }
};
