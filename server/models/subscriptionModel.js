import pool from '../config/db.js';

export async function findSubscriptionByUserId(userId) {
  const [rows] = await pool.query(
    'SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
    [userId]
  );
  return rows[0] || null;
}

// Called once, right after signup, alongside createProfileForUser —
// every user starts on a 'trial' plan with 'pending' status until an
// admin approves it.
export async function createTrialSubscription(userId) {
  await pool.query(
    `INSERT INTO subscriptions (user_id, plan, status)
     VALUES (?, 'trial', 'pending')`,
    [userId]
  );
  return findSubscriptionByUserId(userId);
}

export async function findSubscriptionById(id) {
  const [rows] = await pool.query(
    'SELECT * FROM subscriptions WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
}

// Used by the admin dashboard listing — joins in business_name and
// username so the frontend doesn't need a second round-trip per row.
export async function getAllSubscriptionsWithUser() {
  const [rows] = await pool.query(`
    SELECT
      s.id, s.user_id, s.plan, s.status, s.payment_date, s.renews_at, s.created_at,
      u.username, bp.business_name
    FROM subscriptions s
    JOIN users u ON u.id = s.user_id
    LEFT JOIN business_profiles bp ON bp.user_id = s.user_id
    ORDER BY s.created_at DESC
  `);
  return rows;
}

export async function updateSubscriptionStatus(id, { status, plan, paymentDate, renewsAt }) {
  const columns = [];
  const values = [];

  if (status !== undefined)     { columns.push('status = ?');       values.push(status); }
  if (plan !== undefined)       { columns.push('plan = ?');         values.push(plan); }
  if (paymentDate !== undefined){ columns.push('payment_date = ?'); values.push(paymentDate); }
  if (renewsAt !== undefined)   { columns.push('renews_at = ?');    values.push(renewsAt); }

  if (columns.length === 0) return findSubscriptionById(id);

  values.push(id);
  await pool.query(
    `UPDATE subscriptions SET ${columns.join(', ')} WHERE id = ?`,
    values
  );
  return findSubscriptionById(id);
}