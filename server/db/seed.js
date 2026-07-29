/**
 * db/seed.js — demo data for the Super Admin Requests workflow.
 *
 * shop_requests already existed in schema.sql (Section 4), but nothing in
 * the app writes to it yet — there's no business-side "file a request" UI.
 * This script seeds a super_admin login, a handful of demo businesses (one
 * per module) and shop_requests rows so SuperAdminRequestsPage.jsx has real
 * data to exercise locally, roughly matching the original mockup rows.
 *
 * Idempotent: safe to re-run (looks up by unique username / business owner
 * / request title before inserting).
 *
 * Usage: npm run db:seed   (after db:reset / schema.sql has been applied)
 */
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { pool } from '../config/db.js';

const DEMO_PASSWORD = 'Demo@12345';

function daysAgo(n, extraHours = 0) {
  const ms = Date.now() - n * 24 * 60 * 60 * 1000 - extraHours * 60 * 60 * 1000;
  return new Date(ms).toISOString().slice(0, 19).replace('T', ' ');
}

const OWNERS = [
  {
    username: 'alkaram_pharmacy',
    email: 'owner@alkaramph.pk',
    businessName: 'Al-Karam Pharmacy',
    moduleCode: 'pharmacy',
    request: {
      type: 'other',
      title: 'Billing limit increase',
      details: 'Requesting a higher daily billing cap ahead of Ramadan stock-up.',
      status: 'Pending',
      daysAgo: 2,
    },
  },
  {
    username: 'fairyparcel',
    email: 'owner@fairyparcel.pk',
    businessName: 'Fairy Parcel Co.',
    moduleCode: 'general_store',
    request: {
      type: 'module_change',
      title: 'New module activation',
      details: 'Would like to add gifting/hamper categories to the existing catalog.',
      status: 'Pending',
      daysAgo: 1,
    },
  },
  {
    username: 'greenvalley',
    email: 'owner@greenvalleygrocers.pk',
    businessName: 'Green valley Grocers',
    moduleCode: 'grocery',
    request: {
      type: 'plan_upgrade',
      title: 'Plan upgrade request',
      details: 'Moving from the 3-month to the 12-month retention plan.',
      status: 'Pending',
      daysAgo: 4,
    },
  },
  {
    username: 'rafirestaurant',
    email: 'owner@rafirestaurant.pk',
    businessName: 'Rafi Restaurant Co.',
    moduleCode: 'restaurant',
    request: {
      type: 'other',
      title: 'Staff account request',
      details: 'Need 3 additional staff/cashier logins for the new branch.',
      status: 'Pending',
      daysAgo: 5,
    },
  },
  {
    username: 'pixeltech',
    email: 'owner@pixeltech.pk',
    businessName: 'Pixel Tech Solutions',
    moduleCode: 'electronics',
    request: {
      type: 'other',
      title: 'Custom tax receipt setup',
      details: 'Need GST breakdown printed on receipts for corporate customers.',
      status: 'Resubmit',
      daysAgo: 6,
      note: 'Please attach a sample receipt layout before we can configure this.',
    },
  },
  {
    username: 'thegiftery',
    email: 'owner@thegiftery.pk',
    businessName: 'The Giftery',
    moduleCode: 'general_store',
    request: {
      type: 'other',
      title: 'Payment method change',
      details: 'Switching the subscription payment method from card to bank transfer.',
      status: 'Approved',
      daysAgo: 17,
      note: 'Confirmed with owner over call, bank details verified.',
    },
  },
  {
    username: 'piatobakery',
    email: 'owner@piatobakery.pk',
    businessName: 'Piato Bakery',
    moduleCode: 'bakery',
    request: {
      type: 'other',
      title: 'Refund Request',
      details: 'Customer refund for a duplicate subscription charge.',
      status: 'Approved',
      daysAgo: 30,
      note: 'Refund processed, duplicate charge confirmed.',
    },
  },
  {
    username: 'parienhouse',
    email: 'owner@parienhouse.pk',
    businessName: 'Parien House',
    moduleCode: 'clothing',
    request: {
      type: 'plan_upgrade',
      title: 'Plan Upgrade request',
      details: 'Upgrading to the 6-month plan with inventory backup add-on.',
      status: 'Approved',
      daysAgo: 28,
      note: 'Upgrade applied, next invoice reflects new plan.',
    },
  },
];

