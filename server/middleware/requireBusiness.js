import { findBusinessWithModuleByOwner } from '../models/businessModel.js';

/**
 * Every route from Phase 4 onward operates on data scoped to a business
 * (products, categories, suppliers, customers, ...). This resolves
 * req.user.id -> their business and attaches:
 *   req.businessId    - for WHERE business_id = ? scoping
 *   req.business       - the full row, incl. module_code/module_name
 *
 * Must run after verifyToken. 403s if the owner hasn't finished the
 * registration wizard yet (no business exists).
 *
 * NOTE: this only resolves businesses.owner_user_id, i.e. the `admin`
 * role. There is no staff-to-business linking in the schema yet, so a
 * `user`-role account (a cashier/staff login) has no way to reach a
 * business's data through this middleware. That's a real gap — staff
 * accounts aren't creatable yet either, so it hasn't mattered until now,
 * but it will need a `business_staff` table (or a business_id column on
 * users) before role='user' logins are useful for anything.
 */
export async function requireBusiness(req, res, next) {
  try {
    const business = await findBusinessWithModuleByOwner(req.user.id);
    if (!business) {
      return res.status(403).json({ message: 'Finish setting up your business first' });
    }
    req.businessId = business.id;
    req.business = business;
    return next();
  } catch (err) {
    return next(err);
  }
}
