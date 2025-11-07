import express from 'express';
import bcrypt from 'bcryptjs';
import { authenticateAdmin, AuthenticatedRequest } from '../middleware/authenticateAdmin';
import { databaseManager } from '../services/databaseManager';

const router = express.Router();

function generateTempPassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const all = upper + lower + digits;
  let out = '';
  out += upper[Math.floor(Math.random() * upper.length)];
  out += lower[Math.floor(Math.random() * lower.length)];
  out += digits[Math.floor(Math.random() * digits.length)];
  for (let i = 0; i < 9; i++) out += all[Math.floor(Math.random() * all.length)];
  return out;
}

async function getParentEMSUserId(req: AuthenticatedRequest): Promise<string | null> {
  const db = databaseManager.getPrismaClient();
  // EMS tokens use agencyId as id; use email to find user
  if (!req.user?.email) return null;
  const parent = await db.eMSUser.findUnique({ where: { email: req.user.email } });
  return parent?.id || null;
}

// List EMS sub-users
router.get('/', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    if (!(req.user.userType === 'EMS' || req.user.userType === 'ADMIN')) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    const parentId = await getParentEMSUserId(req);
    if (!parentId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const db = databaseManager.getPrismaClient();
    const users = await db.eMSUser.findMany({
      where: { parentUserId: parentId, isSubUser: true },
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, name: true, isActive: true, createdAt: true, updatedAt: true }
    });
    res.json({ success: true, data: users });
  } catch (e) {
    console.error('EMS_SUBUSERS:list error', e);
    res.status(500).json({ success: false, error: 'Failed to list sub-users' });
  }
});

// Create EMS sub-user
router.post('/', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    if (!(req.user.userType === 'EMS' || req.user.userType === 'ADMIN')) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    const { email, name } = req.body || {};
    if (!email || !name) {
      return res.status(400).json({ success: false, error: 'email and name are required' });
    }
    const db = databaseManager.getPrismaClient();

    const parentId = await getParentEMSUserId(req);
    if (!parentId) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const parent = await db.eMSUser.findUnique({ where: { id: parentId } });
    if (!parent) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const existing = await db.eMSUser.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Email already in use' });
    }

    const tempPassword = generateTempPassword();
    const hash = await bcrypt.hash(tempPassword, 12);

    const created = await db.eMSUser.create({
      data: {
        email,
        password: hash,
        name,
        agencyName: parent.agencyName,
        agencyId: parent.agencyId,
        userType: 'EMS',
        isActive: true,
        isSubUser: true,
        parentUserId: parentId,
        mustChangePassword: true,
      }
    });

    res.json({ success: true, data: { id: created.id, email: created.email, name: created.name, tempPassword } });
  } catch (e) {
    console.error('EMS_SUBUSERS:create error', e);
    res.status(500).json({ success: false, error: 'Failed to create sub-user' });
  }
});

// Update EMS sub-user
router.patch('/:id', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    if (!(req.user.userType === 'EMS' || req.user.userType === 'ADMIN')) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    const { id } = req.params;
    const { name, isActive } = req.body || {};

    const parentId = await getParentEMSUserId(req);
    if (!parentId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const db = databaseManager.getPrismaClient();
    const sub = await db.eMSUser.findUnique({ where: { id } });
    if (!sub || sub.parentUserId !== parentId) {
      return res.status(404).json({ success: false, error: 'Sub-user not found' });
    }

    const updated = await db.eMSUser.update({
      where: { id },
      data: {
        ...(typeof name === 'string' ? { name } : {}),
        ...(typeof isActive === 'boolean' ? { isActive } : {}),
      },
      select: { id: true, email: true, name: true, isActive: true }
    });

    res.json({ success: true, data: updated });
  } catch (e) {
    console.error('EMS_SUBUSERS:update error', e);
    res.status(500).json({ success: false, error: 'Failed to update sub-user' });
  }
});

// Reset temp password
router.post('/:id/reset-temp-password', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    if (!(req.user.userType === 'EMS' || req.user.userType === 'ADMIN')) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    const { id } = req.params;

    const parentId = await getParentEMSUserId(req);
    if (!parentId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const db = databaseManager.getPrismaClient();
    const sub = await db.eMSUser.findUnique({ where: { id } });
    if (!sub || sub.parentUserId !== parentId) {
      return res.status(404).json({ success: false, error: 'Sub-user not found' });
    }

    const tempPassword = generateTempPassword();
    const hash = await bcrypt.hash(tempPassword, 12);
    await db.eMSUser.update({ where: { id }, data: { password: hash, mustChangePassword: true, isActive: true } });

    res.json({ success: true, data: { id, tempPassword } });
  } catch (e) {
    console.error('EMS_SUBUSERS:reset error', e);
    res.status(500).json({ success: false, error: 'Failed to reset password' });
  }
});

// Delete EMS sub-user
router.delete('/:id', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    if (!(req.user.userType === 'EMS' || req.user.userType === 'ADMIN')) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    const { id } = req.params;
    const parentId = await getParentEMSUserId(req);
    if (!parentId) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const db = databaseManager.getPrismaClient();
    const sub = await db.eMSUser.findUnique({ where: { id } });
    if (!sub || sub.parentUserId !== parentId) {
      return res.status(404).json({ success: false, error: 'Sub-user not found' });
    }
    await db.eMSUser.delete({ where: { id } });
    res.json({ success: true, message: 'Sub-user deleted' });
  } catch (e) {
    console.error('EMS_SUBUSERS:delete error', e);
    res.status(500).json({ success: false, error: 'Failed to delete sub-user' });
  }
});

export default router;


