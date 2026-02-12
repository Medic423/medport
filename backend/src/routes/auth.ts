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
      userType: req.user.userType,
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
 * Register new Healthcare Facility (Public)
 */
router.post('/healthcare/register', async (req, res) => {
  try {
    const { 
      email, 
      password, 
      name, 
      facilityName, 
      facilityType,
      manageMultipleLocations, // ✅ NEW: Multi-location flag
      address, 
      city, 
      state, 
      zipCode, 
      phone, 
      latitude, 
      longitude 
    } = req.body;

    if (!email || !password || !name || !facilityName || !facilityType) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, name, facilityName, and facilityType are required'
      });
    }

    // Validate coordinates if provided
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return res.status(400).json({
          success: false,
          error: 'Invalid latitude or longitude coordinates'
        });
      }
    }

    const db = databaseManager.getPrismaClient();
    
    // Check if user already exists
    const existingUser = await db.healthcareUser.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email already exists. Please use a different email or try logging in.'
      });
    }
    
    // Also check if facility name already exists
    const centerDB = databaseManager.getPrismaClient();
    const existingFacility = await centerDB.hospital.findFirst({
      where: { name: facilityName }
    });

    if (existingFacility) {
      return res.status(400).json({
        success: false,
        error: 'A facility with this name already exists. Please use a different facility name.'
      });
    }

    // Determine if this is the first account for this facility (orgAdmin=true for first)
    const existingForFacility = await db.healthcareUser.count({ where: { facilityName } });
    const isFirst = existingForFacility === 0;

    // Use transaction to ensure all records are created atomically
    // This prevents partial registrations if any step fails
    const result = await db.$transaction(async (tx) => {
      // Create new healthcare user
      console.log('MULTI_LOC: Creating healthcare user with manageMultipleLocations:', manageMultipleLocations);
      const user = await tx.healthcareUser.create({
        data: {
          email,
          password: await bcrypt.hash(password, 10),
          name,
          facilityName,
          facilityType,
          manageMultipleLocations: manageMultipleLocations || false, // ✅ NEW: Multi-location flag
          userType: 'HEALTHCARE',
          isActive: true, // Active by default; trial/payment can auto-deactivate at end of free trial
          orgAdmin: isFirst
        }
      });

      // Also create a corresponding Hospital record in Center database for TCC dashboard
      // Note: db and centerDB use the same connection, so this is in the same transaction
      await tx.hospital.create({
        data: {
          name: facilityName,
          address: address || 'Address to be provided',
          city: city || 'City to be provided',
          state: state || 'State to be provided',
          zipCode: zipCode || '00000',
          phone: phone || null,
          email: email,
          type: facilityType,
          capabilities: [], // Will be updated when approved
          region: 'Region to be determined',
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          isActive: true, // Active by default; trial/payment can auto-deactivate at end of free trial
          requiresReview: false
        }
      });

      // Create a healthcareLocation record so it appears in Facilities List (even if inactive)
      // This allows admins to see and approve pending facilities
      const location = await tx.healthcareLocation.create({
        data: {
          healthcareUserId: user.id,
          locationName: facilityName,
          address: address || 'Address to be provided',
          city: city || 'City to be provided',
          state: state || 'State to be provided',
          zipCode: zipCode || '00000',
          phone: phone || null,
          facilityType: facilityType,
          isActive: true, // Active by default; trial/payment can auto-deactivate at end of free trial
          isPrimary: true, // First location is always primary
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
        }
      });

      return { user, location };
    });

    const { user, location } = result;
    console.log('MULTI_LOC: Successfully created user, hospital, and healthcareLocation in transaction');

    res.status(201).json({
      success: true,
      message: 'Healthcare facility registration successful. You can log in now.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        facilityName: user.facilityName,
        facilityType: user.facilityType,
        userType: user.userType,
        isActive: user.isActive
      }
    });

  } catch (error: any) {
    console.error('Healthcare registration error:', error);
    console.error('Healthcare registration error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    });
    
    // Handle Prisma unique constraint violations
    if (error.code === 'P2002') {
      const target = error.meta?.target;
      if (target && target.includes('email')) {
        return res.status(400).json({
          success: false,
          error: 'An account with this email already exists. Please use a different email or try logging in.'
        });
      }
      if (target && target.includes('name')) {
        return res.status(400).json({
          success: false,
          error: 'A facility with this name already exists. Please use a different facility name.'
        });
      }
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }

    // Return more detailed error for debugging
    const errorResponse: any = {
      success: false,
      error: error.message || 'Registration failed. Please try again.'
    };
    
    // Include error code for debugging
    if (error.code) {
      errorResponse.code = error.code;
    }
    
    // Include Prisma error details if available
    if (error.meta) {
      errorResponse.meta = error.meta;
    }

    console.error('TCC_DEBUG: Sending error response:', JSON.stringify(errorResponse, null, 2));
    
    // Return 400 for validation errors, 500 for server errors
    const statusCode = error.code && error.code.startsWith('P') ? 400 : 500;
    res.status(statusCode).json(errorResponse);
  }
});

/**
 * PUT /api/auth/healthcare/facility/update
 * Update healthcare facility information (Authenticated)
 */
