import { ApiError } from '../utils/ApiError.js';
import { pool, withTransaction } from '../config/db.js';
import {
  findDraftByUser,
  upsertDraft,
  deleteDraftByUser,
} from '../models/registrationDraftModel.js';
import { findBusinessByOwner, createBusiness } from '../models/businessModel.js';
import { createSubscription, addSubscriptionBackupModules } from '../models/subscriptionModel.js';
import { grantThemeEntitlement } from '../models/themeEntitlementModel.js';
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

// ── POST /api/registration/upload-proof ────────────────────────────────────
export async function uploadPaymentProof(req, res) {
  if (!req.file) {
    throw new ApiError(400, 'proofFile is required');
  }
  const proofUrl = `/uploads/proofs/${req.file.filename}`;
  res.json({ ok: true, proofUrl, filename: req.file.filename });
}

// ── POST /api/registration/finish ─────────────────────────────────────────
// Validates everything, then creates businesses + subscriptions +
// first staff + shop_request atomically, and clears the draft.
export async function finishSetup(req, res) {
  const { business, moduleCode, subscription, firstStaff, paymentProofUrl } = req.body;

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

  let paletteIdToUse = null;
  let themePrice = 0;
  let paletteName = 'Default';
  if (business.paletteId) {
    const [pRows] = await pool.query('SELECT id, name, price FROM pos_palettes WHERE id = ? LIMIT 1', [Number(business.paletteId)]);
    if (!pRows[0]) throw new ApiError(400, 'Unknown or invalid palette');
    paletteIdToUse = Number(business.paletteId);
    themePrice = Number(pRows[0].price || 0);
    paletteName = pRows[0].name;
  } else {
    paletteIdToUse = module.palette_id || 1;
    const [pRows] = await pool.query('SELECT name, price FROM pos_palettes WHERE id = ? LIMIT 1', [paletteIdToUse]);
    if (pRows[0]) {
      themePrice = Number(pRows[0].price || 0);
      paletteName = pRows[0].name;
    }
  }

  const totalMonthlyCost = Number(plan.monthly_price) + backupModulesPrice + themePrice;

  // ── First Staff Member (Optional) ────────────────────────────────────
  let staffObj = null;
  if (firstStaff && firstStaff.username?.trim() && firstStaff.password) {
    if (firstStaff.password.length < 6) {
      throw new ApiError(400, 'First staff password must be at least 6 characters');
    }
    const [existingUser] = await pool.query('SELECT id FROM users WHERE username = ? LIMIT 1', [firstStaff.username.trim()]);
    if (existingUser.length > 0) {
      throw new ApiError(409, 'Staff username is already taken');
    }
    const bcrypt = (await import('bcrypt')).default;
    const staffPassHash = await bcrypt.hash(firstStaff.password, 10);
    staffObj = {
      username: firstStaff.username.trim(),
      fullName: firstStaff.fullName?.trim() || firstStaff.username.trim(),
      passwordHash: staffPassHash,
    };
  }

  // ── Payment Proof Status ─────────────────────────────────────────────
  const proofStatus = paymentProofUrl ? 'submitted' : 'not_submitted';

  // ── All validated — create business + subscription + staff + shop_request atomically ───
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
      paletteId: paletteIdToUse,
    });

    // Update payment proof URL and status on business row
    await conn.query(
      'UPDATE businesses SET payment_proof_url = ?, payment_proof_status = ? WHERE id = ?',
      [paymentProofUrl || null, proofStatus, createdBusiness.id]
    );

    // Ensure user has business_id set and status is 'pending' until Super Admin approves
    await conn.query('UPDATE users SET business_id = ?, status = ? WHERE id = ?', [createdBusiness.id, 'pending', req.user.id]);

    const subscriptionId = await createSubscription(conn, {
      businessId: createdBusiness.id,
      planId: plan.id,
      platform,
      paymentMethod: subscription.paymentMethod,
      planPrice: plan.monthly_price,
      backupModulesPrice,
      themePrice,
    });

    await addSubscriptionBackupModules(conn, subscriptionId, backupModules);

    // Grant initial theme entitlement for the selected palette
    await grantThemeEntitlement(createdBusiness.id, paletteIdToUse, themePrice, conn);

    // Create First Staff member if provided (status = 'pending' until business approval)
    if (staffObj) {
      await conn.query(
        `INSERT INTO users (username, email, phone, full_name, password_hash, role, status, business_id)
         VALUES (?, ?, ?, ?, ?, 'user', 'pending', ?)`,
        [
          staffObj.username,
          `${staffObj.username}_${createdBusiness.id}@staff.local`,
          '00000000000',
          staffObj.fullName,
          staffObj.passwordHash,
          createdBusiness.id,
        ]
      );
    }

    // Create Approval Request in shop_requests for Super Admin
    const detailsObj = {
      planName: plan.name,
      planCode: plan.code,
      planPrice: Number(plan.monthly_price),
      themeName: paletteName,
      themePrice,
      backupModulesPrice,
      totalAmount: totalMonthlyCost,
      currency: plan.currency,
      ownerEmail: req.user.email,
      ownerUsername: req.user.username,
      paymentProofUrl: paymentProofUrl || null,
      paymentProofStatus: proofStatus,
      firstStaffUsername: staffObj?.username || null,
      firstStaffFullName: staffObj?.fullName || null,
    };

    await conn.query(
      `INSERT INTO shop_requests (business_id, request_type, title, details, status)
       VALUES (?, 'registration', ?, ?, 'Pending')`,
      [createdBusiness.id, `New Business Registration: ${createdBusiness.name}`, JSON.stringify(detailsObj)]
    );

    return { business: createdBusiness, subscriptionId };
  });

  await deleteDraftByUser(req.user.id);

  return res.status(201).json({
    message: 'Business setup submitted for Super Admin approval',
    business: {
      id: result.business.id,
      name: result.business.name,
      moduleCode: module.code,
      status: 'pending',
      onboardingStatus: result.business.onboarding_status,
      paymentProofStatus: proofStatus,
      paymentProofUrl: paymentProofUrl || null,
    },
    subscription: {
      planCode: plan.code,
      estimatedMonthlyCost: totalMonthlyCost,
      themePrice,
      currency: plan.currency,
    },
  });
}
