import { pool } from '../config/db.js';

// ── Common SELECT shape for the shops list ────────────────────────────────────
const SHOP_SELECT = `
  SELECT
    b.id,
    b.name                AS business_name,
    b.shop_address,
    b.city_region,
    b.status,
    b.bill_status,
    b.bill_amount,
    b.bill_due_date,
    b.last_paid_at,
    b.pos_purchased,
    b.pos_active,
    b.status_reason,
    b.created_at,
    m.code                AS module_code,
    m.name                AS module_name,
    u.id                  AS owner_user_id,
    u.username            AS owner_username,
    u.full_name           AS owner_full_name,
    u.email               AS owner_email,
    u.phone               AS owner_phone,
    u.last_login_at
  FROM businesses b
  JOIN modules m ON m.id = b.module_id
  JOIN users  u ON u.id = b.owner_user_id
`;

/** Format a business row into the camelCase shape the frontend expects. */
function serializeBusiness(row) {
  const name = row.owner_full_name || row.owner_username;
  const billAmt = Number(row.bill_amount ?? 0);
  const billLabel =
    row.bill_status === 'paid'
      ? `Paid Rs ${billAmt.toLocaleString()}`
      : row.bill_status === 'overdue'
      ? `Overdue Rs ${billAmt.toLocaleString()}`
      : row.bill_status === 'staff_request'
      ? 'Staff request'
      : 'Upgrade request';

  return {
    id: row.id,
    business: row.business_name,
    posModule: `${row.module_name} POS`,
    moduleCode: row.module_code,
    billStatus: row.bill_status,
    billAmount: billAmt,
    billDisplayText: billLabel,
    billDueDate: row.bill_due_date ?? null,    // ISO date string or null
    lastPaidAt: row.last_paid_at ?? null,
    status: row.status,
    statusReason: row.status_reason ?? null,
    owner: name,
    ownerEmail: row.owner_email ?? null,
    ownerPhone: row.owner_phone ?? null,
    shopAddress: row.shop_address ?? null,
    cityRegion: row.city_region ?? null,
    posPurchased: row.pos_purchased ?? 1,
    posActive: row.pos_active ?? 1,
    registeredAt: row.created_at,
    lastLoginAt: row.last_login_at ?? null,
    ownerUserId: row.owner_user_id,
  };
}

/** List all businesses, optionally filtered by status. */
export async function listBusinesses({ status } = {}) {
  const where = status && status !== 'all' ? `WHERE b.status = ?` : '';
  const params = status && status !== 'all' ? [status] : [];
  const [rows] = await pool.query(
    `${SHOP_SELECT} ${where} ORDER BY b.created_at DESC`,
    params
  );
  return rows.map(serializeBusiness);
}

/** Single business — includes all detail fields. */
export async function findBusinessById(id) {
  const [rows] = await pool.query(`${SHOP_SELECT} WHERE b.id = ? LIMIT 1`, [id]);
  if (!rows.length) return null;
  return serializeBusiness(rows[0]);
}

/** Update editable shop info fields. Returns the refreshed row. */
export async function updateBusinessInfo(id, { name, shopAddress, cityRegion, moduleCode, ownerFullName }) {
  // Resolve moduleCode -> module_id
  const [mods] = await pool.query(`SELECT id FROM modules WHERE code = ? LIMIT 1`, [moduleCode]);
  const moduleId = mods[0]?.id;

  await pool.query(
    `UPDATE businesses
     SET name = ?, shop_address = ?, city_region = ?, ${moduleId ? 'module_id = ?,' : ''}
         updated_at = NOW()
     WHERE id = ?`,
    moduleId
      ? [name, shopAddress, cityRegion, moduleId, id]
      : [name, shopAddress, cityRegion, id]
  );

  // Update owner display name on users table
  if (ownerFullName) {
    const [biz] = await pool.query(`SELECT owner_user_id FROM businesses WHERE id = ? LIMIT 1`, [id]);
    if (biz[0]) {
      await pool.query(`UPDATE users SET full_name = ? WHERE id = ?`, [ownerFullName, biz[0].owner_user_id]);
    }
  }

  return findBusinessById(id);
}

