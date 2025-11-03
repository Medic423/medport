#!/usr/bin/env node
/*
  Backfill orgAdmin=true for the earliest Healthcare/EMS user per organization.
  - Healthcare: group by facilityName
  - EMS: group by agencyName

  Usage:
    node scripts/backfill-org-admin.js
*/

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function backfillHealthcare() {
  const users = await prisma.healthcareUser.findMany({
    select: { id: true, facilityName: true, createdAt: true, orgAdmin: true },
    where: { isActive: true },
    orderBy: { createdAt: 'asc' }
  });
  const seen = new Set();
  const updates = [];
  for (const u of users) {
    const key = (u.facilityName || '').trim().toLowerCase();
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    if (!u.orgAdmin) {
      updates.push({ id: u.id, facilityName: u.facilityName });
    }
  }
  for (const up of updates) {
    await prisma.healthcareUser.update({ where: { id: up.id }, data: { orgAdmin: true } });
    console.log('[HC] orgAdmin set for first user of facility:', up.facilityName);
  }
  return updates.length;
}

async function backfillEMS() {
  const users = await prisma.eMSUser.findMany({
    select: { id: true, agencyName: true, createdAt: true, orgAdmin: true },
    where: { isActive: true },
    orderBy: { createdAt: 'asc' }
  });
  const seen = new Set();
  const updates = [];
  for (const u of users) {
    const key = (u.agencyName || '').trim().toLowerCase();
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    if (!u.orgAdmin) {
      updates.push({ id: u.id, agencyName: u.agencyName });
    }
  }
  for (const up of updates) {
    await prisma.eMSUser.update({ where: { id: up.id }, data: { orgAdmin: true } });
    console.log('[EMS] orgAdmin set for first user of agency:', up.agencyName);
  }
  return updates.length;
}

(async () => {
  try {
    const hc = await backfillHealthcare();
    const ems = await backfillEMS();
    console.log(`Backfill complete. Healthcare updated: ${hc}, EMS updated: ${ems}`);
  } catch (e) {
    console.error('Backfill failed:', e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();


