import { ApiError } from '../utils/ApiError.js';
import {
  listShopRequests,
  countPendingRequests,
  findShopRequestById,
  listRequestModules,
  createShopRequest,
  updateShopRequestStatus,
} from '../models/shopRequestModel.js';

// Matches shop_requests.request_type ENUM in schema.sql exactly.
const REQUEST_TYPES = ['pos_terminal', 'plan_upgrade', 'module_change', 'other'];
// Matches shop_requests.status ENUM exactly — same strings the frontend renders.
const STATUSES = ['Pending', 'Approved', 'Rejected', 'Resubmit'];

function serializeRequest(row) {
  return {
    id: row.id,
    businessId: row.business_id,
    business: row.business_name,
    moduleCode: row.module_code,
    posModule: `${row.module_name} POS`,
    requestType: row.request_type,
    title: row.title,
    details: row.details,
    status: row.status,
    rejectionReason: row.rejection_reason,
    reviewedAt: row.reviewed_at,
    reviewedBy: row.reviewed_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ── Business-side (role: admin, scoped by requireBusiness) ─────────────

/** A business owner files a new request (billing/plan/module/other). */
export async function postRequest(req, res) {
  const { requestType, title, details } = req.body;
  if (!REQUEST_TYPES.includes(requestType)) {
    throw new ApiError(400, `requestType must be one of: ${REQUEST_TYPES.join(', ')}`);
  }
  if (!title?.trim()) {
    throw new ApiError(400, 'title is required');
  }
  const request = await createShopRequest(req.businessId, {
    requestType,
    title: title.trim(),
    details: details?.trim() || null,
  });
  res.status(201).json({ request: serializeRequest(request) });
}

/** A business owner views the requests they've filed for their own business. */
export async function getMyRequests(req, res) {
  const rows = await listShopRequests({ businessId: req.businessId });
  res.json({ requests: rows.map(serializeRequest) });
}

// ── Super admin-side (role: super_admin, platform-wide) ────────────────

/** Powers the Requests table. `module`/`status` query params are optional narrowing — the frontend currently filters client-side, but the API supports server-side filtering too. */
export async function getRequests(req, res) {
  const { module: moduleCode, status } = req.query;
  const rows = await listShopRequests({
    moduleCode: moduleCode && moduleCode !== 'all' ? moduleCode : undefined,
    status: status && status !== 'all' ? status : undefined,
  });
  res.json({ requests: rows.map(serializeRequest) });
}

/** Filter dropdown options + the platform-wide pending count for the page header. */
export async function getRequestsMeta(req, res) {
  const [modules, pendingCount] = await Promise.all([listRequestModules(), countPendingRequests()]);
  res.json({
    modules: modules.map((m) => ({ code: m.code, name: m.name, label: `${m.name} POS` })),
    pendingCount,
  });
}

export async function getRequestById(req, res) {
  const row = await findShopRequestById(req.params.id);
  if (!row) throw new ApiError(404, 'Request not found');
  res.json({ request: serializeRequest(row) });
}

/**
 * Approve / Reject / Resubmit / re-review ("Update") a request.
 * A note is required for Resubmit (it's the "suggestion or improvement"
 * shown back to the business owner) but optional otherwise — Approve/Reject
 * are one-click actions in the UI with no note field.
 */
export async function patchRequestStatus(req, res) {
  const { status, note } = req.body;
  if (!STATUSES.includes(status)) {
    throw new ApiError(400, `status must be one of: ${STATUSES.join(', ')}`);
  }
  if (status === 'Resubmit' && !note?.trim()) {
    throw new ApiError(400, 'A note is required when marking a request as Resubmit');
  }
  const updated = await updateShopRequestStatus(req.params.id, {
    status,
    reviewerId: req.user.id,
    note: note?.trim() || null,
  });
  if (!updated) throw new ApiError(404, 'Request not found');
  res.json({ request: serializeRequest(updated) });
}
