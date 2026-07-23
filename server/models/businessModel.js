import { pool } from '../config/db.js';

export async function findBusinessByOwner(ownerUserId) {
  const [rows] = await pool.query(
    `SELECT * FROM businesses WHERE owner_user_id = ? LIMIT 1`,
    [ownerUserId]
  );
  return rows[0] || null;
}

export async function findBusinessById(id) {
  const [rows] = await pool.query(`SELECT * FROM businesses WHERE id = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

/** Joins in the module code/name — used by requireBusiness to decide which satellite table product writes go to. */
export async function findBusinessWithModuleByOwner(ownerUserId) {
  const [rows] = await pool.query(
    `SELECT b.*, m.code AS module_code, m.name AS module_name
     FROM businesses b JOIN modules m ON m.id = b.module_id
     WHERE b.owner_user_id = ? LIMIT 1`,
    [ownerUserId]
  );
  return rows[0] || null;
}

/**
 * Runs inside the caller's transaction (`conn`), not the shared pool —
 * this is always called alongside subscription creation, and both must
 * commit or roll back together.
 *
 * @param {import('mysql2/promise').PoolConnection} conn
 */
export async function createBusiness(conn, {
  ownerUserId,
  moduleId,
  businessTypeId,
  name,
  location,
  cityRegion,
  shopAddress,
  isRegistered,
  nicNumber,
}) {
  const [result] = await conn.query(
    `INSERT INTO businesses
       (owner_user_id, module_id, business_type_id, name, location, city_region,
        shop_address, is_registered, nic_number, onboarding_status, terms_accepted_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', NOW())`,
    [
      ownerUserId,
      moduleId,
      businessTypeId,
      name,
      location,
      cityRegion,
      shopAddress,
      isRegistered ? 1 : 0,
      nicNumber,
    ]
  );
  const [rows] = await conn.query(`SELECT * FROM businesses WHERE id = ?`, [result.insertId]);
  return rows[0];
}
