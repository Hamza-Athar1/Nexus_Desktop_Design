import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { requireBusiness } from '../middleware/requireBusiness.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getSuppliers, postSupplier, putSupplier, removeSupplier } from '../controllers/supplierController.js';

const router = express.Router();
router.use(verifyToken, requireBusiness);

router.get('/suppliers', asyncHandler(getSuppliers));
router.post('/suppliers', asyncHandler(postSupplier));
router.put('/suppliers/:id', asyncHandler(putSupplier));
router.delete('/suppliers/:id', asyncHandler(removeSupplier));

export default router;
