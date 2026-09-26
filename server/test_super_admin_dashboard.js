import { pool } from './config/db.js';
import { getDashboardAnalytics } from './models/billingModel.js';

async function runSuperAdminDashboardTest() {
  console.log('====================================================');
  console.log('    TESTING SUPER ADMIN DASHBOARD METRICS           ');
  console.log('====================================================\n');

  const analytics = await getDashboardAnalytics();
  const { summary, userGrowth, revenueTrend, usagePosData, revenuePosData } = analytics;

  // 1. Independent DB queries
  const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) AS totalUsers FROM users');
  const [[{ activeModules }]] = await pool.query('SELECT COUNT(*) AS activeModules FROM modules WHERE is_available = 1');
  const [[{ totalRevenue }]] = await pool.query("SELECT COALESCE(SUM(amount), 0) AS totalRevenue FROM invoices WHERE status = 'paid'");
  const [[{ totalActiveBiz }]] = await pool.query("SELECT COUNT(*) AS totalActiveBiz FROM businesses WHERE status = 'active'");

  // 2. Validate Summary KPIs
  console.log(`Summary Total Users: API=${summary.totalUsers} vs DB=${totalUsers}`);
  if (summary.totalUsers !== Number(totalUsers)) throw new Error('Total users mismatch!');

  console.log(`Summary Active Modules: API=${summary.activeModules} vs DB=${activeModules}`);
  if (summary.activeModules !== Number(activeModules)) throw new Error('Active modules mismatch!');

  console.log(`Summary Total Revenue: API=${summary.totalRevenue} vs DB=${totalRevenue}`);
  if (summary.totalRevenue !== Number(totalRevenue)) throw new Error('Total revenue mismatch!');

  // 3. Validate POS Usage Share
  const sumUsageBiz = usagePosData.reduce((acc, item) => acc + item.count, 0);
  console.log(`Active Businesses in Usage POS Share: Sum=${sumUsageBiz} vs DB=${totalActiveBiz}`);
  if (sumUsageBiz !== Number(totalActiveBiz)) throw new Error('Active businesses module sum mismatch!');

  // 4. Validate POS Revenue Share
  const sumRevPOS = revenuePosData.reduce((acc, item) => acc + item.rawAmount, 0);
  console.log(`Revenue in Revenue POS Share: Sum=${sumRevPOS} vs DB=${totalRevenue}`);
  if (sumRevPOS !== Number(totalRevenue)) throw new Error('Revenue per POS sum mismatch!');

  // 5. Validate User Growth dataset
  const sumUserGrowth = userGrowth.reduce((acc, item) => acc + item.users, 0);
  console.log(`Total Users in Growth dataset: Sum=${sumUserGrowth} vs DB=${totalUsers}`);
  if (sumUserGrowth !== Number(totalUsers)) throw new Error('User growth total mismatch!');

  // 6. Validate Revenue Trend dataset
  const sumRevenueTrend = revenueTrend.reduce((acc, item) => acc + item.rawValue, 0);
  console.log(`Total Revenue in Trend dataset: Sum=${sumRevenueTrend} vs DB=${totalRevenue}`);
  if (sumRevenueTrend !== Number(totalRevenue)) throw new Error('Revenue trend total mismatch!');

  console.log('\n✅ PASS: Super Admin Dashboard metrics are 100% accurate and consistent with MySQL live database.\n');
  process.exit(0);
}

runSuperAdminDashboardTest().catch(err => {
  console.error('\n❌ FAIL: Super Admin Dashboard test error:', err);
  process.exit(1);
});
