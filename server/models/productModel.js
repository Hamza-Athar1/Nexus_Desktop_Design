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

async function fetchProductVariants(conn, productId) {
  const [rows] = await conn.query(
    'SELECT * FROM product_variants WHERE product_id = ? AND is_active = 1',
    [productId]
  );
  return rows.map((v) => ({
    id: v.id,
    product_id: v.product_id,
    sku: v.sku,
    barcode: v.barcode,
    size: v.size,
    color: v.color,
    cost_price: Number(v.cost_price),
    sale_price: Number(v.sale_price),
    stock_quantity: Number(v.stock_quantity),
    stock_qty: Number(v.stock_quantity),
    is_active: Boolean(v.is_active),
  }));
}

/**
 * Shapes a `products` row (+ its satellite row, if any) into the flat
 * item contract InventoryPage.jsx / ClothingInventoryPage.jsx /
 * ItemFormModal.jsx already expect: { id, name, category, price,
 * stock_qty, module_specific_fields: {...} }.
 */
function mapRow(row, satelliteRow, moduleCode, variants = []) {
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
    unit: row.unit,
    category: row.category_name || null,
    supplier: row.supplier_name || null,
    price: Number(row.sale_price),
    sale_price: Number(row.sale_price),
    cost_price: Number(row.cost_price),
    stock_qty: Number(row.stock_quantity),
    stock_quantity: Number(row.stock_quantity),
    tax_rate: Number(row.tax_rate || 0),
    reorder_level: Number(row.reorder_level),
    is_active: Boolean(row.is_active),
    module_specific_fields: moduleFields,
    variants: variants || [],
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
    const variants = await fetchProductVariants(pool, row.id);
    items.push(mapRow(row, satellite, moduleCode, variants));
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
  const variants = await fetchProductVariants(pool, id);
  return mapRow(rows[0], satellite, moduleCode, variants);
}

export async function findProductByBarcode(businessId, barcode, moduleCode) {
  // 1. First check product_variants barcode match
  const [vRows] = await pool.query(
    `SELECT pv.*, p.business_id
     FROM product_variants pv
     JOIN products p ON p.id = pv.product_id
     WHERE p.business_id = ? AND pv.barcode = ? AND pv.is_active = 1 AND p.is_active = 1 LIMIT 1`,
    [businessId, barcode]
  );
  if (vRows[0]) {
    const pId = vRows[0].product_id;
    const [rows] = await pool.query(
      `${BASE_SELECT} WHERE p.business_id = ? AND p.id = ? LIMIT 1`,
      [businessId, pId]
    );
    if (rows[0]) {
      const satellite = await fetchSatelliteRow(pool, moduleCode, pId);
      const variants = await fetchProductVariants(pool, pId);
      const item = mapRow(rows[0], satellite, moduleCode, variants);
      item.matched_variant_id = vRows[0].id;
      item.matched_variant = {
        id: vRows[0].id,
        sku: vRows[0].sku,
        barcode: vRows[0].barcode,
        size: vRows[0].size,
        color: vRows[0].color,
        cost_price: Number(vRows[0].cost_price),
        sale_price: Number(vRows[0].sale_price),
        stock_quantity: Number(vRows[0].stock_quantity),
      };
      return item;
    }
  }

  // 2. Direct products table barcode match
  const [rows] = await pool.query(
    `${BASE_SELECT} WHERE p.business_id = ? AND p.barcode = ? AND p.is_active = 1 LIMIT 1`,
    [businessId, barcode]
  );
  if (!rows[0]) return null;
  const satellite = await fetchSatelliteRow(pool, moduleCode, rows[0].id);
  const variants = await fetchProductVariants(pool, rows[0].id);
  return mapRow(rows[0], satellite, moduleCode, variants);
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
    const variants = await fetchProductVariants(pool, row.id);
    items.push(mapRow(row, satellite, moduleCode, variants));
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
    const variants = await fetchProductVariants(pool, row.id);
    items.push(mapRow(row, satellite, moduleCode, variants));
  }
  return items;
}

