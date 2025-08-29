import express, { Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import unitAssignmentService from '../services/unitAssignmentService';
import revenueTrackingService from '../services/revenueTrackingService';
import { TransportLevel, UnitStatus, RequestStatus, Priority } from '@prisma/client';
import { z } from 'zod';

const router = express.Router();

// Demo mode middleware for GET and POST requests
const demoOrAuth = (req: any, res: any, next: any) => {
  console.log('[MedPort:UnitAssignment] Demo middleware - Method:', req.method, 'Headers:', req.headers);
  
  // Allow demo access for GET and POST requests
  if (req.method === 'GET' || req.method === 'POST') {
    const authHeader = req.headers['authorization'];
    console.log('[MedPort:UnitAssignment] Demo middleware - Auth header:', authHeader);
    
    if (authHeader && (authHeader.includes('demo-token') || authHeader === 'Bearer demo-token')) {
      console.log('[MedPort:UnitAssignment] Demo middleware - Demo token detected, setting demo user');
      // Set demo user for GET and POST requests
      req.user = { id: 'demo-user', email: 'demo@medport.com', role: 'COORDINATOR' };
      return next();
    } else {
      console.log('[MedPort:UnitAssignment] Demo middleware - No valid demo token found');
    }
  }
  
  console.log('[MedPort:UnitAssignment] Demo middleware - Falling back to regular auth');
  // For all other requests, require proper authentication
  return authenticateToken(req, res, next);
};

// Apply demo or auth middleware to all routes
router.use(demoOrAuth);

// Validation schemas
const UnitAssignmentRequestSchema = z.object({
  transportRequestId: z.string().cuid(),
  transportLevel: z.nativeEnum(TransportLevel),
  agencyId: z.string().cuid().optional(),
  assignmentTime: z.string().datetime(),
  assignedBy: z.string(),
  priority: z.nativeEnum(Priority).optional(),
  specialRequirements: z.string().optional(),
});

const PerformanceMetricsRequestSchema = z.object({
  unitId: z.string().cuid(),
  timeRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }),
});

const ConflictDetectionRequestSchema = z.object({
  unitId: z.string().cuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
});

const OptimizationRequestSchema = z.object({
  optimizationType: z.enum(['REVENUE_MAX', 'EFFICIENCY', 'BALANCED']).optional(),
  constraints: z.object({
    maxUnits: z.number().optional(),
    maxDistance: z.number().optional(),
    preferredAgencyId: z.string().cuid().optional(),
    timeWindow: z.object({
      start: z.string().datetime(),
      end: z.string().datetime(),
    }).optional(),
  }).optional(),
});

/**
 * POST /api/unit-assignment/assign
 * Assign transport request to optimal unit
 */
