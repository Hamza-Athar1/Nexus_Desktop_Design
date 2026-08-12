import { ApiError } from '../utils/ApiError.js';
import {
  listBusinesses,
  findBusinessById,
  updateBusinessInfo,
  updateBusinessStatus,
  extendBillDueDate,
  getActivityLog,
  createMessage,
  deleteBusinessById,
} from '../models/userManagementModel.js';

const VALID_STATUSES = ['active', 'suspended', 'blocked'];

/** GET /api/admin/shops  — full list, optional ?status= filter */
export async function getShops(req, res) {
  const { status } = req.query;
  const shops = await listBusinesses({ status });
  res.json({ shops });
}

/** GET /api/admin/shops/:id */
export async function getShopById(req, res) {
  const shop = await findBusinessById(Number(req.params.id));
  if (!shop) throw new ApiError(404, 'Shop not found');
  res.json({ shop });
}

/** PATCH /api/admin/shops/:id  — edit shop info */
export async function patchShopInfo(req, res) {
  const id = Number(req.params.id);
  const { name, shopAddress, cityRegion, moduleCode, ownerFullName } = req.body;
  if (!name?.trim()) throw new ApiError(400, 'name is required');
  const shop = await updateBusinessInfo(id, {
    name: name.trim(),
    shopAddress: shopAddress?.trim() ?? null,
    cityRegion: cityRegion?.trim() ?? null,
    moduleCode,
    ownerFullName: ownerFullName?.trim() ?? null,
  });
  if (!shop) throw new ApiError(404, 'Shop not found');
  res.json({ shop });
}

/** PATCH /api/admin/shops/:id/status  — suspend / block / activate / unblock */
export async function patchShopStatus(req, res) {
  const id = Number(req.params.id);
  const { status, reason, billDueDate, billAmount, posPurchased, posActive } = req.body;
  if (!VALID_STATUSES.includes(status)) {
    throw new ApiError(400, `status must be one of: ${VALID_STATUSES.join(', ')}`);
  }
  const shop = await updateBusinessStatus(id, {
    status,
    reason: reason?.trim() ?? null,
    billDueDate: billDueDate ?? null,
    billAmount: billAmount !== undefined ? Number(billAmount) : null,
    posPurchased: posPurchased !== undefined ? Number(posPurchased) : null,
    posActive: posActive !== undefined ? Number(posActive) : null,
  });
  if (!shop) throw new ApiError(404, 'Shop not found');
  res.json({ shop });
}

/** PATCH /api/admin/shops/:id/extend-due */
export async function patchExtendDue(req, res) {
  const id = Number(req.params.id);
  const { newDueDate, reason } = req.body;
  if (!newDueDate) throw new ApiError(400, 'newDueDate is required (YYYY-MM-DD)');
  const shop = await extendBillDueDate(id, {
    newDueDate,
    reason: reason?.trim() ?? null,
  });
  if (!shop) throw new ApiError(404, 'Shop not found');
  res.json({ shop });
}

/** GET /api/admin/shops/:id/activity */
export async function getShopActivity(req, res) {
  const id = Number(req.params.id);
  const exists = await findBusinessById(id);
  if (!exists) throw new ApiError(404, 'Shop not found');
  const entries = await getActivityLog(id);
  res.json({ activity: entries });
}

/** POST /api/admin/shops/:id/message */
export async function postMessage(req, res) {
  const id = Number(req.params.id);
  const { subject, body } = req.body;
  if (!subject?.trim()) throw new ApiError(400, 'subject is required');
  if (!body?.trim()) throw new ApiError(400, 'body is required');
  const exists = await findBusinessById(id);
  if (!exists) throw new ApiError(404, 'Shop not found');
  const msgId = await createMessage(id, {
    subject: subject.trim(),
    body: body.trim(),
    fromUserId: req.user.id,
  });
  res.status(201).json({ messageId: msgId });
}

/** DELETE /api/admin/shops/:id */
export async function deleteShop(req, res) {
  const id = Number(req.params.id);
  const deleted = await deleteBusinessById(id);
  if (!deleted) throw new ApiError(404, 'Shop not found');
  res.json({ deleted: true });
}