/**
 * @param {object} business  req.business from requireBusiness (needs id + module_code)
 * @param {object} fields    { name, sku, barcode, category, unit, price, stockQty, reorderLevel, moduleSpecificFields, variants }
 */
export async function createProduct(business, fields, userId) {
  const { name, sku, barcode, category, unit, price, stockQty, reorderLevel, moduleSpecificFields = {}, variants = [] } = fields;

  const categoryId = await findOrCreateCategory(business.id, category);
  const supplierId = moduleSpecificFields.supplier_name
    ? await findOrCreateSupplier(business.id, moduleSpecificFields.supplier_name)
    : null;

  const finalSku = sku?.trim() || generateSku();
  const finalUnit = unit || moduleSpecificFields.unit || 'pcs';
  const costPrice = moduleSpecificFields.cost_price ?? 0;
  
  let openingStock = Number(stockQty) || 0;
  if (Array.isArray(variants) && variants.length > 0) {
    openingStock = variants.reduce((acc, v) => acc + (Number(v.stock_quantity ?? v.stock_qty ?? v.stock) || 0), 0);
  }

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

    if (Array.isArray(variants) && variants.length > 0) {
      for (const v of variants) {
        const vSku = v.sku?.trim() || `${finalSku}-${(v.size || '').toUpperCase()}-${(v.color || '').toUpperCase()}`;
        const vCost = v.cost_price !== undefined ? Number(v.cost_price) : costPrice;
        const vSale = v.sale_price !== undefined ? Number(v.sale_price) : (Number(price) || 0);
        const vStock = Number(v.stock_quantity ?? v.stock_qty ?? v.stock) || 0;
        await conn.query(
          `INSERT INTO product_variants
             (product_id, sku, barcode, size, color, cost_price, sale_price, stock_quantity, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
          [id, vSku, v.barcode?.trim() || null, v.size || null, v.color || null, vCost, vSale, vStock]
        );
      }
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

  const { name, sku, barcode, category, unit, price, stockQty, reorderLevel, moduleSpecificFields = {}, variants } = fields;

  const categoryId = category !== undefined ? await findOrCreateCategory(business.id, category) : undefined;
  const supplierId = moduleSpecificFields.supplier_name
    ? await findOrCreateSupplier(business.id, moduleSpecificFields.supplier_name)
    : undefined;

  let newStock = stockQty !== undefined ? Number(stockQty) : existing.stock_qty;
  if (Array.isArray(variants) && variants.length > 0) {
    newStock = variants.reduce((acc, v) => acc + (Number(v.stock_quantity ?? v.stock_qty ?? v.stock) || 0), 0);
  }
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

    if (Array.isArray(variants)) {
      for (const v of variants) {
        if (v.id) {
          const vCost = v.cost_price !== undefined ? Number(v.cost_price) : existing.cost_price;
          const vSale = v.sale_price !== undefined ? Number(v.sale_price) : existing.sale_price;
          const vStock = Number(v.stock_quantity ?? v.stock_qty ?? v.stock) || 0;
          await conn.query(
            `UPDATE product_variants SET
               sku = COALESCE(?, sku),
               barcode = ?,
               size = COALESCE(?, size),
               color = COALESCE(?, color),
               cost_price = ?,
               sale_price = ?,
               stock_quantity = ?
             WHERE id = ? AND product_id = ?`,
            [v.sku?.trim() || null, v.barcode?.trim() || null, v.size || null, v.color || null, vCost, vSale, vStock, v.id, id]
          );
        } else {
          const vSku = v.sku?.trim() || `${existing.sku}-${(v.size || '').toUpperCase()}-${(v.color || '').toUpperCase()}`;
          const vCost = v.cost_price !== undefined ? Number(v.cost_price) : existing.cost_price;
          const vSale = v.sale_price !== undefined ? Number(v.sale_price) : existing.sale_price;
          const vStock = Number(v.stock_quantity ?? v.stock_qty ?? v.stock) || 0;
          await conn.query(
            `INSERT INTO product_variants
               (product_id, sku, barcode, size, color, cost_price, sale_price, stock_quantity, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
            [id, vSku, v.barcode?.trim() || null, v.size || null, v.color || null, vCost, vSale, vStock]
          );
        }
      }
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
