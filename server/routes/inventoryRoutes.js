import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
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

// All inventory routes require a logged-in user; every query is
// scoped to req.user.id at the model layer, so one business's
// inventory is never visible to another's.
router.get('/inventory/items', verifyToken, listItems);
router.post('/inventory/items', verifyToken, addItem);
router.get('/inventory/items/:id', verifyToken, getItem);
router.put('/inventory/items/:id', verifyToken, editItem);
router.delete('/inventory/items/:id', verifyToken, removeItem);

router.get('/inventory/low-stock', verifyToken, lowStock);
router.get('/inventory/scan/:barcode', verifyToken, scanBarcode);
router.get('/inventory/search', verifyToken, search);

export default router;