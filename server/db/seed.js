/**
 * db/seed.js — demo data for Super Admin workflow (Requests + User Management).
 *
 * Seeds:
 *  - superadmin user (super_admin role)
 *  - 8 demo business owners with businesses, matching the mockup screenshots
 *  - shop_requests rows (Phase 5)
 *  - billing columns (bill_amount, bill_due_date, last_paid_at) on businesses
 *  - business_activity_log entries per business (Phase 6)
 *
 * Idempotent: safe to re-run.
 * Usage: npm run db:seed  (after npm run db:reset)
 */
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { pool } from '../config/db.js';

const DEMO_PASSWORD = 'Demo@12345';

function daysAgo(n, extraHours = 0) {
  const ms = Date.now() - n * 24 * 60 * 60 * 1000 - extraHours * 60 * 60 * 1000;
  return new Date(ms).toISOString().slice(0, 19).replace('T', ' ');
}

function dateOffset(daysFromNow) {
  const d = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

// Today = Aug 4 2026. Dates from screenshots:
// Al-Karam Pharmacy:  paid Rs 4,500  expires Aug 14  last paid Jul 17 → +10 days, -18 days
// Piato Bakery:       paid Rs 3,500  expires Sep 12  last paid Jul 17 → +39 days, -18 days
// Fairy Parcel Co.:   overdue Rs 5,200 expires Jul 25 (past)  last paid Jun 20 → -10 days, -45 days
// Green valley:       paid Rs 6,000  expires Aug 20  last paid Jul 14 → +16 days, -21 days
// Rafi Restaurant:    overdue Rs 2,800 expires Jul 10 (past)  last paid May 12 → -25 days, -84 days

const OWNERS = [
  {
    username: 'alkaram_pharmacy',
    fullName: 'Kareem Shahid',
    email: 'owner@alkaramph.pk',
    businessName: 'Al-Karam Pharmacy',
    shopAddress: 'Shop 12, Block C, Gulshan-e-Iqbal',
    cityRegion: 'Karachi',
    moduleCode: 'pharmacy',
    billAmount: 4500,
    billStatus: 'paid',
    businessStatus: 'active',
    billDueDays: +10,
    lastPaidDays: -18,
    posPurchased: 5,
    posActive: 2,
    request: {
      type: 'other',
      title: 'Billing limit increase',
      details: 'Requesting a higher daily billing cap ahead of Ramadan stock-up.',
      status: 'Pending',
      daysAgo: 2,
    },
    activities: [
      { type: 'login',   desc: 'Logged in from Karachi, PK',        daysAgo: 0, hoursAgo: 15 },
      { type: 'edit',    desc: 'Updated shop address',              daysAgo: 18 },
      { type: 'bill',    desc: 'Bill payment received — Rs 4,500',  daysAgo: 18 },
      { type: 'pos',     desc: 'Added new POS terminal',            daysAgo: 26 },
      { type: 'key',     desc: 'Password changed',                  daysAgo: 37 },
    ],
  },
  {
    username: 'piatobakery',
    fullName: 'Sajid Piato',
    email: 'owner@piatobakery.pk',
    businessName: 'Piato Bakery',
    shopAddress: 'Plot 45-B, Commercial Area, DHA Phase 6',
    cityRegion: 'Lahore',
    moduleCode: 'bakery',
    billAmount: 3500,
    billStatus: 'paid',
    businessStatus: 'active',
    billDueDays: +39,
    lastPaidDays: -18,
    posPurchased: 4,
    posActive: 3,
    request: {
      type: 'other',
      title: 'Refund Request',
      details: 'Customer refund for a duplicate subscription charge.',
      status: 'Approved',
      daysAgo: 30,
      note: 'Refund processed, duplicate charge confirmed.',
    },
    activities: [
      { type: 'login', desc: 'Logged in from Lahore, PK',       daysAgo: 0, hoursAgo: 13 },
      { type: 'bill',  desc: 'Bill payment received — Rs 3,500', daysAgo: 18 },
      { type: 'edit',  desc: 'Updated catalog items',            daysAgo: 23 },
    ],
  },
  {
    username: 'fairyparcel',
    fullName: 'Fiza Malik',
    email: 'owner@fairyparcel.pk',
    businessName: 'Fairy Parcel Co.',
    shopAddress: 'Office 302, 3rd Floor, Centaurus Mall',
    cityRegion: 'Islamabad',
    moduleCode: 'general_store',
    billAmount: 5200,
    billStatus: 'overdue',
    businessStatus: 'suspended',
    billDueDays: -10,
    lastPaidDays: -45,
    posPurchased: 3,
    posActive: 1,
    request: {
      type: 'module_change',
      title: 'New module activation',
      details: 'Would like to add gifting/hamper categories to the existing catalog.',
      status: 'Pending',
      daysAgo: 1,
    },
    activities: [
      { type: 'login',  desc: 'Logged in from Islamabad, PK',      daysAgo: 1, hoursAgo: 1 },
      { type: 'bill',   desc: 'Payment reminder sent',             daysAgo: 0, hoursAgo: 15 },
      { type: 'status', desc: 'Shop suspended — reason: Payment overdue', daysAgo: 5 },
      { type: 'key',    desc: 'Password reset requested',          daysAgo: 20 },
    ],
  },
  {
    username: 'greenvalley',
    fullName: 'Tariq Mehmood',
    email: 'owner@greenvalleygrocers.pk',
    businessName: 'Green valley Grocers',
    shopAddress: 'Main Boulevard, Bahria Town',
    cityRegion: 'Rawalpindi',
    moduleCode: 'grocery',
    billAmount: 6000,
    billStatus: 'paid',
    businessStatus: 'active',
    billDueDays: +16,
    lastPaidDays: -21,
    posPurchased: 6,
    posActive: 4,
    request: {
      type: 'plan_upgrade',
      title: 'Plan upgrade request',
      details: 'Moving from the 3-month to the 12-month retention plan.',
      status: 'Pending',
      daysAgo: 4,
    },
    activities: [
      { type: 'edit',  desc: 'Plan upgrade request submitted',    daysAgo: 4 },
      { type: 'login', desc: 'Logged in from Rawalpindi, PK',     daysAgo: 5 },
    ],
  },
  {
    username: 'rafirestaurant',
    fullName: 'Rafiuddin Sheikh',
    email: 'owner@rafirestaurant.pk',
    businessName: 'Rafi Restaurant Co.',
    shopAddress: 'Food Street, near Fort',
    cityRegion: 'Lahore',
    moduleCode: 'restaurant',
    billAmount: 2800,
    billStatus: 'overdue',
    businessStatus: 'blocked',
    billDueDays: -25,
    lastPaidDays: -84,
    posPurchased: 8,
    posActive: 5,
    request: {
      type: 'other',
      title: 'Staff account request',
      details: 'Need 3 additional staff/cashier logins for the new branch.',
      status: 'Pending',
      daysAgo: 5,
    },
    activities: [
      { type: 'status', desc: 'Shop blocked — reason: Billing issue', daysAgo: 10 },
      { type: 'pos',    desc: 'Staff account request submitted',      daysAgo: 5 },
      { type: 'login',  desc: 'Logged in from Lahore, PK',           daysAgo: 6 },
    ],
  },
  {
    username: 'pixeltech',
    fullName: 'Ali Hassan',
    email: 'owner@pixeltech.pk',
    businessName: 'Pixel Tech Solutions',
    shopAddress: 'Plot 22, Blue Area',
    cityRegion: 'Islamabad',
    moduleCode: 'electronics',
    billAmount: 3200,
    billStatus: 'paid',
    businessStatus: 'active',
    billDueDays: +22,
    lastPaidDays: -12,
    posPurchased: 2,
    posActive: 1,
    request: {
      type: 'other',
      title: 'Custom tax receipt setup',
      details: 'Need GST breakdown printed on receipts for corporate customers.',
      status: 'Resubmit',
      daysAgo: 6,
      note: 'Please attach a sample receipt layout before we can configure this.',
    },
    activities: [
      { type: 'bill',  desc: 'Bill payment received — Rs 3,200', daysAgo: 12 },
      { type: 'login', desc: 'Logged in from Islamabad, PK',     daysAgo: 14 },
    ],
  },
  {
    username: 'thegiftery',
    fullName: 'Sara Naz',
    email: 'owner@thegiftery.pk',
    businessName: 'The Giftery',
    shopAddress: 'Shop 5, Zamzama Lane',
    cityRegion: 'Karachi',
    moduleCode: 'general_store',
    billAmount: 2500,
    billStatus: 'paid',
    businessStatus: 'active',
    billDueDays: +28,
    lastPaidDays: -5,
    posPurchased: 2,
    posActive: 2,
    request: {
      type: 'other',
      title: 'Payment method change',
      details: 'Switching the subscription payment method from card to bank transfer.',
      status: 'Approved',
      daysAgo: 17,
      note: 'Confirmed with owner over call, bank details verified.',
    },
    activities: [
      { type: 'bill',  desc: 'Bill payment received — Rs 2,500', daysAgo: 5 },
      { type: 'login', desc: 'Logged in from Karachi, PK',       daysAgo: 7 },
    ],
  },
  {
    username: 'parienhouse',
    fullName: 'Hina Javed',
    email: 'owner@parienhouse.pk',
    businessName: 'Parien House',
    shopAddress: 'Shop 8, Main Market, Gulberg',
    cityRegion: 'Lahore',
    moduleCode: 'clothing',
    billAmount: 4100,
    billStatus: 'paid',
    businessStatus: 'active',
    billDueDays: +30,
    lastPaidDays: -8,
    posPurchased: 3,
    posActive: 2,
    request: {
      type: 'plan_upgrade',
      title: 'Plan Upgrade request',
      details: 'Upgrading to the 6-month plan with inventory backup add-on.',
      status: 'Approved',
      daysAgo: 28,
      note: 'Upgrade applied, next invoice reflects new plan.',
    },
    activities: [
      { type: 'bill',  desc: 'Bill payment received — Rs 4,100', daysAgo: 8 },
      { type: 'login', desc: 'Logged in from Lahore, PK',        daysAgo: 9 },
    ],
  },
];

// ── helpers ──────────────────────────────────────────────────────────────────

async function upsertSuperAdmin() {
  const [existing] = await pool.query(`SELECT id FROM users WHERE username = ?`, ['superadmin']);
  if (existing[0]) return existing[0].id;

  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const [result] = await pool.query(
    `INSERT INTO users (username, email, phone, password_hash, role, status)
     VALUES ('superadmin', 'superadmin@nexus.local', '0300-0000000', ?, 'super_admin', 'active')`,
    [hash]
  );
  console.log(`  ✔ created super_admin -> superadmin / ${DEMO_PASSWORD}`);
  return result.insertId;
}

async function upsertOwner({ username, fullName, email, businessStatus }) {
  const [existing] = await pool.query(`SELECT id FROM users WHERE username = ?`, [username]);
  if (existing[0]) return existing[0].id;

  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const userStatus = businessStatus === 'active' ? 'active' : businessStatus;
  const [result] = await pool.query(
    `INSERT INTO users (username, full_name, email, password_hash, role, status)
     VALUES (?, ?, ?, ?, 'admin', ?)`,
    [username, fullName, email, hash, userStatus]
  );
  return result.insertId;
}

async function upsertBusiness(ownerId, owner) {
  const [existing] = await pool.query(`SELECT id FROM businesses WHERE owner_user_id = ?`, [ownerId]);
  if (existing[0]) {
    // Update billing fields in case seed is rerun after schema change
    await pool.query(
      `UPDATE businesses SET
         bill_amount = ?, bill_status = ?, bill_due_date = ?, last_paid_at = ?,
         status = ?, shop_address = ?, city_region = ?, pos_purchased = ?, pos_active = ?
       WHERE id = ?`,
      [
        owner.billAmount, owner.billStatus,
        dateOffset(owner.billDueDays), dateOffset(owner.lastPaidDays),
        owner.businessStatus, owner.shopAddress, owner.cityRegion,
        owner.posPurchased, owner.posActive,
        existing[0].id,
      ]
    );
    return existing[0].id;
  }

  const [[mod]] = await pool.query(`SELECT id FROM modules WHERE code = ?`, [owner.moduleCode]);
  if (!mod) throw new Error(`Unknown module code "${owner.moduleCode}"`);

  const [result] = await pool.query(
    `INSERT INTO businesses
       (owner_user_id, module_id, name, shop_address, city_region, location,
        is_registered, onboarding_status, terms_accepted_at,
        bill_amount, bill_status, bill_due_date, last_paid_at,
        status, pos_purchased, pos_active)
     VALUES (?, ?, ?, ?, ?, ?, 0, 'completed', NOW(), ?, ?, ?, ?, ?, ?, ?)`,
    [
      ownerId, mod.id, owner.businessName,
      owner.shopAddress, owner.cityRegion, `${owner.cityRegion}, Pakistan`,
      owner.billAmount, owner.billStatus,
      dateOffset(owner.billDueDays), dateOffset(owner.lastPaidDays),
      owner.businessStatus, owner.posPurchased, owner.posActive,
    ]
  );
  return result.insertId;
}

async function upsertRequest(businessId, req, superAdminId) {
  const [existing] = await pool.query(
    `SELECT id FROM shop_requests WHERE business_id = ? AND title = ? LIMIT 1`,
    [businessId, req.title]
  );
  if (existing[0]) return;

  const isReviewed = req.status !== 'Pending';
  const createdAt  = daysAgo(req.daysAgo);
  const reviewedAt = isReviewed ? daysAgo(Math.max(req.daysAgo - 1, 0), 3) : null;

  await pool.query(
    `INSERT INTO shop_requests
       (business_id, request_type, title, details, status,
        reviewed_by_user_id, reviewed_at, rejection_reason, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [businessId, req.type, req.title, req.details ?? null, req.status,
     isReviewed ? superAdminId : null, reviewedAt, req.note ?? null, createdAt]
  );
}

async function upsertActivityLog(businessId, activities) {
  // Only insert if table is empty for this business (idempotent)
  const [existing] = await pool.query(
    `SELECT COUNT(*) AS cnt FROM business_activity_log WHERE business_id = ?`,
    [businessId]
  );
  if (existing[0].cnt > 0) return;

  for (const act of activities) {
    const hours = act.hoursAgo ?? 0;
    const ts = daysAgo(act.daysAgo, hours);
    await pool.query(
      `INSERT INTO business_activity_log (business_id, event_type, description, created_at)
       VALUES (?, ?, ?, ?)`,
      [businessId, act.type, act.desc, ts]
    );
  }
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('⏳  Seeding demo data...');
  const superAdminId = await upsertSuperAdmin();

  for (const owner of OWNERS) {
    const ownerId    = await upsertOwner(owner);
    const businessId = await upsertBusiness(ownerId, owner);
    await upsertRequest(businessId, owner.request, superAdminId);
    await upsertActivityLog(businessId, owner.activities);
    console.log(`  ✔ ${owner.businessName}`);
  }

  console.log(`\n✅  Done! ${OWNERS.length} businesses seeded.`);
  console.log(`   Super admin -> superadmin / ${DEMO_PASSWORD}`);
  console.log(`   Business owners all use the same demo password: ${DEMO_PASSWORD}`);
  await pool.end();
}

main().catch((err) => {
  console.error('❌  Seed failed:', err.message);
  process.exit(1);
});
