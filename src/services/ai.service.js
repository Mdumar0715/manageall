/**
 * Gemini AI Service
 * Uses Google's free Gemini 2.5 Flash-Lite API for schedule analysis
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent';

const AIService = {
  /**
   * Analyze the user's complete schedule and provide insights
   */
  async analyzeSchedule(scheduleData, customPrompt = null) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_api_key_here') {
      throw new Error('Gemini API key not configured');
    }

    const systemPrompt = `You are a personal productivity assistant analyzing a student's schedule, goals, and data. 
Provide actionable, specific insights. Be encouraging but honest. Format your response with clear sections using markdown.
Focus on:
1. Schedule optimization (free time gaps, study windows)
2. Goal progress assessment
3. Exam preparation urgency
4. Spending patterns
5. Health trends
6. Study recommendations`;

    const userPrompt = customPrompt || 'Analyze my current schedule and data. Give me actionable insights and suggestions for improvement.';

    const body = {
      contents: [{
        parts: [{
          text: `${systemPrompt}\n\nHere is my current data:\n${JSON.stringify(scheduleData, null, 2)}\n\n${userPrompt}`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024
      }
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No analysis generated';
  },

  /**
   * Get quick suggestions based on current context
   */
  async getQuickSuggestions(context) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_api_key_here') {
      return this.getDefaultSuggestions(context);
    }

    const body = {
      contents: [{
        parts: [{
          text: `Based on this context, give me exactly 4 short, actionable suggestions (one line each):
Context: ${JSON.stringify(context)}
Format as a JSON array of strings.`
        }]
      }],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 256
      }
    };

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      // Try to parse JSON from response
      const jsonMatch = text.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return this.getDefaultSuggestions(context);
    } catch {
      return this.getDefaultSuggestions(context);
    }
  },

  getDefaultSuggestions(context) {
    const suggestions = [];
    if (!context.hasClasses) suggestions.push('📅 Add your college timetable to get started');
    if (context.goalCount === 0) suggestions.push('🎯 Create your first weekly goal');
    if (context.upcomingExams === 0) suggestions.push('📝 Add upcoming exams to track deadlines');
    suggestions.push('🍅 Try a Pomodoro session to boost focus');
    return suggestions.slice(0, 4);
  }
};

module.exports = AIService;
