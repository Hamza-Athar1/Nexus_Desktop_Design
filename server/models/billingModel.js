/**
 * billingModel.js — DB layer for the Super Admin Billing & Payment pages.
 *
 * Invoices are never tenant-scoped at query time here (super admin sees all).
 */
import { pool } from '../config/db.js';

// ── Shared SELECT columns ─────────────────────────────────────────────────────
const INV_SELECT = `
  SELECT
    inv.id,
    inv.invoice_number,
    inv.amount,
    inv.status,
    inv.method,
    inv.due_date,
    inv.paid_at,
    inv.created_at,
    b.id           AS business_id,
    b.name         AS business_name,
    b.status       AS business_status,
    m.code         AS module_code,
    CONCAT(m.name, ' POS')  AS module_name,
    u.full_name    AS owner_name,
    u.username     AS owner_username
  FROM invoices inv
  JOIN businesses b ON b.id = inv.business_id
  JOIN modules    m ON m.id = b.module_id
  JOIN users      u ON u.id = b.owner_user_id
`;

// ── Billing page: latest invoice per business ─────────────────────────────────

/**
 * Returns the most-recent invoice for every business that has at least one.
 * Optionally filtered by status ('paid' | 'pending' | 'overdue').
 *
 * @param {{ status?: string }} [filters]
 */
export async function listLatestInvoices({ status } = {}) {
  // Subquery picks the highest invoice id per business (latest by insertion).
  let sql = `
    ${INV_SELECT}
    JOIN (
      SELECT business_id, MAX(id) AS latest_id
      FROM invoices
      GROUP BY business_id
    ) latest ON latest.latest_id = inv.id
  `;
  const params = [];
  if (status) {
    sql += ' WHERE inv.status = ?';
    params.push(status);
  }
  sql += ' ORDER BY inv.created_at DESC';
  const [rows] = await pool.query(sql, params);
  return rows;
}

// ── Stats card data ───────────────────────────────────────────────────────────

export async function getBillingStats() {
  const [[{ collected }]] = await pool.query(`
    SELECT COALESCE(SUM(amount), 0) AS collected
    FROM invoices
    WHERE status = 'paid'
      AND YEAR(paid_at)  = YEAR(CURDATE())
      AND MONTH(paid_at) = MONTH(CURDATE())
  `);

  const [[{ pendingSum }]] = await pool.query(`
    SELECT COALESCE(SUM(amount), 0) AS pendingSum
    FROM invoices WHERE status = 'pending'
  `);

  const [[{ overdueSum }]] = await pool.query(`
    SELECT COALESCE(SUM(amount), 0) AS overdueSum
    FROM invoices WHERE status = 'overdue'
  `);

  const [[{ total }]] = await pool.query(`
    SELECT COUNT(DISTINCT business_id) AS total FROM invoices
  `);

  const [[{ revenue }]] = await pool.query(`
    SELECT COALESCE(SUM(amount), 0) AS revenue
    FROM invoices WHERE status = 'paid'
  `);

  return {
    collectedThisMonth: Number(collected),
    pendingSum: Number(pendingSum),
    overdueSum: Number(overdueSum),
    totalInvoices: Number(total),
    totalRevenue: Number(revenue),
  };
}

// ── Single invoice detail + payment history ───────────────────────────────────

export async function findInvoiceById(id) {
  const [[inv]] = await pool.query(`
    ${INV_SELECT}
    WHERE inv.id = ?
  `, [id]);
  if (!inv) return null;

  const [[{ totalBilled }]] = await pool.query(`
    SELECT COALESCE(SUM(amount), 0) AS totalBilled
    FROM invoices
    WHERE business_id = ? AND status = 'paid'
  `, [inv.business_id]);

  const [history] = await pool.query(`
    SELECT id, invoice_number, amount, paid_at, method
    FROM invoices
    WHERE business_id = ? AND status = 'paid'
    ORDER BY paid_at DESC
    LIMIT 20
  `, [inv.business_id]);

  return { invoice: inv, totalBilledToDate: Number(totalBilled), paymentHistory: history };
}

// ── Initiate a new invoice ────────────────────────────────────────────────────

export async function createInvoice(businessId, { invoiceNumber, amount, dueDate }) {
  const [result] = await pool.query(`
    INSERT INTO invoices (business_id, invoice_number, amount, status, due_date)
    VALUES (?, ?, ?, 'pending', ?)
  `, [businessId, invoiceNumber, amount, dueDate]);
  return result.insertId;
}

// ── Payment page: all invoices with optional filters ─────────────────────────

/**
 * @param {{ moduleCode?: string, startDate?: string, endDate?: string }} [filters]
 */
export async function listPayments({ moduleCode, startDate, endDate } = {}) {
  let sql = `${INV_SELECT} WHERE 1=1`;
  const params = [];

  if (moduleCode) {
    sql += ' AND m.code = ?';
    params.push(moduleCode);
  }

  // Filter on effective date = paid_at for paid, due_date for others
  if (startDate) {
    sql += ' AND COALESCE(inv.paid_at, inv.due_date) >= ?';
    params.push(startDate);
  }
  if (endDate) {
    sql += ' AND COALESCE(inv.paid_at, inv.due_date) <= ?';
    params.push(endDate);
  }

  sql += ' ORDER BY COALESCE(inv.paid_at, inv.due_date) DESC';
  const [rows] = await pool.query(sql, params);
  return rows;
}

// ── Payment page: KPI stats for a specific module ─────────────────────────────

