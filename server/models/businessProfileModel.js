import pool from '../config/db.js';

export async function findProfileByUserId(userId) {
  const [rows] = await pool.query(
    'SELECT * FROM business_profiles WHERE user_id = ? LIMIT 1',
    [userId]
  );
  return rows[0] || null;
}

// Called once, right after signup, so every user has a profile row to
// update later rather than needing to handle "no profile yet" branching
// throughout the app. Seeds business_name/business_type from the
// signup form so the profile isn't empty on first load.
export async function createProfileForUser(userId, { businessName, businessType }) {
  await pool.query(
    `INSERT INTO business_profiles (user_id, business_name, business_type)
     VALUES (?, ?, ?)`,
    [userId, businessName, businessType]
  );
  return findProfileByUserId(userId);
}

// Builds an UPDATE dynamically from whatever fields were actually sent,
// so a partial PUT (e.g. just toggling fbr_enabled) doesn't clobber
// other columns with undefined/null.
export async function updateProfile(userId, fields) {
  const allowedFields = [
    'business_name', 'business_type', 'owner_name', 'phone',
    'license_no', 'logo_url', 'gst_number', 'ntn_number',
    'fbr_enabled', 'auto_gst',
  ];

  const columns = [];
  const values = [];

  for (const key of allowedFields) {
    if (fields[key] !== undefined) {
      columns.push(`${key} = ?`);
      values.push(fields[key]);
    }
  }

  if (columns.length === 0) {
    return findProfileByUserId(userId); // nothing to update
  }

  values.push(userId);
  await pool.query(
    `UPDATE business_profiles SET ${columns.join(', ')} WHERE user_id = ?`,
    values
  );
  return findProfileByUserId(userId);
}

export async function setSelectedModule(userId, moduleId) {
  await pool.query(
    'UPDATE business_profiles SET selected_module = ? WHERE user_id = ?',
    [moduleId, userId]
  );
  return findProfileByUserId(userId);
}

// Used by the admin-approval flow to keep the cached status on the
// profile in sync with the subscriptions table (the source of truth).
export async function setSubscriptionStatus(userId, status) {
  await pool.query(
    'UPDATE business_profiles SET subscription_status = ? WHERE user_id = ?',
    [status, userId]
  );
}