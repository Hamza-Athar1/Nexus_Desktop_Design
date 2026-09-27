import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { getDraft, saveDraft, finishSetup, uploadPaymentProof } from '../controllers/registrationController.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

const uploadDir = path.join(process.cwd(), 'uploads', 'proofs');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    const uniqueName = `proof_${Date.now()}_${Math.random().toString(36).slice(-6)}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('INVALID_FILE_TYPE'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});

// All registration routes require an authenticated user
router.get('/draft', verifyToken, asyncHandler(getDraft));
router.put('/draft', verifyToken, asyncHandler(saveDraft));
router.post('/upload-proof', verifyToken, (req, res, next) => {
  upload.single('proofFile')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File size exceeds 5MB limit' });
      }
      if (err.message === 'INVALID_FILE_TYPE') {
        return res.status(400).json({ message: 'Invalid file type. Allowed: JPG, PNG, WEBP, PDF' });
      }
      return res.status(400).json({ message: err.message || 'File upload failed' });
    }
    next();
  });
}, asyncHandler(uploadPaymentProof));

router.post('/finish', verifyToken, asyncHandler(finishSetup));

export default router;
