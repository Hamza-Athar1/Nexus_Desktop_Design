import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });
import bcrypt from 'bcrypt';
import { pool, withTransaction } from './config/db.js';
import { createUser } from './models/userModel.js';
import {
  executeCheckoutTransaction,
  findSalesByBusiness,
  findSaleDetailById,
  executeReturnTransaction,
} from './models/salesModel.js';

const RESULTS = [];

function recordTest(name, passed, details = '') {
  RESULTS.push({ name, passed, details });
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${name}${details ? ' - ' + details : ''}`);
}

async function runCashierReturnTests() {
  console.log('====================================================');
  console.log('  TESTING CASHIER INVOICE RETURNS (SECTION 17)      ');
  console.log('====================================================\n');

  let bizAId = null;
  let bizBId = null;
  let cashierA = null;
  let cashierB = null;

  let prod1 = null;
  let prod2 = null;
  let variant1 = null;

  let saleA1 = null; // Single item sale (5 qty)
  let saleA2 = null; // Multi-item sale (3 qty item 1, 2 qty item 2)
  let saleB1 = null; // Business B sale

  try {
    // Setup test businesses
    let [bizRows] = await pool.query('SELECT id, owner_user_id FROM businesses LIMIT 2');
    if (bizRows.length < 2) {
      const passHash = await bcrypt.hash('Demo@12345', 10);
      const uA = await createUser({ username: `cr_admin_a_${Date.now()}`, email: `cr_admin_a_${Date.now()}@test.local`, passwordHash: passHash, role: 'admin' });
      const uB = await createUser({ username: `cr_admin_b_${Date.now()}`, email: `cr_admin_b_${Date.now()}@test.local`, passwordHash: passHash, role: 'admin' });
      await pool.query(`INSERT INTO businesses (owner_user_id, module_id, name) VALUES (?, 1, 'CR Biz A')`, [uA.id]);
      await pool.query(`INSERT INTO businesses (owner_user_id, module_id, name) VALUES (?, 1, 'CR Biz B')`, [uB.id]);
      [bizRows] = await pool.query('SELECT id, owner_user_id FROM businesses LIMIT 2');
    }

    bizAId = bizRows[0].id;
    bizBId = bizRows[1].id;

    const passHash = await bcrypt.hash('CashierPass123', 10);
    cashierA = await createUser({
      username: `cashier_a_${Date.now()}`,
      email: `cashier_a_${Date.now()}@test.local`,
      passwordHash: passHash,
      role: 'user',
      status: 'active',
      businessId: bizAId,
    });

    cashierB = await createUser({
      username: `cashier_b_${Date.now()}`,
      email: `cashier_b_${Date.now()}@test.local`,
      passwordHash: passHash,
      role: 'user',
      status: 'active',
      businessId: bizBId,
    });

    // Create Product 1 for Biz A (Stock: 50, Price: Rs 1000)
    const [p1Res] = await pool.query(
      `INSERT INTO products (business_id, sku, barcode, name, cost_price, sale_price, tax_rate, stock_quantity, is_active)
       VALUES (?, ?, ?, 'Cashier Return Item 1', 600.00, 1000.00, 0.00, 50.000, 1)`,
      [bizAId, `SKU-CR1-${Date.now()}`, `BC-CR1-${Date.now()}`]
    );
    prod1 = { id: p1Res.insertId, name: 'Cashier Return Item 1', price: 1000, stock: 50 };

    // Create Variant for Product 1
    const [v1Res] = await pool.query(
      `INSERT INTO product_variants (product_id, sku, barcode, size, color, cost_price, sale_price, stock_quantity, is_active)
       VALUES (?, ?, ?, 'M', 'Black', 600.00, 1000.00, 50.000, 1)`,
      [prod1.id, `SKU-CR1-V1-${Date.now()}`, `BC-CR1-V1-${Date.now()}`]
    );
    variant1 = { id: v1Res.insertId, stock: 50 };

    // Create Product 2 for Biz A (Stock: 30, Price: Rs 2500)
    const [p2Res] = await pool.query(
      `INSERT INTO products (business_id, sku, barcode, name, cost_price, sale_price, tax_rate, stock_quantity, is_active)
       VALUES (?, ?, ?, 'Cashier Return Item 2', 1500.00, 2500.00, 0.00, 30.000, 1)`,
      [bizAId, `SKU-CR2-${Date.now()}`, `BC-CR2-${Date.now()}`]
    );
    prod2 = { id: p2Res.insertId, name: 'Cashier Return Item 2', price: 2500, stock: 30 };

    // Create Product for Biz B
    const [pBRes] = await pool.query(
      `INSERT INTO products (business_id, sku, barcode, name, cost_price, sale_price, tax_rate, stock_quantity, is_active)
       VALUES (?, ?, ?, 'Biz B Product', 500.00, 800.00, 0.00, 20.000, 1)`,
      [bizBId, `SKU-CRB-${Date.now()}`, `BC-CRB-${Date.now()}`]
    );
    const prodB = { id: pBRes.insertId };

    // Perform Checkout for Sale A1 (5 x Product 1 with Variant 1)
    await withTransaction(async (conn) => {
      saleA1 = await executeCheckoutTransaction(conn, {
        businessId: bizAId,
        userId: cashierA.id,
        items: [{ productId: prod1.id, variantId: variant1.id, quantity: 5 }],
        payment: { method: 'cash', amount: 5000 },
        note: 'Sale A1 for Cashier Return Test',
      });
    });

    // Perform Checkout for Sale A2 (3 x Prod 1, 2 x Prod 2)
    await withTransaction(async (conn) => {
      saleA2 = await executeCheckoutTransaction(conn, {
        businessId: bizAId,
        userId: cashierA.id,
        items: [
          { productId: prod1.id, quantity: 3 },
          { productId: prod2.id, quantity: 2 },
        ],
        payment: { method: 'cash', amount: 8000 },
        note: 'Sale A2 Multi-item',
      });
    });

    // Perform Checkout for Sale B1 (2 x Product B)
    await withTransaction(async (conn) => {
      saleB1 = await executeCheckoutTransaction(conn, {
        businessId: bizBId,
        userId: cashierB.id,
        items: [{ productId: prodB.id, quantity: 2 }],
        payment: { method: 'cash', amount: 1600 },
        note: 'Sale B1 Tenant B',
      });
    });

    // Create a second sale in Biz B so its invoice sequence is different/unique
    let saleB2 = null;
    await withTransaction(async (conn) => {
      saleB2 = await executeCheckoutTransaction(conn, {
        businessId: bizBId,
        userId: cashierB.id,
        items: [{ productId: prodB.id, quantity: 1 }],
        payment: { method: 'cash', amount: 800 },
        note: 'Sale B2 Tenant B Unique',
      });
    });

    console.log(`📌 Created test sales:`);
    console.log(`   Sale A1: ${saleA1.invoiceNumber} (Sale ID: ${saleA1.id})`);
    console.log(`   Sale A2: ${saleA2.invoiceNumber} (Sale ID: ${saleA2.id})`);
    console.log(`   Sale B1: ${saleB1.invoiceNumber} (Sale ID: ${saleB1.id})`);
    console.log(`   Sale B2: ${saleB2.invoiceNumber} (Sale ID: ${saleB2.id})\n`);

    // ── TEST 1: Invoice Search ─────────────────────────────────────────────
    const searchRes = await findSalesByBusiness(bizAId, { search: saleA1.invoiceNumber });
    const foundSale = searchRes.sales.find((s) => s.invoice_number === saleA1.invoiceNumber);

    // Also test shorthand search like INV-<saleId> or numeric sale ID
    const shorthandRes = await findSalesByBusiness(bizAId, { search: `INV-${saleA1.id}` });
    const foundShorthand = shorthandRes.sales.find((s) => s.id === saleA1.id);

    recordTest('Test 1 — Invoice Search', Boolean(foundSale && foundShorthand), `Found invoice ${saleA1.invoiceNumber} and shorthand INV-${saleA1.id}`);

    // ── TEST 2: Business Isolation ──────────────────────────────────────────
    // Cashier of Biz A searching for Sale B2 (which belongs to Biz B)
    const isoSearchRes = await findSalesByBusiness(bizAId, { search: saleB2.invoiceNumber });
    const isoDetailRes = await findSaleDetailById(bizAId, saleB2.id);

    // Verify that NO returned search result belongs to Biz B, and direct ID lookup for Biz B's sale returns null
    const noBizBSalesReturned = isoSearchRes.sales.every((s) => s.id !== saleB2.id && s.business_id === bizAId);
    const isolated = noBizBSalesReturned && isoDetailRes === null;
    recordTest('Test 2 — Business Isolation', isolated, `Biz A cashier cannot access Biz B invoice (Sale B2 ID: ${saleB2.id})`);

    // ── TEST 3: Partial Return (Purchased = 5, Return = 2, Remaining = 3) ──
    let detailA1 = await findSaleDetailById(bizAId, saleA1.id);
    const itemA1 = detailA1.items[0];

    let partialRefund = null;
    await withTransaction(async (conn) => {
      partialRefund = await executeReturnTransaction(conn, {
        businessId: bizAId,
        userId: cashierA.id,
        saleId: saleA1.id,
        reason: 'Partial return test',
        items: [{ saleItemId: itemA1.id, productId: itemA1.product_id, quantity: 2 }],
        restock: true,
      });
    });

    detailA1 = await findSaleDetailById(bizAId, saleA1.id);
    const updatedItemA1 = detailA1.items[0];
    const remainingQty = Number(updatedItemA1.quantity) - Number(updatedItemA1.returned_quantity);
    recordTest(
      'Test 3 — Partial Return',
      partialRefund.status === 'partially_refunded' && Number(updatedItemA1.returned_quantity) === 2 && remainingQty === 3,
      `Returned: ${updatedItemA1.returned_quantity}, Remaining: ${remainingQty}, Status: ${partialRefund.status}`
    );

    // ── TEST 4: Second Return (Return remaining 3) ─────────────────────────
    let secondRefund = null;
    await withTransaction(async (conn) => {
      secondRefund = await executeReturnTransaction(conn, {
        businessId: bizAId,
        userId: cashierA.id,
        saleId: saleA1.id,
        reason: 'Second return test',
        items: [{ saleItemId: itemA1.id, productId: itemA1.product_id, quantity: 3 }],
        restock: true,
      });
    });

    detailA1 = await findSaleDetailById(bizAId, saleA1.id);
    const finalItemA1 = detailA1.items[0];
    recordTest(
      'Test 4 — Second Return',
      secondRefund.status === 'refunded' && Number(finalItemA1.returned_quantity) === 5,
      `Fully returned 5/5 items. Status: ${secondRefund.status}`
    );

    // ── TEST 5: Over-Return (Purchased = 5, Already returned = 5, Attempt 1 more) ──
    let overReturnFailed = false;
    try {
      await withTransaction(async (conn) => {
        await executeReturnTransaction(conn, {
          businessId: bizAId,
          userId: cashierA.id,
          saleId: saleA1.id,
          reason: 'Over-return test',
          items: [{ saleItemId: itemA1.id, productId: itemA1.product_id, quantity: 1 }],
          restock: true,
        });
      });
    } catch (err) {
      if (err.message?.startsWith('RETURN_QTY_EXCEEDED') || err.message === 'SALE_ALREADY_REFUNDED') {
        overReturnFailed = true;
      }
    }
    recordTest('Test 5 — Over-Return Prevention', overReturnFailed, 'Attempt to over-return rejected as expected');

    // ── TEST 6: Inventory Restoration ─────────────────────────────────────
    // Verify product and variant stock was restored by total returned quantity (5)
    const [p1Check] = await pool.query(`SELECT stock_quantity FROM products WHERE id = ?`, [prod1.id]);
    const [v1Check] = await pool.query(`SELECT stock_quantity FROM product_variants WHERE id = ?`, [variant1.id]);
    
    // Main stock: Initial 50 - 5 (Sale 1) - 3 (Sale 2) + 5 (Returned) = 47.
    // Variant stock: Initial 50 - 5 (Sale 1) + 5 (Returned) = 50.
    const p1Stock = Number(p1Check[0].stock_quantity);
    const v1Stock = Number(v1Check[0].stock_quantity);
    recordTest('Test 6 — Inventory Restoration', p1Stock === 47 && v1Stock === 50, `Main Stock: ${p1Stock}, Variant Stock: ${v1Stock}`);

    // ── TEST 7: Stock Movement Creation ────────────────────────────────────
    const [smRows] = await pool.query(
      `SELECT * FROM stock_movements WHERE business_id = ? AND product_id = ? AND movement_type = 'refund' ORDER BY id DESC`,
      [bizAId, prod1.id]
    );
    recordTest('Test 7 — Stock Movement', smRows.length >= 2, `Recorded ${smRows.length} refund stock movements`);

    // ── TEST 8: Refund Calculation ────────────────────────────────────────
    // First partial refund was 2 x 1000 = 2000. Second refund was 3 x 1000 = 3000. Total = 5000.
    const [refundHeaderRows] = await pool.query(
      `SELECT SUM(total_amount) AS total_refunded FROM refunds WHERE sale_id = ?`,
      [saleA1.id]
    );
    const totalRefunded = Number(refundHeaderRows[0].total_refunded);
    recordTest('Test 8 — Refund Calculation', totalRefunded === 5000, `Total Refunded: Rs. ${totalRefunded}`);

    // ── TEST 9: Multiple Items Return ──────────────────────────────────────
    const detailA2 = await findSaleDetailById(bizAId, saleA2.id);
    const itemA2_1 = detailA2.items.find((i) => i.product_id === prod1.id);
    const itemA2_2 = detailA2.items.find((i) => i.product_id === prod2.id);

    let multiReturn = null;
    await withTransaction(async (conn) => {
      multiReturn = await executeReturnTransaction(conn, {
        businessId: bizAId,
        userId: cashierA.id,
        saleId: saleA2.id,
        reason: 'Multi-item return test',
        items: [
          { saleItemId: itemA2_1.id, productId: itemA2_1.product_id, quantity: 1 },
          { saleItemId: itemA2_2.id, productId: itemA2_2.product_id, quantity: 2 },
        ],
        restock: true,
      });
    });

    const multiRefundAmt = multiReturn.totalRefundAmount;
    // Item 1: 1 x 1000 = 1000. Item 2: 2 x 2500 = 5000. Total = 6000.
    recordTest('Test 9 — Multiple Items Return', multiRefundAmt === 6000, `Multi-item refund calculated: Rs. ${multiRefundAmt}`);

    // ── TEST 10: Existing Admin Return Compatibility ───────────────────────
    const updatedSaleA2 = await findSaleDetailById(bizAId, saleA2.id);
    const item1Status = updatedSaleA2.items.find((i) => i.product_id === prod1.id);
    const item2Status = updatedSaleA2.items.find((i) => i.product_id === prod2.id);

    const isCompat =
      Number(item1Status.returned_quantity) === 1 &&
      Number(item2Status.returned_quantity) === 2 &&
      updatedSaleA2.status === 'partially_refunded';
    recordTest('Test 10 — Existing Admin Returns Compatibility', isCompat, `Sale A2 Status: ${updatedSaleA2.status}`);

  } catch (err) {
    console.error('❌ Fatal error in cashier returns test runner:', err);
  } finally {
    console.log('\n====================================================');
    const passedCount = RESULTS.filter((r) => r.passed).length;
    console.log(`  RESULTS: ${passedCount} / ${RESULTS.length} PASSED`);
    console.log('====================================================\n');

    if (passedCount < RESULTS.length) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  }
}

runCashierReturnTests();
