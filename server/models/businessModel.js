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

/** Joins in the module code/name and resolved palette details — fallback order: business.palette_id -> preset fallback. */
export async function findBusinessWithModuleByOwner(ownerUserId) {
  const [rows] = await pool.query(
    `SELECT b.*, m.code AS module_code, m.name AS module_name,
            p.id AS resolved_palette_id, p.name AS palette_name,
            p.color_primary, p.color_accent, p.color_shade, p.color_light
     FROM businesses b
     JOIN modules m ON m.id = b.module_id
     LEFT JOIN pos_palettes p ON p.id = COALESCE(b.palette_id, (SELECT id FROM pos_palettes WHERE is_preset = 1 ORDER BY id ASC LIMIT 1))
     WHERE b.owner_user_id = ? LIMIT 1`,
    [ownerUserId]
  );
  return rows[0] || null;
}

/** Resolves business context with palette details for either owner (admin) or staff (user). */
export async function findBusinessWithModuleByUser(userId) {
  const [rows] = await pool.query(
    `SELECT b.*, m.code AS module_code, m.name AS module_name,
            p.id AS resolved_palette_id, p.name AS palette_name,
            p.color_primary, p.color_accent, p.color_shade, p.color_light
     FROM users u
     JOIN businesses b ON (
       (u.role = 'admin' AND b.owner_user_id = u.id) OR
       (u.role = 'user' AND b.id = u.business_id)
     )
     JOIN modules m ON m.id = b.module_id
     LEFT JOIN pos_palettes p ON p.id = COALESCE(b.palette_id, (SELECT id FROM pos_palettes WHERE is_preset = 1 ORDER BY id ASC LIMIT 1))
     WHERE u.id = ? LIMIT 1`,
    [userId]
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
  paletteId = null,
}) {
  const [result] = await conn.query(
    `INSERT INTO businesses
       (owner_user_id, module_id, business_type_id, name, location, city_region,
        shop_address, is_registered, nic_number, palette_id, onboarding_status, terms_accepted_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', NOW())`,
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
      paletteId || null,
    ]
  );
  const [rows] = await conn.query(`SELECT * FROM businesses WHERE id = ?`, [result.insertId]);
  return rows[0];
}

export async function updateBusinessPalette(businessId, paletteId) {
  await pool.query(`UPDATE businesses SET palette_id = ? WHERE id = ?`, [paletteId, businessId]);
}