router.put('/healthcare/facility/update', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('TCC_DEBUG: Healthcare facility update request received:', {
      userId: req.user?.id,
      userType: req.user?.userType,
      body: req.body
    });

    const userId = req.user?.id;
    if (!userId) {
      console.log('TCC_DEBUG: No user ID found in request');
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const updateData = req.body;
    console.log('TCC_DEBUG: Update data received:', updateData);

    const hospitalDB = databaseManager.getPrismaClient();
    const centerDB = databaseManager.getPrismaClient();

    console.log('TCC_DEBUG: Attempting to update healthcare user record...');
    
    // Update healthcare user record
    const updatedUser = await hospitalDB.healthcareUser.update({
      where: { id: userId },
      data: {
        facilityName: updateData.facilityName,
        facilityType: updateData.facilityType,
        email: updateData.email,
        updatedAt: new Date()
      }
    });

    console.log('TCC_DEBUG: Healthcare user updated successfully:', updatedUser);

    console.log('TCC_DEBUG: Attempting to update Hospital record in Center database...');
    
    // Also update the corresponding Hospital record in Center database
    const hospitalUpdateResult = await centerDB.hospital.updateMany({
      where: { email: updatedUser.email },
      data: {
        name: updateData.facilityName,
        type: updateData.facilityType,
        email: updateData.email,
        phone: updateData.phone,
        address: updateData.address,
        city: updateData.city,
        state: updateData.state,
        zipCode: updateData.zipCode,
        updatedAt: new Date()
      }
    });

    console.log('TCC_DEBUG: Hospital record update result:', hospitalUpdateResult);

    res.json({
      success: true,
      message: 'Facility information updated successfully',
      data: updatedUser
    });

  } catch (error) {
    console.error('TCC_DEBUG: Update healthcare facility error:', error);
    console.error('TCC_DEBUG: Error stack:', (error as Error).stack);
    res.status(500).json({
      success: false,
      error: 'Failed to update facility information'
    });
  }
});

/**
 * GET /api/auth/ems/agency/info
 * Get current EMS agency information (Authenticated)
 */
