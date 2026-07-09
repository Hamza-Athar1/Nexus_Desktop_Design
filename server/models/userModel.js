import pool from '../config/db.js';

// All the raw SQL for the `users` table lives here. Controllers call
// these functions instead of writing SQL inline — keeps queries in
// one place if the schema changes later.

export async function findUserByEmail(email) {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE email = ? LIMIT 1',
    [email]
  );
  return rows[0] || null;
}

export async function findUserByUsername(username) {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE username = ? LIMIT 1',
    [username]
  );
  return rows[0] || null;
}

export async function findUserById(id) {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
}

export async function findAllUsers() {
  const [rows] = await pool.query(`
    SELECT
      u.id, u.username, u.email, u.role, u.created_at,
      bp.business_name, bp.business_type, bp.selected_module, bp.subscription_status
    FROM users u
    LEFT JOIN business_profiles bp ON bp.user_id = u.id
    ORDER BY u.created_at DESC
  `);
  return rows;
}
export async function createUser({ businessName, businessType, email, username, passwordHash }) {
  const [result] = await pool.query(
    `INSERT INTO users (business_name, business_type, email, username, password_hash, role)
     VALUES (?, ?, ?, ?, ?, 'user')`,
    [businessName, businessType, email, username, passwordHash]
  );
  // result.insertId is the new user's auto-incremented id
  return findUserById(result.insertId);
}

// ── Refresh token helpers ─────────────────────────────────

export async function saveRefreshToken(userId, token, expiresAt) {
  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)`,
    [userId, token, expiresAt]
  );
}

export async function findRefreshToken(token) {
  const [rows] = await pool.query(
    'SELECT * FROM refresh_tokens WHERE token = ? LIMIT 1',
    [token]
  );
  return rows[0] || null;
}

export async function deleteRefreshToken(token) {
  await pool.query('DELETE FROM refresh_tokens WHERE token = ?', [token]);
}