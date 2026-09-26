import assert from 'node:assert';
import { pool } from './config/db.js';
import { checkBusinessThemeOwnership, grantThemeEntitlement, getBusinessThemeCatalog } from './models/themeEntitlementModel.js';
import { listShopRequests, createShopRequest, updateShopRequestStatus } from './models/shopRequestModel.js';

let passed = 0;
let failed = 0;

function logPass(msg) {
  passed++;
  console.log(`✅ PASS: ${msg}`);
}

function logFail(msg, err) {
  failed++;
  console.error(`❌ FAIL: ${msg}`, err || '');
}

async function runTests() {
  console.log('====================================================');
  console.log('  TESTING THEME ENTITLEMENT & REQUEST SYSTEM        ');
  console.log('====================================================\n');

  try {
    // Pick an existing business (e.g. business_id = 1)
    const [bizRows] = await pool.query('SELECT id FROM businesses LIMIT 1');
    if (!bizRows.length) throw new Error('No test business found');
    const bizId = bizRows[0].id;

    // Pick a paid theme palette (price > 0)
    const [palRows] = await pool.query('SELECT id, name, price FROM pos_palettes WHERE price > 0 LIMIT 1');
    if (!palRows.length) throw new Error('No paid theme found in pos_palettes');
    const paidTheme = palRows[0];

    // 1. Initial Entitlement Check (Ensure unowned before grant)
    await pool.query('DELETE FROM business_theme_entitlements WHERE business_id = ? AND palette_id = ?', [bizId, paidTheme.id]);
    const unownedCheck = await checkBusinessThemeOwnership(bizId, paidTheme.id);
    assert.strictEqual(unownedCheck, false, 'Unowned paid theme should return false');
    logPass(`Theme Ownership Check: Unowned paid theme "${paidTheme.name}" returned false`);

    // 2. Grant Initial Entitlement
    await grantThemeEntitlement(bizId, paidTheme.id, paidTheme.price);
    const ownedCheck = await checkBusinessThemeOwnership(bizId, paidTheme.id);
    assert.strictEqual(ownedCheck, true, 'Granted theme should return true for ownership');
    logPass(`Grant Theme Entitlement: Entitled theme "${paidTheme.name}" now returns true`);

    // 3. Catalog API query
    const catalog = await getBusinessThemeCatalog(bizId);
    const themeItem = catalog.find((t) => t.id === paidTheme.id);
    assert.ok(themeItem && themeItem.owned === true, 'Catalog should mark granted theme as owned');
    logPass(`Theme Catalog Resolution: Catalog correctly tags palette ${paidTheme.id} as owned`);

    // 4. Create Theme Purchase Request
    const requestTitle = `Theme Purchase: ${paidTheme.name}`;
    const requestDetails = JSON.stringify({ paletteId: paidTheme.id, themeName: paidTheme.name, price: Number(paidTheme.price) });
    const req = await createShopRequest(bizId, {
      requestType: 'theme_purchase',
      title: requestTitle,
      details: requestDetails,
    });
    assert.ok(req && req.status === 'Pending', 'Created request should be Pending');
    logPass(`Create Shop Request: Theme purchase request filed with status 'Pending' (ID: ${req.id})`);

    // 5. Tenant Scoping for Requests
    const myReqs = await listShopRequests({ businessId: bizId });
    const hasMyReq = myReqs.some((r) => r.id === req.id);
    assert.ok(hasMyReq, 'Business requests query must include filed request');
    logPass(`Tenant Isolation & Request Query: Request successfully scoped to Business ID ${bizId}`);

    // 6. Super Admin Approval Flow for Theme Purchase
    // Get superadmin user id
    const [saRows] = await pool.query('SELECT id FROM users WHERE role = "super_admin" LIMIT 1');
    const saUserId = saRows[0]?.id || 1;

    const approvedReq = await updateShopRequestStatus(req.id, {
      status: 'Approved',
      reviewerId: saUserId,
      note: 'Approved for test',
    });
    assert.strictEqual(approvedReq.status, 'Approved', 'Request status updated to Approved');

    const recheckOwned = await checkBusinessThemeOwnership(bizId, paidTheme.id);
    assert.strictEqual(recheckOwned, true, 'Approval must grant entitlement');
    logPass(`Super Admin Approval Flow: Approving request granted entitlement to palette ${paidTheme.id}`);

    // Cleanup test request
    await pool.query('DELETE FROM shop_requests WHERE id = ?', [req.id]);

  } catch (err) {
    logFail('Theme entitlement and request tests failed', err);
  }

  console.log('\n====================================================');
  console.log(`RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');
  if (failed > 0) process.exit(1);
}

runTests();
