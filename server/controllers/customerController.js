import { ApiError } from '../utils/ApiError.js';
import {
  listCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../models/customerModel.js';

export async function getCustomers(req, res) {
  res.json({ customers: await listCustomers(req.businessId) });
}

export async function postCustomer(req, res) {
  if (!req.body.name?.trim()) throw new ApiError(400, 'Customer name is required');
  const customer = await createCustomer(req.businessId, req.body);
  res.status(201).json({ customer });
}

export async function putCustomer(req, res) {
  const customer = await updateCustomer(req.businessId, req.params.id, req.body);
  if (!customer) throw new ApiError(404, 'Customer not found');
  res.json({ customer });
}

export async function removeCustomer(req, res) {
  const deleted = await deleteCustomer(req.businessId, req.params.id);
  if (!deleted) throw new ApiError(404, 'Customer not found');
  res.json({ message: 'Customer deleted' });
}
