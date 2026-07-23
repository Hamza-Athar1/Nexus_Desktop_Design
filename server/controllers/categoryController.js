import { ApiError } from '../utils/ApiError.js';
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../models/categoryModel.js';

export async function getCategories(req, res) {
  res.json({ categories: await listCategories(req.businessId) });
}

export async function postCategory(req, res) {
  if (!req.body.name?.trim()) throw new ApiError(400, 'Category name is required');
  const category = await createCategory(req.businessId, {
    name: req.body.name.trim(),
    parentId: req.body.parentId || null,
  });
  res.status(201).json({ category });
}

export async function putCategory(req, res) {
  const category = await updateCategory(req.businessId, req.params.id, {
    name: req.body.name?.trim(),
    parentId: req.body.parentId,
  });
  if (!category) throw new ApiError(404, 'Category not found');
  res.json({ category });
}

export async function removeCategory(req, res) {
  const deleted = await deleteCategory(req.businessId, req.params.id);
  if (!deleted) throw new ApiError(404, 'Category not found');
  res.json({ message: 'Category deleted' });
}