/**
 * Update business status (active / suspended / blocked).
 * Also syncs the owner user's status so login is blocked when needed.
 */
export async function updateBusinessStatus(id, { status, reason = null, billDueDate = null, billAmount = null, posPurchased = null, posActive = null }) {
  // Map business status → user status
  const userStatus = status === 'active' ? 'active' : status; // 'suspended' | 'blocked'

  const [biz] = await pool.query(`SELECT owner_user_id FROM businesses WHERE id = ? LIMIT 1`, [id]);
  if (!biz[0]) return null;

  let updateQuery = `UPDATE businesses SET status = ?, status_reason = ?`;
  const params = [status, reason];

  if (billDueDate !== null) {
    updateQuery += `, bill_due_date = ?`;
    params.push(billDueDate);
  }
  if (billAmount !== null) {
    updateQuery += `, bill_amount = ?`;
    params.push(billAmount);
  }
  if (posPurchased !== null) {
    updateQuery += `, pos_purchased = ?`;
    params.push(posPurchased);
  }
  if (posActive !== null) {
    updateQuery += `, pos_active = ?`;
    params.push(posActive);
  }

  updateQuery += `, updated_at = NOW() WHERE id = ?`;
  params.push(id);

  await pool.query(updateQuery, params);
  await pool.query(
    `UPDATE users SET status = ?, updated_at = NOW() WHERE id = ?`,
    [userStatus, biz[0].owner_user_id]
  );

  // Log the status change
  const desc = reason
    ? `Shop ${status} — reason: ${reason}`
    : `Shop status changed to ${status}`;
  await logActivity(id, 'status', desc);

  return findBusinessById(id);
}

/** Extend the billing due date. */
export async function extendBillDueDate(id, { newDueDate, reason = null }) {
  await pool.query(
    `UPDATE businesses SET bill_due_date = ?, updated_at = NOW() WHERE id = ?`,
    [newDueDate, id]
  );

  const desc = reason
    ? `Due date extended to ${newDueDate} — note: ${reason}`
    : `Due date extended to ${newDueDate}`;
  await logActivity(id, 'bill', desc);

  return findBusinessById(id);
}

/** Return activity log entries for the last 30 days. */
export async function getActivityLog(businessId) {
  const [rows] = await pool.query(
    `SELECT id, event_type, description, created_at
     FROM business_activity_log
     WHERE business_id = ?
       AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
     ORDER BY created_at DESC
     LIMIT 50`,
    [businessId]
  );
  return rows;
}

/** Store an admin message and write an activity log entry. */
export async function createMessage(businessId, { subject, body, fromUserId }) {
  const [result] = await pool.query(
    `INSERT INTO admin_messages (business_id, from_user_id, subject, body) VALUES (?, ?, ?, ?)`,
    [businessId, fromUserId, subject, body]
  );
  await logActivity(businessId, 'message', `Message sent: "${subject}"`);
  return result.insertId;
}

/**
 * Permanently delete a business and its owner user.
 * ON DELETE CASCADE handles child rows.
 */
export async function deleteBusinessById(id) {
  const [biz] = await pool.query(`SELECT owner_user_id FROM businesses WHERE id = ? LIMIT 1`, [id]);
  if (!biz[0]) return false;
  // Delete user — CASCADE drops the business row too.
  await pool.query(`DELETE FROM users WHERE id = ?`, [biz[0].owner_user_id]);
  return true;
}

/** Internal helper — write one activity log row. */
export async function logActivity(businessId, eventType, description) {
  await pool.query(
    `INSERT INTO business_activity_log (business_id, event_type, description) VALUES (?, ?, ?)`,
    [businessId, eventType, description]
  );
}
