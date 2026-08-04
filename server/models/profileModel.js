/**
 * profileModel.js — DB layer for the Super Admin Profile Management page.
 * All queries are scoped to the currently logged-in user (userId = req.user.id).
 */
import bcrypt from 'bcrypt';
import { pool } from '../config/db.js';

const PROFILE_FIELDS = `
  id, username, email, phone, full_name,
  twofa_enabled,
  pref_security_alerts, pref_new_logins, pref_billing_updates, pref_announcements,
  status, role, created_at
`;

// ── Profile info ──────────────────────────────────────────────────────────────

export async function getProfile(userId) {
  const [rows] = await pool.query(
    `SELECT ${PROFILE_FIELDS} FROM users WHERE id = ? LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
}

export async function updateProfile(userId, { fullName, phone }) {
  await pool.query(
    `UPDATE users SET full_name = ?, phone = ?, updated_at = NOW() WHERE id = ?`,
    [fullName ?? null, phone ?? null, userId]
  );
  return getProfile(userId);
}

export async function updateEmail(userId, { newEmail }) {
  // Check uniqueness first
  const [taken] = await pool.query(
    `SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1`,
    [newEmail, userId]
  );
  if (taken[0]) {
    throw Object.assign(new Error('Email already in use'), { status: 409 });
  }
  await pool.query(
    `UPDATE users SET email = ?, updated_at = NOW() WHERE id = ?`,
    [newEmail, userId]
  );
  return getProfile(userId);
}

// ── Password ──────────────────────────────────────────────────────────────────

export async function verifyAndChangePassword(userId, { currentPassword, newPassword }) {
  const [[user]] = await pool.query(
    `SELECT id, password_hash FROM users WHERE id = ? LIMIT 1`,
    [userId]
  );
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });

  const match = await bcrypt.compare(currentPassword, user.password_hash ?? '');
  if (!match) {
    throw Object.assign(new Error('Current password is incorrect'), { status: 400 });
  }

  const hash = await bcrypt.hash(newPassword, 10);
  await pool.query(
    `UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?`,
    [hash, userId]
  );

  // Revoke all existing sessions so old tokens stop working
  await pool.query(
    `UPDATE sessions SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL`,
    [userId]
  );
}

// ── 2FA ───────────────────────────────────────────────────────────────────────

export async function setTwofa(userId, enabled) {
  await pool.query(
    `UPDATE users SET twofa_enabled = ?, updated_at = NOW() WHERE id = ?`,
    [enabled ? 1 : 0, userId]
  );
}

// ── Email preferences ─────────────────────────────────────────────────────────

export async function updatePreferences(userId, { securityAlerts, newLogins, billingUpdates, announcements }) {
  await pool.query(
    `UPDATE users SET
       pref_security_alerts = ?,
       pref_new_logins       = ?,
       pref_billing_updates  = ?,
       pref_announcements    = ?,
       updated_at = NOW()
     WHERE id = ?`,
    [securityAlerts ? 1 : 0, newLogins ? 1 : 0, billingUpdates ? 1 : 0, announcements ? 1 : 0, userId]
  );
}

// ── Sessions ──────────────────────────────────────────────────────────────────

export async function getActiveSessions(userId) {
  const [rows] = await pool.query(
    `SELECT id, user_agent, remember_me, created_at, expires_at
     FROM sessions
     WHERE user_id = ? AND revoked_at IS NULL AND expires_at > NOW()
     ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
}

export async function revokeAllSessions(userId) {
  await pool.query(
    `UPDATE sessions SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL`,
    [userId]
  );
}

// ── Delete account ────────────────────────────────────────────────────────────

export async function verifyPasswordAndDelete(userId, password) {
  const [[user]] = await pool.query(
    `SELECT id, password_hash FROM users WHERE id = ? LIMIT 1`,
    [userId]
  );
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });

  const match = await bcrypt.compare(password, user.password_hash ?? '');
  if (!match) {
    throw Object.assign(new Error('Password is incorrect'), { status: 400 });
  }

  await pool.query(`DELETE FROM users WHERE id = ?`, [userId]);
}
