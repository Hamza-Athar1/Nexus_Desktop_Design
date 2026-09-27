import { ApiError } from '../utils/ApiError.js';
import {
  listShopRequests,
  countPendingRequests,
  findShopRequestById,
  listRequestModules,
  createShopRequest,
  updateShopRequestStatus,
} from '../models/shopRequestModel.js';

import { pool } from '../config/db.js';
import { checkBusinessThemeOwnership } from '../models/themeEntitlementModel.js';

// Matches shop_requests.request_type ENUM in database.
const REQUEST_TYPES = ['pos_terminal', 'plan_upgrade', 'module_change', 'registration', 'theme_purchase', 'general', 'other'];
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

/** A business owner files a new request (billing/plan/module/theme/general/other). */
export async function postRequest(req, res) {
  const { requestType, title, details, paletteId } = req.body;
  if (!REQUEST_TYPES.includes(requestType)) {
    throw new ApiError(400, `requestType must be one of: ${REQUEST_TYPES.join(', ')}`);
  }

  let finalTitle = title?.trim();
  let finalDetails = details?.trim() || null;

  if (requestType === 'theme_purchase') {
    if (!paletteId) throw new ApiError(400, 'paletteId is required for theme purchase request');
    const [pRows] = await pool.query('SELECT id, name, price FROM pos_palettes WHERE id = ? LIMIT 1', [Number(paletteId)]);
    if (!pRows.length) throw new ApiError(404, 'Selected theme not found');

    const theme = pRows[0];
    const isOwned = await checkBusinessThemeOwnership(req.businessId, theme.id);
    if (isOwned) {
      throw new ApiError(400, `Your business already owns the ${theme.name} theme.`);
    }

    // Check for existing pending request
    const existingRequests = await listShopRequests({ businessId: req.businessId, status: 'Pending' });
    const hasPending = existingRequests.some((r) => {
      if (r.request_type !== 'theme_purchase') return false;
      try {
        const parsed = typeof r.details === 'string' && r.details.startsWith('{') ? JSON.parse(r.details) : null;
        return parsed?.paletteId === theme.id;
      } catch {
        return false;
      }
    });

    if (hasPending) {
      throw new ApiError(400, 'A request for this theme is already pending.');
    }

    finalTitle = `Theme Purchase: ${theme.name}`;
    finalDetails = JSON.stringify({
      paletteId: theme.id,
      themeName: theme.name,
      price: Number(theme.price),
      message: details?.trim() || null,
    });
  } else {
    if (!finalTitle) {
      throw new ApiError(400, 'title is required');
    }
  }

  const request = await createShopRequest(req.businessId, {
    requestType,
    title: finalTitle,
    details: finalDetails,
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
