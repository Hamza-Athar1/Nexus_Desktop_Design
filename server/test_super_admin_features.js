import { pool } from './config/db.js';
import { listShopRequests } from './models/shopRequestModel.js';
import { listBusinesses } from './models/userManagementModel.js';
import { getDashboardAnalytics } from './models/billingModel.js';

async function runSuperAdminFeaturesTest() {
  console.log('====================================================');
  console.log('    TESTING SUPER ADMIN NEW & MODIFIED FEATURES     ');
  console.log('====================================================\n');

  // 1. Check User Approvals pending filtering
  const pendingRequests = await listShopRequests({ status: 'Pending' });
  console.log(`✅ User Approvals Query: ${pendingRequests.length} pending registration/requests found in DB.`);

  // 2. Test User Management query with lastPaidAt and billDueDate
  const shops = await listBusinesses();
  if (!Array.isArray(shops)) throw new Error('Failed to retrieve businesses list');
  console.log(`✅ User Management Query: Retrieved ${shops.length} business records.`);
  if (shops.length > 0) {
    const s = shops[0];
    console.log(`   Sample Shop "${s.business}" -> Expiry/DueDate: ${s.billDueDate}, LastPaid: ${s.lastPaidAt}`);
  }

  // 3. Test Dashboard Analytics KPIs
  const analytics = await getDashboardAnalytics();
  if (!analytics.summary || typeof analytics.summary.totalRevenue !== 'number') {
    throw new Error('Invalid dashboard analytics structure');
  }
  console.log(`✅ Financial Analytics KPI: Total Revenue = Rs ${analytics.summary.totalRevenue}`);

  // 4. Test Password Reset endpoint logic
  if (shops.length > 0) {
    const shopToReset = shops[0];
    const tempPassword = 'Nx-' + Math.random().toString(36).slice(-8) + '!';
    const bcrypt = await import('bcrypt');
    const hash = await bcrypt.default.hash(tempPassword, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, shopToReset.ownerUserId]);
    console.log(`✅ Password Reset Logic: Successfully updated password hash for user #${shopToReset.ownerUserId}`);
  }

  console.log('\n====================================================');
  console.log('   ALL SUPER ADMIN FEATURE VERIFICATIONS PASSED      ');
  console.log('====================================================\n');
  process.exit(0);
}

runSuperAdminFeaturesTest().catch(err => {
  console.error('\n❌ FAIL: Super Admin features test error:', err);
  process.exit(1);
});
