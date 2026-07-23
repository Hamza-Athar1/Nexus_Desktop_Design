import { pool } from '../config/db.js';

export async function findSubscriptionByBusiness(businessId) {
  const [rows] = await pool.query(
    `SELECT s.*, p.code AS plan_code, p.name AS plan_name
     FROM subscriptions s JOIN plans p ON p.id = s.plan_id
     WHERE s.business_id = ? LIMIT 1`,
    [businessId]
  );
  return rows[0] || null;
}

/**
 * @param {import('mysql2/promise').PoolConnection} conn
 */
export async function createSubscription(conn, {
  businessId,
  planId,
  platform,
  paymentMethod,
  planPrice,
  backupModulesPrice,
  currency = 'PKR',
}) {
  const estimatedMonthlyCost = Number(planPrice) + Number(backupModulesPrice);
  const [result] = await conn.query(
    `INSERT INTO subscriptions
       (business_id, plan_id, platform, payment_method, plan_price,
        backup_modules_price, estimated_monthly_cost, currency)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [businessId, planId, platform, paymentMethod, planPrice, backupModulesPrice, estimatedMonthlyCost, currency]
  );
  return result.insertId;
}

/**
 * @param {import('mysql2/promise').PoolConnection} conn
 * @param {Array<{id:number, monthly_price:number}>} backupModules
 */
export async function addSubscriptionBackupModules(conn, subscriptionId, backupModules) {
  if (!backupModules.length) return;
  const values = backupModules.map((m) => [subscriptionId, m.id, m.monthly_price]);
  await conn.query(
    `INSERT INTO subscription_backup_modules (subscription_id, backup_module_id, unit_price) VALUES ?`,
    [values]
  );
}
