import { pool } from '../config/db.js';
import { hashToken } from '../utils/tokens.js';

/**
 * @param {{userId:number, refreshToken:string, userAgent?:string,
 *           rememberMe?:boolean, expiresAt:Date}} input
 *
 * NOTE: `sessions.ip_address` is VARBINARY(16) (INET6_ATON format) in the
 * schema, intended for a future "Active Sessions" security screen — which
 * doesn't exist in the frontend yet. Rather than half-implement IPv4/IPv6
 * parsing no one can see or use yet, we leave it NULL here and wire it up
 * properly when that screen is actually built.
 */
export async function createSession({
  userId,
  refreshToken,
  userAgent = null,
  rememberMe = false,
  expiresAt,
}) {
  await pool.query(
    `INSERT INTO sessions
       (user_id, refresh_token_hash, user_agent, ip_address, remember_me, expires_at)
     VALUES (?, ?, ?, NULL, ?, ?)`,
    [userId, hashToken(refreshToken), userAgent, rememberMe ? 1 : 0, expiresAt]
  );
}

export async function findActiveSessionByToken(refreshToken) {
  const [rows] = await pool.query(
    `SELECT * FROM sessions
     WHERE refresh_token_hash = ? AND revoked_at IS NULL AND expires_at > NOW()
     LIMIT 1`,
    [hashToken(refreshToken)]
  );
  return rows[0] || null;
}

export async function revokeSessionByToken(refreshToken) {
  await pool.query(
    `UPDATE sessions SET revoked_at = NOW() WHERE refresh_token_hash = ? AND revoked_at IS NULL`,
    [hashToken(refreshToken)]
  );
}

/** Used after a password reset — kill every existing session for the user. */
export async function revokeAllSessionsForUser(userId) {
  await pool.query(
    `UPDATE sessions SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL`,
    [userId]
  );
}
