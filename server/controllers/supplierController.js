import { ApiError } from '../utils/ApiError.js';
import {
  listSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from '../models/supplierModel.js';

export async function getSuppliers(req, res) {
  res.json({ suppliers: await listSuppliers(req.businessId) });
}

export async function postSupplier(req, res) {
  if (!req.body.name?.trim()) throw new ApiError(400, 'Supplier name is required');
  const supplier = await createSupplier(req.businessId, req.body);
  res.status(201).json({ supplier });
}

export async function putSupplier(req, res) {
  const supplier = await updateSupplier(req.businessId, req.params.id, req.body);
  if (!supplier) throw new ApiError(404, 'Supplier not found');
  res.json({ supplier });
}

export async function removeSupplier(req, res) {
  const deleted = await deleteSupplier(req.businessId, req.params.id);
  if (!deleted) throw new ApiError(404, 'Supplier not found');
  res.json({ message: 'Supplier deleted' });
}
