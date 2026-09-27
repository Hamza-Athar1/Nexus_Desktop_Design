import { apiFetchJson } from './api.js';

/** Fetch all products for the current business */
export async function getInventoryItems() {
  return apiFetchJson('/inventory/items', { method: 'GET' });
}

/** Create a new inventory product */
export async function createInventoryItem(payload) {
  return apiFetchJson('/inventory/items', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** Update an existing product */
export async function updateInventoryItem(id, payload) {
  return apiFetchJson(`/inventory/items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

/** Deactivate / delete a product */
export async function deleteInventoryItem(id) {
  return apiFetchJson(`/inventory/items/${id}`, {
    method: 'DELETE',
  });
}

/** Scan product/variant by barcode */
export async function scanBarcodeApi(barcode) {
  return apiFetchJson(`/inventory/scan/${encodeURIComponent(barcode.trim())}`, {
    method: 'GET',
  });
}
