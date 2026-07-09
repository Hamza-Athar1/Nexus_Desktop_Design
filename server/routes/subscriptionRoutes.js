import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { getSubscriptionStatus } from '../controllers/subscriptionController.js';

const router = express.Router();

router.get('/subscriptions/status', verifyToken, getSubscriptionStatus);

export default router;