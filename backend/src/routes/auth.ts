 import express from 'express';
import { authService } from '../services/authService';
import { authenticateAdmin, authenticateToken, AuthenticatedRequest } from '../middleware/authenticateAdmin';
import { databaseManager } from '../services/databaseManager';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';


const router = express.Router();

/**
 * POST /api/auth/login
 * Admin login endpoint
 */
router.post('/login', async (req, res) => {
  try {
    console.log('TCC_DEBUG: Login request received:', { 
      email: req.body.email, 
      password: req.body.password ? '***' : 'missing',
      body: req.body,
      headers: req.headers
    });
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const result = await authService.login({ email, password });

    if (!result.success) {
      console.log('TCC_DEBUG: Login failed:', result.error);
      return res.status(401).json({
        success: false,
        error: result.error
      });
    }

    // Note: lastLogin is already updated by authService.login() for all user types
    // No need to update again here

    console.log('TCC_DEBUG: Login successful, user ID in token:', result.user?.id);
    // Set HttpOnly cookie for SSE/cookie-based auth
    res.cookie('tcc_token', result.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      message: 'Login successful',
      user: result.user,
      token: result.token,
      mustChangePassword: (result as any).mustChangePassword === true
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * PUT /api/auth/password/change
 * Change password for the authenticated user
 */
router.put('/password/change', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Current and new password are required' });
    }

    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const result = await authService.changePassword({
      email: req.user.email,
      currentPassword,
      newPassword
    });

    if (!result.success) {
      // Weak password or wrong current password → 400; other cases may also respond 400 for simplicity
      return res.status(400).json({ success: false, error: result.error || 'Password change failed' });
    }

    return res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/logout
 * Logout endpoint (client-side token removal)
 */
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

/**
 * GET /api/auth/verify
 * Verify token and get user info
 */
router.get('/verify', authenticateAdmin, (req: AuthenticatedRequest, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

/**
 * POST /api/auth/healthcare/register
 * Register new Healthcare Organization (Public)
 */
router.post('/healthcare/register', async (req, res) => {
  try {
    const {
      email, password, name, facilityName, facilityType,
      address, city, state, zipCode, phone, latitude, longitude, smsOptIn
    } = req.body;

    if (!email || !password || !name || !facilityName || !facilityType) {
      return res.status(400).json({ success: false, error: 'Email, password, name, facilityName, and facilityType are required' });
    }

    const db = databaseManager.getPrismaClient();

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists.' });
    }

    const existingOrg = await db.organization.findFirst({ where: { name: facilityName } });
    if (existingOrg) {
      return res.status(400).json({ success: false, error: 'A facility with this name already exists.' });
    }

    const result = await db.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: facilityName,
          organizationType: 'HEALTHCARE',
          phone: phone || null,
          email,
          address: address || null,
          city: city || null,
          state: state || null,
          zipCode: zipCode || null,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          isActive: true,
          status: 'ACTIVE',
          acceptsNotifications: true,
        }
      });

      const facilityTypeEnum = (facilityType?.toUpperCase()?.replace(/[^A-Z_]/g, '_')) as any;
      const validFacilityTypes = ['HOSPITAL', 'CLINIC', 'NURSING_HOME', 'REHAB_FACILITY', 'URGENT_CARE', 'OTHER'];
      const mappedType = validFacilityTypes.includes(facilityTypeEnum) ? facilityTypeEnum : 'OTHER';

      const facility = await tx.facility.create({
        data: {
          name: facilityName,
          organizationId: org.id,
          facilityType: mappedType,
          address: address || 'Address to be provided',
          city: city || 'City to be provided',
          state: state || 'State to be provided',
          zipCode: zipCode || '00000',
          phone: phone || null,
          email,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          isPrimary: true,
          isActive: true,
        }
      });

      const user = await tx.user.create({
        data: {
          email,
          password: await bcrypt.hash(password, 10),
          name,
          userType: 'ORGANIZATION_USER',
          organizationId: org.id,
          isActive: true,
          mustChangePassword: false,
        }
      });

      // Store notification preference if opted in
      if (smsOptIn === true || smsOptIn === 'true') {
        await tx.userPreference.create({
          data: {
            userId: user.id,
            preferenceType: 'NOTIFICATION_SMS',
            value: { enabled: true },
          }
        });
      }

      return { org, facility, user };
    });

    res.status(201).json({
      success: true,
      message: 'Healthcare organization registration successful. You can log in now.',
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        userType: result.user.userType,
        organizationId: result.org.id,
        isActive: result.user.isActive,
      }
    });

  } catch (error: any) {
    console.error('Healthcare registration error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }
    res.status(500).json({ success: false, error: error.message || 'Registration failed. Please try again.' });
  }
});