async function upsertSuperAdmin() {
  const [existing] = await pool.query(`SELECT id FROM users WHERE username = ?`, ['superadmin']);
  if (existing[0]) return existing[0].id;

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const [result] = await pool.query(
    `INSERT INTO users (username, email, phone, password_hash, role, status)
     VALUES (?, ?, ?, ?, 'super_admin', 'active')`,
    ['superadmin', 'superadmin@nexus.local', '0300-0000000', passwordHash]
  );
  console.log(`  created super_admin login -> username: superadmin / password: ${DEMO_PASSWORD}`);
  return result.insertId;
}

async function upsertOwner({ username, email }) {
  const [existing] = await pool.query(`SELECT id FROM users WHERE username = ?`, [username]);
  if (existing[0]) return existing[0].id;

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const [result] = await pool.query(
    `INSERT INTO users (username, email, password_hash, role, status)
     VALUES (?, ?, ?, 'admin', 'active')`,
    [username, email, passwordHash]
  );
  return result.insertId;
}

async function upsertBusiness(ownerId, { businessName, moduleCode }) {
  const [existing] = await pool.query(`SELECT id FROM businesses WHERE owner_user_id = ?`, [ownerId]);
  if (existing[0]) return existing[0].id;

  const [[mod]] = await pool.query(`SELECT id FROM modules WHERE code = ?`, [moduleCode]);
  if (!mod) throw new Error(`Unknown module code "${moduleCode}" — did schema.sql seed data change?`);

  const [result] = await pool.query(
    `INSERT INTO businesses
       (owner_user_id, module_id, name, location, city_region, is_registered, onboarding_status, terms_accepted_at)
     VALUES (?, ?, ?, 'Karachi, Pakistan', 'Karachi, Sindh', 0, 'completed', NOW())`,
    [ownerId, mod.id, businessName]
  );
  return result.insertId;
}

async function upsertRequest(businessId, req, superAdminId) {
  const [existing] = await pool.query(
    `SELECT id FROM shop_requests WHERE business_id = ? AND title = ? LIMIT 1`,
    [businessId, req.title]
  );
  if (existing[0]) return existing[0].id;

  const isReviewed = req.status !== 'Pending';
  const createdAt = daysAgo(req.daysAgo);
  const reviewedAt = isReviewed ? daysAgo(Math.max(req.daysAgo - 1, 0), 3) : null;
  const reviewerId = isReviewed ? superAdminId : null;

  const [result] = await pool.query(
    `INSERT INTO shop_requests
       (business_id, request_type, title, details, status, reviewed_by_user_id, reviewed_at, rejection_reason, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      businessId,
      req.type,
      req.title,
      req.details ?? null,
      req.status,
      reviewerId,
      reviewedAt,
      req.note ?? null,
      createdAt,
    ]
  );
  return result.insertId;
}

async function main() {
  console.log('⏳ Seeding demo requests data...');
  const superAdminId = await upsertSuperAdmin();

  for (const owner of OWNERS) {
    const ownerId = await upsertOwner(owner);
    const businessId = await upsertBusiness(ownerId, owner);
    await upsertRequest(businessId, owner.request, superAdminId);
  }

  console.log(`✅ Seeded ${OWNERS.length} demo businesses + requests.`);
  console.log(`   Super admin login -> username: superadmin / password: ${DEMO_PASSWORD}`);
  console.log(`   (Business owner logins use the same password: ${DEMO_PASSWORD})`);
  await pool.end();
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
