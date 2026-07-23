import { pool } from '../config/db.js';

export async function listCategories(businessId) {
  const [rows] = await pool.query(
    `SELECT id, name, parent_id FROM categories WHERE business_id = ? ORDER BY name`,
    [businessId]
  );
  return rows;
}

export async function findCategoryById(businessId, id) {
  const [rows] = await pool.query(
    `SELECT * FROM categories WHERE business_id = ? AND id = ? LIMIT 1`,
    [businessId, id]
  );
  return rows[0] || null;
}

export async function createCategory(businessId, { name, parentId = null }) {
  const [result] = await pool.query(
    `INSERT INTO categories (business_id, parent_id, name) VALUES (?, ?, ?)`,
    [businessId, parentId, name]
  );
  return findCategoryById(businessId, result.insertId);
}

export async function updateCategory(businessId, id, { name, parentId }) {
  await pool.query(
    `UPDATE categories SET name = COALESCE(?, name), parent_id = ? WHERE business_id = ? AND id = ?`,
    [name ?? null, parentId ?? null, businessId, id]
  );
  return findCategoryById(businessId, id);
}

export async function deleteCategory(businessId, id) {
  const [result] = await pool.query(
    `DELETE FROM categories WHERE business_id = ? AND id = ?`,
    [businessId, id]
  );
  return result.affectedRows > 0;
}

/**
 * The inventory UI sends a plain category name string, not an id
 * (ItemFormModal's category dropdowns are hardcoded lists like
 * ['Grain','Dairy',...] or ['Men','Women',...], not sourced from the
 * catalog yet). This resolves that string to a real categories row,
 * creating one on first use, so every product still gets a proper
 * category_id FK underneath.
 */
export async function findOrCreateCategory(businessId, name) {
  const trimmed = name?.trim();
  if (!trimmed) return null;

  const [existing] = await pool.query(
    `SELECT id FROM categories WHERE business_id = ? AND name = ? LIMIT 1`,
    [businessId, trimmed]
  );
  if (existing[0]) return existing[0].id;

  const [result] = await pool.query(
    `INSERT INTO categories (business_id, name) VALUES (?, ?)`,
    [businessId, trimmed]
  );
  return result.insertId;
}
