import 'dotenv/config';
import bcrypt from 'bcrypt';
import { pool, withTransaction } from './config/db.js';
import { createUser, findUserById } from './models/userModel.js';
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

async function runPhase2Tests() {
  console.log('====================================================');
  console.log('  TESTING PHASE 2 IMPLEMENTATION (NEXUS DESKTOP)    ');
  console.log('====================================================\n');

  let bizAId = null;
  let bizBId = null;
  let adminB = null;
  let staffA = null;
  let prodA1 = null;
  let prodA2 = null;
  let prodB1 = null;
  let inactiveProdA = null;

  try {
    // ── Setup Test Businesses & Products ──────────────────────────────────
    let [bizRows] = await pool.query('SELECT id, owner_user_id FROM businesses LIMIT 2');
    if (bizRows.length < 2) {
      const passHash = await bcrypt.hash('Demo@12345', 10);
      const uA = await createUser({ username: `p2_admin_a_${Date.now()}`, email: `p2_admin_a_${Date.now()}@test.local`, passwordHash: passHash, role: 'admin' });
      const uB = await createUser({ username: `p2_admin_b_${Date.now()}`, email: `p2_admin_b_${Date.now()}@test.local`, passwordHash: passHash, role: 'admin' });
      await pool.query(`INSERT INTO businesses (owner_user_id, module_id, name) VALUES (?, 1, 'P2 Biz A')`, [uA.id]);
      await pool.query(`INSERT INTO businesses (owner_user_id, module_id, name) VALUES (?, 1, 'P2 Biz B')`, [uB.id]);
      [bizRows] = await pool.query('SELECT id, owner_user_id FROM businesses LIMIT 2');
    }

    bizAId = bizRows[0].id;
    bizBId = bizRows[1].id;
    const adminA = await findUserById(bizRows[0].owner_user_id);
    adminB = await findUserById(bizRows[1].owner_user_id);

    // Create Staff A
    const staffPass = await bcrypt.hash('StaffPass123', 10);
    staffA = await createUser({
      username: `p2_staff_a_${Date.now()}`,
      email: `p2_staff_a_${Date.now()}@test.local`,
      passwordHash: staffPass,
      role: 'user',
      status: 'active',
      businessId: bizAId,
    });

    // Create Product A1 (Active, Stock: 10, Price: 500, Cost: 300, Tax: 10%)
    const [pA1Res] = await pool.query(
      `INSERT INTO products (business_id, sku, barcode, name, cost_price, sale_price, tax_rate, stock_quantity, is_active)
       VALUES (?, ?, ?, 'Test Product A1', 300.00, 500.00, 10.00, 10.000, 1)`,
      [bizAId, `SKU-A1-${Date.now()}`, `BC-A1-${Date.now()}`]
    );
    prodA1 = { id: pA1Res.insertId, name: 'Test Product A1', sale_price: 500, cost_price: 300, stock_quantity: 10 };

    // Create Product A2 (Active, Stock: 5)
    const [pA2Res] = await pool.query(
      `INSERT INTO products (business_id, sku, barcode, name, cost_price, sale_price, tax_rate, stock_quantity, is_active)
       VALUES (?, ?, ?, 'Test Product A2', 100.00, 200.00, 0.00, 5.000, 1)`,
      [bizAId, `SKU-A2-${Date.now()}`, `BC-A2-${Date.now()}`]
    );
    prodA2 = { id: pA2Res.insertId, name: 'Test Product A2', stock_quantity: 5 };

    // Create Product B1 (Belongs to Business B)
    const [pB1Res] = await pool.query(
      `INSERT INTO products (business_id, sku, barcode, name, cost_price, sale_price, tax_rate, stock_quantity, is_active)
       VALUES (?, ?, ?, 'Test Product B1', 50.00, 100.00, 5.00, 20.000, 1)`,
      [bizBId, `SKU-B1-${Date.now()}`, `BC-B1-${Date.now()}`]
    );
    prodB1 = { id: pB1Res.insertId, name: 'Test Product B1' };

    // Create Inactive Product A (is_active = 0)
    const [pInactRes] = await pool.query(
      `INSERT INTO products (business_id, sku, barcode, name, cost_price, sale_price, tax_rate, stock_quantity, is_active)
       VALUES (?, ?, ?, 'Inactive Prod A', 50.00, 100.00, 0.00, 10.000, 0)`,
      [bizAId, `SKU-IN-${Date.now()}`, `BC-IN-${Date.now()}`]
    );
    inactiveProdA = { id: pInactRes.insertId, name: 'Inactive Prod A' };

    console.log(`📌 Test Environment Initialized.`);
    console.log(`   Biz A (${bizAId}): Admin A (${adminA.id}), Staff A (${staffA.id}), Prod A1 (${prodA1.id}), Prod A2 (${prodA2.id})`);
    console.log(`   Biz B (${bizBId}): Admin B (${adminB.id}), Prod B1 (${prodB1.id})\n`);

    // ── TEST 1: Server-Authoritative Pricing & Subtotal Calculation ───────
    let sale1Result = null;
    await withTransaction(async (conn) => {
      sale1Result = await executeCheckoutTransaction(conn, {
        businessId: bizAId,
        userId: staffA.id,
        items: [{ productId: prodA1.id, quantity: 2, discountAmount: 0 }],
        payment: { method: 'cash', amount: 1500.00 }, // Client attempts fake cash payment
      });
    });

    // Authoritative math: price 500, discount 0, tax 10% -> 500 * 2 = 1000 subtotal, 100 tax -> 1100 total
    if (
      sale1Result &&
      sale1Result.subtotal === 1000 &&
      sale1Result.taxAmount === 100 &&
      sale1Result.totalAmount === 1100 &&
      sale1Result.changeAmount === 400
    ) {
      recordTest('Server-Authoritative Price & Calculation', true, `Calculated subtotal=${sale1Result.subtotal}, tax=${sale1Result.taxAmount}, total=${sale1Result.totalAmount}, change=${sale1Result.changeAmount}`);
    } else {
      recordTest('Server-Authoritative Price & Calculation', false, `Calculation mismatch: ${JSON.stringify(sale1Result)}`);
    }

    // ── TEST 2: Inactive Product Rejection ────────────────────────────────
    let inactiveRejected = false;
    try {
      await withTransaction(async (conn) => {
        await executeCheckoutTransaction(conn, {
          businessId: bizAId,
          userId: staffA.id,
          items: [{ productId: inactiveProdA.id, quantity: 1 }],
          payment: { method: 'cash', amount: 100.00 },
        });
      });
    } catch (err) {
      inactiveRejected = err.message?.startsWith('PRODUCT_INACTIVE:');
    }

    if (inactiveRejected) {
      recordTest('Inactive Product Rejection', true, 'Checkout for is_active = 0 product correctly rejected');
    } else {
      recordTest('Inactive Product Rejection', false, 'Inactive product checkout was allowed!');
    }

    // ── TEST 3: Insufficient Stock Rejection ──────────────────────────────
    let insufficientRejected = false;
    try {
      await withTransaction(async (conn) => {
        await executeCheckoutTransaction(conn, {
          businessId: bizAId,
          userId: staffA.id,
          items: [{ productId: prodA2.id, quantity: 999 }], // Exceeds stock (5)
          payment: { method: 'cash', amount: 999000 },
        });
      });
    } catch (err) {
      insufficientRejected = err.message?.startsWith('INSUFFICIENT_STOCK:');
    }

    // Check stock was untouched in DB
    const [pA2StockCheck] = await pool.query('SELECT stock_quantity FROM products WHERE id = ?', [prodA2.id]);

    if (insufficientRejected && Number(pA2StockCheck[0].stock_quantity) === 5) {
      recordTest('Insufficient Stock Rejection & Rollback', true, 'Over-quantity purchase rejected, stock remains 5');
    } else {
      recordTest('Insufficient Stock Rejection & Rollback', false, `Stock mutation or check failed. Current stock: ${pA2StockCheck[0]?.stock_quantity}`);
    }

    // ── TEST 4: Atomic Checkout & Stock Movements Audit Ledger ─────────────
    // Verify `sales`, `sale_items`, `payments`, `stock_movements`, and product stock decrement
    const [pA1StockAfterSale1] = await pool.query('SELECT stock_quantity FROM products WHERE id = ?', [prodA1.id]);
    const [saleItemsCount] = await pool.query('SELECT COUNT(*) as cnt FROM sale_items WHERE sale_id = ?', [sale1Result.id]);
    const [paymentsCount] = await pool.query('SELECT COUNT(*) as cnt FROM payments WHERE sale_id = ?', [sale1Result.id]);
    const [stockMovs] = await pool.query(
      'SELECT * FROM stock_movements WHERE reference_type = "sale" AND reference_id = ?',
      [sale1Result.id]
    );

    if (
      Number(pA1StockAfterSale1[0].stock_quantity) === 8 &&
      saleItemsCount[0].cnt === 1 &&
      paymentsCount[0].cnt === 1 &&
      stockMovs.length === 1 &&
      stockMovs[0].movement_type === 'sale' &&
      Number(stockMovs[0].quantity_change) === -2
    ) {
      recordTest('Atomic Checkout & Stock Movement Ledger', true, 'Stock decremented from 10 to 8, stock_movement & sale_items logged atomically');
    } else {
      recordTest('Atomic Checkout & Stock Movement Ledger', false, 'DB state incomplete after sale');
    }

    // ── TEST 5: Concurrent Checkout (`SELECT ... FOR UPDATE` Row Locking) ─
    // Reset prodA2 stock to 5
    await pool.query('UPDATE products SET stock_quantity = 5.000 WHERE id = ?', [prodA2.id]);

    // Cashier A attempts to buy 4, Cashier B attempts to buy 4 concurrently
    let resA = null;
    let resB = null;

    const promiseA = withTransaction(async (conn) => {
      return executeCheckoutTransaction(conn, {
        businessId: bizAId,
        userId: staffA.id,
        items: [{ productId: prodA2.id, quantity: 4 }],
        payment: { method: 'cash', amount: 1000 },
      });
    }).then(() => resA = 'SUCCESS').catch(e => resA = e.message);

    const promiseB = withTransaction(async (conn) => {
      return executeCheckoutTransaction(conn, {
        businessId: bizAId,
        userId: staffA.id,
        items: [{ productId: prodA2.id, quantity: 4 }],
        payment: { method: 'cash', amount: 1000 },
      });
    }).then(() => resB = 'SUCCESS').catch(e => resB = e.message);

    await Promise.all([promiseA, promiseB]);

    const [prodA2FinalStock] = await pool.query('SELECT stock_quantity FROM products WHERE id = ?', [prodA2.id]);

    const oneSucceededOneFailed = (resA === 'SUCCESS' && resB.startsWith('INSUFFICIENT_STOCK:')) || (resB === 'SUCCESS' && resA.startsWith('INSUFFICIENT_STOCK:'));

    if (oneSucceededOneFailed && Number(prodA2FinalStock[0].stock_quantity) === 1) {
      recordTest('Concurrent Checkout Row Locking (SELECT FOR UPDATE)', true, `One checkout succeeded, one rejected. Final stock = 1.`);
    } else {
      recordTest('Concurrent Checkout Row Locking (SELECT FOR UPDATE)', false, `Concurrency failure: ResA=${resA}, ResB=${resB}, Stock=${prodA2FinalStock[0]?.stock_quantity}`);
    }

    // ── TEST 6: Sales History & Receipt Details (GET /api/sales) ───────────
    const history = await findSalesByBusiness(bizAId, { page: 1, limit: 10 });
    const detail = await findSaleDetailById(bizAId, sale1Result.id);
    const crossDetail = await findSaleDetailById(bizBId, sale1Result.id); // Business B attempting to view Business A's sale

    if (history.sales.length > 0 && detail && detail.items.length > 0 && crossDetail === null) {
      recordTest('Sales History & Receipt Details Scoping', true, `History count: ${history.sales.length}, Detail items: ${detail.items.length}, Cross-tenant query returned null`);
    } else {
      recordTest('Sales History & Receipt Details Scoping', false, 'History or detail retrieval scoping failed');
    }

    // ── TEST 7: Cross-Business Checkout Block ─────────────────────────────
    let crossCheckoutBlocked = false;
    try {
      await withTransaction(async (conn) => {
        await executeCheckoutTransaction(conn, {
          businessId: bizAId, // Business A context
          userId: staffA.id,
          items: [{ productId: prodB1.id, quantity: 1 }], // Product belonging to Business B
          payment: { method: 'cash', amount: 200 },
        });
      });
    } catch (err) {
      crossCheckoutBlocked = err.message?.startsWith('PRODUCT_NOT_FOUND:');
    }

    if (crossCheckoutBlocked) {
      recordTest('Cross-Business Checkout Protection', true, 'Attempt to checkout another business product correctly rejected');
    } else {
      recordTest('Cross-Business Checkout Protection', false, 'Cross-tenant checkout was allowed!');
    }

    // ── TEST 8: Returns & Refunds (Partial & Restock) ─────────────────────
    // sale1Result had 2 units of prodA1. Let's return 1 unit with restock = true.
    const saleDetailForReturn = await findSaleDetailById(bizAId, sale1Result.id);
    const saleItemToReturn = saleDetailForReturn.items[0];

    let return1Result = null;
    await withTransaction(async (conn) => {
      return1Result = await executeReturnTransaction(conn, {
        businessId: bizAId,
        userId: staffA.id,
        saleId: sale1Result.id,
        reason: 'Defective item',
        items: [{ saleItemId: saleItemToReturn.id, quantity: 1 }],
        restock: true,
      });
    });

    const [prodA1StockAfterRefund] = await pool.query('SELECT stock_quantity FROM products WHERE id = ?', [prodA1.id]);
    const [refundMovs] = await pool.query('SELECT * FROM stock_movements WHERE movement_type = "refund" AND reference_id = ?', [return1Result.refundId]);
    const saleStatusAfterReturn1 = (await findSaleDetailById(bizAId, sale1Result.id)).status;

    if (
      return1Result &&
      return1Result.status === 'partially_refunded' &&
      Number(prodA1StockAfterRefund[0].stock_quantity) === 9 &&
      refundMovs.length === 1 &&
      saleStatusAfterReturn1 === 'partially_refunded'
    ) {
      recordTest('Partial Sales Return & Stock Restoration', true, 'Returned 1 unit, stock restored from 8 to 9, sale status updated to partially_refunded');
    } else {
      recordTest('Partial Sales Return & Stock Restoration', false, `Return failed: ${JSON.stringify(return1Result)}, Stock: ${prodA1StockAfterRefund[0]?.stock_quantity}`);
    }

    // ── TEST 9: Full Return & Status Transition ───────────────────────────
    let return2Result = null;
    await withTransaction(async (conn) => {
      return2Result = await executeReturnTransaction(conn, {
        businessId: bizAId,
        userId: staffA.id,
        saleId: sale1Result.id,
        reason: 'Full return restock',
        items: [{ saleItemId: saleItemToReturn.id, quantity: 1 }],
        restock: true,
      });
    });

    const saleStatusAfterReturn2 = (await findSaleDetailById(bizAId, sale1Result.id)).status;

    if (return2Result && return2Result.status === 'refunded' && saleStatusAfterReturn2 === 'refunded') {
      recordTest('Full Sales Return & Final Status Transition', true, 'Remaining unit returned, sale status transitioned to refunded');
    } else {
      recordTest('Full Sales Return & Final Status Transition', false, `Full return failed: ${JSON.stringify(return2Result)}`);
    }

    // ── TEST 10: Excessive Return Limit Protection ────────────────────────
    let excessiveReturnBlocked = false;
    try {
      await withTransaction(async (conn) => {
        await executeReturnTransaction(conn, {
          businessId: bizAId,
          userId: staffA.id,
          saleId: sale1Result.id,
          reason: 'Excessive return attempt',
          items: [{ saleItemId: saleItemToReturn.id, quantity: 1 }],
          restock: true,
        });
      });
    } catch (err) {
      excessiveReturnBlocked = err.message === 'SALE_ALREADY_REFUNDED' || err.message?.startsWith('RETURN_QTY_EXCEEDED:');
    }

    if (excessiveReturnBlocked) {
      recordTest('Excessive Return Quantity Limit Protection', true, 'Attempt to return more than purchased quantity rejected');
    } else {
      recordTest('Excessive Return Quantity Limit Protection', false, 'Excessive return was allowed!');
    }

    // ── TEST 11: Cross-Business Return Protection ─────────────────────────
    let crossReturnBlocked = false;
    try {
      await withTransaction(async (conn) => {
        await executeReturnTransaction(conn, {
          businessId: bizBId, // Business B context
          userId: adminB.id,
          saleId: sale1Result.id, // Business A's sale
          reason: 'Cross return',
          items: [{ saleItemId: saleItemToReturn.id, quantity: 1 }],
        });
      });
    } catch (err) {
      crossReturnBlocked = err.message === 'SALE_NOT_FOUND';
    }

    if (crossReturnBlocked) {
      recordTest('Cross-Business Return Protection', true, 'Attempting to return another business sale correctly returned SALE_NOT_FOUND (404)');
    } else {
      recordTest('Cross-Business Return Protection', false, 'Cross-tenant return was allowed!');
    }

    // ── TEST 12: Historical Snapshot Preservation Test ─────────────────────
    // Create new sale at price 500
    let histSale = null;
    await withTransaction(async (conn) => {
      histSale = await executeCheckoutTransaction(conn, {
        businessId: bizAId,
        userId: staffA.id,
        items: [{ productId: prodA1.id, quantity: 1 }],
        payment: { method: 'cash', amount: 600 },
      });
    });

    // Update product price in DB to 999.00
    await pool.query('UPDATE products SET sale_price = 999.00 WHERE id = ?', [prodA1.id]);

    // Retrieve historical sale detail
    const histDetail = await findSaleDetailById(bizAId, histSale.id);

    if (histDetail && Number(histDetail.items[0].unit_price) === 500) {
      recordTest('Historical Price Snapshot Integrity', true, 'Product price changed in DB to 999, but historical receipt snapshot preserves 500');
    } else {
      recordTest('Historical Price Snapshot Integrity', false, `Historical price mutated! Got: ${histDetail?.items[0]?.unit_price}`);
    }

    // ── TEST 13: Phase 1 Regression Verification ──────────────────────────
    const [staffCheck] = await pool.query('SELECT role, business_id FROM users WHERE id = ?', [staffA.id]);
    if (staffCheck[0]?.role === 'user' && staffCheck[0]?.business_id === bizAId) {
      recordTest('Phase 1 Staff Scoping Regression Check', true, 'Phase 1 staff business_id and role structure intact');
    } else {
      recordTest('Phase 1 Staff Scoping Regression Check', false, 'Phase 1 regression failure');
    }

  } catch (err) {
    console.error('❌ Exception during Phase 2 test suite execution:', err);
    recordTest('Phase 2 Test Execution', false, err.message);
  } finally {
    // Clean up test products, sales, refunds, stock_movements, and test users
    console.log('\n🧹 Cleaning up test products and accounts...');
    try {
      await pool.query('SET FOREIGN_KEY_CHECKS = 0');
      if (bizAId) {
        await pool.query('DELETE FROM refund_items WHERE refund_id IN (SELECT id FROM refunds WHERE sale_id IN (SELECT id FROM sales WHERE business_id = ?))', [bizAId]);
        await pool.query('DELETE FROM refunds WHERE sale_id IN (SELECT id FROM sales WHERE business_id = ?)', [bizAId]);
        await pool.query('DELETE FROM stock_movements WHERE business_id = ?', [bizAId]);
        await pool.query('DELETE FROM payments WHERE sale_id IN (SELECT id FROM sales WHERE business_id = ?)', [bizAId]);
        await pool.query('DELETE FROM sale_items WHERE sale_id IN (SELECT id FROM sales WHERE business_id = ?)', [bizAId]);
        await pool.query('DELETE FROM sales WHERE business_id = ?', [bizAId]);
      }
      if (bizBId) {
        await pool.query('DELETE FROM stock_movements WHERE business_id = ?', [bizBId]);
        await pool.query('DELETE FROM payments WHERE sale_id IN (SELECT id FROM sales WHERE business_id = ?)', [bizBId]);
        await pool.query('DELETE FROM sale_items WHERE sale_id IN (SELECT id FROM sales WHERE business_id = ?)', [bizBId]);
        await pool.query('DELETE FROM sales WHERE business_id = ?', [bizBId]);
      }
      if (prodA1?.id) await pool.query('DELETE FROM products WHERE id = ?', [prodA1.id]);
      if (prodA2?.id) await pool.query('DELETE FROM products WHERE id = ?', [prodA2.id]);
      if (prodB1?.id) await pool.query('DELETE FROM products WHERE id = ?', [prodB1.id]);
      if (inactiveProdA?.id) await pool.query('DELETE FROM products WHERE id = ?', [inactiveProdA.id]);
      if (staffA?.id) await pool.query('DELETE FROM users WHERE id = ?', [staffA.id]);
    } catch (cleanErr) {
      console.error('Teardown warning:', cleanErr.message);
    } finally {
      await pool.query('SET FOREIGN_KEY_CHECKS = 1');
    }
    console.log('✨ Cleanup complete.');
  }

  // Print Summary Table
  console.log('\n====================================================');
  console.log('                PHASE 2 TEST SUMMARY                ');
  console.log('====================================================');
  const total = RESULTS.length;
  const passedCount = RESULTS.filter((r) => r.passed).length;
  const failedCount = total - passedCount;

  console.log(`Total Tests Executed: ${total}`);
  console.log(`Passed: ${passedCount}`);
  console.log(`Failed: ${failedCount}\n`);

  if (failedCount === 0) {
    console.log('RESULT: PHASE 2 VERIFIED\n');
  } else {
    console.log('RESULT: PHASE 2 NOT VERIFIED\n');
  }
}

runPhase2Tests().then(() => pool.end());
