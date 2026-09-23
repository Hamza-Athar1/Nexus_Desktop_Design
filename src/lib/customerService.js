import { apiFetchJson } from './api.js';

/** Fetch all active customers for the current business */
export async function getCustomers() {
  return apiFetchJson('/customers', { method: 'GET' });
}
