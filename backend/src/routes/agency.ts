import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import agencyService from '../services/agencyService';
import transportBiddingService from '../services/transportBiddingService';
import { authenticateToken } from '../middleware/auth';

// Custom authentication middleware for agency routes
const authenticateAgencyToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  
  // Handle agency demo token
  if (authHeader === 'Bearer demo-agency-token') {
    console.log('AUTH: Agency demo mode authentication bypassed');
    req.user = {
      id: 'demo-agency-user',
      email: 'demo@agency.com',
      role: 'TRANSPORT_AGENCY',
      agencyId: 'demo-agency-id'
    };
    return next();
  }
  
  // Fall back to regular authentication
  return authenticateToken(req, res, next);
};

const prisma = new PrismaClient();

const router = express.Router();

// Validation schemas
const agencyRegistrationSchema = z.object({
  name: z.string().min(2, 'Agency name must be at least 2 characters'),
  contactName: z.string().min(2, 'Contact name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  email: z.string().email('Invalid email format'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().length(2, 'State must be 2 characters'),
  zipCode: z.string().min(5, 'Zip code must be at least 5 characters'),
  serviceArea: z.any().optional(),
  operatingHours: z.any().optional(),
  capabilities: z.any().optional(),
  pricingStructure: z.any().optional(),
  adminUser: z.object({
    email: z.string().email('Invalid admin email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(2, 'Admin name must be at least 2 characters'),
    phone: z.string().optional()
  })
});

const agencyLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

const unitAvailabilitySchema = z.object({
  unitId: z.string().min(1, 'Unit ID is required'),
  status: z.enum(['AVAILABLE', 'IN_USE', 'OUT_OF_SERVICE', 'MAINTENANCE']),
  location: z.any().optional(),
  shiftStart: z.string().datetime().optional(),
  shiftEnd: z.string().datetime().optional(),
  crewMembers: z.any().optional(),
  currentAssignment: z.string().optional(),
  notes: z.string().optional()
});

const bidSubmissionSchema = z.object({
  transportRequestId: z.string().min(1, 'Transport request ID is required'),
  bidAmount: z.number().positive().optional(),
  estimatedArrival: z.string().datetime().optional(),
  unitType: z.enum(['BLS', 'ALS', 'CCT']),
  specialCapabilities: z.any().optional(),
  notes: z.string().optional()
});

// Agency Registration (Public)
router.post('/register', async (req, res) => {
  try {
    console.log('[AGENCY-REGISTER] Registration attempt:', { email: req.body.email, name: req.body.name });
    
    const validatedData = agencyRegistrationSchema.parse(req.body);
    
    const result = await agencyService.registerAgency(validatedData);
    
    console.log('[AGENCY-REGISTER] Success:', { agencyId: result.agency.id, userId: result.adminUser.id });
    
    res.status(201).json({
      success: true,
      message: 'Agency registered successfully',
      data: {
        agency: {
          id: result.agency.id,
          name: result.agency.name,
          email: result.agency.email
        },
        adminUser: {
          id: result.adminUser.id,
          name: result.adminUser.name,
          email: result.adminUser.email,
          role: result.adminUser.role
        },
        token: result.token
      }
    });
  } catch (error) {
    console.error('[AGENCY-REGISTER] Error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: (error as any).errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// Agency Statistics (Protected)
router.get('/stats', authenticateAgencyToken, async (req, res) => {
  try {
    console.log('[AGENCY-STATS] Fetching agency statistics');
    
    // Check if this is a demo request
    const authHeader = req.headers.authorization;
    const isDemoMode = authHeader === 'Bearer demo-token';
    
    if (isDemoMode) {
      // Return demo data
      const demoStats = {
        totalUnits: 8,
        availableUnits: 5,
        totalTransports: 156,
        completedTransports: 142,
        completionRate: 91.0,
        totalRevenue: 125000,
        pendingBids: 3
      };
      
      console.log('[AGENCY-STATS] Demo mode - returning demo data');
      
      return res.json({
        success: true,
        message: 'Demo agency statistics retrieved successfully',
        data: demoStats
      });
    }
    
    // For now, return demo data since we need to implement proper agency-user relationship
    // In a real implementation, you would:
    // 1. Add agencyId field to User model
    // 2. Query based on the user's agency
    // 3. Calculate real statistics from the database
    
    const demoStats = {
      totalUnits: 8,
      availableUnits: 5,
      totalTransports: 156,
      completedTransports: 142,
      completionRate: 91.0,
      totalRevenue: 125000,
      pendingBids: 3
    };
    
    console.log('[AGENCY-STATS] Returning demo data for now');
    
    res.json({
      success: true,
      message: 'Agency statistics retrieved successfully (demo data)',
      data: demoStats
    });
  } catch (error) {
    console.error('[AGENCY-STATS] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve agency statistics'
    });
  }
});

// Agency Login (Public)
router.post('/login', async (req, res) => {
  try {
    console.log('[AGENCY-LOGIN] Login attempt:', { email: req.body.email });
    
    const validatedData = agencyLoginSchema.parse(req.body);
    
    const result = await agencyService.loginAgencyUser(validatedData.email, validatedData.password);
    
    console.log('[AGENCY-LOGIN] Success:', { userId: result.user.id, agencyId: result.agency.id });
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role
        },
        agency: {
          id: result.agency.id,
          name: result.agency.name,
          email: result.agency.email
        },
        token: result.token
      }
    });
  } catch (error) {
    console.error('[AGENCY-LOGIN] Error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: (error as any).errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    
    res.status(401).json({
      success: false,
      message: error instanceof Error ? error.message : 'Invalid credentials'
    });
  }
});

// Demo Login (Public - for testing)
router.post('/demo/login', async (req, res) => {
  try {
    console.log('[AGENCY-DEMO-LOGIN] Demo login attempt');
    
    // Create demo data
    const demoUser = {
      id: 'demo-user-001',
      name: 'Demo User',
      email: 'demo@agency.com',
      role: 'TRANSPORT_AGENCY'
    };
    
    const demoAgency = {
      id: 'demo-agency-001',
      name: 'Demo Transport Agency',
      email: 'demo@agency.com'
    };
    
    const demoToken = 'demo-token-' + Date.now();
    
    console.log('[AGENCY-DEMO-LOGIN] Success:', { userId: demoUser.id, agencyId: demoAgency.id });
    
    res.json({
      success: true,
      message: 'Demo login successful',
      data: {
        user: demoUser,
        agency: demoAgency,
        token: demoToken
      }
    });
  } catch (error) {
    console.error('[AGENCY-DEMO-LOGIN] Error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Demo login failed'
    });
  }
});

// Get Agency Profile (Protected)
router.get('/profile', authenticateAgencyToken, async (req, res) => {
  try {
    const agencyId = (req as any).user.agencyId;
    
    if (!agencyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Agency context required.'
      });
    }
    
    const agency = await agencyService.getAgencyById(agencyId);
    
    if (!agency) {
      return res.status(404).json({
        success: false,
        message: 'Agency not found'
      });
    }
    
    res.json({
      success: true,
      data: agency
    });
  } catch (error) {
    console.error('[AGENCY-PROFILE] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update Agency Profile (Protected)
router.put('/profile', authenticateAgencyToken, async (req, res) => {
  try {
    const agencyId = (req as any).user.agencyId;
    
    if (!agencyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Agency context required.'
      });
    }
    
    const updatedProfile = await agencyService.updateAgencyProfile(agencyId, req.body);
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile
    });
  } catch (error) {
    console.error('[AGENCY-PROFILE-UPDATE] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get Agency Stats (Protected)
router.get('/stats', authenticateAgencyToken, async (req, res) => {
  try {
    const agencyId = (req as any).user.agencyId;
    
    if (!agencyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Agency context required.'
      });
    }
    
    const stats = await agencyService.getAgencyStats(agencyId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('[AGENCY-STATS] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get Agency Units (Protected)
router.get('/units', authenticateAgencyToken, async (req, res) => {
  try {
    const agencyId = (req as any).user.agencyId;
    
    if (!agencyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Agency context required.'
      });
    }
    
    const units = await agencyService.getAgencyUnits(agencyId);
    
    res.json({
      success: true,
      data: units
    });
  } catch (error) {
    console.error('[AGENCY-UNITS] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update Unit Availability (Protected)
router.put('/units/:unitId/availability', authenticateAgencyToken, async (req, res) => {
  try {
    const agencyId = (req as any).user.agencyId;
    const { unitId } = req.params;
    
    if (!agencyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Agency context required.'
      });
    }
    
    // Validate that the unit belongs to the agency
    const unit = await prisma.unit.findFirst({
      where: { id: unitId, agencyId }
    });
    
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found or access denied'
      });
    }
    
    const validatedData = unitAvailabilitySchema.parse(req.body);
    
    // Convert string dates to Date objects
    const processedData = {
      ...validatedData,
      shiftStart: validatedData.shiftStart ? new Date(validatedData.shiftStart) : undefined,
      shiftEnd: validatedData.shiftEnd ? new Date(validatedData.shiftEnd) : undefined
    };
    
    const updatedAvailability = await agencyService.updateUnitAvailability(unitId, processedData);
    
    res.json({
      success: true,
      message: 'Unit availability updated successfully',
      data: updatedAvailability
    });
  } catch (error) {
    console.error('[UNIT-AVAILABILITY-UPDATE] Error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: (error as any).errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get Available Transport Requests (Protected)
router.get('/transports/available', authenticateAgencyToken, async (req, res) => {
  try {
    const agencyId = (req as any).user.agencyId;
    
    if (!agencyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Agency context required.'
      });
    }
    
    const filters = {
      transportLevel: req.query.transportLevel as any,
      priority: req.query.priority as any,
      originCity: req.query.originCity as string,
      destinationCity: req.query.destinationCity as string
    };
    
    const transports = await transportBiddingService.getAvailableTransportsForAgency(agencyId, filters);
    
    res.json({
      success: true,
      data: transports
    });
  } catch (error) {
    console.error('[AVAILABLE-TRANSPORTS] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Submit Bid (Protected)
router.post('/transports/:transportId/bid', authenticateAgencyToken, async (req, res) => {
  try {
    const agencyId = (req as any).user.agencyId;
    const userId = (req as any).user.userId;
    const { transportId } = req.params;
    
    if (!agencyId || !userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Agency context required.'
      });
    }
    
    const validatedData = bidSubmissionSchema.parse(req.body);
    
    // Convert string dates to Date objects
    const processedData = {
      ...validatedData,
      estimatedArrival: validatedData.estimatedArrival ? new Date(validatedData.estimatedArrival) : undefined
    };
    
    const bid = await transportBiddingService.submitBid({
      agencyId,
      agencyUserId: userId,
      ...processedData
    });
    
    res.status(201).json({
      success: true,
      message: 'Bid submitted successfully',
      data: bid
    });
  } catch (error) {
    console.error('[BID-SUBMISSION] Error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: (error as any).errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// Get Agency Bid History (Protected)
router.get('/bids', authenticateAgencyToken, async (req, res) => {
  try {
    const agencyId = (req as any).user.agencyId;
    
    if (!agencyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Agency context required.'
      });
    }
    
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const bids = await transportBiddingService.getAgencyBidHistory(agencyId, limit);
    
    res.json({
      success: true,
      data: bids
    });
  } catch (error) {
    console.error('[AGENCY-BIDS] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get Bid Statistics (Protected)
router.get('/bids/stats', authenticateAgencyToken, async (req, res) => {
  try {
    const agencyId = (req as any).user.agencyId;
    
    if (!agencyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Agency context required.'
      });
    }
    
    const stats = await transportBiddingService.getAgencyBidStats(agencyId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('[BID-STATS] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Withdraw Bid (Protected)
router.put('/bids/:bidId/withdraw', authenticateAgencyToken, async (req, res) => {
  try {
    const agencyId = (req as any).user.agencyId;
    const { bidId } = req.params;
    
    if (!agencyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Agency context required.'
      });
    }
    
    const updatedBid = await transportBiddingService.withdrawBid(bidId, agencyId);
    
    res.json({
      success: true,
      message: 'Bid withdrawn successfully',
      data: updatedBid
    });
  } catch (error) {
    console.error('[BID-WITHDRAW] Error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// Demo mode support
router.post('/demo/login', async (req, res) => {
  try {
    if (req.headers.authorization === 'Bearer demo-token') {
      // Return demo agency data
      res.json({
        success: true,
        message: 'Demo login successful',
        data: {
          user: {
            id: 'demo-user-id',
            name: 'Demo Agency User',
            email: 'demo@agency.com',
            role: 'TRANSPORT_AGENCY'
          },
          agency: {
            id: 'demo-agency-id',
            name: 'Demo Transport Agency',
            email: 'demo@agency.com'
          },
          token: 'demo-agency-token'
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Demo token required'
      });
    }
  } catch (error) {
    console.error('[DEMO-LOGIN] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Crew Management Routes
router.get('/crew', authenticateAgencyToken, async (req, res) => {
  try {
    console.log('[AGENCY-CREW] Fetching crew members');
    
    // Check if this is a demo request
    const authHeader = req.headers.authorization;
    const isDemoMode = authHeader === 'Bearer demo-agency-token';
    
    if (isDemoMode) {
      // Return demo crew data
      const demoCrew = [
        {
          id: 'crew-1',
          name: 'John Smith',
          role: 'DRIVER',
          certification: 'CDL-A',
          availability: 'AVAILABLE',
          currentLocation: 'Main Station',
          shiftStart: '08:00',
          shiftEnd: '20:00'
        },
        {
          id: 'crew-2',
          name: 'Sarah Johnson',
          role: 'EMT',
          certification: 'EMT-B',
          availability: 'AVAILABLE',
          currentLocation: 'Main Station',
          shiftStart: '08:00',
          shiftEnd: '20:00'
        },
        {
          id: 'crew-3',
          name: 'Mike Davis',
          role: 'PARAMEDIC',
          certification: 'EMT-P',
          availability: 'ASSIGNED',
          currentLocation: 'En Route',
          shiftStart: '08:00',
          shiftEnd: '20:00'
        }
      ];
      
      return res.json({
        success: true,
        message: 'Demo crew data retrieved successfully',
        crewMembers: demoCrew
      });
    }
    
    // For now, return demo data
    const demoCrew = [
      {
        id: 'crew-1',
        name: 'John Smith',
        role: 'DRIVER',
        certification: 'CDL-A',
        availability: 'AVAILABLE',
        currentLocation: 'Main Station',
        shiftStart: '08:00',
        shiftEnd: '20:00'
      },
      {
        id: 'crew-2',
        name: 'Sarah Johnson',
        role: 'EMT',
        certification: 'EMT-B',
        availability: 'AVAILABLE',
        currentLocation: 'Main Station',
        shiftStart: '08:00',
        shiftEnd: '20:00'
      },
      {
        id: 'crew-3',
        name: 'Mike Davis',
        role: 'PARAMEDIC',
        certification: 'EMT-P',
        availability: 'ASSIGNED',
        currentLocation: 'En Route',
        shiftStart: '08:00',
        shiftEnd: '20:00'
      }
    ];
    
    res.json({
      success: true,
      message: 'Crew members retrieved successfully (demo data)',
      crewMembers: demoCrew
    });
  } catch (error) {
    console.error('[AGENCY-CREW] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve crew members'
    });
  }
});

// Crew Assignments Routes
router.get('/assignments', authenticateAgencyToken, async (req, res) => {
  try {
    console.log('[AGENCY-ASSIGNMENTS] Fetching crew assignments');
    
    // Check if this is a demo request
    const authHeader = req.headers.authorization;
    const isDemoMode = authHeader === 'Bearer demo-agency-token';
    
    if (isDemoMode) {
      // Return demo assignment data
      const demoAssignments = [
        {
          id: 'assign-1',
          crewMemberId: 'crew-3',
          transportRequestId: 'transport-1',
          assignmentTime: '2025-08-26T10:00:00Z',
          status: 'ACTIVE'
        },
        {
          id: 'assign-2',
          crewMemberId: 'crew-1',
          transportRequestId: 'transport-2',
          assignmentTime: '2025-08-26T14:00:00Z',
          status: 'PENDING'
        }
      ];
      
      return res.json({
        success: true,
        message: 'Demo assignments retrieved successfully',
        assignments: demoAssignments
      });
    }
    
    // For now, return demo data
    const demoAssignments = [
      {
        id: 'assign-1',
        crewMemberId: 'crew-3',
        transportRequestId: 'transport-1',
        assignmentTime: '2025-08-26T10:00:00Z',
        status: 'ACTIVE'
      },
      {
        id: 'assign-2',
        crewMemberId: 'crew-1',
        transportRequestId: 'transport-2',
        assignmentTime: '2025-08-26T14:00:00Z',
        status: 'PENDING'
      }
    ];
    
    res.json({
      success: true,
      message: 'Assignments retrieved successfully (demo data)',
      assignments: demoAssignments
    });
  } catch (error) {
    console.error('[AGENCY-ASSIGNMENTS] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve assignments'
    });
  }
});

router.post('/assignments', authenticateAgencyToken, async (req, res) => {
  try {
    console.log('[AGENCY-ASSIGNMENTS] Creating crew assignment:', req.body);
    
    // For now, just return success with demo data
    const newAssignment = {
      id: `assign-${Date.now()}`,
      crewMemberId: req.body.crewMemberId,
      transportRequestId: req.body.transportRequestId,
      assignmentTime: new Date().toISOString(),
      status: 'PENDING'
    };
    
    res.status(201).json({
      success: true,
      message: 'Crew assignment created successfully',
      assignment: newAssignment
    });
  } catch (error) {
    console.error('[AGENCY-ASSIGNMENTS] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create crew assignment'
    });
  }
});

// Transport Requests Routes (for Trip Acceptance)
router.get('/transport-requests', authenticateAgencyToken, async (req, res) => {
  try {
    console.log('[AGENCY-TRANSPORT-REQUESTS] Fetching transport requests');
    
    // Check if this is a demo request
    const authHeader = req.headers.authorization;
    const isDemoMode = authHeader === 'Bearer demo-agency-token';
    
    if (isDemoMode) {
      // Return demo transport request data
      const demoRequests = [
        {
          id: 'transport-1',
          originFacility: { name: 'UPMC Altoona Hospital' },
          destinationFacility: { name: 'Penn State Health' },
          transportLevel: 'CCT',
          priority: 'HIGH',
          requestTimestamp: '2025-08-26T09:00:00Z',
          estimatedRevenue: 450,
          distance: 25.5
        },
        {
          id: 'transport-2',
          originFacility: { name: 'Mount Nittany Medical Center' },
          destinationFacility: { name: 'Geisinger Medical Center' },
          transportLevel: 'ALS',
          priority: 'MEDIUM',
          requestTimestamp: '2025-08-26T11:00:00Z',
          estimatedRevenue: 320,
          distance: 18.2
        }
      ];
      
      return res.json({
        success: true,
        message: 'Demo transport requests retrieved successfully',
        transportRequests: demoRequests
      });
    }
    
    // For now, return demo data
    const demoRequests = [
      {
        id: 'transport-1',
        originFacility: { name: 'UPMC Altoona Hospital' },
        destinationFacility: { name: 'Penn State Health' },
        transportLevel: 'CCT',
        priority: 'HIGH',
        requestTimestamp: '2025-08-26T09:00:00Z',
        estimatedRevenue: 450,
        distance: 25.5
      },
      {
        id: 'transport-2',
        originFacility: { name: 'Mount Nittany Medical Center' },
        destinationFacility: { name: 'Geisinger Medical Center' },
        transportLevel: 'ALS',
        priority: 'MEDIUM',
        requestTimestamp: '2025-08-26T11:00:00Z',
        estimatedRevenue: 320,
        distance: 18.2
      }
    ];
    
    res.json({
      success: true,
      message: 'Transport requests retrieved successfully (demo data)',
      transportRequests: demoRequests
    });
  } catch (error) {
    console.error('[AGENCY-TRANSPORT-REQUESTS] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve transport requests'
    });
  }
});

router.post('/transport-requests/:requestId/accept', authenticateAgencyToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    console.log('[AGENCY-TRANSPORT-REQUESTS] Accepting transport request:', requestId);
    
    // For now, just return success
    res.json({
      success: true,
      message: 'Transport request accepted successfully',
      requestId
    });
  } catch (error) {
    console.error('[AGENCY-TRANSPORT-REQUESTS] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept transport request'
    });
  }
});

router.post('/transport-requests/:requestId/reject', authenticateAgencyToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    console.log('[AGENCY-TRANSPORT-REQUESTS] Rejecting transport request:', requestId);
    
    // For now, just return success
    res.json({
      success: true,
      message: 'Transport request rejected successfully',
      requestId
    });
  } catch (error) {
    console.error('[AGENCY-TRANSPORT-REQUESTS] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject transport request'
    });
  }
});

// Revenue Opportunities Routes
router.get('/revenue-opportunities', authenticateAgencyToken, async (req, res) => {
  try {
    console.log('[AGENCY-REVENUE] Fetching revenue opportunities');
    
    // Check if this is a demo request
    const authHeader = req.headers.authorization;
    const isDemoMode = authHeader === 'Bearer demo-agency-token';
    
    if (isDemoMode) {
      // Return demo revenue opportunities data
      const demoOpportunities = [
        {
          id: 'opp-1',
          title: 'Route Optimization',
          description: 'Optimize routes to reduce empty miles and increase efficiency',
          potentialRevenue: 15000,
          implementationCost: 2000,
          roi: 650,
          difficulty: 'MEDIUM',
          category: 'ROUTE_OPTIMIZATION'
        },
        {
          id: 'opp-2',
          title: 'Chained Trips',
          description: 'Coordinate multiple transports to maximize unit utilization',
          potentialRevenue: 8000,
          implementationCost: 1000,
          roi: 700,
          difficulty: 'LOW',
          category: 'CHAINED_TRIPS'
        }
      ];
      
      return res.json({
        success: true,
        message: 'Demo revenue opportunities retrieved successfully',
        revenueOpportunities: demoOpportunities
      });
    }
    
    // For now, return demo data
    const demoOpportunities = [
      {
        id: 'opp-1',
        title: 'Route Optimization',
        description: 'Optimize routes to reduce empty miles and increase efficiency',
        potentialRevenue: 15000,
        implementationCost: 2000,
        roi: 650,
        difficulty: 'MEDIUM',
        category: 'ROUTE_OPTIMIZATION'
      },
      {
        id: 'opp-2',
        title: 'Chained Trips',
        description: 'Coordinate multiple transports to maximize unit utilization',
        potentialRevenue: 8000,
        implementationCost: 1000,
        roi: 700,
        difficulty: 'LOW',
        category: 'CHAINED_TRIPS'
      }
    ];
    
    res.json({
      success: true,
      message: 'Revenue opportunities retrieved successfully (demo data)',
      revenueOpportunities: demoOpportunities
    });
  } catch (error) {
    console.error('[AGENCY-REVENUE] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve revenue opportunities'
    });
  }
});

router.post('/revenue-opportunities/:opportunityId/implement', authenticateAgencyToken, async (req, res) => {
  try {
    const { opportunityId } = req.params;
    console.log('[AGENCY-REVENUE] Implementing revenue opportunity:', opportunityId);
    
    // For now, just return success
    res.json({
      success: true,
      message: 'Revenue opportunity implementation started successfully',
      opportunityId
    });
  } catch (error) {
    console.error('[AGENCY-REVENUE] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to implement revenue opportunity'
    });
  }
});

router.post('/revenue-opportunities/:opportunityId/reject', authenticateAgencyToken, async (req, res) => {
  try {
    const { opportunityId } = req.params;
    console.log('[AGENCY-REVENUE] Rejecting revenue opportunity:', opportunityId);
    
    // For now, just return success
    res.json({
      success: true,
      message: 'Revenue opportunity rejected successfully',
      opportunityId
    });
  } catch (error) {
    console.error('[AGENCY-REVENUE] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject revenue opportunity'
    });
  }
});

// Agency Analytics Routes
router.get('/analytics/metrics', authenticateAgencyToken, async (req, res) => {
  try {
    const { timeRange } = req.query;
    console.log('[AGENCY-ANALYTICS] Fetching metrics for time range:', timeRange);
    
    // Check if this is a demo request
    const authHeader = req.headers.authorization;
    const isDemoMode = authHeader === 'Bearer demo-agency-token';
    
    if (isDemoMode) {
      // Return demo metrics data
      const demoMetrics = {
        onTimePerformance: 94.2,
        customerSatisfaction: 4.8,
        unitUtilization: 87.5,
        crewEfficiency: 92.1,
        averageResponseTime: 12.5,
        totalTrips: 156,
        completedTrips: 142,
        cancelledTrips: 14
      };
      
      return res.json({
        success: true,
        message: 'Demo metrics retrieved successfully',
        metrics: demoMetrics
      });
    }
    
    // For now, return demo data
    const demoMetrics = {
      onTimePerformance: 94.2,
      customerSatisfaction: 4.8,
      unitUtilization: 87.5,
      crewEfficiency: 92.1,
      averageResponseTime: 12.5,
      totalTrips: 156,
      completedTrips: 142,
      cancelledTrips: 14
    };
    
    res.json({
      success: true,
      message: 'Metrics retrieved successfully (demo data)',
      metrics: demoMetrics
    });
  } catch (error) {
    console.error('[AGENCY-ANALYTICS] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve metrics'
    });
  }
});

router.get('/analytics/trends', authenticateAgencyToken, async (req, res) => {
  try {
    const { timeRange } = req.query;
    console.log('[AGENCY-ANALYTICS] Fetching trends for time range:', timeRange);
    
    // Check if this is a demo request
    const authHeader = req.headers.authorization;
    const isDemoMode = authHeader === 'Bearer demo-agency-token';
    
    if (isDemoMode) {
      // Return demo trends data
      const demoTrends = [
        { month: 'June', trips: 45, revenue: 18500, performance: 92.1 },
        { month: 'July', trips: 52, revenue: 21800, performance: 94.2 },
        { month: 'August', trips: 59, revenue: 25100, performance: 96.8 }
      ];
      
      return res.json({
        success: true,
        message: 'Demo trends retrieved successfully',
        trends: demoTrends
      });
    }
    
    // For now, return demo data
    const demoTrends = [
      { month: 'June', trips: 45, revenue: 18500, performance: 92.1 },
      { month: 'July', trips: 52, revenue: 21800, performance: 94.2 },
      { month: 'August', trips: 59, revenue: 25100, performance: 96.8 }
    ];
    
    res.json({
      success: true,
      message: 'Trends retrieved successfully (demo data)',
      trends: demoTrends
    });
  } catch (error) {
    console.error('[AGENCY-ANALYTICS] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve trends'
    });
  }
});

router.get('/analytics/revenue', authenticateAgencyToken, async (req, res) => {
  try {
    const { timeRange } = req.query;
    console.log('[AGENCY-ANALYTICS] Fetching revenue for time range:', timeRange);
    
    // Check if this is a demo request
    const authHeader = req.headers.authorization;
    const isDemoMode = authHeader === 'Bearer demo-agency-token';
    
    if (isDemoMode) {
      // Return demo revenue data
      const demoRevenue = {
        totalRevenue: 65400,
        averagePerTrip: 420,
        breakdown: {
          cct: 28000,
          als: 22000,
          bls: 15400
        },
        growth: 12.5
      };
      
      return res.json({
        success: true,
        message: 'Demo revenue data retrieved successfully',
        revenue: demoRevenue
      });
    }
    
    // For now, return demo data
    const demoRevenue = {
      totalRevenue: 65400,
      averagePerTrip: 420,
      breakdown: {
        cct: 28000,
        als: 22000,
        bls: 15400
      },
      growth: 12.5
    };
    
    res.json({
      success: true,
      message: 'Revenue data retrieved successfully (demo data)',
      revenue: demoRevenue
    });
  } catch (error) {
    console.error('[AGENCY-ANALYTICS] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve revenue data'
    });
  }
});

export default router;