/**
 * PUT /api/auth/healthcare/facility/update
 * Update healthcare organization information (Authenticated)
 */
router.put('/healthcare/facility/update', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'User not authenticated' });

    const { facilityName, facilityType, email, phone, address, city, state, zipCode } = req.body;
    const db = databaseManager.getPrismaClient();

    const user = await db.user.findUnique({ where: { id: userId }, select: { organizationId: true } });
    if (!user?.organizationId) return res.status(404).json({ success: false, error: 'Organization not found' });

    const updated = await db.organization.update({
      where: { id: user.organizationId },
      data: { name: facilityName, email, phone, address, city, state, zipCode }
    });

    res.json({ success: true, message: 'Organization information updated successfully', data: updated });
  } catch (error) {
    console.error('Update healthcare facility error:', error);
    res.status(500).json({ success: false, error: 'Failed to update facility information' });
  }
});

/**
 * GET /api/auth/ems/agency/info
 * Get current EMS agency information (Authenticated)
 */
router.get('/ems/agency/info', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'User not authenticated' });

    const db = databaseManager.getPrismaClient();
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { organization: true }
    });

    if (!user?.organization) {
      return res.status(404).json({ success: false, error: 'Organization not found' });
    }

    const org = user.organization;
    const hours = (org.operatingHours as any) || {};

    res.json({
      success: true,
      data: {
        agencyName: org.name,
        contactName: org.contactName || user.name,
        email: org.email || user.email,
        phone: org.phone || '',
        address: org.address || '',
        city: org.city || '',
        state: org.state || '',
        zipCode: org.zipCode || '',
        latitude: org.latitude ?? null,
        longitude: org.longitude ?? null,
        capabilities: Array.isArray(org.capabilities) ? org.capabilities : [],
        operatingHours: { start: hours.start || '00:00', end: hours.end || '23:59' },
        smsNotifications: org.acceptsNotifications ?? true
      }
    });
  } catch (error) {
    console.error('Get EMS agency info error:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve agency information' });
  }
});

/**
 * PUT /api/auth/ems/agency/update
 * Update EMS agency information (Authenticated)
 */
router.put('/ems/agency/update', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'User not authenticated' });

    const db = databaseManager.getPrismaClient();
    const user = await db.user.findUnique({ where: { id: userId }, select: { organizationId: true, email: true } });
    if (!user?.organizationId) return res.status(404).json({ success: false, error: 'Organization not found' });

    const { agencyName, contactName, email, phone, address, city, state, zipCode, latitude, longitude, capabilities, operatingHours, smsNotifications } = req.body;

    const updated = await db.organization.update({
      where: { id: user.organizationId },
      data: {
        name: agencyName,
        contactName,
        email,
        phone,
        address,
        city,
        state,
        zipCode,
        latitude: latitude !== undefined ? latitude : undefined,
        longitude: longitude !== undefined ? longitude : undefined,
        capabilities: capabilities || undefined,
        operatingHours: operatingHours || undefined,
        acceptsNotifications: smsNotifications !== undefined ? smsNotifications : undefined
      }
    });

    let newToken: string | undefined;
    if (email && email !== user.email) {
      await db.user.update({ where: { id: userId }, data: { email } });
      newToken = jwt.sign(
        { id: userId, email, userType: req.user?.userType, organizationId: user.organizationId },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      );
      res.cookie('tcc_token', newToken, {
        httpOnly: true, sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000
      });
    }

    res.json({ success: true, message: 'Agency information updated successfully', data: updated, token: newToken });
  } catch (error) {
    console.error('Update EMS agency error:', error);
    res.status(500).json({ success: false, error: 'Failed to update agency information' });
  }
});

/**
 * GET /api/auth/ems/agency/availability
 * Get EMS agency availability status (Authenticated)
 */
