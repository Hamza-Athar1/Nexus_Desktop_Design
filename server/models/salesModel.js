import { pool } from '../config/db.js';

function round(val, decimals = 2) {
  return Number(Math.round(Number(val + 'e' + decimals)) + 'e-' + decimals);
}

/** Generates a sequential invoice number scoped to date (INV-YYYYMMDD-XXXX) using row locking */
async function generateInvoiceNumber(conn, businessId) {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  
  // Lock sales rows for this business to get accurate count
  const [rows] = await conn.query(
    `SELECT COUNT(*) AS cnt FROM sales WHERE business_id = ? FOR UPDATE`,
    [businessId]
  );
  const nextSeq = (rows[0]?.cnt || 0) + 1;
  const seqPadded = String(nextSeq).padStart(4, '0');
  return `INV-${dateStr}-${seqPadded}`;
}

/** Executed inside a MySQL transaction handle (`conn`) */
export async function executeCheckoutTransaction(conn, { businessId, userId, customerId, items, payment, note }) {
  // Validate customerId belongs to business if provided
  if (customerId) {
    const [custRows] = await conn.query(
      `SELECT id FROM customers WHERE business_id = ? AND id = ? LIMIT 1`,
      [businessId, customerId]
    );
    if (custRows.length === 0) {
      throw new Error('CUSTOMER_NOT_FOUND');
    }
  }

  // 1. Lock product rows FOR UPDATE
  const productIds = items.map((i) => i.productId);
  const placeholders = productIds.map(() => '?').join(',');
  
  const [products] = await conn.query(
    `SELECT id, business_id, name, unit, cost_price, sale_price, tax_rate, stock_quantity, is_active
     FROM products
     WHERE business_id = ? AND id IN (${placeholders})
     FOR UPDATE`,
    [businessId, ...productIds]
  );

  const productMap = new Map(products.map((p) => [p.id, p]));

  // Lock product_variants FOR UPDATE if any items have variantId
  const variantIds = items.map((i) => i.variantId || i.variant_id).filter(Boolean);
  const variantMap = new Map();
  if (variantIds.length > 0) {
    const vPlaceholders = variantIds.map(() => '?').join(',');
    const [variants] = await conn.query(
      `SELECT id, product_id, sku, barcode, size, color, cost_price, sale_price, stock_quantity, is_active
       FROM product_variants
       WHERE id IN (${vPlaceholders})
       FOR UPDATE`,
      variantIds
    );
    for (const v of variants) {
      variantMap.set(v.id, v);
    }
  }

  // Validate all requested products/variants exist for this business
  for (const item of items) {
    const prod = productMap.get(item.productId);
    if (!prod) {
      throw new Error(`PRODUCT_NOT_FOUND:${item.productId}`);
    }
    if (!prod.is_active) {
      throw new Error(`PRODUCT_INACTIVE:${prod.name}`);
    }
    if (Number(item.discountAmount || 0) < 0) {
      throw new Error(`INVALID_DISCOUNT:${prod.name}`);
    }
    
    const vId = item.variantId || item.variant_id;
    if (vId) {
      const variant = variantMap.get(vId);
      if (!variant) {
        throw new Error(`VARIANT_NOT_FOUND:${vId}`);
      }
      if (!variant.is_active) {
        throw new Error(`VARIANT_INACTIVE:${vId}`);
      }
      if (Number(variant.stock_quantity) < Number(item.quantity)) {
        throw new Error(`INSUFFICIENT_STOCK:${prod.name} (${variant.size}/${variant.color})`);
      }
    } else {
      if (Number(prod.stock_quantity) < Number(item.quantity)) {
        throw new Error(`INSUFFICIENT_STOCK:${prod.name}`);
      }
    }
  }

  // 2. Perform authoritative calculations
  let subtotal = 0;
  let taxAmount = 0;
  let discountAmountTotal = 0;
  const processedItems = [];

  for (const item of items) {
    const prod = productMap.get(item.productId);
    const vId = item.variantId || item.variant_id;
    const variant = vId ? variantMap.get(vId) : null;
    
    const qty = Number(item.quantity);
    const unitPrice = variant && Number(variant.sale_price) > 0 ? Number(variant.sale_price) : Number(prod.sale_price);
    const costPrice = variant && Number(variant.cost_price) > 0 ? Number(variant.cost_price) : Number(prod.cost_price);
    const itemDiscount = Number(item.discountAmount || 0);
    const taxRate = Number(prod.tax_rate || 0);

    const effectiveUnitPrice = round(unitPrice - itemDiscount);
    const lineSubtotal = round(effectiveUnitPrice * qty);
    const lineTax = round(lineSubtotal * (taxRate / 100));
    const lineTotal = round(lineSubtotal + lineTax);

    subtotal += lineSubtotal;
    taxAmount += lineTax;
    discountAmountTotal += round(itemDiscount * qty);

    let displayName = prod.name;
    if (variant && (variant.size || variant.color)) {
      const details = [variant.size, variant.color].filter(Boolean).join(' / ');
      displayName = `${prod.name} (${details})`;
    }

    processedItems.push({
      product: prod,
      variant: variant,
      variantId: variant ? variant.id : null,
      productId: prod.id,
      productName: displayName,
      quantity: qty,
      unitPrice,
      costPrice,
      discountAmount: itemDiscount,
      taxRate,
      taxAmount: lineTax,
      lineTotal,
    });
  }

  const totalAmount = round(subtotal + taxAmount);
  const paidAmount = round(Number(payment.amount));
  
  if (payment.method === 'cash' && paidAmount < totalAmount) {
    throw new Error('UNDERPAYMENT');
  }

  const changeAmount = payment.method === 'cash' ? round(paidAmount - totalAmount) : 0.00;
  const finalPaidAmount = payment.method === 'cash' ? paidAmount : totalAmount;

  // 3. Generate invoice number
  const invoiceNumber = await generateInvoiceNumber(conn, businessId);

  // 4. Insert into `sales`
  const [saleResult] = await conn.query(
    `INSERT INTO sales
       (business_id, customer_id, user_id, invoice_number, status,
        subtotal, discount_amount, tax_amount, total_amount, paid_amount, change_amount, note, sold_at)
     VALUES (?, ?, ?, ?, 'completed', ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      businessId,
      customerId || null,
      userId,
      invoiceNumber,
      subtotal,
      discountAmountTotal,
      taxAmount,
      totalAmount,
      finalPaidAmount,
      changeAmount,
      note?.trim() || null,
    ]
  );
  const saleId = saleResult.insertId;

  // 5. Insert into `sale_items` & Update Stock & Insert `stock_movements`
  for (const item of processedItems) {
    await conn.query(
      `INSERT INTO sale_items
         (sale_id, product_id, variant_id, product_name, quantity, unit_price, cost_price, discount_amount, tax_rate, tax_amount, line_total)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        saleId,
        item.productId,
        item.variantId,
        item.productName,
        item.quantity,
        item.unitPrice,
        item.costPrice,
        item.discountAmount,
        item.taxRate,
        item.taxAmount,
        item.lineTotal,
      ]
    );

    // Decrement main product stock
    const newStock = round(Number(item.product.stock_quantity) - item.quantity, 3);
    await conn.query(
      `UPDATE products SET stock_quantity = ? WHERE id = ? AND business_id = ?`,
      [newStock, item.productId, businessId]
    );

    // Decrement variant stock if applicable
    if (item.variant) {
      const newVStock = round(Number(item.variant.stock_quantity) - item.quantity, 3);
      await conn.query(
        `UPDATE product_variants SET stock_quantity = ? WHERE id = ?`,
        [newVStock, item.variantId]
      );
    }

    // Record stock movement
    await conn.query(
      `INSERT INTO stock_movements
         (business_id, product_id, variant_id, user_id, movement_type, quantity_change, balance_after, reference_type, reference_id, note)
       VALUES (?, ?, ?, ?, 'sale', ?, ?, 'sale', ?, ?)`,
      [
        businessId,
        item.productId,
        item.variantId,
        userId,
        -item.quantity,
        newStock,
        saleId,
        invoiceNumber,
      ]
    );
  }

  // 6. Insert into `payments`
  await conn.query(
    `INSERT INTO payments (sale_id, method, amount, reference)
     VALUES (?, ?, ?, ?)`,
    [saleId, payment.method, finalPaidAmount, payment.reference || null]
  );

  return {
    id: saleId,
    invoiceNumber,
    subtotal,
    taxAmount,
    discountAmount: discountAmountTotal,
    totalAmount,
    paidAmount: finalPaidAmount,
    changeAmount,
    status: 'completed',
    items: processedItems,
  };
}

