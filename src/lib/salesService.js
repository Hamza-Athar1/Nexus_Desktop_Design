import { apiFetchJson } from './api.js';

/**
 * Creates a new sale (checkout).
 *
 * @param {Object} payload
 * @param {number|null} [payload.customerId]
 * @param {Array<{ productId: number, quantity: number, discountAmount?: number }>} payload.items
 * @param {{ method: string, amount: number, reference?: string|null }} payload.payment
 * @param {string} [payload.note]
 */
export async function createSale(payload) {
  return apiFetchJson('/sales', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Fetches sales history for the current business.
 *
 * @param {Object} [params]
 * @param {number} [params.page]
 * @param {number} [params.limit]
 * @param {string} [params.status]
 * @param {string} [params.date]
 */
export async function getSales(params = {}) {
  const query = new URLSearchParams();
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);
  if (params.status) query.append('status', params.status);
  if (params.date) query.append('date', params.date);

  const queryString = query.toString();
  const path = `/sales${queryString ? `?${queryString}` : ''}`;
  return apiFetchJson(path, { method: 'GET' });
}

/**
 * Fetches single sale details by ID.
 *
 * @param {number|string} saleId
 */
export async function getSaleById(saleId) {
  return apiFetchJson(`/sales/${saleId}`, { method: 'GET' });
}

/**
 * Processes a return/refund for a completed sale.
 *
 * @param {Object} payload
 * @param {number} payload.saleId
 * @param {Array<{ saleItemId: number, productId?: number, quantity: number }>} payload.items
 * @param {boolean} [payload.restock=true]
 * @param {string} [payload.reason]
 */
export async function processReturn(payload) {
  return apiFetchJson('/sales/returns', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
