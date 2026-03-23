import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import pool from './pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Run init.sql to create tables if they don't exist.
 * Retries a few times in case the database is still starting up.
 */
export async function initDatabase(retries = 5, delay = 2000) {
  const sql = readFileSync(join(__dirname, 'init.sql'), 'utf-8');

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await pool.query(sql);
      console.log('Database initialised successfully');
      return;
    } catch (err) {
      if (attempt === retries) throw err;
      console.log(
        `Database init attempt ${attempt}/${retries} failed, retrying in ${delay}ms...`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
