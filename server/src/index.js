require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`[server] RecipeRight API listening on http://localhost:${PORT}`);
    });

    const shutdown = (signal) => {
      console.log(`\n[server] ${signal} received, shutting down...`);
      server.close(() => process.exit(0));
    };
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    console.error('[server] failed to start:', err.message);
    process.exit(1);
  }
}

start();
