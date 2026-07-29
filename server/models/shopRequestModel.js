import { pool } from '../config/db.js';

/**
 * shop_requests workflow model.
 *
 * Table already existed in the schema (Section 4) — nothing here writes
 * to it until this patch. `status` values ('Pending'/'Approved'/'Rejected'
 * /'Resubmit') are used verbatim as the ENUM already matches what
 * SuperAdminRequestsPage.jsx renders, so no translation layer is needed
 * between DB and UI.
 */

const LIST_SELECT = `
  SELECT
    r.id,
    r.business_id,
    b.name        AS business_name,
    m.code        AS module_code,
    m.name        AS module_name,
    r.request_type,
    r.title,
    r.details,
    r.status,
    r.rejection_reason,
    r.reviewed_at,
    ru.username   AS reviewed_by,
    r.created_at,
    r.updated_at
  FROM shop_requests r
  JOIN businesses b ON b.id = r.business_id
  JOIN modules m    ON m.id = b.module_id
  LEFT JOIN users ru ON ru.id = r.reviewed_by_user_id
`;

/**
 * @param {{ moduleCode?: string, status?: string, businessId?: number }} [filters]
 */
export async function listShopRequests({ moduleCode, status, businessId } = {}) {
  const clauses = [];
  const params = [];
  if (moduleCode) {
    clauses.push('m.code = ?');
    params.push(moduleCode);
  }
  if (status) {
    clauses.push('r.status = ?');
    params.push(status);
  }
  if (businessId) {
    clauses.push('r.business_id = ?');
    params.push(businessId);
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const [rows] = await pool.query(`${LIST_SELECT} ${where} ORDER BY r.created_at DESC`, params);
  return rows;
}

/** Platform-wide pending count — deliberately not filter-scoped, backs the "N pending across all POS modules" header. */
export async function countPendingRequests() {
  const [rows] = await pool.query(`SELECT COUNT(*) AS count FROM shop_requests WHERE status = 'Pending'`);
  return rows[0]?.count ?? 0;
}

export async function findShopRequestById(id) {
  const [rows] = await pool.query(`${LIST_SELECT} WHERE r.id = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

/** Modules catalog, used to populate the "POS module" filter dropdown. */
export async function listRequestModules() {
  const [rows] = await pool.query(`SELECT code, name FROM modules ORDER BY display_order`);
  return rows;
}

export async function createShopRequest(businessId, { requestType, title, details = null }) {
  const [result] = await pool.query(
    `INSERT INTO shop_requests (business_id, request_type, title, details, status)
     VALUES (?, ?, ?, ?, 'Pending')`,
    [businessId, requestType, title, details]
  );
  return findShopRequestById(result.insertId);
}

/**
 * Applies a super admin's review decision. Used for the quick
 * Approve/Reject actions as well as the Resubmit-with-note flow and the
 * "Update" re-review modal (which can move a request to any status).
 */
export async function updateShopRequestStatus(id, { status, reviewerId, note = null }) {
  const [result] = await pool.query(
    `UPDATE shop_requests
     SET status = ?, reviewed_by_user_id = ?, reviewed_at = NOW(), rejection_reason = ?
     WHERE id = ?`,
    [status, reviewerId, note, id]
  );
  if (result.affectedRows === 0) return null;
  return findShopRequestById(id);
}
