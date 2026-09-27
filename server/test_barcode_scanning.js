import { pool } from './config/db.js';
import { findProductByBarcode } from './models/productModel.js';
import assert from 'assert';

async function runBarcodeTests() {
  console.log('--- RUNNING BARCODE SCANNING INTEGRATION TESTS ---');

  const suf = Date.now().toString().slice(-6);

  // 1. Setup Test Business A & Business B Products with Barcodes
  const [uA] = await pool.query(`INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, 'hash', 'admin')`, [`bar_user_a_${suf}`, `bar_a_${suf}@test.local`]);
  const [uB] = await pool.query(`INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, 'hash', 'admin')`, [`bar_user_b_${suf}`, `bar_b_${suf}@test.local`]);

  const [bizARes] = await pool.query(`INSERT INTO businesses (owner_user_id, module_id, name) VALUES (?, 1, 'Barcode Test Shop A')`, [uA.insertId]);
  const bizAId = bizARes.insertId;

  const [bizBRes] = await pool.query(`INSERT INTO businesses (owner_user_id, module_id, name) VALUES (?, 1, 'Barcode Test Shop B')`, [uB.insertId]);
  const bizBId = bizBRes.insertId;

  try {
    // Business A Base Product with Barcode
    const barA1 = `BAR-A1-${suf}`;
    const [pA1Res] = await pool.query(
      `INSERT INTO products (business_id, sku, barcode, name, cost_price, sale_price, stock_quantity, is_active)
       VALUES (?, ?, ?, 'Base Product A1', 10, 20, 50, 1)`,
      [bizAId, `SKU-A1-${suf}`, barA1]
    );
    const pA1Id = pA1Res.insertId;

    // Business A Product with Variant Barcodes
    const barVarS = `BAR-VAR-S-${suf}`;
    const barVarM = `BAR-VAR-M-${suf}`;
    const [pA2Res] = await pool.query(
      `INSERT INTO products (business_id, sku, name, cost_price, sale_price, stock_quantity, is_active)
       VALUES (?, ?, 'Shirt with Variants', 50, 100, 30, 1)`,
      [bizAId, `SKU-A2-${suf}`]
    );
    const pA2Id = pA2Res.insertId;

    const [vSRes] = await pool.query(
      `INSERT INTO product_variants (product_id, sku, barcode, size, color, cost_price, sale_price, stock_quantity, is_active)
       VALUES (?, ?, ?, 'S', 'Blue', 50, 100, 10, 1)`,
      [pA2Id, `SKU-VAR-S-${suf}`, barVarS]
    );
    const vSId = vSRes.insertId;

    await pool.query(
      `INSERT INTO product_variants (product_id, sku, barcode, size, color, cost_price, sale_price, stock_quantity, is_active)
       VALUES (?, ?, ?, 'M', 'Blue', 50, 100, 20, 1)`,
      [pA2Id, `SKU-VAR-M-${suf}`, barVarM]
    );

    // Business B Product (Cross-tenant test)
    const barB1 = `BAR-B1-${suf}`;
    await pool.query(
      `INSERT INTO products (business_id, sku, barcode, name, cost_price, sale_price, stock_quantity, is_active)
       VALUES (?, ?, ?, 'Business B Product', 15, 30, 100, 1)`,
      [bizBId, `SKU-B1-${suf}`, barB1]
    );

    // Inactive Product
    const barInactive = `BAR-INACTIVE-${suf}`;
    await pool.query(
      `INSERT INTO products (business_id, sku, barcode, name, cost_price, sale_price, stock_quantity, is_active)
       VALUES (?, ?, ?, 'Inactive Product', 10, 20, 10, 0)`,
      [bizAId, `SKU-INACTIVE-${suf}`, barInactive]
    );

    // --- TEST 1: Base Product Barcode Lookup ---
    const itemA1 = await findProductByBarcode(bizAId, barA1, 'clothing');
    assert.ok(itemA1, 'Should find base product A1');
    assert.strictEqual(itemA1.id, pA1Id);
    assert.strictEqual(itemA1.name, 'Base Product A1');
    assert.strictEqual(itemA1.barcode, barA1);
    console.log('1. Base product barcode lookup: PASSED');

    // --- TEST 2: Variant Barcode Lookup ---
    const itemVarS = await findProductByBarcode(bizAId, barVarS, 'clothing');
    assert.ok(itemVarS, 'Should find variant S product');
    assert.strictEqual(itemVarS.id, pA2Id);
    assert.ok(itemVarS.matched_variant, 'Should return matched_variant');
    assert.strictEqual(itemVarS.matched_variant.id, vSId);
    assert.strictEqual(itemVarS.matched_variant.size, 'S');
    assert.strictEqual(itemVarS.matched_variant.barcode, barVarS);
    console.log('2. Variant barcode lookup: PASSED');

    // --- TEST 3: Multi-tenant Isolation (Business A trying Business B barcode) ---
    const crossRes = await findProductByBarcode(bizAId, barB1, 'clothing');
    assert.strictEqual(crossRes, null, 'Business A must NOT find Business B barcode');
    console.log('3. Multi-tenant barcode isolation: PASSED');

    // --- TEST 4: Invalid Barcode Lookup ---
    const invalidRes = await findProductByBarcode(bizAId, 'BAR-NONEXISTENT-999', 'clothing');
    assert.strictEqual(invalidRes, null, 'Non-existent barcode should return null');
    console.log('4. Non-existent barcode lookup: PASSED');

    // --- TEST 5: Inactive Product Barcode Lookup ---
    const inactiveRes = await findProductByBarcode(bizAId, barInactive, 'clothing');
    assert.strictEqual(inactiveRes, null, 'Inactive product barcode must return null');
    console.log('5. Inactive product barcode protection: PASSED');

    console.log('--- ALL BARCODE SCANNING TESTS PASSED ---');
  } finally {
    // Cleanup
    await pool.query(`DELETE FROM product_variants WHERE product_id IN (SELECT id FROM products WHERE business_id IN (?, ?))`, [bizAId, bizBId]);
    await pool.query(`DELETE FROM products WHERE business_id IN (?, ?)`, [bizAId, bizBId]);
    await pool.query(`DELETE FROM businesses WHERE id IN (?, ?)`, [bizAId, bizBId]);
  }
}

runBarcodeTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Test failed:', err);
    process.exit(1);
  });
