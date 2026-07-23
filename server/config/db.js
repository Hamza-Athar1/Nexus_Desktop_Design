/**
 * db.js — MySQL connection pool (raw mysql2, no ORM).
 *
 * We use mysql2/promise directly rather than an ORM because the schema
 * leans on features ORMs don't model well: CHECK constraints, ENUMs,
 * generated VIEWs, and a JSON column used deliberately schemaless
 * (registration_drafts.payload). Query logic lives in models/*.js as
 * plain parameterised SQL.
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nexus_desktop',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  // Return DECIMAL columns as JS numbers instead of strings for money math.
  decimalNumbers: true,
  dateStrings: false,
});

/**
 * Verifies the pool can actually reach MySQL before the HTTP server
 * starts accepting traffic. Fails loudly (and fast) on bad credentials
 * or a database that hasn't been created in Workbench yet, rather than
 * letting every request 500 with a confusing pool error.
 */
export async function testConnection() {
  const conn = await pool.getConnection();
  try {
    await conn.query('SELECT 1');
    console.log('✅ MySQL connection OK');
  } finally {
    conn.release();
  }
}

/**
 * Runs multiple statements inside a single transaction.
 * `work` receives a connection — use it in place of `pool` for every
 * query so all statements share the same transaction.
 *
 * @template T
 * @param {(conn: import('mysql2/promise').PoolConnection) => Promise<T>} work
 * @returns {Promise<T>}
 */
export async function withTransaction(work) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await work(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