export async function getPaymentModuleStats(moduleCode) {
  const [[{ posSince }]] = await pool.query(`
    SELECT MIN(b.created_at) AS posSince
    FROM businesses b
    JOIN modules m ON m.id = b.module_id
    WHERE m.code = ?
  `, [moduleCode]);

  const [[{ paymentsMade, totalPaid }]] = await pool.query(`
    SELECT
      COUNT(*) AS paymentsMade,
      COALESCE(SUM(inv.amount), 0) AS totalPaid
    FROM invoices inv
    JOIN businesses b ON b.id = inv.business_id
    JOIN modules    m ON m.id = b.module_id
    WHERE m.code = ? AND inv.status = 'paid'
  `, [moduleCode]);

  // Human-readable duration from posSince to now
  let timeUsingPOS = null;
  if (posSince) {
    const since = new Date(posSince);
    const now = new Date();
    const totalMonths =
      (now.getFullYear() - since.getFullYear()) * 12 +
      (now.getMonth() - since.getMonth());
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    if (years > 0 && months > 0) {
      timeUsingPOS = `${years} year${years > 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`;
    } else if (years > 0) {
      timeUsingPOS = `${years} year${years > 1 ? 's' : ''}`;
    } else {
      timeUsingPOS = `${months} month${months !== 1 ? 's' : ''}`;
    }
  }

  return {
    posSince: posSince ? new Date(posSince).toISOString().slice(0, 10) : null,
    timeUsingPOS,
    paymentsMade: Number(paymentsMade),
    totalPaid: Number(totalPaid),
  };
}

// ── Super Admin Dashboard Analytics ─────────────────────────────────────────

export async function getDashboardAnalytics() {
  const [[{ totalUsers }]] = await pool.query(`SELECT COUNT(*) AS totalUsers FROM users`);
  const [[{ activeModules }]] = await pool.query(`SELECT COUNT(*) AS activeModules FROM modules WHERE is_available = 1`);
  const [[{ totalRevenue }]] = await pool.query(`SELECT COALESCE(SUM(amount), 0) AS totalRevenue FROM invoices WHERE status = 'paid'`);

  // User growth over time
  const [userGrowthRows] = await pool.query(`
    SELECT 
      DATE_FORMAT(created_at, '%b') AS name, 
      COUNT(*) AS users
    FROM users
    GROUP BY YEAR(created_at), MONTH(created_at), DATE_FORMAT(created_at, '%b')
    ORDER BY YEAR(created_at) ASC, MONTH(created_at) ASC
  `);

  // Revenue trend over time
  const [revenueTrendRows] = await pool.query(`
    SELECT 
      DATE_FORMAT(COALESCE(paid_at, due_date), '%b %Y') AS name, 
      ROUND(COALESCE(SUM(amount), 0) / 1000, 1) AS value,
      COALESCE(SUM(amount), 0) AS rawValue
    FROM invoices
    WHERE status = 'paid'
    GROUP BY YEAR(COALESCE(paid_at, due_date)), MONTH(COALESCE(paid_at, due_date)), DATE_FORMAT(COALESCE(paid_at, due_date), '%b %Y')
    ORDER BY YEAR(COALESCE(paid_at, due_date)) ASC, MONTH(COALESCE(paid_at, due_date)) ASC
  `);

  // Active modules share (USAGE_POS_DATA)
  const [[{ totalActiveBiz }]] = await pool.query(`SELECT COUNT(*) AS totalActiveBiz FROM businesses WHERE status = 'active'`);
  const [moduleShareRows] = await pool.query(`
    SELECT 
      m.name,
      COUNT(b.id) AS count
    FROM modules m
    LEFT JOIN businesses b ON b.module_id = m.id AND b.status = 'active'
    GROUP BY m.id, m.name
    ORDER BY count DESC
  `);

  const colors = ['#0d381c', '#276834', '#4eaf65', '#e5b61b', '#d9801c', '#baa78c', '#e1dc7f'];

  const usagePosData = moduleShareRows.map((row, idx) => {
    const pct = totalActiveBiz > 0 ? Math.round((Number(row.count) / Number(totalActiveBiz)) * 100) : 0;
    return {
      name: row.name,
      value: pct,
      count: Number(row.count),
      color: colors[idx % colors.length],
    };
  });

  // Revenue by POS / module (REVENUE_POS_DATA)
  const [revenuePosRows] = await pool.query(`
    SELECT 
      m.name,
      COALESCE(SUM(inv.amount), 0) AS rawAmount
    FROM modules m
    LEFT JOIN businesses b ON b.module_id = m.id
    LEFT JOIN invoices inv ON inv.business_id = b.id AND inv.status = 'paid'
    GROUP BY m.id, m.name
    ORDER BY rawAmount DESC
  `);

  const totalInvRev = revenuePosRows.reduce((acc, r) => acc + Number(r.rawAmount), 0);

  const revenuePosData = revenuePosRows.map((row, idx) => {
    const rawAmt = Number(row.rawAmount);
    const pct = totalInvRev > 0 ? Math.round((rawAmt / totalInvRev) * 100) : 0;
    return {
      name: row.name,
      value: pct,
      amount: `PKR ${rawAmt.toLocaleString()}`,
      rawAmount: rawAmt,
      color: colors[idx % colors.length],
      barColor: colors[idx % colors.length],
    };
  });

  return {
    summary: {
      uptime: '99.9%',
      activeModules: Number(activeModules),
      totalRevenue: Number(totalRevenue),
      totalUsers: Number(totalUsers),
    },
    userGrowth: userGrowthRows.map(r => ({ name: r.name, users: Number(r.users) })),
    revenueTrend: revenueTrendRows.map(r => ({ name: r.name, value: Number(r.value), rawValue: Number(r.rawValue) })),
    usagePosData,
    revenuePosData,
  };
}
