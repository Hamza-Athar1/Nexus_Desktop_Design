import { pool } from '../config/db.js';
import { hashToken } from '../utils/tokens.js';

const RESET_TOKEN_TTL_MINUTES = 60;

export async function createPasswordReset(userId, rawToken) {
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);
  await pool.query(
    `INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, ?)`,
    [userId, hashToken(rawToken), expiresAt]
  );
  return expiresAt;
}

export async function findValidPasswordReset(rawToken) {
  const [rows] = await pool.query(
    `SELECT * FROM password_resets
     WHERE token_hash = ? AND used_at IS NULL AND expires_at > NOW()
     LIMIT 1`,
    [hashToken(rawToken)]
  );
  return rows[0] || null;
}

export async function markPasswordResetUsed(id) {
  await pool.query(`UPDATE password_resets SET used_at = NOW() WHERE id = ?`, [id]);
}
