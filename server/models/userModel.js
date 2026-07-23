import { pool } from '../config/db.js';

/** Columns we're ever willing to send to the client. Never password_hash. */
const SAFE_FIELDS = `
  id, username, email, phone, role, status, city_region,
  email_verified_at, last_login_at, created_at
`;

export async function findUserByEmail(email) {
  const [rows] = await pool.query(`SELECT * FROM users WHERE email = ? LIMIT 1`, [email]);
  return rows[0] || null;
}

export async function findUserByUsername(username) {
  const [rows] = await pool.query(`SELECT * FROM users WHERE username = ? LIMIT 1`, [username]);
  return rows[0] || null;
}

/**
 * Login accepts either a username or an email in the same field
 * (the frontend only exposes one "username" input, but there's no
 * reason to force people to remember which one they registered with).
 */
export async function findUserByIdentifier(identifier) {
  const [rows] = await pool.query(
    `SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1`,
    [identifier, identifier]
  );
  return rows[0] || null;
}

export async function findUserById(id) {
  const [rows] = await pool.query(`SELECT ${SAFE_FIELDS} FROM users WHERE id = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

/**
 * @param {{username:string, email:string, phone?:string, cityRegion?:string,
 *           passwordHash:string, role?:'super_admin'|'admin'|'user', status?:string}} input
 * @returns {Promise<object>} the newly created user, safe fields only
 */
export async function createUser({
  username,
  email,
  phone = null,
  cityRegion = null,
  passwordHash,
  role = 'admin',
  status = 'active',
}) {
  const [result] = await pool.query(
    `INSERT INTO users (username, email, phone, city_region, password_hash, role, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [username, email, phone, cityRegion, passwordHash, role, status]
  );
  return findUserById(result.insertId);
}

export async function updateLastLogin(userId) {
  await pool.query(`UPDATE users SET last_login_at = NOW() WHERE id = ?`, [userId]);
}

export async function updatePasswordHash(userId, passwordHash) {
  await pool.query(`UPDATE users SET password_hash = ? WHERE id = ?`, [passwordHash, userId]);
}

/**
 * A user owns at most one business (businesses.owner_user_id is UNIQUE).
 * Used by /auth/me so the frontend knows whether to route the owner into
 * the registration wizard or straight to their dashboard.
 */
export async function findBusinessIdForOwner(userId) {
  const [rows] = await pool.query(
    `SELECT id FROM businesses WHERE owner_user_id = ? LIMIT 1`,
    [userId]
  );
  return rows[0]?.id ?? null;
}
