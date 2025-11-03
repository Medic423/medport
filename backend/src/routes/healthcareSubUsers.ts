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

// List sub-users for current healthcare parent user
router.get('/', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    if (!(req.user.userType === 'HEALTHCARE' || req.user.userType === 'ADMIN')) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const db = databaseManager.getPrismaClient();

    // Parent ID is the token id for HEALTHCARE
    const parentId = req.user.id;

    const users = await db.healthcareUser.findMany({
      where: { parentUserId: parentId, isSubUser: true },
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, name: true, isActive: true, createdAt: true, updatedAt: true }
    });

    res.json({ success: true, data: users });
  } catch (e) {
    console.error('HC_SUBUSERS:list error', e);
    res.status(500).json({ success: false, error: 'Failed to list sub-users' });
  }
});

// Create sub-user with temporary password (returned once)
router.post('/', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    if (!(req.user.userType === 'HEALTHCARE' || req.user.userType === 'ADMIN')) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    const { email, name } = req.body || {};
    if (!email || !name) {
      return res.status(400).json({ success: false, error: 'email and name are required' });
    }

    const db = databaseManager.getPrismaClient();
    const existing = await db.healthcareUser.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Email already in use' });
    }

    const tempPassword = generateTempPassword();
    const hash = await bcrypt.hash(tempPassword, 12);

    const created = await db.healthcareUser.create({
      data: {
        email,
        password: hash,
        name,
        facilityName: req.user.facilityName || 'Facility',
        facilityType: 'Healthcare',
        userType: 'HEALTHCARE',
        isActive: true,
        isSubUser: true,
        parentUserId: req.user.id,
        mustChangePassword: true,
      }
    });

    // Return temp password only once
    res.json({ success: true, data: { id: created.id, email: created.email, name: created.name, tempPassword } });
  } catch (e) {
    console.error('HC_SUBUSERS:create error', e);
    res.status(500).json({ success: false, error: 'Failed to create sub-user' });
  }
});

// Update sub-user basic info or deactivate/reactivate
router.patch('/:id', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    if (!(req.user.userType === 'HEALTHCARE' || req.user.userType === 'ADMIN')) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    const { id } = req.params;
    const { name, isActive } = req.body || {};

    const db = databaseManager.getPrismaClient();

    // Ensure ownership
    const sub = await db.healthcareUser.findUnique({ where: { id } });
    if (!sub || sub.parentUserId !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Sub-user not found' });
    }

    const updated = await db.healthcareUser.update({
      where: { id },
      data: {
        ...(typeof name === 'string' ? { name } : {}),
        ...(typeof isActive === 'boolean' ? { isActive } : {}),
      },
      select: { id: true, email: true, name: true, isActive: true }
    });

    res.json({ success: true, data: updated });
  } catch (e) {
    console.error('HC_SUBUSERS:update error', e);
    res.status(500).json({ success: false, error: 'Failed to update sub-user' });
  }
});

// Reset temporary password (returns new temp password once)
router.post('/:id/reset-temp-password', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    if (!(req.user.userType === 'HEALTHCARE' || req.user.userType === 'ADMIN')) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    const { id } = req.params;

    const db = databaseManager.getPrismaClient();
    const sub = await db.healthcareUser.findUnique({ where: { id } });
    if (!sub || sub.parentUserId !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Sub-user not found' });
    }

    const tempPassword = generateTempPassword();
    const hash = await bcrypt.hash(tempPassword, 12);
    await db.healthcareUser.update({
      where: { id },
      data: { password: hash, mustChangePassword: true, isActive: true }
    });

    res.json({ success: true, data: { id, tempPassword } });
  } catch (e) {
    console.error('HC_SUBUSERS:reset error', e);
    res.status(500).json({ success: false, error: 'Failed to reset password' });
  }
});

// Delete sub-user (cascade via FK constraints)
router.delete('/:id', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    if (!(req.user.userType === 'HEALTHCARE' || req.user.userType === 'ADMIN')) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    const { id } = req.params;
    const db = databaseManager.getPrismaClient();
    const sub = await db.healthcareUser.findUnique({ where: { id } });
    if (!sub || sub.parentUserId !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Sub-user not found' });
    }
    await db.healthcareUser.delete({ where: { id } });
    res.json({ success: true, message: 'Sub-user deleted' });
  } catch (e) {
    console.error('HC_SUBUSERS:delete error', e);
    res.status(500).json({ success: false, error: 'Failed to delete sub-user' });
  }
});

export default router;


