import { pool } from '../config/db.js';

/** Columns we're ever willing to send to the client. Never password_hash. */
const SAFE_FIELDS = `
  id, username, email, phone, role, status, city_region, business_id,
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

export async function findUserById(id, connection = null) {
  const executor = connection || pool;
  const [rows] = await executor.query(`SELECT ${SAFE_FIELDS} FROM users WHERE id = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

/**
 * @param {{username:string, email:string, phone?:string, cityRegion?:string,
 *           passwordHash?:string, role?:'super_admin'|'admin'|'user', status?:string,
 *           businessId?:number, emailVerifiedAt?:Date|string}} input
 * @param {import('mysql2/promise').PoolConnection} [connection]
 * @returns {Promise<object>} the newly created user, safe fields only
 */
export async function createUser({
  username,
  email,
  phone = null,
  cityRegion = null,
  passwordHash = null,
  role = 'admin',
  status = 'active',
  businessId = null,
  emailVerifiedAt = null,
}, connection = null) {
  const executor = connection || pool;
  const [result] = await executor.query(
    `INSERT INTO users (username, email, phone, city_region, password_hash, role, status, business_id, email_verified_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [username, email, phone, cityRegion, passwordHash, role, status, businessId, emailVerifiedAt]
  );
  return findUserById(result.insertId, connection);
}

export async function updateLastLogin(userId) {
  await pool.query(`UPDATE users SET last_login_at = NOW() WHERE id = ?`, [userId]);
}

export async function updatePasswordHash(userId, passwordHash) {
  await pool.query(`UPDATE users SET password_hash = ? WHERE id = ?`, [passwordHash, userId]);
}

/**
 * Resolves businessId for either:
 *  • admin (owner): businesses.owner_user_id = userId
 *  • staff (user): users.business_id = businesses.id
 */
export async function findBusinessIdForUser(userId) {
  const [userRows] = await pool.query(`SELECT role, business_id FROM users WHERE id = ? LIMIT 1`, [userId]);
  const user = userRows[0];
  if (!user) return null;

  if (user.role === 'admin') {
    const [bizRows] = await pool.query(
      `SELECT id FROM businesses WHERE owner_user_id = ? LIMIT 1`,
      [userId]
    );
    return bizRows[0]?.id ?? null;
  }

  if (user.role === 'user') {
    return user.business_id ?? null;
  }

  return null;
}

/** Legacy alias for backwards compatibility */
export const findBusinessIdForOwner = findBusinessIdForUser;

