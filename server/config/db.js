import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Connection pool — reused across requests instead of opening a new
// connection every time. This is the standard pattern for mysql2.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Quick sanity check you can call on server startup to confirm
// the DB is reachable before accepting traffic.
export async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('✅ MySQL connected successfully');
    conn.release();
  } catch (err) {
    console.error('❌ MySQL connection failed:', err.message);
    process.exit(1);
  }
}

export default pool;