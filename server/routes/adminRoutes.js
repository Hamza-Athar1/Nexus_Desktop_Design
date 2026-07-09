import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { roleCheck } from '../middleware/roleCheck.js';
import {
  getAllUsersHandler,
  getAllSubscriptionsHandler,
  approveSubscription,
} from '../controllers/adminController.js';

const router = express.Router();

// All admin routes require a valid session AND an admin/super-admin role.
router.get('/admin/users', verifyToken, roleCheck('admin', 'super-admin'), getAllUsersHandler);
router.get('/admin/subscriptions', verifyToken, roleCheck('admin', 'super-admin'), getAllSubscriptionsHandler);
router.patch('/admin/subscriptions/:id/approve', verifyToken, roleCheck('admin', 'super-admin'), approveSubscription);

export default router;