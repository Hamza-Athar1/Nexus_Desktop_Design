import crypto from 'crypto';
import { pool, withTransaction } from '../config/db.js';
import { findOrCreateCategory } from './categoryModel.js';
import { findOrCreateSupplier } from './supplierModel.js';
import { getSatelliteHandler } from '../lib/moduleSatellites.js';

function generateSku() {
  return `SKU-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

const BASE_SELECT = `
  SELECT p.*, c.name AS category_name, s.name AS supplier_name
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id
  LEFT JOIN suppliers s ON s.id = p.supplier_id
`;

/**
 * Shapes a `products` row (+ its satellite row, if any) into the flat
 * item contract InventoryPage.jsx / ClothingInventoryPage.jsx /
 * ItemFormModal.jsx already expect: { id, name, category, price,
 * stock_qty, module_specific_fields: {...} }. `unit` and `cost_price`
 * are real top-level `products` columns, not module-specific — they're
 * duplicated into module_specific_fields too, because the existing UI
 * reads them from there (e.g. `it.module_specific_fields?.unit`).
 */
function mapRow(row, satelliteRow, moduleCode) {
  const handler = getSatelliteHandler(moduleCode);
  const moduleFields = {
    cost_price: Number(row.cost_price),
    unit: row.unit,
    ...(handler ? handler.fromRow(satelliteRow) : {}),
  };

  return {
    id: row.id,
    name: row.name,
    sku: row.sku,
    barcode: row.barcode,
    category: row.category_name || null,
    supplier: row.supplier_name || null,
    price: Number(row.sale_price),
    stock_qty: Number(row.stock_quantity),
    reorder_level: Number(row.reorder_level),
    is_active: Boolean(row.is_active),
    module_specific_fields: moduleFields,
  };
}

async function fetchSatelliteRow(conn, moduleCode, productId) {
  const handler = getSatelliteHandler(moduleCode);
  if (!handler) return null;
  const [rows] = await conn.query(
    `SELECT * FROM ${handler.table} WHERE product_id = ? LIMIT 1`,
    [productId]
  );
  return rows[0] || null;
}

export async function listProducts(businessId, moduleCode) {
  const [rows] = await pool.query(
    `${BASE_SELECT} WHERE p.business_id = ? AND p.is_active = 1 ORDER BY p.created_at DESC`,
    [businessId]
  );
  const items = [];
  for (const row of rows) {
    const satellite = await fetchSatelliteRow(pool, moduleCode, row.id);
    items.push(mapRow(row, satellite, moduleCode));
  }
  return items;
}

export async function findProductById(businessId, id, moduleCode) {
  const [rows] = await pool.query(
    `${BASE_SELECT} WHERE p.business_id = ? AND p.id = ? LIMIT 1`,
    [businessId, id]
  );
  if (!rows[0]) return null;
  const satellite = await fetchSatelliteRow(pool, moduleCode, id);
  return mapRow(rows[0], satellite, moduleCode);
}

export async function findProductByBarcode(businessId, barcode, moduleCode) {
  const [rows] = await pool.query(
    `${BASE_SELECT} WHERE p.business_id = ? AND p.barcode = ? AND p.is_active = 1 LIMIT 1`,
    [businessId, barcode]
  );
  if (!rows[0]) return null;
  const satellite = await fetchSatelliteRow(pool, moduleCode, rows[0].id);
  return mapRow(rows[0], satellite, moduleCode);
}

export async function searchProducts(businessId, query, moduleCode) {
  const like = `%${query}%`;
  const [rows] = await pool.query(
    `${BASE_SELECT}
     WHERE p.business_id = ? AND p.is_active = 1
       AND (p.name LIKE ? OR p.sku LIKE ? OR p.barcode LIKE ? OR c.name LIKE ?)
     ORDER BY p.name ASC`,
    [businessId, like, like, like, like]
  );
  const items = [];
  for (const row of rows) {
    const satellite = await fetchSatelliteRow(pool, moduleCode, row.id);
    items.push(mapRow(row, satellite, moduleCode));
  }
  return items;
}

export async function lowStockProducts(businessId, moduleCode) {
  const [rows] = await pool.query(
    `${BASE_SELECT} WHERE p.business_id = ? AND p.is_active = 1 AND p.stock_quantity <= p.reorder_level
     ORDER BY p.stock_quantity ASC`,
    [businessId]
  );
  const items = [];
  for (const row of rows) {
    const satellite = await fetchSatelliteRow(pool, moduleCode, row.id);
    items.push(mapRow(row, satellite, moduleCode));
  }
  return items;
}

/**
 * @param {object} business  req.business from requireBusiness (needs id + module_code)
 * @param {object} fields    { name, sku, barcode, category, unit, price, stockQty, reorderLevel, moduleSpecificFields }
 */
export async function createProduct(business, fields, userId) {
  const { name, sku, barcode, category, unit, price, stockQty, reorderLevel, moduleSpecificFields = {} } = fields;

  const categoryId = await findOrCreateCategory(business.id, category);
  const supplierId = moduleSpecificFields.supplier_name
    ? await findOrCreateSupplier(business.id, moduleSpecificFields.supplier_name)
    : null;

  const finalSku = sku?.trim() || generateSku();
  const finalUnit = unit || moduleSpecificFields.unit || 'pcs';
  const costPrice = moduleSpecificFields.cost_price ?? 0;
  const openingStock = Number(stockQty) || 0;

  const productId = await withTransaction(async (conn) => {
    const [result] = await conn.query(
      `INSERT INTO products
         (business_id, category_id, supplier_id, sku, barcode, name, unit,
          cost_price, sale_price, stock_quantity, reorder_level, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        business.id, categoryId, supplierId, finalSku, barcode?.trim() || null, name,
        finalUnit, costPrice, Number(price) || 0, openingStock, Number(reorderLevel) || 0,
      ]
    );
    const id = result.insertId;

    const handler = getSatelliteHandler(business.module_code);
    if (handler) {
      const satelliteFields = handler.toRow(moduleSpecificFields);
      const columns = Object.keys(satelliteFields);
      await conn.query(
        `INSERT INTO ${handler.table} (product_id, ${columns.join(', ')})
         VALUES (?, ${columns.map(() => '?').join(', ')})`,
        [id, ...columns.map((c) => satelliteFields[c])]
      );
    }

    if (openingStock > 0) {
      await conn.query(
        `INSERT INTO stock_movements
           (business_id, product_id, user_id, movement_type, quantity_change, balance_after, note)
         VALUES (?, ?, ?, 'opening', ?, ?, 'Opening stock on creation')`,
        [business.id, id, userId, openingStock, openingStock]
      );
    }

    return id;
  });

  return findProductById(business.id, productId, business.module_code);
}