/** Paginated list of sales for a business */
export async function findSalesByBusiness(businessId, { page = 1, limit = 20, startDate, endDate, search, status }) {
  const offset = (Number(page) - 1) * Number(limit);
  const conditions = ['s.business_id = ?'];
  const params = [businessId];

  if (startDate) {
    conditions.push('s.sold_at >= ?');
    params.push(`${startDate} 00:00:00`);
  }
  if (endDate) {
    conditions.push('s.sold_at <= ?');
    params.push(`${endDate} 23:59:59`);
  }
  if (status) {
    conditions.push('s.status = ?');
    params.push(status);
  }
  if (search?.trim()) {
    conditions.push('(s.invoice_number LIKE ? OR c.name LIKE ?)');
    params.push(`%${search.trim()}%`, `%${search.trim()}%`);
  }

  const whereClause = conditions.join(' AND ');

  const [countRows] = await pool.query(
    `SELECT COUNT(*) as total FROM sales s LEFT JOIN customers c ON c.id = s.customer_id WHERE ${whereClause}`,
    params
  );

  const [rows] = await pool.query(
    `SELECT s.*, c.name AS customer_name, u.username AS cashier_name
     FROM sales s
     LEFT JOIN customers c ON c.id = s.customer_id
     LEFT JOIN users u ON u.id = s.user_id
     WHERE ${whereClause}
     ORDER BY s.sold_at DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );

  return {
    sales: rows,
    total: countRows[0]?.total || 0,
    page: Number(page),
    limit: Number(limit),
  };
}

/** Detailed invoice payload */
export async function findSaleDetailById(businessId, saleId) {
  const [sales] = await pool.query(
    `SELECT s.*, c.name AS customer_name, c.phone AS customer_phone, u.username AS cashier_name
     FROM sales s
     LEFT JOIN customers c ON c.id = s.customer_id
     LEFT JOIN users u ON u.id = s.user_id
     WHERE s.id = ? AND s.business_id = ? LIMIT 1`,
    [saleId, businessId]
  );

  if (!sales[0]) return null;

  const sale = sales[0];

  const [items] = await pool.query(
    `SELECT si.*, p.sku, p.barcode
     FROM sale_items si
     LEFT JOIN products p ON p.id = si.product_id
     WHERE si.sale_id = ?`,
    [saleId]
  );

  const [payments] = await pool.query(
    `SELECT * FROM payments WHERE sale_id = ? ORDER BY id ASC`,
    [saleId]
  );

  const [refunds] = await pool.query(
    `SELECT r.*, u.username AS refunded_by_name
     FROM refunds r
     LEFT JOIN users u ON u.id = r.user_id
     WHERE r.sale_id = ? ORDER BY r.refunded_at DESC`,
    [saleId]
  );

  return {
    ...sale,
    items,
    payments,
    refunds,
  };
}

/** Executed inside a MySQL transaction handle (`conn`) for returns */
export async function executeReturnTransaction(conn, { businessId, userId, saleId, reason, items, restock = true }) {
  // 1. Lock sale FOR UPDATE
  const [sales] = await conn.query(
    `SELECT * FROM sales WHERE id = ? AND business_id = ? FOR UPDATE`,
    [saleId, businessId]
  );

  if (!sales[0]) {
    throw new Error('SALE_NOT_FOUND');
  }

  const sale = sales[0];

  if (sale.status === 'refunded') {
    throw new Error('SALE_ALREADY_REFUNDED');
  }

  // 2. Lock sale items FOR UPDATE
  const [saleItems] = await conn.query(
    `SELECT * FROM sale_items WHERE sale_id = ? FOR UPDATE`,
    [saleId]
  );

  const saleItemMap = new Map(saleItems.map((si) => [si.id, si]));

  // Calculate previously returned quantities for each sale item
  const [prevRefundItems] = await conn.query(
    `SELECT ri.sale_item_id, SUM(ri.quantity) AS returned_qty
     FROM refund_items ri
     JOIN refunds r ON r.id = ri.refund_id
     WHERE r.sale_id = ?
     GROUP BY ri.sale_item_id`,
    [saleId]
  );

  const returnedMap = new Map(prevRefundItems.map((r) => [r.sale_item_id, Number(r.returned_qty || 0)]));

  // 3. Validate returnable quantities & compute refund total
  let totalRefundAmount = 0;
  const processedReturns = [];

  for (const item of items) {
    const saleItem = saleItemMap.get(item.saleItemId);
    if (!saleItem) {
      throw new Error(`INVALID_SALE_ITEM:${item.saleItemId}`);
    }

    const prevReturned = returnedMap.get(saleItem.id) || 0;
    const returnableQty = round(Number(saleItem.quantity) - prevReturned, 3);
    const requestedQty = Number(item.quantity);

    if (requestedQty <= 0) {
      throw new Error(`INVALID_RETURN_QTY:${saleItem.product_name}`);
    }

    if (requestedQty > returnableQty) {
      throw new Error(`RETURN_QTY_EXCEEDED:${saleItem.product_name}`);
    }

    // Authoritative refund price per unit from original snapshot
    const lineUnitPrice = Number(saleItem.unit_price) - Number(saleItem.discount_amount);
    const lineTaxPerUnit = Number(saleItem.tax_amount) / Number(saleItem.quantity);
    const refundLineAmount = round((lineUnitPrice + lineTaxPerUnit) * requestedQty);

    totalRefundAmount += refundLineAmount;

    processedReturns.push({
      saleItem,
      quantity: requestedQty,
      amount: refundLineAmount,
    });
  }

  totalRefundAmount = round(totalRefundAmount);

  // 4. Create `refunds` header
  const [refundResult] = await conn.query(
    `INSERT INTO refunds (sale_id, user_id, reason, total_amount, refunded_at)
     VALUES (?, ?, ?, ?, NOW())`,
    [saleId, userId, reason?.trim() || null, totalRefundAmount]
  );
  const refundId = refundResult.insertId;

  // 5. Create `refund_items` & optionally restore product stock & log `stock_movements`
  for (const ret of processedReturns) {
    await conn.query(
      `INSERT INTO refund_items (refund_id, sale_item_id, quantity, amount, restock)
       VALUES (?, ?, ?, ?, ?)`,
      [refundId, ret.saleItem.id, ret.quantity, ret.amount, restock ? 1 : 0]
    );

    if (restock && ret.saleItem.product_id) {
      // Lock product row
      const [prods] = await conn.query(
        `SELECT id, stock_quantity FROM products WHERE id = ? AND business_id = ? FOR UPDATE`,
        [ret.saleItem.product_id, businessId]
      );

      if (prods[0]) {
        const newStock = round(Number(prods[0].stock_quantity) + ret.quantity, 3);
        await conn.query(
          `UPDATE products SET stock_quantity = ? WHERE id = ? AND business_id = ?`,
          [newStock, ret.saleItem.product_id, businessId]
        );

        if (ret.saleItem.variant_id) {
          const [vars] = await conn.query(
            `SELECT id, stock_quantity FROM product_variants WHERE id = ? FOR UPDATE`,
            [ret.saleItem.variant_id]
          );
          if (vars[0]) {
            const newVStock = round(Number(vars[0].stock_quantity) + ret.quantity, 3);
            await conn.query(
              `UPDATE product_variants SET stock_quantity = ? WHERE id = ?`,
              [newVStock, ret.saleItem.variant_id]
            );
          }
        }

        await conn.query(
          `INSERT INTO stock_movements
             (business_id, product_id, variant_id, user_id, movement_type, quantity_change, balance_after, reference_type, reference_id, note)
           VALUES (?, ?, ?, ?, 'refund', ?, ?, 'refund', ?, ?)`,
          [
            businessId,
            ret.saleItem.product_id,
            ret.saleItem.variant_id || null,
            userId,
            ret.quantity,
            newStock,
            refundId,
            reason ? `Refund: ${reason}` : 'Sale return restock',
          ]
        );
      }
    }
  }

  // 6. Update sale status (refunded vs partially_refunded)
  const [allRefunds] = await conn.query(
    `SELECT SUM(ri.quantity) AS total_returned
     FROM refund_items ri
     JOIN refunds r ON r.id = ri.refund_id
     WHERE r.sale_id = ?`,
    [saleId]
  );

  const totalOriginalQty = saleItems.reduce((acc, i) => acc + Number(i.quantity), 0);
  const totalReturnedQty = Number(allRefunds[0]?.total_returned || 0);

  const newStatus = totalReturnedQty >= totalOriginalQty ? 'refunded' : 'partially_refunded';

  await conn.query(`UPDATE sales SET status = ? WHERE id = ? AND business_id = ?`, [newStatus, saleId, businessId]);

  return {
    refundId,
    saleId,
    totalRefundAmount,
    status: newStatus,
  };
}
