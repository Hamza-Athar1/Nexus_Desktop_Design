/**
 * db/reset.js — applies db/schema.sql against MySQL from the command line.
 *
 * You're using MySQL Workbench day-to-day, which is fine — just paste
 * db/schema.sql into a new query tab and run it there. This script exists
 * as a faster CLI alternative (`npm run db:reset`) for when you want a
 * clean slate without leaving the terminal, e.g. after pulling a patch
 * that changes the schema.
 *
 * DROPS the nexus_desktop database (see schema.sql line 1) — never point
 * this at anything but your local dev database.
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true, // only ever used here, for the one-shot schema load
  });

  console.log('⏳ Applying db/schema.sql ...');
  await connection.query(schemaSql);
  console.log('✅ Schema applied to nexus_desktop');
  await connection.end();
}

main().catch((err) => {
  console.error('❌ Failed to apply schema:', err.message);
  process.exit(1);
});
