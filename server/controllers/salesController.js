import { ApiError } from '../utils/ApiError.js';
import { withTransaction } from '../config/db.js';
import {
  executeCheckoutTransaction,
  findSalesByBusiness,
  findSaleDetailById,
  executeReturnTransaction,
} from '../models/salesModel.js';

/** POST /api/sales — process checkout transaction */
export async function postCheckout(req, res) {
  const { customerId, items, payment, note } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'Items array with at least one item is required');
  }

  // Check for duplicate product IDs in the request
  const productIds = items.map((i) => i?.productId);
  if (productIds.some((id) => !id || typeof id !== 'number')) {
    throw new ApiError(400, 'Valid productId is required for all items');
  }
  if (new Set(productIds).size !== productIds.length) {
    throw new ApiError(400, 'Duplicate products detected in checkout payload');
  }

  // Validate quantities
  for (const item of items) {
    if (typeof item.quantity !== 'number' || item.quantity <= 0) {
      throw new ApiError(400, 'Quantity must be greater than zero');
    }
    if (item.discountAmount !== undefined && (typeof item.discountAmount !== 'number' || item.discountAmount < 0)) {
      throw new ApiError(400, 'Discount amount cannot be negative');
    }
  }

  // Validate payment
  if (!payment || typeof payment !== 'object') {
    throw new ApiError(400, 'Payment object is required');
  }
  const validMethods = ['cash', 'card', 'bank_transfer', 'jazzcash_easypaisa', 'credit'];
  if (!validMethods.includes(payment.method)) {
    throw new ApiError(400, `Invalid payment method. Allowed: ${validMethods.join(', ')}`);
  }
  if (typeof payment.amount !== 'number' || payment.amount < 0) {
    throw new ApiError(400, 'Payment amount must be a positive number');
  }

  try {
    const saleResult = await withTransaction(async (conn) => {
      return await executeCheckoutTransaction(conn, {
        businessId: req.businessId,
        userId: req.user.id,
        customerId,
        items,
        payment,
        note,
      });
    });

    res.status(201).json({
      message: 'Checkout successful',
      sale: saleResult,
    });
  } catch (err) {
    if (err.message?.startsWith('PRODUCT_NOT_FOUND:')) {
      throw new ApiError(400, 'One or more requested products were not found or belong to another store');
    }
    if (err.message?.startsWith('PRODUCT_INACTIVE:')) {
      const name = err.message.split(':')[1];
      throw new ApiError(400, `Product "${name}" is inactive and cannot be sold`);
    }
    if (err.message?.startsWith('INVALID_DISCOUNT:')) {
      const name = err.message.split(':')[1];
      throw new ApiError(400, `Discount amount for "${name}" cannot be negative`);
    }
    if (err.message?.startsWith('DISCOUNT_EXCEEDS_PRICE:')) {
      const name = err.message.split(':')[1];
      throw new ApiError(400, `Discount for "${name}" cannot exceed the item price`);
    }
    if (err.message?.startsWith('INSUFFICIENT_STOCK:')) {
      const name = err.message.split(':')[1];
      throw new ApiError(400, `Insufficient stock for product "${name}"`);
    }
    if (err.message === 'UNDERPAYMENT') {
      throw new ApiError(400, 'Paid amount is less than total amount');
    }
    throw err;
  }
}

/** GET /api/sales — paginated sales history list */
export async function getSales(req, res) {
  const { page, limit, startDate, endDate, search, status } = req.query;

  const result = await findSalesByBusiness(req.businessId, {
    page,
    limit,
    startDate,
    endDate,
    search,
    status,
  });

  res.json(result);
}

/** GET /api/sales/:id — invoice receipt detail */
export async function getSaleDetail(req, res) {
  const { id } = req.params;

  const sale = await findSaleDetailById(req.businessId, id);
  if (!sale) {
    throw new ApiError(404, 'Sale receipt not found');
  }

  res.json({ sale });
}

/** POST /api/sales/returns — process sale return / refund */
export async function postReturn(req, res) {
  const { saleId, items, reason, restock = true } = req.body;

  if (!saleId || typeof saleId !== 'number') {
    throw new ApiError(400, 'Valid saleId is required');
  }
  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'Items array with at least one return item is required');
  }

  for (const item of items) {
    if (!item.saleItemId || typeof item.saleItemId !== 'number') {
      throw new ApiError(400, 'Valid saleItemId is required for each return item');
    }
    if (typeof item.quantity !== 'number' || item.quantity <= 0) {
      throw new ApiError(400, 'Return quantity must be greater than zero');
    }
  }

  try {
    const returnResult = await withTransaction(async (conn) => {
      return await executeReturnTransaction(conn, {
        businessId: req.businessId,
        userId: req.user.id,
        saleId,
        reason,
        items,
        restock: Boolean(restock),
      });
    });

    res.status(200).json({
      message: 'Return processed successfully',
      refund: returnResult,
    });
  } catch (err) {
    if (err.message === 'SALE_NOT_FOUND') {
      throw new ApiError(404, 'Sale receipt not found');
    }
    if (err.message === 'SALE_ALREADY_REFUNDED') {
      throw new ApiError(400, 'This sale has already been fully refunded');
    }
    if (err.message?.startsWith('INVALID_SALE_ITEM:')) {
      throw new ApiError(400, 'One or more sale items are invalid for this invoice');
    }
    if (err.message?.startsWith('RETURN_QTY_EXCEEDED:')) {
      const name = err.message.split(':')[1];
      throw new ApiError(400, `Return quantity exceeds remaining purchased quantity for "${name}"`);
    }
    if (err.message?.startsWith('INVALID_RETURN_QTY:')) {
      throw new ApiError(400, 'Return quantity must be greater than zero');
    }
    throw err;
  }
}
