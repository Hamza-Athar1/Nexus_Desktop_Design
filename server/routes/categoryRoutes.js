import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { requireBusiness } from '../middleware/requireBusiness.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getCategories, postCategory, putCategory, removeCategory } from '../controllers/categoryController.js';

const router = express.Router();
router.use(verifyToken, requireBusiness);

router.get('/categories', asyncHandler(getCategories));
router.post('/categories', asyncHandler(postCategory));
router.put('/categories/:id', asyncHandler(putCategory));
router.delete('/categories/:id', asyncHandler(removeCategory));

export default router;
