import assert from 'assert';
import { pool } from './config/db.js';
import { getReceiptSettingsByBusiness, upsertReceiptSettings } from './models/receiptSettingsModel.js';

async function runTests() {
  console.log('--- RUNNING RECEIPT SETTINGS TESTS ---');

  // Find a test business ID
  const [businesses] = await pool.query('SELECT id FROM businesses LIMIT 1');
  if (businesses.length === 0) {
    console.log('No businesses found to test receipt settings.');
    process.exit(0);
  }
  const businessId = businesses[0].id;
  console.log(`Testing with businessId: ${businessId}`);

  // 1. Get initial or default settings
  const initialSettings = await getReceiptSettingsByBusiness(businessId);
  assert(initialSettings, 'Initial settings should not be null');
  console.log('1. Initial settings retrieved successfully:', initialSettings);

  // 2. Upsert settings
  const testPayload = {
    shopName: 'Test Automation Shop',
    shopAddress: '123 Automation Way\nSuite 400',
    fontSize: 16,
    language: 'ur',
    logoUrl: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4='
  };

  const updated = await upsertReceiptSettings(businessId, testPayload);
  assert.strictEqual(updated.shopName, testPayload.shopName);
  assert.strictEqual(updated.shopAddress, testPayload.shopAddress);
  assert.strictEqual(updated.fontSize, 16);
  assert.strictEqual(updated.language, 'ur');
  assert.strictEqual(updated.logoUrl, testPayload.logoUrl);
  console.log('2. Upsert settings verified successfully in DB.');

  // 3. Verify get retrieves updated values
  const retrieved = await getReceiptSettingsByBusiness(businessId);
  assert.strictEqual(retrieved.shopName, 'Test Automation Shop');
  assert.strictEqual(retrieved.language, 'ur');
  console.log('3. Retrieval after upsert matched expected values.');

  console.log('--- RECEIPT SETTINGS TESTS PASSED ---');
  await pool.end();
  process.exit(0);
}

runTests().catch(err => {
  console.error('Receipt settings test failed:', err);
  process.exit(1);
});