router.post('/assign', async (req: AuthRequest, res: Response) => {
  try {
    console.log('[MedPort:UnitAssignment] POST /assign - Request received:', req.body);

    // Validate request body
    const validationResult = UnitAssignmentRequestSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: validationResult.error.issues.map(e => `${e.path.join('.')}: ${e.message}`)
      });
    }

    const assignmentRequest = {
      ...validationResult.data,
      assignmentTime: new Date(validationResult.data.assignmentTime),
    };

    // Perform unit assignment
    const result = await unitAssignmentService.assignTransportToUnit(assignmentRequest);

    res.status(200).json({
      message: 'Unit assignment completed successfully',
      data: result
    });

  } catch (error) {
    console.error('[MedPort:UnitAssignment] Error during unit assignment:', error);
    res.status(500).json({
      error: 'Unit assignment failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/unit-assignment/performance/:unitId
 * Get unit performance metrics
 */
router.get('/performance/:unitId', async (req: AuthRequest, res: Response) => {
  try {
    console.log('[MedPort:UnitAssignment] GET /performance/:unitId - Unit ID:', req.params.unitId);

    const { unitId } = req.params;
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({
        error: 'Start and end dates are required'
      });
    }

    const timeRange = {
      start: new Date(start as string),
      end: new Date(end as string)
    };

    const metrics = await unitAssignmentService.getUnitPerformanceMetrics(unitId, timeRange);

    res.status(200).json({
      message: 'Unit performance metrics retrieved successfully',
      data: metrics
    });

  } catch (error) {
    console.error('[MedPort:UnitAssignment] Error getting unit performance metrics:', error);
    res.status(500).json({
      error: 'Failed to retrieve unit performance metrics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/unit-assignment/conflicts/detect
 * Detect assignment conflicts for a unit
 */
router.post('/conflicts/detect', async (req: AuthRequest, res: Response) => {
  try {
    console.log('[MedPort:UnitAssignment] POST /conflicts/detect - Request received:', req.body);

    // Validate request body
    const validationResult = ConflictDetectionRequestSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: validationResult.error.issues.map(e => `${e.path.join('.')}: ${e.message}`)
      });
    }

    const { unitId, startTime, endTime } = validationResult.data;

    const conflicts = await unitAssignmentService.detectAssignmentConflicts(
      unitId,
      new Date(startTime),
      new Date(endTime)
    );

    res.status(200).json({
      message: 'Conflict detection completed',
      data: {
        unitId,
        timeRange: { startTime, endTime },
        conflicts,
        conflictCount: conflicts.length
      }
    });

  } catch (error) {
    console.error('[MedPort:UnitAssignment] Error detecting conflicts:', error);
    res.status(500).json({
      error: 'Conflict detection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/unit-assignment/availability-matrix
 * Get unit availability matrix for dashboard
 */
router.get('/availability-matrix', async (req: AuthRequest, res: Response) => {
  try {
    console.log('[MedPort:UnitAssignment] GET /availability-matrix');

    const matrix = await unitAssignmentService.getUnitAvailabilityMatrix();

    res.status(200).json({
      message: 'Unit availability matrix retrieved successfully',
      data: matrix
    });

  } catch (error) {
    console.error('[MedPort:UnitAssignment] Error getting availability matrix:', error);
    res.status(500).json({
      error: 'Failed to retrieve availability matrix',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/unit-assignment/debug
 * Debug endpoint to check data
 */
router.get('/debug', async (req: AuthRequest, res: Response) => {
  try {
    console.log('[MedPort:UnitAssignment] GET /debug - Debug request received');

    // Get unassigned transport requests using the service
    const unassignedRequests = await unitAssignmentService.getAvailableUnits(TransportLevel.BLS);
    
    // Get available units using the service
    const availableUnits = await unitAssignmentService.getAvailableUnits(TransportLevel.BLS);

    res.status(200).json({
      message: 'Debug data retrieved successfully',
      data: {
        unassignedRequests: {
          count: unassignedRequests.length,
          requests: unassignedRequests
        },
        availableUnits: {
          count: availableUnits.length,
          units: availableUnits
        }
      }
    });

  } catch (error) {
    console.error('[MedPort:UnitAssignment] Error during debug:', error);
    res.status(500).json({
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/unit-assignment/optimize
 * Optimize unit assignments for maximum revenue
 */
router.post('/optimize', async (req: AuthRequest, res: Response) => {
  try {
    console.log('[MedPort:UnitAssignment] POST /optimize - Request received:', req.body);

    // Validate request body
    const validationResult = OptimizationRequestSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: validationResult.error.issues.map(e => `${e.path.join('.')}: ${e.message}`)
      });
    }

    const optimizationParams = validationResult.data;

    const result = await unitAssignmentService.optimizeUnitAssignments(optimizationParams);

    res.status(200).json({
      message: 'Unit assignment optimization completed successfully',
      data: result
    });

  } catch (error) {
    console.error('[MedPort:UnitAssignment] Error during optimization:', error);
    res.status(500).json({
      error: 'Unit assignment optimization failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/unit-assignment/units
 * Get all units with availability status
 */
router.get('/units', async (req: AuthRequest, res: Response) => {
  try {
    console.log('[MedPort:UnitAssignment] GET /units - Query params:', req.query);

    const { status, transportLevel } = req.query;

    // Build where clause
    const where: any = {
      isActive: true
    };

    if (status) {
      where.currentStatus = status;
    }

    if (transportLevel) {
      where.type = transportLevel;
    }

    // Get all units from the database
    const units = await unitAssignmentService.getAllUnits(where);

    res.status(200).json({
      message: 'Units retrieved successfully',
      data: units
    });

  } catch (error) {
    console.error('[MedPort:UnitAssignment] Error getting units:', error);
    res.status(500).json({
      error: 'Failed to retrieve units',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/unit-assignment/units/:agencyId
 * Get units for a specific agency with availability status
 */
router.get('/units/:agencyId', async (req: AuthRequest, res: Response) => {
  try {
    console.log('[MedPort:UnitAssignment] GET /units/:agencyId - Agency ID:', req.params.agencyId);

    const { agencyId } = req.params;
    const { status, transportLevel } = req.query;

    // Build where clause
    const where: any = {
      agencyId,
      isActive: true
    };

    if (status) {
      where.currentStatus = status;
    }

    if (transportLevel) {
      where.type = transportLevel;
    }

    // Get units with availability and assignment information
    const units = await unitAssignmentService.getAvailableUnits(
      transportLevel as TransportLevel || TransportLevel.BLS,
      agencyId
    );

    res.status(200).json({
      message: 'Units retrieved successfully',
      data: {
        agencyId,
        units,
        totalUnits: units.length,
        filters: { status, transportLevel }
      }
    });

  } catch (error) {
    console.error('[MedPort:UnitAssignment] Error getting units:', error);
    res.status(500).json({
      error: 'Failed to retrieve units',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/unit-assignment/assignments
 * Get unit assignments with filtering and pagination
 */
router.get('/assignments', async (req: AuthRequest, res: Response) => {
  try {
    console.log('[MedPort:UnitAssignment] GET /assignments - Query params:', req.query);

    const { 
      unitId, 
      agencyId, 
      status, 
      startDate, 
      endDate, 
      page = '1', 
      limit = '20' 
    } = req.query;

    // Build where clause
    const where: any = {};
    
    if (unitId) where.unitId = unitId;
    if (agencyId) where.unit = { agencyId };
    if (status) where.status = status;
    
    if (startDate && endDate) {
      where.startTime = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Get assignments with pagination
    const assignments = await unitAssignmentService.getAssignments(where, skip, limitNum);
    const total = await unitAssignmentService.getAssignmentCount(where);

    res.status(200).json({
      message: 'Assignments retrieved successfully',
      data: {
        assignments,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        },
        filters: { unitId, agencyId, status, startDate, endDate }
      }
    });

  } catch (error) {
    console.error('[MedPort:UnitAssignment] Error getting assignments:', error);
    res.status(500).json({
      error: 'Failed to retrieve assignments',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /api/unit-assignment/assignments/:assignmentId
 * Update unit assignment status
 */
router.put('/assignments/:assignmentId', async (req: AuthRequest, res: Response) => {
  try {
    console.log('[MedPort:UnitAssignment] PUT /assignments/:assignmentId - Assignment ID:', req.params.assignmentId);

    const { assignmentId } = req.params;
    const { status, endTime, notes } = req.body;

    if (!status && !endTime && !notes) {
      return res.status(400).json({
        error: 'At least one field must be provided for update'
      });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (endTime) updateData.endTime = new Date(endTime);
    if (notes) updateData.notes = notes;

    const result = await unitAssignmentService.updateAssignment(assignmentId, updateData);

    res.status(200).json({
      message: 'Assignment updated successfully',
      data: result
    });

  } catch (error) {
    console.error('[MedPort:UnitAssignment] Error updating assignment:', error);
    res.status(500).json({
      error: 'Failed to update assignment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /api/unit-assignment/assignments/:assignmentId
 * Cancel unit assignment
 */
router.delete('/assignments/:assignmentId', async (req: AuthRequest, res: Response) => {
  try {
    console.log('[MedPort:UnitAssignment] DELETE /assignments/:assignmentId - Assignment ID:', req.params.assignmentId);

    const { assignmentId } = req.params;

    const result = await unitAssignmentService.cancelAssignment(assignmentId);

    res.status(200).json({
      message: 'Assignment cancelled successfully',
      data: result
    });

  } catch (error) {
    console.error('[MedPort:UnitAssignment] Error cancelling assignment:', error);
    res.status(500).json({
      error: 'Failed to cancel assignment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/unit-assignment/revenue/:entityId
 * Get revenue metrics for unit or agency
 */
router.get('/revenue/:entityId', async (req: AuthRequest, res: Response) => {
  try {
    console.log('[MedPort:UnitAssignment] GET /revenue/:entityId - Entity ID:', req.params.entityId);

    const { entityId } = req.params;
    const { entityType, start, end } = req.query;

    if (!entityType || !start || !end) {
      return res.status(400).json({
        error: 'Entity type, start date, and end date are required'
      });
    }

    const timeRange = {
      start: new Date(start as string),
      end: new Date(end as string)
    };

    const revenueMetrics = await revenueTrackingService.calculateRevenueMetrics(
      entityId,
      entityType as 'unit' | 'agency',
      timeRange
    );

    res.status(200).json({
      message: 'Revenue metrics retrieved successfully',
      data: revenueMetrics
    });

  } catch (error) {
    console.error('[MedPort:UnitAssignment] Error getting revenue metrics:', error);
    res.status(500).json({
      error: 'Failed to retrieve revenue metrics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/unit-assignment/revenue/analysis/:entityId
 * Get revenue optimization analysis
 */
router.get('/revenue/analysis/:entityId', async (req: AuthRequest, res: Response) => {
  try {
    console.log('[MedPort:UnitAssignment] GET /revenue/analysis/:entityId - Entity ID:', req.params.entityId);

    const { entityId } = req.params;
    const { entityType } = req.query;

    if (!entityType) {
      return res.status(400).json({
        error: 'Entity type is required'
      });
    }

          const optimizationParams = {
        targetRevenuePerMile: 4.0,
        targetTransportsPerPeriod: 25,
        maxEmptyMiles: 10,
        preferredTransportLevels: [TransportLevel.BLS, TransportLevel.ALS, TransportLevel.CCT]
      };

    const analysis = await revenueTrackingService.analyzeRevenueOptimization(
      entityId,
      entityType as 'unit' | 'agency',
      optimizationParams
    );

    res.status(200).json({
      message: 'Revenue analysis completed successfully',
      data: analysis
    });

  } catch (error) {
    console.error('[MedPort:UnitAssignment] Error getting revenue analysis:', error);
    res.status(500).json({
      error: 'Failed to complete revenue analysis',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/unit-assignment/revenue/trends/:entityId
 * Get revenue trends over time
 */
router.get('/revenue/trends/:entityId', async (req: AuthRequest, res: Response) => {
  try {
    console.log('[MedPort:UnitAssignment] GET /revenue/trends/:entityId - Entity ID:', req.params.entityId);

    const { entityId } = req.params;
    const { entityType, period, start, end } = req.query;

    if (!entityType || !start || !end) {
      return res.status(400).json({
        error: 'Entity type, start date, and end date are required'
      });
    }

    const timeRange = {
      start: new Date(start as string),
      end: new Date(end as string)
    };

    const trends = await revenueTrackingService.getRevenueTrends(
      entityId,
      entityType as 'unit' | 'agency',
      (period as 'daily' | 'weekly' | 'monthly') || 'monthly',
      timeRange
    );

    res.status(200).json({
      message: 'Revenue trends retrieved successfully',
      data: trends
    });

  } catch (error) {
    console.error('[MedPort:UnitAssignment] Error getting revenue trends:', error);
    res.status(500).json({
      error: 'Failed to retrieve revenue trends',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/unit-assignment/revenue/agencies/summary
 * Get revenue summary for all agencies
 */
router.get('/revenue/agencies/summary', async (req: AuthRequest, res: Response) => {
  try {
    console.log('[MedPort:UnitAssignment] GET /revenue/agencies/summary');

    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({
        error: 'Start and end dates are required'
      });
    }

    const timeRange = {
      start: new Date(start as string),
      end: new Date(end as string)
    };

    const summary = await revenueTrackingService.getAgencyRevenueSummary(timeRange);

    res.status(200).json({
      message: 'Agency revenue summary retrieved successfully',
      data: summary
    });

  } catch (error) {
    console.error('[MedPort:UnitAssignment] Error getting agency revenue summary:', error);
    res.status(500).json({
      error: 'Failed to retrieve agency revenue summary',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/unit-assignment/revenue/units/performance/:agencyId
 * Get unit revenue performance for an agency
 */
router.get('/revenue/units/performance/:agencyId', async (req: AuthRequest, res: Response) => {
  try {
    console.log('[MedPort:UnitAssignment] GET /revenue/units/performance/:agencyId - Agency ID:', req.params.agencyId);

    const { agencyId } = req.params;
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({
        error: 'Start and end dates are required'
      });
    }

    const timeRange = {
      start: new Date(start as string),
      end: new Date(end as string)
    };

    const performance = await revenueTrackingService.getUnitRevenuePerformance(agencyId, timeRange);

    res.status(200).json({
      message: 'Unit revenue performance retrieved successfully',
      data: performance
    });

  } catch (error) {
    console.error('[MedPort:UnitAssignment] Error getting unit revenue performance:', error);
    res.status(500).json({
      error: 'Failed to retrieve unit revenue performance',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
