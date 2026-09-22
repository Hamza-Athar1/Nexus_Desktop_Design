import { findBusinessWithModuleByUser } from '../models/businessModel.js';

/**
 * Operates on data scoped to a business (products, categories, suppliers, sales, ...).
 * Resolves req.user.id -> their business and attaches:
 *   req.businessId    - for WHERE business_id = ? scoping
 *   req.business       - the full row, incl. module_code/module_name
 *
 * Must run after verifyToken. 403s if no business exists for the user.
 * Supports both admin (owner) and user (staff cashier).
 */
export async function requireBusiness(req, res, next) {
  try {
    const business = await findBusinessWithModuleByUser(req.user.id);
    if (!business) {
      return res.status(403).json({ message: 'No active business associated with this account' });
    }
    req.businessId = business.id;
    req.business = business;
    return next();
  } catch (err) {
    return next(err);
  }
}

