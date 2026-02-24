/**
 * Run prisma/seed.ts with DATABASE_URL set from backend/.env (DB_* or DATABASE_URL).
 * Run from backend folder: npm run db:seed  or  node run-seed.js
 */
const path = require('path');
const { spawnSync } = require('child_process');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, 'prisma', '.env'), override: true });

function buildDatabaseUrl() {
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  if (!user || password === undefined) return process.env.DATABASE_URL;
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '5432';
  const db = process.env.DB_NAME || 'postgres';
  const schema = process.env.DB_SCHEMA || 'public';
  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${db}?schema=${schema}`;
}

const url = buildDatabaseUrl();
if (url) process.env.DATABASE_URL = url;

const result = spawnSync('npx', ['ts-node', 'prisma/seed.ts'], {
  stdio: 'inherit',
  env: process.env,
  cwd: __dirname,
  shell: true,
});
process.exit(result.status || 0);
