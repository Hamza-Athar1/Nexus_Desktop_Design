import { ApiError } from '../utils/ApiError.js';
import {
  listProducts,
  findProductById,
  findProductByBarcode,
  searchProducts,
  lowStockProducts,
  createProduct,
  updateProduct,
  deactivateProduct,
} from '../models/productModel.js';

export async function listItems(req, res) {
  const items = await listProducts(req.businessId, req.business.module_code);
  res.json({ items });
}

export async function getItem(req, res) {
  const item = await findProductById(req.businessId, req.params.id, req.business.module_code);
  if (!item) throw new ApiError(404, 'Item not found');
  res.json({ item });
}

export async function addItem(req, res) {
  const { name, price } = req.body;
  if (!name?.trim()) {
    throw new ApiError(400, 'Item name is required');
  }
  if (price !== undefined && Number(price) < 0) {
    throw new ApiError(400, 'Price cannot be negative');
  }

  const item = await createProduct(req.business, req.body, req.user.id);
  res.status(201).json({ message: 'Item created', item });
}

export async function editItem(req, res) {
  const { name, price } = req.body;
  if (name !== undefined && !name.trim()) {
    throw new ApiError(400, 'Item name cannot be empty');
  }
  if (price !== undefined && Number(price) < 0) {
    throw new ApiError(400, 'Price cannot be negative');
  }

  const item = await updateProduct(req.business, req.params.id, req.body, req.user.id);
  if (!item) throw new ApiError(404, 'Item not found');
  res.json({ message: 'Item updated', item });
}

export async function removeItem(req, res) {
  const deleted = await deactivateProduct(req.businessId, req.params.id);
  if (!deleted) throw new ApiError(404, 'Item not found');
  res.json({ message: 'Item deleted' });
}

export async function lowStock(req, res) {
  const items = await lowStockProducts(req.businessId, req.business.module_code);
  res.json({ items });
}

export async function scanBarcode(req, res) {
  const item = await findProductByBarcode(req.businessId, req.params.barcode, req.business.module_code);
  if (!item) throw new ApiError(404, 'No item matches that barcode');
  res.json({ item });
}

export async function search(req, res) {
  const q = req.query.q || '';
  if (!q.trim()) return res.json({ items: [] });
  const items = await searchProducts(req.businessId, q.trim(), req.business.module_code);
  res.json({ items });
}
