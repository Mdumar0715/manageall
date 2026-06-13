# MANAGEALL — Personal Life & Productivity Dashboard

**MANAGEALL** is a modern, unified, self-hosted personal life dashboard designed to streamline academic, physical, and financial productivity in one central, secure hub. Built with a lightweight Node.js Express backend and a responsive vanilla HTML5, CSS3, and JavaScript frontend, the application provides a beautifully optimized, glassmorphic dark-theme user experience.

---

## 🚀 Key Features

* **📅 Timetable Scheduler**: Keep track of your daily and weekly class schedules with subject, room, professor details, and customizable colors.
* **📝 Exam Tracker**: Countdown to your upcoming exams, log notes, and manage topic preparation with a detailed syllabus progress tracker.
* **🎯 Goals Management**: Set, categorize, and complete weekly and monthly targets to keep yourself accountable.
* **🍅 Pomodoro Timer**: Stay focused on your work or study sessions with a highly interactive Pomodoro focus timer and daily session statistics.
* **💪 Gym & Workout Planner**: Organize your workout schedules, exercise lists, rest days, and alarms for the week.
* **❤️ Health & Wellness Log**: Monitor your daily weight trends, sleep patterns, water intake, mood, and personal wellbeing notes.
* **💰 Expense Tracker**: Record your daily transactions, categorize expenditures, configure monthly budget limits, and visualize your spending trends with interactive charts.
* **🤖 AI Schedule Insights**: Connect with the Google Gemini API to analyze your current schedule, spending habits, health patterns, and get personalized, actionable productivity recommendations.

---

## 🛠️ Technology Stack

* **Backend**: Node.js, Express.js
* **Database**: SQLite (via `sql.js` for self-contained, serverless data persistence)
* **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ES6)
* **Visualizations**: Chart.js
* **Icons**: Lucide Icons
* **Integrations**: Google Gemini API (via HTTP request)

---

## ⚙️ Installation & Setup

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18 or higher recommended).

### 1. Clone/Initialize the Project
Ensure you are in the project folder directory:
```bash
cd MANAGEALL
```

### 2. Install Dependencies
Install the required Node.js packages:
```bash
npm install
```

### 3. Configure Environment Variables
Create or edit the `.env` file in the root directory:
```env
# Server Port
PORT=3000

# Database Path
DB_PATH=./data/manageall.db

# Gemini AI API Key (Optional - get a free key at https://aistudio.google.com)
GEMINI_API_KEY=your_api_key_here
```

### 4. Run the Application

* **Development Mode** (with hot-reloading using Node `--watch`):
  ```bash
  npm run dev
  ```
* **Production Mode**:
  ```bash
  npm start
  ```

Open your browser and visit: **[http://localhost:3000](http://localhost:3000)**

---

## 📂 Project Structure

```text
├── data/               # SQLite database directory
│   └── manageall.db    # Primary application database
├── public/             # Static frontend files
│   ├── css/            # Global stylesheets
│   ├── js/             # Frontend application modules & routing
│   └── index.html      # Main Single Page Application HTML file
├── src/                # Backend source code
│   ├── config/         # Database and server configuration
│   ├── controllers/    # Route controllers & business logic
│   ├── middleware/     # Custom Express middlewares
│   ├── models/         # Database models & queries
│   ├── routes/         # Express API routes
│   ├── services/       # External services (Gemini AI integration)
│   └── app.js          # Express app setup
├── server.js           # Server entry point
├── package.json        # Node.js project configuration
└── README.md           # Project documentation
```

---

## 🔒 Security & Privacy
* **Self-Hosted**: All data is stored locally in your own `manageall.db` SQLite database file. No third-party servers store your logs, budget details, or schedule.
* **AI Analysis**: Gemini API requests are only made when you request AI insights, sending your data securely directly to Google's generative language API using your personal API key.

---

## 📄 License
This project is licensed under the ISC License.
