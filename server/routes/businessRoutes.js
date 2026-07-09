import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { getProfile, updateProfileHandler, selectModule } from '../controllers/businessProfileController.js';

const router = express.Router();

router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfileHandler);
router.post('/business/select-module', verifyToken, selectModule);

export default router;