import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { requireBusiness } from '../middleware/requireBusiness.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  listItems,
  getItem,
  addItem,
  editItem,
  removeItem,
  lowStock,
  scanBarcode,
  search,
} from '../controllers/inventoryController.js';

const router = express.Router();

// Every route needs a logged-in user AND a completed business — every
// query is scoped to req.businessId at the model layer.
router.use(verifyToken, requireBusiness);

router.get('/inventory/items', asyncHandler(listItems));
router.post('/inventory/items', asyncHandler(addItem));
router.get('/inventory/items/:id', asyncHandler(getItem));
router.put('/inventory/items/:id', asyncHandler(editItem));
router.delete('/inventory/items/:id', asyncHandler(removeItem));

router.get('/inventory/low-stock', asyncHandler(lowStock));
router.get('/inventory/scan/:barcode', asyncHandler(scanBarcode));
router.get('/inventory/search', asyncHandler(search));

export default router;
