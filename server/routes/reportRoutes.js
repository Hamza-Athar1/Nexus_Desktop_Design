import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { requireBusiness } from '../middleware/requireBusiness.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  getSalesOverviewHandler,
  getTopProductsHandler,
  getCategoryDistributionHandler,
  getProfitAnalysisHandler,
  getStockDistributionHandler,
} from '../controllers/reportController.js';

const router = express.Router();
router.use(verifyToken, requireBusiness);

router.get('/reports/sales-overview', asyncHandler(getSalesOverviewHandler));
router.get('/reports/top-products', asyncHandler(getTopProductsHandler));
router.get('/reports/category-distribution', asyncHandler(getCategoryDistributionHandler));
router.get('/reports/profit-analysis', asyncHandler(getProfitAnalysisHandler));
router.get('/reports/stock-distribution', asyncHandler(getStockDistributionHandler));

export default router;
