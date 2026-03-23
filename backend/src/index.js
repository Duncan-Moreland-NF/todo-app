import 'dotenv/config';
import app from './app.js';
import { initDatabase } from './db/init.js';

const PORT = process.env.PORT || 3001;

async function start() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
