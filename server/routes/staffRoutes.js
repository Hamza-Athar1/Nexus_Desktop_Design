import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { roleCheck } from '../middleware/roleCheck.js';
import { requireBusiness } from '../middleware/requireBusiness.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  getStaff,
  postStaff,
  putStaff,
  deleteStaff,
} from '../controllers/staffController.js';

const router = express.Router();

// Staff management is business-scoped and requires owner/admin authorization
const authStaff = [verifyToken, requireBusiness, roleCheck('admin', 'super_admin')];

router.get('/staff', authStaff, asyncHandler(getStaff));
router.post('/staff', authStaff, asyncHandler(postStaff));
router.put('/staff/:id', authStaff, asyncHandler(putStaff));
router.delete('/staff/:id', authStaff, asyncHandler(deleteStaff));

export default router;
