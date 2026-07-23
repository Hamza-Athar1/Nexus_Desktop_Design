import { pool } from '../config/db.js';

/**
 * Platform catalog reads — modules, business types, plans, backup modules.
 * All seeded in schema.sql Section 9. Nothing here is tenant-scoped.
 */

/** Every module, including unavailable ones — the frontend renders those as "MORE SOON" tiles. */
export async function listModules() {
  const [rows] = await pool.query(
    `SELECT id, code, name, tagline, icon, is_available, display_order
     FROM modules ORDER BY display_order`
  );
  return rows;
}

export async function getModuleByCode(code) {
  const [rows] = await pool.query(`SELECT * FROM modules WHERE code = ? LIMIT 1`, [code]);
  return rows[0] || null;
}

export async function listBusinessTypes() {
  const [rows] = await pool.query(
    `SELECT id, code, name, display_order FROM business_types ORDER BY display_order`
  );
  return rows;
}

export async function getBusinessTypeByCode(code) {
  const [rows] = await pool.query(`SELECT * FROM business_types WHERE code = ? LIMIT 1`, [code]);
  return rows[0] || null;
}

/**
 * businessType on the frontend is currently a free-text input (not yet a
 * dropdown sourced from this catalog — see server/README.md). This does a
 * best-effort case-insensitive match against name/code, falling back to
 * the 'other' business type so free text never blocks registration.
 */
export async function resolveBusinessType(freeText) {
  if (!freeText?.trim()) return getBusinessTypeByCode('other');
  const [rows] = await pool.query(
    `SELECT * FROM business_types WHERE LOWER(name) = LOWER(?) OR LOWER(code) = LOWER(?) LIMIT 1`,
    [freeText.trim(), freeText.trim()]
  );
  return rows[0] || (await getBusinessTypeByCode('other'));
}

export async function listPlans() {
  const [rows] = await pool.query(
    `SELECT id, code, name, retention_months, monthly_price, currency
     FROM plans WHERE is_active = 1 ORDER BY display_order`
  );
  return rows;
}

export async function getPlanByCode(code) {
  const [rows] = await pool.query(
    `SELECT * FROM plans WHERE code = ? AND is_active = 1 LIMIT 1`,
    [code]
  );
  return rows[0] || null;
}

export async function listBackupModules() {
  const [rows] = await pool.query(
    `SELECT id, code, name, description, monthly_price
     FROM backup_modules WHERE is_active = 1 ORDER BY display_order`
  );
  return rows;
}

/** @param {string[]} codes */
export async function getBackupModulesByCodes(codes) {
  if (!codes?.length) return [];
  const [rows] = await pool.query(
    `SELECT * FROM backup_modules WHERE code IN (?) AND is_active = 1`,
    [codes]
  );
  return rows;
}
