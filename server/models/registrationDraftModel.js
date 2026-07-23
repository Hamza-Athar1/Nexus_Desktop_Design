import { pool } from '../config/db.js';

/**
 * One draft per user (registration_drafts.user_id is UNIQUE). Draft data
 * is intentionally schemaless — `payload` holds whatever the frontend's
 * accumulated wizard state looks like at each step. See server/README.md
 * for why step 1 (Account) isn't part of this: it's handled by
 * /auth/signup, since a draft row requires a user to already exist
 * (registration_drafts.user_id has a NOT NULL FK to users).
 */
export async function findDraftByUser(userId) {
  const [rows] = await pool.query(
    `SELECT current_step, payload, last_saved_at, created_at
     FROM registration_drafts WHERE user_id = ? LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
}

/**
 * @param {number} userId
 * @param {number} step   1..4 — which step this save came from
 * @param {object} payload
 */
export async function upsertDraft(userId, step, payload) {
  await pool.query(
    `INSERT INTO registration_drafts (user_id, current_step, payload)
     VALUES (?, ?, CAST(? AS JSON))
     ON DUPLICATE KEY UPDATE
       current_step = VALUES(current_step),
       payload = VALUES(payload),
       last_saved_at = NOW()`,
    [userId, step, JSON.stringify(payload)]
  );
  return findDraftByUser(userId);
}

export async function deleteDraftByUser(userId) {
  await pool.query(`DELETE FROM registration_drafts WHERE user_id = ?`, [userId]);
}
