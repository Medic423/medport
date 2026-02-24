/**
 * Run Prisma CLI with DATABASE_URL set from .env.
 * Builds DATABASE_URL from DB_USER, DB_PASSWORD, etc. if set (avoids URL encoding issues).
 * Run from backend folder: node run-prisma.js migrate deploy
 */
const path = require('path');
const { spawnSync } = require('child_process');
const dotenv = require('dotenv');

// Load .env from backend root and prisma folder
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
  const encodedUser = encodeURIComponent(user);
  const encodedPassword = encodeURIComponent(password);
  return `postgresql://${encodedUser}:${encodedPassword}@${host}:${port}/${db}?schema=${schema}`;
}

const url = buildDatabaseUrl();
if (url) process.env.DATABASE_URL = url;

const prismaArgs = process.argv.slice(2);
if (prismaArgs.length === 0) {
  console.error('Usage: node run-prisma.js <prisma-command> [args...]');
  console.error('Example: node run-prisma.js migrate deploy');
  process.exit(1);
}

const result = spawnSync('npx', ['prisma', ...prismaArgs], {
  stdio: 'inherit',
  env: process.env,
  cwd: __dirname,
  shell: true,
});
process.exit(result.status || 0);
