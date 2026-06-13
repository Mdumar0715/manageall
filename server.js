require('dotenv').config();
const app = require('./src/app');
const { initDatabase } = require('./src/config/database');

const PORT = process.env.PORT || 3000;

// Initialize database, then start server
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n🚀 MANAGEALL is running at http://localhost:${PORT}\n`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
