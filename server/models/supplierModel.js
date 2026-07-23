import { pool } from '../config/db.js';

export async function listSuppliers(businessId) {
  const [rows] = await pool.query(
    `SELECT id, name, contact_person, phone, email, address
     FROM suppliers WHERE business_id = ? ORDER BY name`,
    [businessId]
  );
  return rows;
}

export async function findSupplierById(businessId, id) {
  const [rows] = await pool.query(
    `SELECT * FROM suppliers WHERE business_id = ? AND id = ? LIMIT 1`,
    [businessId, id]
  );
  return rows[0] || null;
}

export async function createSupplier(businessId, { name, contactPerson, phone, email, address }) {
  const [result] = await pool.query(
    `INSERT INTO suppliers (business_id, name, contact_person, phone, email, address)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [businessId, name, contactPerson || null, phone || null, email || null, address || null]
  );
  return findSupplierById(businessId, result.insertId);
}

export async function updateSupplier(businessId, id, fields) {
  const current = await findSupplierById(businessId, id);
  if (!current) return null;
  const merged = { ...current, ...fields };
  await pool.query(
    `UPDATE suppliers SET name = ?, contact_person = ?, phone = ?, email = ?, address = ?
     WHERE business_id = ? AND id = ?`,
    [merged.name, merged.contact_person, merged.phone, merged.email, merged.address, businessId, id]
  );
  return findSupplierById(businessId, id);
}

export async function deleteSupplier(businessId, id) {
  const [result] = await pool.query(
    `DELETE FROM suppliers WHERE business_id = ? AND id = ?`,
    [businessId, id]
  );
  return result.affectedRows > 0;
}

/** Same find-or-create pattern as categories — the grocery form sends a plain supplier name. */
export async function findOrCreateSupplier(businessId, name) {
  const trimmed = name?.trim();
  if (!trimmed) return null;

  const [existing] = await pool.query(
    `SELECT id FROM suppliers WHERE business_id = ? AND name = ? LIMIT 1`,
    [businessId, trimmed]
  );
  if (existing[0]) return existing[0].id;

  const [result] = await pool.query(
    `INSERT INTO suppliers (business_id, name) VALUES (?, ?)`,
    [businessId, trimmed]
  );
  return result.insertId;
}
