import express from 'express';
import { getDraft, saveDraft, finishSetup } from '../controllers/registrationController.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

// All registration routes require an authenticated user — the account
// (step 1) is created by /auth/signup before any of these are reachable.
router.get('/draft', verifyToken, asyncHandler(getDraft));
router.put('/draft', verifyToken, asyncHandler(saveDraft));
router.post('/finish', verifyToken, asyncHandler(finishSetup));

export default router;
