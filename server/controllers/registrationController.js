import { ApiError } from '../utils/ApiError.js';
import { withTransaction } from '../config/db.js';
import {
  findDraftByUser,
  upsertDraft,
  deleteDraftByUser,
} from '../models/registrationDraftModel.js';
import { findBusinessByOwner, createBusiness } from '../models/businessModel.js';
import { createSubscription, addSubscriptionBackupModules } from '../models/subscriptionModel.js';
import {
  getModuleByCode,
  resolveBusinessType,
  getPlanByCode,
  getBackupModulesByCodes,
} from '../models/catalogModel.js';

const VALID_PLATFORMS = ['web_app', 'mobile_pos', 'both'];
const VALID_PAYMENT_METHODS = ['card', 'bank_transfer', 'jazzcash_easypaisa'];

// ── GET /api/registration/draft ───────────────────────────────────────────
export async function getDraft(req, res) {
  const draft = await findDraftByUser(req.user.id);
  res.json({ draft });
}

// ── PUT /api/registration/draft ───────────────────────────────────────────
// Body: { step: 2|3|4, payload: <accumulated wizard state so far> }
// Step 1 (Account) isn't saved here — it's what created the user via
// /auth/signup in the first place.
export async function saveDraft(req, res) {
  const { step, payload } = req.body;

  if (![2, 3, 4].includes(Number(step))) {
    throw new ApiError(400, 'step must be 2, 3, or 4');
  }
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
    throw new ApiError(400, 'payload must be an object');
  }

  const existingBusiness = await findBusinessByOwner(req.user.id);
  if (existingBusiness) {
    throw new ApiError(409, 'You have already completed business setup');
  }

  const draft = await upsertDraft(req.user.id, Number(step), payload);
  res.json({ message: 'Draft saved', draft });
}

// ── POST /api/registration/finish ─────────────────────────────────────────
// Validates everything, then creates businesses + subscriptions +
// subscription_backup_modules atomically, and clears the draft.
//
// Expected body shape:
// {
//   business: { businessName, businessTypeCode|businessType, location,
//               cityRegion, shopAddress, isRegistered, nicNumber },
//   moduleCode: 'pharmacy',
//   subscription: { planCode, platform, paymentMethod, backupModuleCodes: [] }
// }
export async function finishSetup(req, res) {
  const { business, moduleCode, subscription } = req.body;

  if (await findBusinessByOwner(req.user.id)) {
    throw new ApiError(409, 'You have already completed business setup');
  }

  // ── Business details ────────────────────────────────────────────────
  if (!business?.businessName?.trim()) {
    throw new ApiError(400, 'Business name is required');
  }
  if (!business?.location?.trim()) {
    throw new ApiError(400, 'Business location is required');
  }
  const isRegistered = Boolean(business.isRegistered);
  if (isRegistered && !business.nicNumber?.trim()) {
    throw new ApiError(400, 'NIC number is required for a registered business');
  }
  if (isRegistered && !business.cityRegion?.trim()) {
    throw new ApiError(400, 'City/region is required for a registered business');
  }

  // businessTypeCode is the correct field once the frontend has a real
  // dropdown; businessType (free text) is what it sends today. Either works.
  const businessType = business.businessTypeCode
    ? await resolveBusinessType(business.businessTypeCode)
    : await resolveBusinessType(business.businessType);

  // ── Module ───────────────────────────────────────────────────────────
  if (!moduleCode) {
    throw new ApiError(400, 'moduleCode is required');
  }
  const module = await getModuleByCode(moduleCode);
  if (!module) {
    throw new ApiError(400, 'Unknown module');
  }
  if (!module.is_available) {
    throw new ApiError(400, `${module.name} isn't available yet`);
  }

  // ── Subscription ─────────────────────────────────────────────────────
  if (!subscription?.planCode) {
    throw new ApiError(400, 'subscription.planCode is required');
  }
  const plan = await getPlanByCode(subscription.planCode);
  if (!plan) {
    throw new ApiError(400, 'Unknown or inactive plan');
  }

  const platform = subscription.platform || 'web_app';
  if (!VALID_PLATFORMS.includes(platform)) {
    throw new ApiError(400, `platform must be one of: ${VALID_PLATFORMS.join(', ')}`);
  }

  if (!VALID_PAYMENT_METHODS.includes(subscription.paymentMethod)) {
    throw new ApiError(400, `paymentMethod must be one of: ${VALID_PAYMENT_METHODS.join(', ')}`);
  }

  const backupModules = await getBackupModulesByCodes(subscription.backupModuleCodes || []);
  const backupModulesPrice = backupModules.reduce((sum, m) => sum + Number(m.monthly_price), 0);

  // ── All validated — create business + subscription together ───────────
  const result = await withTransaction(async (conn) => {
    const createdBusiness = await createBusiness(conn, {
      ownerUserId: req.user.id,
      moduleId: module.id,
      businessTypeId: businessType?.id ?? null,
      name: business.businessName.trim(),
      location: business.location.trim(),
      cityRegion: business.cityRegion?.trim() || null,
      shopAddress: business.shopAddress?.trim() || null,
      isRegistered,
      nicNumber: isRegistered ? business.nicNumber.trim() : null,
    });

    const subscriptionId = await createSubscription(conn, {
      businessId: createdBusiness.id,
      planId: plan.id,
      platform,
      paymentMethod: subscription.paymentMethod,
      planPrice: plan.monthly_price,
      backupModulesPrice,
    });

    await addSubscriptionBackupModules(conn, subscriptionId, backupModules);

    return { business: createdBusiness, subscriptionId };
  });

  await deleteDraftByUser(req.user.id);

  return res.status(201).json({
    message: 'Business setup complete',
    business: {
      id: result.business.id,
      name: result.business.name,
      moduleCode: module.code,
      status: result.business.status,
      onboardingStatus: result.business.onboarding_status,
    },
    subscription: {
      planCode: plan.code,
      estimatedMonthlyCost: Number(plan.monthly_price) + backupModulesPrice,
      currency: plan.currency,
    },
  });
}
