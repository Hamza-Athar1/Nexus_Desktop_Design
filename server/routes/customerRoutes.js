import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { requireBusiness } from '../middleware/requireBusiness.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getCustomers, postCustomer, putCustomer, removeCustomer } from '../controllers/customerController.js';

const router = express.Router();
router.use(verifyToken, requireBusiness);

router.get('/customers', asyncHandler(getCustomers));
router.post('/customers', asyncHandler(postCustomer));
router.put('/customers/:id', asyncHandler(putCustomer));
router.delete('/customers/:id', asyncHandler(removeCustomer));

export default router;
