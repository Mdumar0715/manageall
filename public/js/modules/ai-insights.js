/**
 * AI Insights Module — Frontend Logic  
 */
const AIInsightsModule = {
  async load() {
    this.loadSuggestions();
  },

  async loadSuggestions() {
    const list = document.getElementById('ai-suggestions-list');
    if (!list) return;

    try {
      const data = await API.get('/ai/suggestions');
      const suggestions = data.suggestions || [];

      list.innerHTML = suggestions.map(s => `
        <div class="suggestion-item">${s}</div>
      `).join('');
    } catch (e) { /* ignore */ }
  },

  async analyze() {
    const responseDiv = document.getElementById('ai-response');
    const prompt = document.getElementById('ai-prompt')?.value || '';

    if (!responseDiv) return;

    responseDiv.innerHTML = `
      <div class="ai-loading">
        <div class="spinner"></div>
        <span>Analyzing your data with AI...</span>
      </div>
    `;

    try {
      const result = await API.post('/ai/analyze', { prompt: prompt || null });
      responseDiv.innerHTML = this.formatMarkdown(result.analysis);
    } catch (e) {
      responseDiv.innerHTML = `<p style="color:var(--accent-red);">Error: ${e.message}</p>
        <p style="color:var(--text-muted);margin-top:8px;">Make sure you've added your free Gemini API key in the .env file.</p>`;
    }
  },

  formatMarkdown(text) {
    // Simple markdown-to-HTML conversion
    return text
      .replace(/### (.*)/g, '<h3>$1</h3>')
      .replace(/## (.*)/g, '<h2>$1</h2>')
      .replace(/# (.*)/g, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^\- (.*)/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
  }
};
