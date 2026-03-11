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

// List sub-users for the current EMS organization
router.get('/', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    if (!(req.user.userType === 'EMS_ORGANIZATION_USER' || req.user.userType === 'SYSTEM_ADMIN')) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const db = databaseManager.getPrismaClient();

    const whereClause: any = {
      userType: 'EMS_ORGANIZATION_USER',
      userRoles: { some: { role: { name: 'EMS_SUBUSER' } } }
    };
    if (req.user.userType === 'EMS_ORGANIZATION_USER') {
      whereClause.organizationId = req.user.organizationId;
    }

    const users = await db.user.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, name: true, isActive: true, organizationId: true, createdAt: true, updatedAt: true }
    });
    res.json({ success: true, data: users });
  } catch (e) {
    console.error('EMS_SUBUSERS:list error', e);
    res.status(500).json({ success: false, error: 'Failed to list sub-users' });
  }
});

// Create EMS sub-user (EMS_ORGANIZATION_USER with EMS_SUBUSER role within the same organization)
router.post('/', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    if (!(req.user.userType === 'EMS_ORGANIZATION_USER' || req.user.userType === 'SYSTEM_ADMIN')) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    const { email, name, organizationId: bodyOrgId } = req.body || {};
    if (!email || !name) {
      return res.status(400).json({ success: false, error: 'email and name are required' });
    }

    let orgId: string | undefined;
    if (req.user.userType === 'EMS_ORGANIZATION_USER') {
      orgId = req.user.organizationId;
    } else {
      orgId = bodyOrgId;
      if (!orgId) {
        return res.status(400).json({ success: false, error: 'organizationId is required when creating sub-user as admin' });
      }
    }

    if (!orgId) {
      return res.status(400).json({ success: false, error: 'No organization context found' });
    }

    const db = databaseManager.getPrismaClient();
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Email already in use' });
    }

    const emsSubuserRole = await db.role.findUnique({ where: { name: 'EMS_SUBUSER' } });
    if (!emsSubuserRole) {
      return res.status(500).json({ success: false, error: 'EMS_SUBUSER role not found — run database seed' });
    }

    const tempPassword = generateTempPassword();
    const hash = await bcrypt.hash(tempPassword, 12);

    const created = await db.user.create({
      data: {
        email,
        password: hash,
        name,
        userType: 'EMS_ORGANIZATION_USER',
        organizationId: orgId,
        isActive: true,
        mustChangePassword: true,
        userRoles: { create: { roleId: emsSubuserRole.id, organizationId: orgId } }
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
    if (!(req.user.userType === 'EMS_ORGANIZATION_USER' || req.user.userType === 'SYSTEM_ADMIN')) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    const { id } = req.params;
    const { name, isActive } = req.body || {};

    const db = databaseManager.getPrismaClient();
    const sub = await db.user.findFirst({ where: { id, userRoles: { some: { role: { name: 'EMS_SUBUSER' } } } } });
    if (!sub) {
      return res.status(404).json({ success: false, error: 'Sub-user not found' });
    }

    if (req.user.userType === 'EMS_ORGANIZATION_USER' && sub.organizationId !== req.user.organizationId) {
      return res.status(403).json({ success: false, error: 'Forbidden: You can only update your own sub-users' });
    }

    const updated = await db.user.update({
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
    if (!(req.user.userType === 'EMS_ORGANIZATION_USER' || req.user.userType === 'SYSTEM_ADMIN')) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    const { id } = req.params;

    const db = databaseManager.getPrismaClient();
    const sub = await db.user.findFirst({ where: { id, userRoles: { some: { role: { name: 'EMS_SUBUSER' } } } } });
    if (!sub) {
      return res.status(404).json({ success: false, error: 'Sub-user not found' });
    }

    if (req.user.userType === 'EMS_ORGANIZATION_USER' && sub.organizationId !== req.user.organizationId) {
      return res.status(403).json({ success: false, error: 'Forbidden: You can only reset passwords for your own sub-users' });
    }

    const tempPassword = generateTempPassword();
    const hash = await bcrypt.hash(tempPassword, 12);
    await db.user.update({ where: { id }, data: { password: hash, mustChangePassword: true, isActive: true } });

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
    if (!(req.user.userType === 'EMS_ORGANIZATION_USER' || req.user.userType === 'SYSTEM_ADMIN')) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    const { id } = req.params;
    const db = databaseManager.getPrismaClient();
    const sub = await db.user.findFirst({ where: { id, userRoles: { some: { role: { name: 'EMS_SUBUSER' } } } } });
    if (!sub) {
      return res.status(404).json({ success: false, error: 'Sub-user not found' });
    }

    if (req.user.userType === 'EMS_ORGANIZATION_USER' && sub.organizationId !== req.user.organizationId) {
      return res.status(403).json({ success: false, error: 'Forbidden: You can only delete your own sub-users' });
    }

    await db.user.delete({ where: { id } });
    res.json({ success: true, message: 'Sub-user deleted' });
  } catch (e) {
    console.error('EMS_SUBUSERS:delete error', e);
    res.status(500).json({ success: false, error: 'Failed to delete sub-user' });
  }
});

export default router;
