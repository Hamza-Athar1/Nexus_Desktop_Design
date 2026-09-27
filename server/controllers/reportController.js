import {
  getSalesOverview,
  getTopProducts,
  getCategoryDistribution,
  getProfitAnalysis,
  getStockDistribution,
} from '../models/reportModel.js';

export async function getSalesOverviewHandler(req, res) {
  const data = await getSalesOverview(req.businessId);
  res.json({ salesOverview: data });
}

export async function getTopProductsHandler(req, res) {
  const data = await getTopProducts(req.businessId);
  res.json({ topProducts: data });
}

export async function getCategoryDistributionHandler(req, res) {
  const data = await getCategoryDistribution(req.businessId);
  res.json({ categoryDistribution: data });
}

export async function getProfitAnalysisHandler(req, res) {
  const data = await getProfitAnalysis(req.businessId);
  res.json({ profitAnalysis: data });
}

export async function getStockDistributionHandler(req, res) {
  const data = await getStockDistribution(req.businessId);
  res.json({ stockDistribution: data });
}
