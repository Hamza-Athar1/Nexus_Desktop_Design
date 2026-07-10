import pool from '../config/db.js';

// mysql2 sometimes hands back a JSON column as an already-parsed
// object, sometimes as a raw string, depending on version/config.
// Normalize so callers always get a plain JS object (or null).
function parseModuleFields(raw) {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function mapRow(row) {
  if (!row) return row;
  return { ...row, module_specific_fields: parseModuleFields(row.module_specific_fields) };
}

export async function findItemById(userId, id) {
  const [rows] = await pool.query(
    'SELECT * FROM inventory_items WHERE id = ? AND user_id = ? LIMIT 1',
    [id, userId]
  );
  return mapRow(rows[0]) || null;
}

export async function findItemByBarcode(userId, barcode) {
  const [rows] = await pool.query(
    'SELECT * FROM inventory_items WHERE user_id = ? AND barcode = ? LIMIT 1',
    [userId, barcode]
  );
  return mapRow(rows[0]) || null;
}

export async function getAllItems(userId) {
  const [rows] = await pool.query(
    'SELECT * FROM inventory_items WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return rows.map(mapRow);
}

export async function getLowStockItems(userId) {
  const [rows] = await pool.query(
    'SELECT * FROM inventory_items WHERE user_id = ? AND stock_qty <= reorder_level ORDER BY stock_qty ASC',
    [userId]
  );
  return rows.map(mapRow);
}

// Simple LIKE-based search across name, sku, and category — matches
// any item where the query appears as a substring in any of the three.
export async function searchItems(userId, query) {
  const like = `%${query}%`;
  const [rows] = await pool.query(
    `SELECT * FROM inventory_items
     WHERE user_id = ? AND (name LIKE ? OR sku LIKE ? OR category LIKE ?)
     ORDER BY name ASC`,
    [userId, like, like, like]
  );
  return rows.map(mapRow);
}

export async function createItem(userId, fields) {
  const {
    name, sku, barcode, category,
    stockQty = 0, reorderLevel = 0, price = 0,
    moduleSpecificFields = null,
  } = fields;

  const [result] = await pool.query(
    `INSERT INTO inventory_items
       (user_id, name, sku, barcode, category, stock_qty, reorder_level, price, module_specific_fields)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId, name, sku || null, barcode || null, category || null,
      stockQty, reorderLevel, price,
      moduleSpecificFields ? JSON.stringify(moduleSpecificFields) : null,
    ]
  );
  return findItemById(userId, result.insertId);
}

// Dynamic partial update — only columns actually present in `fields`
// get touched, so a small PUT (e.g. just stock_qty) doesn't wipe
// everything else back to null.
export async function updateItem(userId, id, fields) {
  const columnMap = {
    name: 'name',
    sku: 'sku',
    barcode: 'barcode',
    category: 'category',
    stockQty: 'stock_qty',
    reorderLevel: 'reorder_level',
    price: 'price',
  };

  const columns = [];
  const values = [];

  for (const [key, column] of Object.entries(columnMap)) {
    if (fields[key] !== undefined) {
      columns.push(`${column} = ?`);
      values.push(fields[key]);
    }
  }

  if (fields.moduleSpecificFields !== undefined) {
    columns.push('module_specific_fields = ?');
    values.push(fields.moduleSpecificFields ? JSON.stringify(fields.moduleSpecificFields) : null);
  }

  if (columns.length === 0) {
    return findItemById(userId, id); // nothing to update
  }

  values.push(id, userId);
  await pool.query(
    `UPDATE inventory_items SET ${columns.join(', ')} WHERE id = ? AND user_id = ?`,
    values
  );
  return findItemById(userId, id);
}

// Returns true/false so the controller can tell "deleted" apart from
// "nothing matched that id for this user" (someone else's item, or
// already gone) without a separate existence check first.
export async function deleteItem(userId, id) {
  const [result] = await pool.query(
    'DELETE FROM inventory_items WHERE id = ? AND user_id = ?',
    [id, userId]
  );
  return result.affectedRows > 0;
}