/**
 * @param {object} business  req.business (needs id + module_code)
 */
export async function updateProduct(business, id, fields, userId) {
  const existing = await findProductById(business.id, id, business.module_code);
  if (!existing) return null;

  const { name, sku, barcode, category, unit, price, stockQty, reorderLevel, moduleSpecificFields = {} } = fields;

  const categoryId = category !== undefined ? await findOrCreateCategory(business.id, category) : undefined;
  const supplierId = moduleSpecificFields.supplier_name
    ? await findOrCreateSupplier(business.id, moduleSpecificFields.supplier_name)
    : undefined;

  const newStock = stockQty !== undefined ? Number(stockQty) : existing.stock_qty;
  const stockDelta = newStock - existing.stock_qty;

  await withTransaction(async (conn) => {
    await conn.query(
      `UPDATE products SET
         name = COALESCE(?, name),
         sku = COALESCE(?, sku),
         barcode = ?,
         category_id = COALESCE(?, category_id),
         supplier_id = COALESCE(?, supplier_id),
         unit = COALESCE(?, unit),
         cost_price = COALESCE(?, cost_price),
         sale_price = COALESCE(?, sale_price),
         stock_quantity = ?,
         reorder_level = COALESCE(?, reorder_level)
       WHERE business_id = ? AND id = ?`,
      [
        name ?? null,
        sku?.trim() || null,
        barcode !== undefined ? (barcode?.trim() || null) : existing.barcode,
        categoryId ?? null,
        supplierId ?? null,
        unit || moduleSpecificFields.unit || null,
        moduleSpecificFields.cost_price ?? null,
        price !== undefined ? Number(price) : null,
        newStock,
        reorderLevel !== undefined ? Number(reorderLevel) : null,
        business.id, id,
      ]
    );

    const handler = getSatelliteHandler(business.module_code);
    if (handler && Object.keys(moduleSpecificFields).length) {
      const satelliteFields = handler.toRow(moduleSpecificFields);
      const columns = Object.keys(satelliteFields);
      const assignments = columns.map((c) => `${c} = VALUES(${c})`).join(', ');
      await conn.query(
        `INSERT INTO ${handler.table} (product_id, ${columns.join(', ')})
         VALUES (?, ${columns.map(() => '?').join(', ')})
         ON DUPLICATE KEY UPDATE ${assignments}`,
        [id, ...columns.map((c) => satelliteFields[c])]
      );
    }

    if (stockDelta !== 0) {
      await conn.query(
        `INSERT INTO stock_movements
           (business_id, product_id, user_id, movement_type, quantity_change, balance_after, note)
         VALUES (?, ?, ?, 'adjustment', ?, ?, 'Manual inventory edit')`,
        [business.id, id, userId, stockDelta, newStock]
      );
    }
  });

  return findProductById(business.id, id, business.module_code);
}

/**
 * Soft delete — flips is_active off rather than a hard DELETE, so past
 * sales/purchase history referencing this product (sale_items,
 * stock_movements) stays intact and reports don't silently lose rows.
 */
export async function deactivateProduct(businessId, id) {
  const [result] = await pool.query(
    `UPDATE products SET is_active = 0 WHERE business_id = ? AND id = ? AND is_active = 1`,
    [businessId, id]
  );
  return result.affectedRows > 0;
}
