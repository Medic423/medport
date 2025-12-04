import express from 'express';
import { authService } from '../services/authService';
import { authenticateAdmin, authenticateToken, AuthenticatedRequest } from '../middleware/authenticateAdmin';
import { databaseManager } from '../services/databaseManager';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


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

    const hospitalDB = databaseManager.getPrismaClient();
    
    // Check if user already exists
    const existingUser = await hospitalDB.healthcareUser.findUnique({
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
    const existingForFacility = await hospitalDB.healthcareUser.count({ where: { facilityName } });
    const isFirst = existingForFacility === 0;

    // Create new healthcare user
    console.log('MULTI_LOC: Creating healthcare user with manageMultipleLocations:', manageMultipleLocations);
    const user = await hospitalDB.healthcareUser.create({
      data: {
        email,
        password: await bcrypt.hash(password, 10),
        name,
        facilityName,
        facilityType,
        manageMultipleLocations: manageMultipleLocations || false, // ✅ NEW: Multi-location flag
        userType: 'HEALTHCARE',
        isActive: false, // Requires admin approval
        orgAdmin: isFirst
      }
    });

    // Also create a corresponding Hospital record in Center database for TCC dashboard
    await centerDB.hospital.create({
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
        isActive: false, // Requires admin approval
        requiresReview: true // Flag for admin review
      }
    });

    res.status(201).json({
      success: true,
      message: 'Healthcare facility registration submitted for approval',
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
    
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Registration failed. Please try again.'
    });
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
    if (!req.user?.email) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const db = databaseManager.getPrismaClient();
    const centerDB = databaseManager.getPrismaClient();

    // Find EMS user by email
    const emsUser = await db.eMSUser.findUnique({
      where: { email: req.user.email }
    });

    if (!emsUser) {
      return res.status(404).json({
        success: false,
        error: 'EMS user not found'
      });
    }

    // Find agency record
    const agencyId = emsUser.agencyId || emsUser.id;
    const agency = await centerDB.eMSAgency.findFirst({
      where: { email: emsUser.email }
    });

    if (!agency) {
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
          operatingHours: '24/7'
        }
      });
    }

    // Parse operating hours if it's a string like "00:00 - 23:59"
    let operatingHoursStart = '00:00';
    let operatingHoursEnd = '23:59';
    if (agency.operatingHours) {
      if (typeof agency.operatingHours === 'string') {
        const match = agency.operatingHours.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
        if (match) {
          operatingHoursStart = match[1];
          operatingHoursEnd = match[2];
        } else if (agency.operatingHours !== '24/7') {
          // Try to parse other formats
          operatingHoursStart = '00:00';
          operatingHoursEnd = '23:59';
        }
      }
    }

    res.json({
      success: true,
      data: {
        agencyName: agency.name,
        contactName: agency.contactName,
        email: agency.email,
        phone: agency.phone || '',
        address: agency.address || '',
        city: agency.city || '',
        state: agency.state || '',
        zipCode: agency.zipCode || '',
        latitude: agency.latitude || null,
        longitude: agency.longitude || null,
        capabilities: agency.capabilities || [],
        operatingHours: {
          start: operatingHoursStart,
          end: operatingHoursEnd
        }
      }
    });
  } catch (error) {
    console.error('Get EMS agency info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve agency information'
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
    const emailChanged = typeof updateData.email === 'string' && updateData.email !== previousEmail;
    
    // Update EMS user record using the found user ID
    const updatedUser = await db.eMSUser.update({
      where: { id: existingUser.id },
      data: {
        agencyName: updateData.agencyName,
        email: updateData.email,
        name: updateData.contactName,
        updatedAt: new Date()
      }
    });

    console.log('TCC_DEBUG: EMS user updated successfully:', updatedUser);

    console.log('TCC_DEBUG: Attempting to find existing Agency record in Center database...');
    
    // Check if agency record exists - try by previous email first, then new email, then by agencyId
    let existingAgency = await centerDB.eMSAgency.findFirst({
      where: { email: previousEmail }
    });
    
    if (!existingAgency && updateData.email !== previousEmail) {
      existingAgency = await centerDB.eMSAgency.findFirst({
        where: { email: updateData.email }
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
          name: updateData.agencyName,
          email: updateData.email,
          contactName: updateData.contactName,
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
          updatedAt: new Date()
        }
      });
    } else {
      console.log('TCC_DEBUG: Creating new Agency record...');
      agencyUpdateResult = await centerDB.eMSAgency.create({
        data: {
          name: updateData.agencyName,
          email: updateData.email,
          contactName: updateData.contactName,
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
    if (!req.user?.email) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const db = databaseManager.getPrismaClient();

    // Find EMS user by email
    const emsUser = await db.eMSUser.findUnique({
      where: { email: req.user.email }
    });

    if (!emsUser) {
      return res.status(404).json({
        success: false,
        error: 'EMS user not found'
      });
    }

    // Find agency record - try by email first, then by agencyId
    const agencyId = emsUser.agencyId || emsUser.id;
    let agency = await db.eMSAgency.findFirst({
      where: { email: emsUser.email }
    });

    if (!agency) {
      agency = await db.eMSAgency.findUnique({
        where: { id: agencyId }
      });
    }

    if (!agency) {
      // Return default availability status if agency doesn't exist yet
      return res.json({
        success: true,
        data: {
          availabilityStatus: {
            isAvailable: false,
            availableLevels: []
          }
        }
      });
    }

    // Parse availabilityStatus JSON or return default
    let availabilityStatus = {
      isAvailable: false,
      availableLevels: [] as string[]
    };

    if (agency.availabilityStatus) {
      try {
        const status = typeof agency.availabilityStatus === 'string' 
          ? JSON.parse(agency.availabilityStatus) 
          : agency.availabilityStatus;
        
        availabilityStatus = {
          isAvailable: status.isAvailable || false,
          availableLevels: Array.isArray(status.availableLevels) ? status.availableLevels : []
        };
      } catch (error) {
        console.error('Error parsing availabilityStatus:', error);
        // Use default if parsing fails
      }
    }

    res.json({
      success: true,
      data: {
        availabilityStatus
      }
    });

  } catch (error) {
    console.error('Get EMS agency availability error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve agency availability status'
    });
  }
});

/**
 * PUT /api/auth/ems/agency/availability
 * Update EMS agency availability status (Authenticated)
 */
router.put('/ems/agency/availability', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.email) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Verify user is EMS type
    if (req.user.userType !== 'EMS') {
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

    // Find EMS user by email
    const emsUser = await db.eMSUser.findUnique({
      where: { email: req.user.email }
    });

    if (!emsUser) {
      return res.status(404).json({
        success: false,
        error: 'EMS user not found'
      });
    }

    // Find agency record - try by email first, then by agencyId
    const agencyId = emsUser.agencyId || emsUser.id;
    let agency = await db.eMSAgency.findFirst({
      where: { email: emsUser.email }
    });

    if (!agency) {
      agency = await db.eMSAgency.findUnique({
        where: { id: agencyId }
      });
    }

    if (!agency) {
      return res.status(404).json({
        success: false,
        error: 'EMS agency not found. Please update your agency information first.'
      });
    }

    // Prepare availability status object
    const availabilityStatus = {
      isAvailable,
      availableLevels: availableLevels.filter((level: string) => validLevels.includes(level))
    };

    // Update agency availability status
    const updatedAgency = await db.eMSAgency.update({
      where: { id: agency.id },
      data: {
        availabilityStatus: availabilityStatus,
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Agency availability status updated successfully',
      data: {
        availabilityStatus
      }
    });

  } catch (error) {
    console.error('Update EMS agency availability error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update agency availability status',
      details: (error as Error).message
    });
  }
});

