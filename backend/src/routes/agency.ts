import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import agencyService from '../services/agencyService';
import transportBiddingService from '../services/transportBiddingService';
import { authenticateToken } from '../middleware/auth';

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
      role: 'ADMIN'
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
router.get('/profile', authenticateToken, async (req, res) => {
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
router.put('/profile', authenticateToken, async (req, res) => {
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
router.get('/stats', authenticateToken, async (req, res) => {
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
router.get('/units', authenticateToken, async (req, res) => {
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
router.put('/units/:unitId/availability', authenticateToken, async (req, res) => {
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
router.get('/transports/available', authenticateToken, async (req, res) => {
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
router.post('/transports/:transportId/bid', authenticateToken, async (req, res) => {
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
router.get('/bids', authenticateToken, async (req, res) => {
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
router.get('/bids/stats', authenticateToken, async (req, res) => {
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
router.put('/bids/:bidId/withdraw', authenticateToken, async (req, res) => {
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
            role: 'ADMIN'
          },
          agency: {
            id: 'demo-agency-id',
            name: 'Demo Transport Agency',
            email: 'demo@agency.com'
          },
          token: 'demo-token'
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

export default router;
