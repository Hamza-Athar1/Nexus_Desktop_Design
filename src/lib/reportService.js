import { apiFetchJson } from './api.js';

export async function getSalesOverviewReport() {
  return apiFetchJson('/reports/sales-overview', { method: 'GET' });
}

export async function getTopProductsReport() {
  return apiFetchJson('/reports/top-products', { method: 'GET' });
}

export async function getCategoryDistributionReport() {
  return apiFetchJson('/reports/category-distribution', { method: 'GET' });
}

export async function getProfitAnalysisReport() {
  return apiFetchJson('/reports/profit-analysis', { method: 'GET' });
}

export async function getStockDistributionReport() {
  return apiFetchJson('/reports/stock-distribution', { method: 'GET' });
}

export async function getSuperAdminDashboardAnalytics() {
  return apiFetchJson('/admin/dashboard/stats', { method: 'GET' });
}