router.get('/ems/agency/availability', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'User not authenticated' });

    const db = databaseManager.getPrismaClient();
    const user = await db.user.findUnique({ where: { id: userId }, select: { organizationId: true } });
    if (!user?.organizationId) return res.status(404).json({ success: false, error: 'Organization not found' });

    const org = await db.organization.findUnique({
      where: { id: user.organizationId },
      select: { availabilityStatus: true }
    });

    const defaultStatus = { isAvailable: false, availableLevels: [] as string[] };
    let availabilityStatus: { isAvailable: boolean; availableLevels: string[] } = defaultStatus;

    if (org?.availabilityStatus) {
      try {
        const raw = typeof org.availabilityStatus === 'string'
          ? JSON.parse(org.availabilityStatus)
          : org.availabilityStatus as any;
        availabilityStatus = {
          isAvailable: raw.isAvailable ?? false,
          availableLevels: Array.isArray(raw.availableLevels) ? raw.availableLevels : []
        };
      } catch { /* use defaults */ }
    }

    res.json({ success: true, data: { availabilityStatus } });
  } catch (error) {
    console.error('Get EMS agency availability error:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve availability status' });
  }
});

/**
 * PUT /api/auth/ems/agency/availability
 * Update EMS agency availability status (Authenticated)
 */
router.put('/ems/agency/availability', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'User not authenticated' });

    const { isAvailable, availableLevels } = req.body;

    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({ success: false, error: 'isAvailable must be a boolean' });
    }
    if (!Array.isArray(availableLevels)) {
      return res.status(400).json({ success: false, error: 'availableLevels must be an array' });
    }

    const validLevels = ['BLS', 'ALS', 'CCT'];
    const invalid = availableLevels.filter((l: string) => !validLevels.includes(l));
    if (invalid.length > 0) {
      return res.status(400).json({ success: false, error: `Invalid levels: ${invalid.join(', ')}` });
    }

    const db = databaseManager.getPrismaClient();
    const user = await db.user.findUnique({ where: { id: userId }, select: { organizationId: true } });
    if (!user?.organizationId) return res.status(404).json({ success: false, error: 'Organization not found' });

    const availabilityStatus = { isAvailable, availableLevels };
    await db.organization.update({
      where: { id: user.organizationId },
      data: { availabilityStatus }
    });

    res.json({ success: true, message: 'Availability status updated successfully', data: { availabilityStatus } });
  } catch (error: any) {
    console.error('Update EMS agency availability error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Agency not found' });
    }
    res.status(500).json({ success: false, error: 'Failed to update availability status' });
  }
});

/**
 * POST /api/auth/ems/register
 * Register new EMS Agency (Public)
 */
router.post('/ems/register', async (req, res) => {
  try {
    const {
      email, password, name, agencyName, serviceArea,
      address, city, state, zipCode, phone, latitude, longitude,
      capabilities, operatingHours, smsOptIn
    } = req.body;

    if (!email || !password || !name || !agencyName) {
      return res.status(400).json({ success: false, error: 'Email, password, name, and agencyName are required' });
    }

    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return res.status(400).json({ success: false, error: 'Invalid latitude or longitude coordinates' });
      }
    }

    const db = databaseManager.getPrismaClient();

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists.' });
    }

    const existingOrg = await db.organization.findFirst({ where: { name: agencyName }, select: { id: true } });
    if (existingOrg) {
      return res.status(400).json({ success: false, error: 'An agency with this name already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const acceptsNotifications = smsOptIn !== undefined ? (smsOptIn === true || smsOptIn === 'true') : true;

    const result = await db.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: agencyName,
          organizationType: 'EMS',
          contactName: name,
          phone: phone || '',
          email,
          address: address || '',
          city: city || '',
          state: state || '',
          zipCode: zipCode || '',
          serviceArea: serviceArea || [],
          capabilities: capabilities || [],
          operatingHours: operatingHours || null,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          acceptsNotifications,
          isActive: true,
          status: 'ACTIVE'
        }
      });

      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          userType: 'ORGANIZATION_USER',
          organizationId: organization.id,
          isActive: true,
          mustChangePassword: false
        }
      });

      if (acceptsNotifications) {
        await tx.userPreference.create({
          data: { userId: user.id, preferenceType: 'NOTIFICATION_SMS', value: { enabled: true } }
        });
      }

      return { organization, user };
    });

    res.status(201).json({
      success: true,
      message: 'EMS agency registration successful',
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        userType: result.user.userType,
        isActive: result.user.isActive
      }
    });
  } catch (error: any) {
    console.error('EMS registration error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }
    res.status(500).json({ success: false, error: error.message || 'Registration failed. Please try again.' });
  }
});

/**
 * POST /api/auth/register
 * Register new user (Admin only)
 */
