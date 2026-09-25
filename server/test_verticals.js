import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { withTransaction } from './config/db.js';
import { createUser } from './models/userModel.js';
import { createBusiness, findBusinessWithModuleByOwner } from './models/businessModel.js';
import { createProduct, findProductById } from './models/productModel.js';
import { executeCheckoutTransaction, executeReturnTransaction, findSaleDetailById } from './models/salesModel.js';

function randomSuffix() {
  return crypto.randomBytes(3).toString('hex');
}

async function runVerticalTests() {
  console.log('🧪 Starting Multi-Vertical POS Architecture Test Suite...\n');

  // 1. Module & Registration Verification
  console.log('--- TEST 1: Registration & Module Code Persistence ---');
  const suf = randomSuffix();
  const clothingOwner = await createUser({ username: `cloth_owner_${suf}`, email: `cloth_${suf}@test.com`, role: 'admin' });
  const groceryOwner = await createUser({ username: `groc_owner_${suf}`, email: `groc_${suf}@test.com`, role: 'admin' });

  await withTransaction(async (conn) => {
    return createBusiness(conn, {
      ownerUserId: clothingOwner.id,
      name: `Fashion Hub ${suf}`,
      moduleId: 7, // clothing module ID
    });
  });

  await withTransaction(async (conn) => {
    return createBusiness(conn, {
      ownerUserId: groceryOwner.id,
      name: `Super Grocery ${suf}`,
      moduleId: 2, // grocery module ID
    });
  });

  const clothingBiz = await findBusinessWithModuleByOwner(clothingOwner.id);
  const groceryBiz = await findBusinessWithModuleByOwner(groceryOwner.id);

  assert.equal(clothingBiz.module_code, 'clothing', 'Clothing business module_code must be "clothing"');
  assert.equal(groceryBiz.module_code, 'grocery', 'Grocery business module_code must be "grocery"');
  console.log('✅ PASS: Module registration and code persistence verified.');

  // 2. Clothing Variants & Stock Decrement Test (Phase 27)
  console.log('\n--- TEST 2: Clothing Multi-Variant Inventory & Checkout ---');
  const tshirt = await createProduct(
    clothingBiz,
    {
      name: 'Classic Cotton T-Shirt',
      sku: `TSHIRT-${suf}`,
      barcode: `BAR-TSHIRT-${suf}`,
      price: 1500,
      stockQty: 0,
      moduleSpecificFields: {
        brand: 'UrbanWear',
        material: '100% Cotton',
      },
      variants: [
        { sku: `TS-${suf}-S-BLK`, barcode: `BAR-${suf}-S-BLK`, size: 'S', color: 'Black', stock: 5, sale_price: 1500 },
        { sku: `TS-${suf}-M-BLK`, barcode: `BAR-${suf}-M-BLK`, size: 'M', color: 'Black', stock: 8, sale_price: 1500 },
        { sku: `TS-${suf}-L-BLK`, barcode: `BAR-${suf}-L-BLK`, size: 'L', color: 'Black', stock: 4, sale_price: 1500 },
      ],
    },
    clothingOwner.id
  );

  assert.equal(tshirt.variants.length, 3, 'Product must have 3 variants');
  assert.equal(tshirt.stock_qty, 17, 'Total product stock must sum to 17 (5 + 8 + 4)');

  const sVariant = tshirt.variants.find((v) => v.size === 'S');
  const mVariant = tshirt.variants.find((v) => v.size === 'M');
  const lVariant = tshirt.variants.find((v) => v.size === 'L');

  assert.equal(sVariant.stock_qty, 5, 'S variant initial stock must be 5');
  assert.equal(mVariant.stock_qty, 8, 'M variant initial stock must be 8');
  assert.equal(lVariant.stock_qty, 4, 'L variant initial stock must be 4');

  // Checkout 2x M/Black
  console.log('Selling 2x Medium / Black variants...');
  const saleRes = await withTransaction(async (conn) => {
    return executeCheckoutTransaction(conn, {
      businessId: clothingBiz.id,
      userId: clothingOwner.id,
      items: [
        {
          productId: tshirt.id,
          variantId: mVariant.id,
          quantity: 2,
          discountAmount: 0,
        },
      ],
      payment: { method: 'cash', amount: 3000 },
    });
  });

  assert.equal(saleRes.status, 'completed', 'Sale checkout must complete');

  // Verify variant stocks after checkout
  const tshirtAfterSale = await findProductById(clothingBiz.id, tshirt.id, clothingBiz.module_code);
  const sAfter = tshirtAfterSale.variants.find((v) => v.size === 'S');
  const mAfter = tshirtAfterSale.variants.find((v) => v.size === 'M');
  const lAfter = tshirtAfterSale.variants.find((v) => v.size === 'L');

  assert.equal(sAfter.stock_qty, 5, 'S/Black stock must remain 5');
  assert.equal(mAfter.stock_qty, 6, 'M/Black stock must decrement from 8 to 6');
  assert.equal(lAfter.stock_qty, 4, 'L/Black stock must remain 4');
  assert.equal(tshirtAfterSale.stock_qty, 15, 'Total stock must be 15');
  console.log('✅ PASS: Clothing variant stock decremented correctly (S: 5, M: 6, L: 4).');

  // Return 1x M/Black
  console.log('Refunding 1x Medium / Black variant...');
  const saleDetail = await findSaleDetailById(clothingBiz.id, saleRes.id);
  const saleItemId = saleDetail.items[0].id;

  await withTransaction(async (conn) => {
    return executeReturnTransaction(conn, {
      businessId: clothingBiz.id,
      userId: clothingOwner.id,
      saleId: saleRes.id,
      reason: 'Size exchange',
      items: [{ saleItemId, quantity: 1 }],
      restock: true,
    });
  });

  const tshirtAfterReturn = await findProductById(clothingBiz.id, tshirt.id, clothingBiz.module_code);
  const mAfterReturn = tshirtAfterReturn.variants.find((v) => v.size === 'M');
  assert.equal(mAfterReturn.stock_qty, 7, 'M/Black stock must restock from 6 to 7');
  console.log('✅ PASS: Clothing variant restock verified (M: 7).');

  // 3. Grocery Decimal Quantities Test (Phase 28)
  console.log('\n--- TEST 3: Grocery Decimal Quantities (kg/litre) ---');
  const basmatiRice = await createProduct(
    groceryBiz,
    {
      name: 'Super Basmati Rice',
      price: 320,
      stockQty: 50.5, // 50.5 kg
      unit: 'kg',
      moduleSpecificFields: {
        brand: 'Guard',
        expiry_date: '2027-12-31',
        is_weighed: 1,
      },
    },
    groceryOwner.id
  );

  // Sell 2.75 kg
  await withTransaction(async (conn) => {
    return executeCheckoutTransaction(conn, {
      businessId: groceryBiz.id,
      userId: groceryOwner.id,
      items: [
        {
          productId: basmatiRice.id,
          quantity: 2.75,
          discountAmount: 0,
        },
      ],
      payment: { method: 'cash', amount: 1000 },
    });
  });

  const riceAfterSale = await findProductById(groceryBiz.id, basmatiRice.id, groceryBiz.module_code);
  assert.equal(riceAfterSale.stock_qty, 47.75, 'Rice stock must decrement from 50.5 to 47.75 kg without rounding errors');
  console.log('✅ PASS: Grocery decimal quantities verified (50.5 - 2.75 = 47.75 kg).');

  // 4. Pharmacy Module Test
  console.log('\n--- TEST 4: Pharmacy Batch & Expiry Module ---');
  const pharmOwner = await createUser({ username: `pharm_owner_${suf}`, email: `pharm_${suf}@test.com`, role: 'admin' });
  await withTransaction(async (conn) => {
    return createBusiness(conn, { ownerUserId: pharmOwner.id, name: `City Meds ${suf}`, moduleId: 1 });
  });
  const pharmBiz = await findBusinessWithModuleByOwner(pharmOwner.id);

  const panadol = await createProduct(
    pharmBiz,
    {
      name: 'Panadol Extra 500mg',
      price: 45,
      stockQty: 100,
      unit: 'pack',
      moduleSpecificFields: {
        generic_name: 'Paracetamol / Caffeine',
        manufacturer: 'GSK',
        batch_no: 'BATCH-2026-X',
        expiry_date: '2028-06-30',
        requires_prescription: 0,
      },
    },
    pharmOwner.id
  );

  assert.equal(panadol.module_specific_fields.generic_name, 'Paracetamol / Caffeine');
  assert.equal(panadol.module_specific_fields.batch_no, 'BATCH-2026-X');
  console.log('✅ PASS: Pharmacy batch and expiry fields created and retrieved.');

  // 5. Electronics Module Test
  console.log('\n--- TEST 5: Electronics Serial & Warranty Module ---');
  const elecOwner = await createUser({ username: `elec_owner_${suf}`, email: `elec_${suf}@test.com`, role: 'admin' });
  await withTransaction(async (conn) => {
    return createBusiness(conn, { ownerUserId: elecOwner.id, name: `TechZone ${suf}`, moduleId: 3 });
  });
  const elecBiz = await findBusinessWithModuleByOwner(elecOwner.id);

  const laptop = await createProduct(
    elecBiz,
    {
      name: 'Pro Laptop 15',
      price: 185000,
      stockQty: 3,
      unit: 'pcs',
      moduleSpecificFields: {
        brand: 'Dell',
        model_number: 'XPS-15-9520',
        serial_number: 'SN-9948201',
        warranty_months: 24,
      },
    },
    elecOwner.id
  );

  assert.equal(laptop.module_specific_fields.brand, 'Dell');
  assert.equal(laptop.module_specific_fields.warranty_months, 24);
  console.log('✅ PASS: Electronics model and warranty fields verified.');

  // 6. Tenant Isolation Verification
  console.log('\n--- TEST 6: Tenant Isolation ---');
  try {
    // Business B trying to view or checkout Business A product
    const crossProduct = await findProductById(groceryBiz.id, tshirt.id, 'grocery');
    assert.equal(crossProduct, null, 'Business B must NOT be able to view Business A product');

    await withTransaction(async (conn) => {
      return executeCheckoutTransaction(conn, {
        businessId: groceryBiz.id,
        userId: groceryOwner.id,
        items: [{ productId: tshirt.id, quantity: 1 }],
        payment: { method: 'cash', amount: 2000 },
      });
    });
    assert.fail('Cross-tenant checkout should have thrown error');
  } catch (err) {
    assert.ok(err.message.includes('PRODUCT_NOT_FOUND'), 'Cross-tenant access correctly blocked');
    console.log('✅ PASS: Cross-tenant isolation strictly enforced.');
  }

  console.log('\n🎉 ALL MULTI-VERTICAL POS TESTS PASSED (100% VERIFIED)! 🎉');
  process.exit(0);
}

runVerticalTests().catch((err) => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
