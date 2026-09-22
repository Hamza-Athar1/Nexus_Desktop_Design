import { pool } from '../config/db.js';

const STAFF_SAFE_FIELDS = `
  id, username, email, phone, role, status, city_region, business_id,
  email_verified_at, last_login_at, created_at
`;

export async function findStaffByBusiness(businessId) {
  const [rows] = await pool.query(
    `SELECT ${STAFF_SAFE_FIELDS}
     FROM users
     WHERE business_id = ? AND role = 'user'
     ORDER BY created_at DESC`,
    [businessId]
  );
  return rows;
}

export async function findStaffById(businessId, staffId) {
  const [rows] = await pool.query(
    `SELECT ${STAFF_SAFE_FIELDS}
     FROM users
     WHERE id = ? AND business_id = ? AND role = 'user'
     LIMIT 1`,
    [staffId, businessId]
  );
  return rows[0] || null;
}

export async function createStaffMember(businessId, { username, email, phone, passwordHash }) {
  const [result] = await pool.query(
    `INSERT INTO users (username, email, phone, password_hash, role, status, business_id)
     VALUES (?, ?, ?, ?, 'user', 'active', ?)`,
    [username, email, phone || null, passwordHash, businessId]
  );
  return findStaffById(businessId, result.insertId);
}

export async function updateStaffMember(businessId, staffId, { username, email, phone, status }) {
  const updates = [];
  const params = [];

  if (username !== undefined) {
    updates.push('username = ?');
    params.push(username);
  }
  if (email !== undefined) {
    updates.push('email = ?');
    params.push(email);
  }
  if (phone !== undefined) {
    updates.push('phone = ?');
    params.push(phone);
  }
  if (status !== undefined) {
    updates.push('status = ?');
    params.push(status);
  }

  if (updates.length === 0) {
    return findStaffById(businessId, staffId);
  }

  params.push(staffId, businessId);
  await pool.query(
    `UPDATE users SET ${updates.join(', ')} WHERE id = ? AND business_id = ? AND role = 'user'`,
    params
  );
  return findStaffById(businessId, staffId);
}

export async function deleteStaffMember(businessId, staffId) {
  const [result] = await pool.query(
    `DELETE FROM users WHERE id = ? AND business_id = ? AND role = 'user'`,
    [staffId, businessId]
  );
  return result.affectedRows > 0;
}
