import { pool } from '../config/db.js';

export async function listCustomers(businessId) {
  const [rows] = await pool.query(
    `SELECT id, name, phone, email, address, loyalty_points
     FROM customers WHERE business_id = ? ORDER BY name`,
    [businessId]
  );
  return rows;
}

export async function findCustomerById(businessId, id) {
  const [rows] = await pool.query(
    `SELECT * FROM customers WHERE business_id = ? AND id = ? LIMIT 1`,
    [businessId, id]
  );
  return rows[0] || null;
}

export async function createCustomer(businessId, { name, phone, email, address }) {
  const [result] = await pool.query(
    `INSERT INTO customers (business_id, name, phone, email, address) VALUES (?, ?, ?, ?, ?)`,
    [businessId, name, phone || null, email || null, address || null]
  );
  return findCustomerById(businessId, result.insertId);
}

export async function updateCustomer(businessId, id, fields) {
  const current = await findCustomerById(businessId, id);
  if (!current) return null;
  const merged = { ...current, ...fields };
  await pool.query(
    `UPDATE customers SET name = ?, phone = ?, email = ?, address = ? WHERE business_id = ? AND id = ?`,
    [merged.name, merged.phone, merged.email, merged.address, businessId, id]
  );
  return findCustomerById(businessId, id);
}

export async function deleteCustomer(businessId, id) {
  const [result] = await pool.query(
    `DELETE FROM customers WHERE business_id = ? AND id = ?`,
    [businessId, id]
  );
  return result.affectedRows > 0;
}