/**
 * POST /api/auth/ems/register
 * Register new EMS Agency (Public)
 */
router.post('/ems/register', async (req, res) => {
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

    if (!email || !password || !name || !agencyName) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, name, and agencyName are required'
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
    
    // Check if user already exists in EMS database
    const existingUser = await db.eMSUser.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email already exists. Please use a different email or try logging in.'
      });
    }
    
    // Also check if agency name already exists
    const existingAgency = await db.eMSAgency.findFirst({
      where: { name: agencyName }
    });

    if (existingAgency) {
      return res.status(400).json({
        success: false,
        error: 'An agency with this name already exists. Please use a different agency name.'
      });
    }

    // Determine if this is the first account for this agency (orgAdmin=true for first)
    const existingForAgency = await db.eMSUser.count({ where: { agencyName } });
    const isFirst = existingForAgency === 0;

    // Create new EMS user
    const user = await db.eMSUser.create({
      data: {
        email,
        password: await bcrypt.hash(password, 10),
        name,
        agencyName,
        userType: 'EMS',
        isActive: true, // Auto-approve new EMS registrations
        orgAdmin: isFirst
      }
    });

    // Also create a corresponding EMSAgency record in Center database for TCC dashboard
    const centerDB = databaseManager.getPrismaClient();
    await centerDB.eMSAgency.create({
      data: {
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
        requiresReview: false // No review needed for auto-approved agencies
      }
    });

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
    
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Registration failed. Please try again.'
    });
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
        where: { isDeleted: false },
        select: { id: true, email: true, name: true, userType: true, isActive: true, createdAt: true, updatedAt: true }
      }),
      db.healthcareUser.findMany({
        where: { isDeleted: false },
        select: { id: true, email: true, name: true, userType: true, isActive: true, createdAt: true, updatedAt: true, isSubUser: true, parentUserId: true, facilityName: true, orgAdmin: true }
      }),
      db.eMSUser.findMany({
        where: { isDeleted: false },
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
 * DELETE /api/auth/admin/users/:domain/:id
 * Soft delete a user (ADMIN only). Domain: CENTER|HEALTHCARE|EMS
 * Soft delete sets isDeleted=true, deletedAt=now(), and isActive=false
 */
router.delete('/admin/users/:domain/:id', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    if (req.user?.userType !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Only administrators can delete users' });
    }
    
    const { domain, id } = req.params as { domain: string; id: string };
    const db = (await import('../services/databaseManager')).databaseManager.getPrismaClient();

    // Check if user exists and get details for validation
    let user: any = null;
    let subUserCount = 0;
    let tripCount = 0;

    if (domain === 'CENTER') {
      user = await db.centerUser.findUnique({ where: { id } });
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      if (user.isDeleted) {
        return res.status(400).json({ success: false, error: 'User is already deleted' });
      }
    } else if (domain === 'HEALTHCARE') {
      user = await db.healthcareUser.findUnique({ where: { id } });
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      if (user.isDeleted) {
        return res.status(400).json({ success: false, error: 'User is already deleted' });
      }
      // Check for sub-users
      subUserCount = await db.healthcareUser.count({ where: { parentUserId: id, isDeleted: false } });
      if (subUserCount > 0) {
        return res.status(400).json({ 
          success: false, 
          error: `Cannot delete user: ${subUserCount} sub-user(s) exist. Please delete sub-users first.` 
        });
      }
      // Count trips created by this user
      tripCount = await db.transportRequest.count({ where: { healthcareCreatedById: id } });
    } else if (domain === 'EMS') {
      user = await db.eMSUser.findUnique({ where: { id } });
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      if (user.isDeleted) {
        return res.status(400).json({ success: false, error: 'User is already deleted' });
      }
      // Check for sub-users
      subUserCount = await db.eMSUser.count({ where: { parentUserId: id, isDeleted: false } });
      if (subUserCount > 0) {
        return res.status(400).json({ 
          success: false, 
          error: `Cannot delete user: ${subUserCount} sub-user(s) exist. Please delete sub-users first.` 
        });
      }
    } else {
      return res.status(400).json({ success: false, error: 'Invalid domain' });
    }

    // Perform soft delete
    const deletedAt = new Date();
    let deleted: any = null;

    if (domain === 'CENTER') {
      deleted = await db.centerUser.update({
        where: { id },
        data: { 
          isDeleted: true,
          deletedAt: deletedAt,
          isActive: false
        },
        select: { id: true, email: true, name: true, userType: true, isActive: true, isDeleted: true, deletedAt: true }
      });
    } else if (domain === 'HEALTHCARE') {
      deleted = await db.healthcareUser.update({
        where: { id },
        data: { 
          isDeleted: true,
          deletedAt: deletedAt,
          isActive: false
        },
        select: { id: true, email: true, name: true, userType: true, isActive: true, isDeleted: true, deletedAt: true }
      });
    } else if (domain === 'EMS') {
      deleted = await db.eMSUser.update({
        where: { id },
        data: { 
          isDeleted: true,
          deletedAt: deletedAt,
          isActive: false
        },
        select: { id: true, email: true, name: true, userType: true, isActive: true, isDeleted: true, deletedAt: true }
      });
    }

    res.json({ 
      success: true, 
      message: 'User deleted successfully',
      data: {
        ...deleted,
        tripsCreated: tripCount,
        subUsersDeleted: subUserCount
      }
    });
  } catch (error: any) {
    console.error('Admin delete user error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(500).json({ success: false, error: 'Failed to delete user' });
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
    
    // First check if user exists at all (including deleted)
    const user = await db.eMSUser.findFirst({
      where: { email }
    });
    console.log('TCC_DEBUG: EMS user lookup result:', user ? { id: user.id, email: user.email, name: user.name, isDeleted: user.isDeleted, isActive: user.isActive } : 'NOT FOUND');

    if (!user) {
      console.log('TCC_DEBUG: No EMS user found for email:', email);
      return res.status(401).json({
        success: false,
        error: 'No account found with this email address. Please check your email or contact support.'
      });
    }

    // Check if user is deleted
    if (user.isDeleted) {
      console.log('TCC_DEBUG: EMS user account has been deleted:', email);
      return res.status(401).json({
        success: false,
        error: 'This account has been deleted. Please contact support if you believe this is an error.'
      });
    }

    // Check if user is inactive
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'This account has been deactivated. Please contact support to reactivate your account.'
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('TCC_DEBUG: Password match result:', isValidPassword);
    if (!isValidPassword) {
      console.log('TCC_DEBUG: Password mismatch for user:', email);
      return res.status(401).json({
        success: false,
        error: 'Incorrect password. Please check your password and try again.'
      });
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
    
    // First check if user exists at all (including deleted)
    const user = await db.healthcareUser.findFirst({
      where: { email }
    });

    if (!user) {
      console.log('TCC_DEBUG: No Healthcare user found for email:', email);
      return res.status(401).json({
        success: false,
        error: 'No account found with this email address. Please check your email or contact support.'
      });
    }

    // Check if user is deleted
    if (user.isDeleted) {
      console.log('TCC_DEBUG: Healthcare user account has been deleted:', email);
      return res.status(401).json({
        success: false,
        error: 'This account has been deleted. Please contact support if you believe this is an error.'
      });
    }

    // Check if user is inactive
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'This account has been deactivated. Please contact support to reactivate your account.'
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('TCC_DEBUG: Password mismatch for Healthcare user:', email);
      return res.status(401).json({
        success: false,
        error: 'Incorrect password. Please check your password and try again.'
      });
    }

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
