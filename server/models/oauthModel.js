import { pool } from '../config/db.js';

/**
 * Find an OAuth account by provider and provider's unique ID.
 * @param {string} provider - 'google' or 'facebook'
 * @param {string} providerUid - The unique user ID from the provider
 * @returns {Promise<object|null>} The oauth account object if found, otherwise null
 */
export async function findOAuthAccount(provider, providerUid) {
  const [rows] = await pool.query(
    `SELECT * FROM oauth_accounts WHERE provider = ? AND provider_uid = ? LIMIT 1`,
    [provider, providerUid]
  );
  return rows[0] || null;
}

/**
 * Link a user with an OAuth provider account.
 * @param {{userId: number, provider: string, providerUid: string, providerEmail?: string}} params
 * @param {import('mysql2/promise').PoolConnection} [connection] - Optional connection for transaction
 * @returns {Promise<object>} The newly created oauth account record
 */
export async function createOAuthAccount({ userId, provider, providerUid, providerEmail = null }, connection = null) {
  const executor = connection || pool;
  const [result] = await executor.query(
    `INSERT INTO oauth_accounts (user_id, provider, provider_uid, provider_email)
     VALUES (?, ?, ?, ?)`,
    [userId, provider, providerUid, providerEmail]
  );
  const [rows] = await executor.query(
    `SELECT * FROM oauth_accounts WHERE id = ? LIMIT 1`,
    [result.insertId]
  );
  return rows[0];
}