router.post('/register', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    if (req.user?.userType !== 'SYSTEM_ADMIN') {
      return res.status(403).json({ success: false, error: 'Only administrators can create new users' });
    }

    const { email, password, name, userType, organizationId } = req.body;

    if (!email || !password || !name || !userType) {
      return res.status(400).json({ success: false, error: 'Email, password, name, and userType are required' });
    }

    const validTypes = ['SYSTEM_ADMIN', 'ORGANIZATION_USER', 'FACILITY_USER'];
    if (!validTypes.includes(userType)) {
      return res.status(400).json({ success: false, error: `userType must be one of: ${validTypes.join(', ')}` });
    }

    const user = await authService.createUser({ email, password, name, userType, organizationId });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: { id: user.id, email: user.email, name: user.name, userType: user.userType }
    });
  } catch (error: any) {
    console.error('User registration error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /api/auth/users
 * Get all users (Admin only)
 */
router.get('/users', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    if (req.user?.userType !== 'SYSTEM_ADMIN') {
      return res.status(403).json({ success: false, error: 'Only administrators can view all users' });
    }

    const db = databaseManager.getPrismaClient();
    const users = await db.user.findMany({
      select: {
        id: true, email: true, name: true, userType: true,
        isActive: true, createdAt: true, updatedAt: true, organizationId: true,
        organization: { select: { id: true, name: true, organizationType: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * PATCH /api/auth/admin/users/:domain/:id
 * Update user fields (ADMIN only). :domain is accepted but ignored (backward compat).
 */
router.patch('/admin/users/:domain/:id', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    if (req.user?.userType !== 'SYSTEM_ADMIN') {
      return res.status(403).json({ success: false, error: 'Only administrators can update users' });
    }
    const { id } = req.params as { domain: string; id: string };
    const { userType, isActive } = req.body || {};
    const db = databaseManager.getPrismaClient();

    const data: any = {};
    if (typeof isActive === 'boolean') data.isActive = isActive;
    if (typeof userType === 'string' && ['SYSTEM_ADMIN', 'ORGANIZATION_USER', 'FACILITY_USER'].includes(userType)) {
      data.userType = userType;
    }

    const updated = await db.user.update({
      where: { id },
      data,
      select: { id: true, email: true, name: true, userType: true, isActive: true, organizationId: true }
    });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Admin update user error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(500).json({ success: false, error: 'Failed to update user' });
  }
});

/**
 * Generate temporary password (12 characters: 1 upper, 1 lower, 1 digit, 9 random)
 */
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

/**
 * POST /api/auth/admin/users/:domain/:id/reset-password
 * Reset password for any user (ADMIN only). Generates temporary password.
 * :domain accepted but ignored (backward compat).
 */
router.post('/admin/users/:domain/:id/reset-password', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    if (req.user?.userType !== 'SYSTEM_ADMIN') {
      return res.status(403).json({ success: false, error: 'Only administrators can reset passwords' });
    }
    const { id } = req.params as { domain: string; id: string };
    const db = databaseManager.getPrismaClient();

    const tempPassword = generateTempPassword();
    const hash = await bcrypt.hash(tempPassword, 12);

    const updated = await db.user.update({
      where: { id },
      data: { password: hash, mustChangePassword: true, isActive: true },
      select: { id: true, email: true, name: true, userType: true, isActive: true }
    });

    res.json({ success: true, data: { id: updated.id, email: updated.email, name: updated.name, tempPassword } });
  } catch (error: any) {
    console.error('Admin reset password error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(500).json({ success: false, error: 'Failed to reset password' });
  }
});

/**
 * POST /api/auth/ems/login
 * Legacy EMS login — delegates to unified /login
 */
router.post('/ems/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }
    const result = await authService.login({ email, password });
    if (!result.success) {
      return res.status(401).json({ success: false, error: result.error });
    }
    res.cookie('tcc_token', result.token, {
      httpOnly: true, sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000
    });
    res.json({ success: true, message: 'Login successful', user: result.user, token: result.token, mustChangePassword: (result as any).mustChangePassword === true });
  } catch (error: any) {
    console.error('EMS login error:', error);
    if (error.message === 'Invalid credentials') {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});
/**
 * POST /api/auth/healthcare/login
 * Legacy Healthcare login — delegates to unified /login
 */
router.post('/healthcare/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }
    const result = await authService.login({ email, password });
    if (!result.success) {
      return res.status(401).json({ success: false, error: result.error });
    }
    res.cookie('tcc_token', result.token, {
      httpOnly: true, sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000
    });
    res.json({ success: true, message: 'Login successful', user: result.user, token: result.token, mustChangePassword: (result as any).mustChangePassword === true });
  } catch (error: any) {
    console.error('Healthcare login error:', error);
    if (error.message === 'Invalid credentials') {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
