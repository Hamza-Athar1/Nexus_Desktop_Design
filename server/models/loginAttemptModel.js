import { pool } from '../config/db.js';

export async function recordLoginAttempt(identifier, wasSuccessful) {
  await pool.query(
    `INSERT INTO login_attempts (identifier, was_successful) VALUES (?, ?)`,
    [identifier, wasSuccessful ? 1 : 0]
  );
}

/**
 * Counts failed attempts for this identifier in the last `windowMinutes`.
 * Used to throttle brute-force login attempts before we even touch bcrypt.
 */
export async function countRecentFailedAttempts(identifier, windowMinutes = 15) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS count FROM login_attempts
     WHERE identifier = ? AND was_successful = 0
       AND attempted_at > (NOW() - INTERVAL ? MINUTE)`,
    [identifier, windowMinutes]
  );
  return rows[0].count;
}
