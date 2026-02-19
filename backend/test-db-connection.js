/**
 * Test PostgreSQL connection using DATABASE_URL from .env
 * Run from backend folder: node test-db-connection.js
 */
const path = require('path');
const dotenv = require('dotenv');
 
// Load .env from backend root and prisma
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, 'prisma', '.env'), override: true });
 
// Build URL from DB_* if set (same logic as run-prisma.js and databaseManager)
if (process.env.DB_USER != null && process.env.DB_PASSWORD !== undefined) {
  const enc = (s) => encodeURIComponent(String(s == null ? '' : s));
  process.env.DATABASE_URL = `postgresql://${enc(process.env.DB_USER)}:${enc(process.env.DB_PASSWORD)}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'postgres'}?schema=${process.env.DB_SCHEMA || 'public'}`;
}
 
const { Client } = require('pg');
 
const url = process.env.DATABASE_URL;
if (!url) {
  console.error('❌ DATABASE_URL is not set. Check backend/.env and backend/prisma/.env');
  process.exit(1);
}
 
// Parse URL to avoid logging full password
const match = url.match(/postgresql:\/\/([^:]+):([^@]+)@([^/]+)\/(.+?)(\?|$)/);
const user = match ? match[1] : '(parse failed)';
const host = match ? match[3] : '(parse failed)';
const db = match ? match[4] : '(parse failed)';
 
console.log('Testing connection...');
console.log('  User:', user);
console.log('  Host:', host);
console.log('  Database:', db);
console.log('  (password is from your .env)\n');
 
const client = new Client({ connectionString: url });
 
client
  .connect()
  .then(() => client.query('SELECT current_database(), current_user'))
  .then((res) => {
    console.log('✅ Connection successful!');
    console.log('   Database:', res.rows[0].current_database);
    console.log('   User:', res.rows[0].current_user);
    return client.end();
  })
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Connection failed:\n', err.message);
    if (err.message.includes('password')) {
      console.error('\n💡 The password in your .env is being rejected by PostgreSQL.');
      console.error('   - Use the password you set when you installed PostgreSQL.');
      console.error('   - If you forgot it, you may need to reset it (see docs below).');
      console.error('   - If the password has special characters, try URL-encoding in backend/prisma/.env (e.g. ! → %21).');
    }
    process.exit(1);
  });