router.get('/ems/agency/info', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('TCC_DEBUG: GET /api/auth/ems/agency/info - Request received');
    console.log('TCC_DEBUG: User:', { id: req.user?.id, email: req.user?.email, userType: req.user?.userType });
    
    if (!req.user?.email) {
      console.log('TCC_DEBUG: No user email found');
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const db = databaseManager.getPrismaClient();
    const centerDB = databaseManager.getPrismaClient();

    // Find EMS user by email
    console.log('TCC_DEBUG: Looking up EMS user by email:', req.user.email);
    const emsUser = await db.eMSUser.findUnique({
      where: { email: req.user.email }
    });

    if (!emsUser) {
      console.log('TCC_DEBUG: EMS user not found');
      return res.status(404).json({
        success: false,
        error: 'EMS user not found'
      });
    }

    console.log('TCC_DEBUG: Found EMS user:', { id: emsUser.id, agencyId: emsUser.agencyId, agencyName: emsUser.agencyName });

    // Find agency record - try by agencyId first, then email fallback
    const agencyId = emsUser.agencyId;
    let agency = null;
    
    // First try to find by agencyId
    if (agencyId) {
      console.log('TCC_DEBUG: Looking up agency by agencyId:', agencyId);
      try {
        agency = await centerDB.eMSAgency.findUnique({
          where: { id: agencyId }
        });
        console.log('TCC_DEBUG: Agency lookup result:', agency ? 'found' : 'not found');
      } catch (agencyError: any) {
        console.error('TCC_DEBUG: Error looking up agency by ID:', agencyError.message);
        // Continue to fallback
      }
    }
    
    // Fallback to email lookup if not found by agencyId
    if (!agency) {
      console.log('TCC_DEBUG: Trying fallback lookup by email:', emsUser.email);
      try {
        agency = await centerDB.eMSAgency.findFirst({
          where: { email: emsUser.email }
        });
        console.log('TCC_DEBUG: Email lookup result:', agency ? 'found' : 'not found');
      } catch (emailError: any) {
        console.error('TCC_DEBUG: Error looking up agency by email:', emailError.message);
      }
    }

    if (!agency) {
      console.log('TCC_DEBUG: No agency found, returning user data only');
      // Return user data with empty agency fields
      return res.json({
        success: true,
        data: {
          agencyName: emsUser.agencyName,
          contactName: emsUser.name,
          email: emsUser.email,
          phone: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          capabilities: [],
          operatingHours: {
            start: '00:00',
            end: '23:59'
          },
          smsNotifications: true // Default to true if no agency found
        }
      });
    }

    console.log('TCC_DEBUG: Found agency:', { id: agency.id, name: agency.name });

    // Parse operating hours - handle both string and JSON
    let operatingHoursStart = '00:00';
    let operatingHoursEnd = '23:59';
    
    try {
      if (agency.operatingHours) {
        let operatingHoursStr = '';
        
        // Handle JSON format
        if (typeof agency.operatingHours === 'object') {
          operatingHoursStr = JSON.stringify(agency.operatingHours);
        } else {
          operatingHoursStr = String(agency.operatingHours);
        }
        
        // Try to parse time range format "00:00 - 23:59"
        const match = operatingHoursStr.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
        if (match) {
          operatingHoursStart = match[1];
          operatingHoursEnd = match[2];
        } else if (operatingHoursStr.includes('24/7') || operatingHoursStr.includes('24-7')) {
          operatingHoursStart = '00:00';
          operatingHoursEnd = '23:59';
        }
      }
    } catch (hoursError: any) {
      console.error('TCC_DEBUG: Error parsing operating hours:', hoursError.message);
      // Use defaults
    }

    const responseData = {
      success: true,
      data: {
        agencyName: agency.name,
        contactName: agency.contactName || emsUser.name,
        email: agency.email || emsUser.email,
        phone: agency.phone || '',
        address: agency.address || '',
        city: agency.city || '',
        state: agency.state || '',
        zipCode: agency.zipCode || '',
        latitude: agency.latitude || null,
        longitude: agency.longitude || null,
        capabilities: Array.isArray(agency.capabilities) ? agency.capabilities : [],
        operatingHours: {
          start: operatingHoursStart,
          end: operatingHoursEnd
        },
        smsNotifications: agency?.acceptsNotifications ?? true // Map acceptsNotifications to smsNotifications for frontend (using optional chaining for safety)
      }
    };

    console.log('TCC_DEBUG: Returning agency info successfully');
    res.json(responseData);
  } catch (error: any) {
    console.error('TCC_DEBUG: Get EMS agency info error:', error);
    console.error('TCC_DEBUG: Error stack:', error.stack);
    console.error('TCC_DEBUG: Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve agency information',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * PUT /api/auth/ems/agency/update
 * Update EMS agency information (Authenticated)
 */
router.put('/ems/agency/update', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  console.log('TCC_DEBUG: EMS AGENCY UPDATE ROUTE HIT!');
  console.log('TCC_DEBUG: Request method:', req.method);
  console.log('TCC_DEBUG: Request URL:', req.url);
  console.log('TCC_DEBUG: Request path:', req.path);
  try {
    console.log('TCC_DEBUG: EMS agency update request received:', {
      userId: req.user?.id,
      userType: req.user?.userType,
      body: req.body
    });
    console.log('TCC_DEBUG: Full request body:', JSON.stringify(req.body, null, 2));

    const userId = req.user?.id;
    if (!userId) {
      console.log('TCC_DEBUG: No user ID found in request');
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const updateData = req.body;
    console.log('TCC_DEBUG: Update data received:', updateData);

    const db = databaseManager.getPrismaClient();
    const centerDB = databaseManager.getPrismaClient();

    console.log('TCC_DEBUG: Attempting to update EMS user record...');
    console.log('TCC_DEBUG: Looking for EMS user by email:', req.user?.email);
    
    // Find EMS user by email first
    const existingUser = await db.eMSUser.findUnique({
      where: { email: req.user?.email }
    });
    
    if (!existingUser) {
      console.log('TCC_DEBUG: EMS user not found with email:', req.user?.email);
      return res.status(404).json({
        success: false,
        error: 'EMS user not found'
      });
    }
    
    console.log('TCC_DEBUG: Found EMS user:', existingUser.id);
    const previousEmail = existingUser.email;
    const agencyId = existingUser.agencyId || existingUser.id;
    
    // Only update email if it's provided and valid (not null/undefined/empty)
    const newEmail = typeof updateData.email === 'string' && updateData.email.trim() !== '' 
      ? updateData.email.trim() 
      : previousEmail;
    const emailChanged = newEmail !== previousEmail;
    
    // Build update data object - only include fields that are provided
    const userUpdateData: any = {
      updatedAt: new Date()
    };
    
    // Only update fields that are provided and valid
    if (updateData.agencyName !== undefined && updateData.agencyName !== null) {
      userUpdateData.agencyName = updateData.agencyName;
    }
    if (updateData.contactName !== undefined && updateData.contactName !== null) {
      userUpdateData.name = updateData.contactName;
    }
    // Always update email (either to new value or keep existing)
    userUpdateData.email = newEmail;
    
    console.log('TCC_DEBUG: Updating EMS user with data:', userUpdateData);
    
    // Update EMS user record using the found user ID
    const updatedUser = await db.eMSUser.update({
      where: { id: existingUser.id },
      data: userUpdateData
    });

    console.log('TCC_DEBUG: EMS user updated successfully:', updatedUser);

    console.log('TCC_DEBUG: Attempting to find existing Agency record in Center database...');
    
    // Check if agency record exists - try by previous email first, then new email, then by agencyId
    let existingAgency = await centerDB.eMSAgency.findFirst({
      where: { email: previousEmail }
    });
    
    if (!existingAgency && newEmail !== previousEmail) {
      existingAgency = await centerDB.eMSAgency.findFirst({
        where: { email: newEmail }
      });
    }
    
    if (!existingAgency && agencyId) {
      existingAgency = await centerDB.eMSAgency.findUnique({
        where: { id: agencyId }
      });
    }

    let agencyUpdateResult;
    if (existingAgency) {
      console.log('TCC_DEBUG: Updating existing Agency record...');
      agencyUpdateResult = await centerDB.eMSAgency.update({
        where: { id: existingAgency.id },
        data: {
          name: updateData.agencyName || existingAgency.name,
          email: newEmail,
          contactName: updateData.contactName || existingAgency.contactName,
          phone: updateData.phone,
          address: updateData.address,
          city: updateData.city,
          state: updateData.state,
          zipCode: updateData.zipCode,
          latitude: updateData.latitude !== undefined ? updateData.latitude : existingAgency.latitude,
          longitude: updateData.longitude !== undefined ? updateData.longitude : existingAgency.longitude,
          serviceArea: updateData.capabilities || [],
          capabilities: updateData.capabilities || [],
          operatingHours: updateData.operatingHours || '24/7',
          acceptsNotifications: updateData.smsNotifications !== undefined ? updateData.smsNotifications : existingAgency.acceptsNotifications, // Map smsNotifications to acceptsNotifications
          updatedAt: new Date()
        }
      });
    } else {
      console.log('TCC_DEBUG: Creating new Agency record...');
      agencyUpdateResult = await centerDB.eMSAgency.create({
        data: {
          name: updateData.agencyName || 'Unknown Agency',
          email: newEmail,
          contactName: updateData.contactName || 'Unknown Contact',
          phone: updateData.phone,
          address: updateData.address,
          city: updateData.city,
          state: updateData.state,
          zipCode: updateData.zipCode,
          latitude: updateData.latitude || null,
          longitude: updateData.longitude || null,
          serviceArea: updateData.capabilities || [],
          capabilities: updateData.capabilities || [],
          operatingHours: updateData.operatingHours || '24/7',
          acceptsNotifications: updateData.smsNotifications !== undefined ? updateData.smsNotifications : true, // Default to true if not specified
          isActive: true,
          status: "ACTIVE"
        }
      });
    }

    console.log('TCC_DEBUG: Agency record operation result:', agencyUpdateResult);

    let newToken: string | undefined;
    if (emailChanged) {
      try {
        newToken = jwt.sign(
          {
            id: agencyId,
            email: updatedUser.email,
            userType: 'EMS',
            agencyId
          },
          process.env.JWT_SECRET || 'fallback-secret',
          { expiresIn: '24h' }
        );
        res.cookie('tcc_token', newToken, {
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 24 * 60 * 60 * 1000
        });
      } catch (tokenError) {
        console.error('TCC_DEBUG: Failed to issue new token after email change:', tokenError);
      }
    }

    const responseUser = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      userType: 'EMS' as const,
      agencyName: updatedUser.agencyName,
      agencyId,
      orgAdmin: !!(updatedUser as any).orgAdmin
    };

    res.json({
      success: true,
      message: 'Agency information updated successfully',
      data: responseUser,
      token: newToken,
      emailChanged
    });

  } catch (error) {
    console.error('TCC_DEBUG: Update EMS agency error:', error);
    console.error('TCC_DEBUG: Error message:', (error as Error).message);
    console.error('TCC_DEBUG: Error code:', (error as any).code);
    console.error('TCC_DEBUG: Error stack:', (error as Error).stack);
    res.status(500).json({
      success: false,
      error: 'Failed to update agency information',
      details: (error as Error).message
    });
  }
});

/**
 * GET /api/auth/ems/agency/availability
 * Get EMS agency availability status (Authenticated)
 */
router.get('/ems/agency/availability', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('TCC_DEBUG: Get EMS agency availability request:', {
      userId: req.user?.id,
      userType: req.user?.userType,
      email: req.user?.email
    });

    if (req.user?.userType !== 'EMS') {
      return res.status(403).json({
        success: false,
        error: 'Access denied: EMS users only'
      });
    }

    const db = databaseManager.getPrismaClient();
    
    // Find EMS user to get agencyId
    const emsUser = await db.eMSUser.findUnique({
      where: { email: req.user.email }
    });

    if (!emsUser) {
      return res.status(404).json({
        success: false,
        error: 'EMS user not found'
      });
    }

    const agencyId = emsUser.agencyId || emsUser.id;
    
    // Find agency
    const agency = await db.eMSAgency.findUnique({
      where: { id: agencyId },
      select: { availabilityStatus: true }
    });

    // Default availability status if not set
    const defaultStatus = {
      isAvailable: false,
      availableLevels: []
    };

    let availabilityStatus = defaultStatus;
    
    if (agency?.availabilityStatus) {
      try {
        // Parse if it's a string, otherwise use as-is
        if (typeof agency.availabilityStatus === 'string') {
          availabilityStatus = JSON.parse(agency.availabilityStatus);
        } else {
          availabilityStatus = agency.availabilityStatus as any;
        }
        
        // Ensure it has the required fields
        if (!availabilityStatus.hasOwnProperty('isAvailable')) {
          availabilityStatus.isAvailable = false;
        }
        if (!Array.isArray(availabilityStatus.availableLevels)) {
          availabilityStatus.availableLevels = [];
        }
      } catch (parseError) {
        console.error('TCC_DEBUG: Error parsing availabilityStatus:', parseError);
        availabilityStatus = defaultStatus;
      }
    }

    res.json({
      success: true,
      data: {
        availabilityStatus
      }
    });

  } catch (error) {
    console.error('TCC_DEBUG: Get EMS agency availability error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve availability status',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

/**
 * PUT /api/auth/ems/agency/availability
 * Update EMS agency availability status (Authenticated)
 */
router.put('/ems/agency/availability', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('TCC_DEBUG: Update EMS agency availability request:', {
      userId: req.user?.id,
      userType: req.user?.userType,
      body: req.body
    });

    if (req.user?.userType !== 'EMS') {
      return res.status(403).json({
        success: false,
        error: 'Access denied: EMS users only'
      });
    }

    const { isAvailable, availableLevels } = req.body;

    // Validate input
    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'isAvailable must be a boolean'
      });
    }

    if (!Array.isArray(availableLevels)) {
      return res.status(400).json({
        success: false,
        error: 'availableLevels must be an array'
      });
    }

    // Validate availableLevels contains only valid values
    const validLevels = ['BLS', 'ALS', 'CCT'];
    const invalidLevels = availableLevels.filter((level: string) => !validLevels.includes(level));
    if (invalidLevels.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Invalid levels: ${invalidLevels.join(', ')}. Valid levels are: ${validLevels.join(', ')}`
      });
    }

    const db = databaseManager.getPrismaClient();
    
    // Find EMS user to get agencyId
    const emsUser = await db.eMSUser.findUnique({
      where: { email: req.user.email }
    });

    if (!emsUser) {
      return res.status(404).json({
        success: false,
        error: 'EMS user not found'
      });
    }

    const agencyId = emsUser.agencyId || emsUser.id;
    
    // Update agency availability status
    const availabilityStatus = {
      isAvailable,
      availableLevels
    };

    await db.eMSAgency.update({
      where: { id: agencyId },
      data: {
        availabilityStatus: availabilityStatus as any,
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Availability status updated successfully',
      data: {
        availabilityStatus
      }
    });

  } catch (error: any) {
    console.error('TCC_DEBUG: Update EMS agency availability error:', error);
    
    // Handle case where agency doesn't exist yet
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Agency not found'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update availability status',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/auth/ems/register
 * Register new EMS Agency (Public)
 */
router.post('/ems/register', async (req, res) => {
  console.log('TCC_DEBUG: EMS registration endpoint called');
  console.log('TCC_DEBUG: Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { 
      email, 
      password, 
      name, 
      agencyName, 
      serviceArea, 
      address, 
      city, 
      state, 
      zipCode, 
      phone, 
      latitude, 
      longitude, 
      capabilities, 
      operatingHours 
    } = req.body;

    console.log('TCC_DEBUG: Extracted fields:', {
      email: email ? 'present' : 'missing',
      password: password ? 'present' : 'missing',
      name: name ? 'present' : 'missing',
      agencyName: agencyName ? 'present' : 'missing',
      serviceArea: serviceArea,
      address: address,
      city: city,
      state: state,
      zipCode: zipCode,
      phone: phone,
      latitude: latitude,
      longitude: longitude,
      capabilities: capabilities,
      operatingHours: operatingHours
    });

    if (!email || !password || !name || !agencyName) {
      console.log('TCC_DEBUG: Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'Email, password, name, and agencyName are required'
      });
    }

    // Validate coordinates if provided
    console.log('TCC_DEBUG: Validating coordinates');
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      
      console.log('TCC_DEBUG: Parsed coordinates:', { lat, lng });
      
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        console.log('TCC_DEBUG: Invalid coordinates');
        return res.status(400).json({
          success: false,
          error: 'Invalid latitude or longitude coordinates'
        });
      }
    }

    console.log('TCC_DEBUG: Getting Prisma client');
    const db = databaseManager.getPrismaClient();
    console.log('TCC_DEBUG: Prisma client obtained');
    
    // Check if user already exists in EMS database
    console.log('TCC_DEBUG: Checking for existing user with email:', email);
    const existingUser = await db.eMSUser.findUnique({
      where: { email }
    });
    console.log('TCC_DEBUG: Existing user check result:', existingUser ? 'found' : 'not found');

    if (existingUser) {
      console.log('TCC_DEBUG: User already exists, returning 400');
      return res.status(400).json({
        success: false,
        error: 'An account with this email already exists. Please use a different email or try logging in.'
      });
    }
    
    // Also check if agency name already exists
    console.log('TCC_DEBUG: Checking for existing agency with name:', agencyName);
    // Use select to only get id field to avoid accessing non-existent columns
    const existingAgency = await db.eMSAgency.findFirst({
      where: { name: agencyName },
      select: { id: true } // Only select id to avoid column issues
    });
    console.log('TCC_DEBUG: Existing agency check result:', existingAgency ? 'found' : 'not found');

    if (existingAgency) {
      console.log('TCC_DEBUG: Agency already exists, returning 400');
      return res.status(400).json({
        success: false,
        error: 'An agency with this name already exists. Please use a different agency name.'
      });
    }

    // Determine if this is the first account for this agency (orgAdmin=true for first)
    console.log('TCC_DEBUG: Checking if first account for agency');
    const existingForAgency = await db.eMSUser.count({ where: { agencyName } });
    const isFirst = existingForAgency === 0;
    console.log('TCC_DEBUG: Is first account:', isFirst);

    // Use transaction to ensure agency and user are created atomically
    // This prevents partial registrations if any step fails
    console.log('TCC_DEBUG: Starting transaction for EMS registration');
    const result = await db.$transaction(async (tx) => {
      // Create EMSAgency record first so we can link the user to it
      console.log('TCC_DEBUG: Creating EMSAgency record');
      
      // Only set fields that definitely exist in production database
      // Don't set addedAt or addedBy as they may not exist
      const agencyData: any = {
        name: agencyName,
        contactName: name,
        phone: phone || 'Phone to be provided',
        email: email,
        address: address || 'Address to be provided',
        city: city || 'City to be provided',
        state: state || 'State to be provided',
        zipCode: zipCode || '00000',
        serviceArea: serviceArea || [],
        capabilities: capabilities || [],
        operatingHours: operatingHours || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        isActive: true, // Auto-approve new EMS registrations
        status: 'ACTIVE', // Set status explicitly
        requiresReview: false // No review needed for auto-approved agencies
        // Note: Not setting addedAt or addedBy as they may not exist in production database
      };
      
      console.log('TCC_DEBUG: Agency data to create:', JSON.stringify(agencyData, null, 2));
      
      // Use SAVEPOINT before Prisma create so we can rollback and try raw SQL if it fails
      // This prevents transaction abort from blocking the raw SQL fallback
      const savepointName = `sp_ems_agency_${Date.now()}`;
      await tx.$executeRawUnsafe(`SAVEPOINT ${savepointName}`);
      console.log('TCC_DEBUG: Savepoint created before Prisma create:', savepointName);
      
      // Always use raw SQL for agency creation to avoid Prisma schema validation issues
      // Production database doesn't have addedBy/addedAt columns that Prisma schema expects
      let agency;
      console.log('TCC_DEBUG: Using raw SQL for agency creation (production schema compatibility)');
      
      try {
            const agencyId = `c${Date.now().toString(36)}${randomBytes(6).toString('hex').substring(0, 10)}`;
            
            // Execute raw SQL - transaction is now in valid state after rollback
            await tx.$executeRaw`
              INSERT INTO ems_agencies (
                id, name, "contactName", phone, email, address, city, state, "zipCode",
                "serviceArea", capabilities, "isActive", status, "createdAt", "updatedAt",
                latitude, longitude, "operatingHours", "requiresReview"
              )
              VALUES (
                ${agencyId},
                ${agencyData.name},
                ${agencyData.contactName},
                ${agencyData.phone},
                ${agencyData.email},
                ${agencyData.address},
                ${agencyData.city},
                ${agencyData.state},
                ${agencyData.zipCode},
                ${agencyData.serviceArea || []}::text[],
                ${agencyData.capabilities || []}::text[],
                ${agencyData.isActive},
                ${agencyData.status},
                NOW(),
                NOW(),
                ${agencyData.latitude || null},
                ${agencyData.longitude || null},
                ${agencyData.operatingHours ? JSON.stringify(agencyData.operatingHours) : null}::jsonb,
                ${agencyData.requiresReview || false}
              )
            `;
            
            console.log('TCC_DEBUG: Raw SQL executed successfully, fetching agency');
            
            // Fetch the created agency using raw SQL to avoid Prisma schema mismatch
            // Prisma's findUnique tries to select all columns including addedBy/addedAt which don't exist in production
            // Use $queryRawUnsafe to have full control and avoid any Prisma schema validation
            const agencyResult = await tx.$queryRawUnsafe(`
              SELECT 
                id, name, "contactName", phone, email, address, city, state, "zipCode",
                "serviceArea", capabilities, "isActive", status, "createdAt", "updatedAt",
                latitude, longitude, "operatingHours", "requiresReview"
              FROM ems_agencies
              WHERE id = $1
            `, agencyId) as Array<{
              id: string;
              name: string;
              contactName: string;
              phone: string;
              email: string;
              address: string;
              city: string;
              state: string;
              zipCode: string;
              serviceArea: string[];
              capabilities: string[];
              isActive: boolean;
              status: string;
              createdAt: Date;
              updatedAt: Date;
              latitude: number | null;
              longitude: number | null;
              operatingHours: any;
              requiresReview: boolean;
            }>;
            
            if (!agencyResult || agencyResult.length === 0) {
              throw new Error('Agency was not created successfully via raw SQL');
            }
            
            // Convert raw SQL result to match Prisma model structure
            const rawAgency = agencyResult[0];
            agency = {
              id: rawAgency.id,
              name: rawAgency.name,
              contactName: rawAgency.contactName,
              phone: rawAgency.phone,
              email: rawAgency.email,
              address: rawAgency.address,
              city: rawAgency.city,
              state: rawAgency.state,
              zipCode: rawAgency.zipCode,
              serviceArea: rawAgency.serviceArea,
              capabilities: rawAgency.capabilities,
              isActive: rawAgency.isActive,
              status: rawAgency.status,
              createdAt: rawAgency.createdAt,
              updatedAt: rawAgency.updatedAt,
              latitude: rawAgency.latitude,
              longitude: rawAgency.longitude,
              operatingHours: rawAgency.operatingHours,
              requiresReview: rawAgency.requiresReview,
              // Add required fields with defaults for Prisma model compatibility
              addedBy: null,
              addedAt: rawAgency.createdAt, // Use createdAt as fallback
              acceptsNotifications: true,
              availableUnits: 0,
              lastUpdated: rawAgency.updatedAt,
              notificationMethods: [],
              totalUnits: 0,
              availabilityStatus: { isAvailable: false, availableLevels: [] }
            } as any; // Type assertion needed because Prisma expects all fields
            
            console.log('TCC_DEBUG: Agency created via raw SQL, ID:', agency.id);
          } catch (rawSqlError: any) {
            console.error('TCC_DEBUG: Raw SQL execution failed:', rawSqlError);
            console.error('TCC_DEBUG: Raw SQL error details:', {
              message: rawSqlError.message,
              code: rawSqlError.code,
              meta: rawSqlError.meta
            });
            
            // If transaction was aborted, we can't recover
            if (rawSqlError.code === 'P2010' || rawSqlError.code === '25P02' ||
                (rawSqlError.message && rawSqlError.message.includes('transaction is aborted'))) {
              throw new Error('Transaction failed during agency creation. Please try again.');
            }
            
            // For other raw SQL errors, throw to rollback transaction
            throw new Error(`Failed to create agency: ${rawSqlError.message || 'Unknown error'}`);
          }

      // Create new EMS user with agencyId linked
      console.log('TCC_DEBUG: Creating EMS user with agencyId:', agency.id);
      console.log('TCC_DEBUG: Hashing password');
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('TCC_DEBUG: Password hashed');
      
      const userData = {
        email,
        password: hashedPassword,
        name,
        agencyName,
        agencyId: agency.id, // Link user to agency
        userType: 'EMS',
        isActive: true, // Auto-approve new EMS registrations
        orgAdmin: isFirst
      };
      
      console.log('TCC_DEBUG: User data to create (password hidden):', {
        ...userData,
        password: '[HIDDEN]'
      });
      
      const user = await tx.eMSUser.create({
        data: userData
      });
      console.log('TCC_DEBUG: User created successfully, ID:', user.id);
      
      return { agency, user };
    });

    const { agency, user } = result;
    console.log('TCC_DEBUG: Transaction completed successfully - agency and user created atomically');

    console.log('TCC_DEBUG: Registration successful, sending response');
    res.status(201).json({
      success: true,
      message: 'EMS agency registration successful - agency is now active and available for trip requests',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        agencyName: user.agencyName,
        userType: user.userType,
        isActive: user.isActive
      }
    });

  } catch (error: any) {
    console.error('EMS registration error:', error);
    console.error('EMS registration error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    });
    
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }

    // Return error details - include code and message for debugging
    // In production, we'll still include the error code so we can diagnose issues
    const errorResponse: any = {
      success: false,
      error: error.message || 'Registration failed. Please try again.',
      code: error.code || 'UNKNOWN_ERROR'
    };
    
    // Include additional details for debugging (even in production for now)
    if (error.meta) {
      errorResponse.meta = error.meta;
    }
    
    // Include Prisma error details if available
    if (error.code && error.code.startsWith('P')) {
      errorResponse.prismaError = true;
      errorResponse.prismaCode = error.code;
    }

    console.error('TCC_DEBUG: Sending error response:', JSON.stringify(errorResponse, null, 2));
    res.status(500).json(errorResponse);
  }
});

/**
 * POST /api/auth/register
 * Register new user (Admin only)
 */
router.post('/register', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    // Only admins can create new users
    if (req.user?.userType !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Only administrators can create new users'
      });
    }

    const { email, password, name, userType } = req.body;

    if (!email || !password || !name || !userType) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, name, and userType are required'
      });
    }

    if (!['ADMIN', 'USER'].includes(userType)) {
      return res.status(400).json({
        success: false,
        error: 'userType must be either ADMIN or USER'
      });
    }

    const user = await authService.createUser({
      email,
      password,
      name,
      userType
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType
      }
    });

  } catch (error: any) {
    console.error('User registration error:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/auth/users
 * Get all users (Admin only)
 */
router.get('/users', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    // Only admins can view all users
    if (req.user?.userType !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Only administrators can view all users'
      });
    }

    const db = (await import('../services/databaseManager')).databaseManager.getPrismaClient();
    const includeSubUsers = (req.query.includeSubUsers as string | undefined) === 'true';
    const onlySubUsers = (req.query.onlySubUsers as string | undefined) === 'true';

    const [centers, healthcare, ems] = await Promise.all([
      db.centerUser.findMany({
        select: { id: true, email: true, name: true, userType: true, isActive: true, createdAt: true, updatedAt: true }
      }),
      db.healthcareUser.findMany({
        select: { id: true, email: true, name: true, userType: true, isActive: true, createdAt: true, updatedAt: true, isSubUser: true, parentUserId: true, facilityName: true, orgAdmin: true }
      }),
      db.eMSUser.findMany({
        select: { id: true, email: true, name: true, userType: true, isActive: true, createdAt: true, updatedAt: true, isSubUser: true, parentUserId: true, agencyName: true, orgAdmin: true }
      })
    ]);

    let all = [
      ...centers.map(u => ({ ...u, domain: 'CENTER', isSubUser: false, parentUserId: null })),
      ...healthcare.map(u => ({ ...u, domain: 'HEALTHCARE' })),
      ...ems.map(u => ({ ...u, domain: 'EMS' }))
    ] as any[];

    if (onlySubUsers) {
      all = all.filter(u => u.isSubUser === true);
    } else if (!includeSubUsers) {
      // Default shows all; configure here if you want to hide sub-users by default
    }

    const parentIds = Array.from(new Set(all.map(u => u.parentUserId).filter(Boolean)));
    const parentMap = new Map<string, any>();
    if (parentIds.length) {
      const [parentHC, parentEMS] = await Promise.all([
        db.healthcareUser.findMany({ where: { id: { in: parentIds } }, select: { id: true, email: true, name: true } }),
        db.eMSUser.findMany({ where: { id: { in: parentIds } }, select: { id: true, email: true, name: true } })
      ]);
      parentHC.forEach(p => parentMap.set(p.id, p));
      parentEMS.forEach(p => parentMap.set(p.id, p));
    }

    const users = all
      .map(u => ({ ...u, parent: u.parentUserId ? (parentMap.get(u.parentUserId) || null) : null }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ success: true, users });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * PATCH /api/auth/admin/users/:domain/:id
 * Update user fields (ADMIN only). Domain: CENTER|HEALTHCARE|EMS
 */
router.patch('/admin/users/:domain/:id', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    if (req.user?.userType !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Only administrators can update users' });
    }
    const { domain, id } = req.params as { domain: string; id: string };
  const { userType, isActive, orgAdmin } = req.body || {};
    const db = (await import('../services/databaseManager')).databaseManager.getPrismaClient();

    let updated: any = null;
    if (domain === 'CENTER') {
      const data: any = {};
      if (typeof userType === 'string') data.userType = userType; // e.g., ADMIN|USER
      if (typeof isActive === 'boolean') data.isActive = isActive;
      updated = await db.centerUser.update({ where: { id }, data, select: { id: true, email: true, name: true, userType: true, isActive: true } });
    } else if (domain === 'HEALTHCARE') {
      const data: any = {};
      if (typeof isActive === 'boolean') data.isActive = isActive;
      if (typeof orgAdmin === 'boolean') data.orgAdmin = orgAdmin;
      // Do NOT allow changing healthcare userType to ADMIN via this route
      updated = await db.healthcareUser.update({ where: { id }, data, select: { id: true, email: true, name: true, userType: true, isActive: true, isSubUser: true, parentUserId: true } });
    } else if (domain === 'EMS') {
      const data: any = {};
      if (typeof isActive === 'boolean') data.isActive = isActive;
      if (typeof orgAdmin === 'boolean') data.orgAdmin = orgAdmin;
      updated = await db.eMSUser.update({ where: { id }, data, select: { id: true, email: true, name: true, userType: true, isActive: true, isSubUser: true, parentUserId: true } });
    } else {
      return res.status(400).json({ success: false, error: 'Invalid domain' });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Admin update user error:', error);
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
 * Domain: CENTER|HEALTHCARE|EMS
 */
router.post('/admin/users/:domain/:id/reset-password', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    if (req.user?.userType !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Only administrators can reset passwords' });
    }
    
    const { domain, id } = req.params as { domain: string; id: string };
    const db = (await import('../services/databaseManager')).databaseManager.getPrismaClient();
    const bcrypt = (await import('bcryptjs')).default;

    // Generate temporary password
    const tempPassword = generateTempPassword();
    const hash = await bcrypt.hash(tempPassword, 12);

    let updated: any = null;
    if (domain === 'CENTER') {
      updated = await db.centerUser.update({
        where: { id },
        data: { password: hash },
        select: { id: true, email: true, name: true, userType: true, isActive: true }
      });
    } else if (domain === 'HEALTHCARE') {
      updated = await db.healthcareUser.update({
        where: { id },
        data: { password: hash, mustChangePassword: true, isActive: true },
        select: { id: true, email: true, name: true, userType: true, isActive: true }
      });
    } else if (domain === 'EMS') {
      updated = await db.eMSUser.update({
        where: { id },
        data: { password: hash, mustChangePassword: true, isActive: true },
        select: { id: true, email: true, name: true, userType: true, isActive: true }
      });
    } else {
      return res.status(400).json({ success: false, error: 'Invalid domain' });
    }

    // Return temp password (one-time display)
    res.json({ 
      success: true, 
      data: { 
        id: updated.id, 
        email: updated.email, 
        name: updated.name,
        tempPassword 
      } 
    });
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
 * EMS Agency login endpoint
 */
router.post('/ems/login', async (req, res) => {
  try {
    console.log('TCC_DEBUG: EMS Login request received:', { 
      email: req.body.email, 
      password: req.body.password ? '***' : 'missing'
    });
    
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const db = databaseManager.getPrismaClient();
    console.log('TCC_DEBUG: Looking for EMS user with email:', email);
    const user = await db.eMSUser.findFirst({
      where: { 
        email,
        isActive: true
      }
    });
    console.log('TCC_DEBUG: EMS user lookup result:', user ? { id: user.id, email: user.email, name: user.name } : 'NOT FOUND');

    if (!user) {
      console.log('TCC_DEBUG: No EMS user found for email:', email);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('TCC_DEBUG: Password match result:', isValidPassword);
    if (!isValidPassword) {
      console.log('TCC_DEBUG: Password mismatch for user:', email);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Update lastLogin and lastActivity timestamps
    console.log('TCC_DEBUG: Updating lastLogin and lastActivity for EMSUser:', { email, userId: user.id });
    const now = new Date();
    try {
      const updateResult = await db.eMSUser.update({
        where: { id: user.id },
        data: { 
          lastLogin: now,
          lastActivity: now  // Also update lastActivity on login
        }
      });
      console.log('TCC_DEBUG: Successfully updated lastLogin and lastActivity for EMSUser:', { email, lastLogin: updateResult.lastLogin, lastActivity: updateResult.lastActivity });
    } catch (err) {
      console.error('TCC_DEBUG: Error updating lastLogin/lastActivity for EMSUser:', err);
      // Don't fail login if update fails
    }

    // For EMS users, use the user ID directly (agency lookup optional)
    const token = jwt.sign(
      { 
        id: user.id, // Use user ID for EMS users
        email: user.email, 
        userType: 'EMS',
        agencyId: user.agencyId || user.id // Include agencyId in JWT for filtering
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    // Set HttpOnly cookie
    res.cookie('tcc_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: 'EMS',
        agencyName: user.agencyName,
        agencyId: user.agencyId || user.id // Use agencyId if available, fallback to user id for legacy
      },
      token,
      mustChangePassword: !!(user as any).mustChangePassword
    });
  } catch (error) {
    console.error('EMS Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/auth/healthcare/login
 * Healthcare Facility login endpoint
 */
router.post('/healthcare/login', async (req, res) => {
  try {
    console.log('TCC_DEBUG: Healthcare Login request received:', { 
      email: req.body.email, 
      password: req.body.password ? '***' : 'missing'
    });
    
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const db = databaseManager.getPrismaClient();
    const user = await db.healthcareUser.findFirst({
      where: { 
        email,
        isActive: true
      }
    });

    if (!user) {
      console.log('TCC_DEBUG: No Healthcare user found for email:', email);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Update lastLogin and lastActivity timestamps
    const now = new Date();
    await db.healthcareUser.update({
      where: { id: user.id },
      data: { 
        lastLogin: now,
        lastActivity: now  // Also update lastActivity on login
      }
    }).catch(err => {
      console.error('Error updating lastLogin/lastActivity for HealthcareUser:', err);
      // Don't fail login if update fails
    });

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        userType: 'HEALTHCARE' 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    // Set HttpOnly cookie
    res.cookie('tcc_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000
    });

    console.log('MULTI_LOC: Healthcare login - manageMultipleLocations:', user.manageMultipleLocations);
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: 'HEALTHCARE',
        facilityName: user.facilityName,
        facilityType: user.facilityType,
        manageMultipleLocations: user.manageMultipleLocations, // ✅ NEW: Multi-location flag
        orgAdmin: (user as any).orgAdmin === true
      },
      token,
      mustChangePassword: !!(user as any).mustChangePassword
    });

  } catch (error) {
    console.error('Healthcare Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
