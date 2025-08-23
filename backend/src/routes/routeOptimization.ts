import express from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import routeOptimizationService from '../services/routeOptimizationService';
import { RouteOptimizationType, TransportLevel, Priority } from '@prisma/client';
import { z } from 'zod';

const router = express.Router();

// Demo mode middleware for GET requests
const demoOrAuth = (req: any, res: any, next: any) => {
  // Allow demo access for GET requests
  if (req.method === 'GET') {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.includes('demo-token')) {
      // Set demo user for GET requests
      req.user = { id: 'demo-user', email: 'demo@medport.com', role: 'COORDINATOR' };
      return next();
    }
  }
  // For all other requests, require proper authentication
  return authenticateToken(req, res, next);
};

// Apply demo or auth middleware to all routes
router.use(demoOrAuth);

// Validation schemas
const RouteOptimizationRequestSchema = z.object({
  timeWindowStart: z.string().datetime(),
  timeWindowEnd: z.string().datetime(),
  maxDistance: z.number().optional(),
  transportLevels: z.array(z.nativeEnum(TransportLevel)).optional(),
  priorities: z.array(z.nativeEnum(Priority)).optional(),
  agencyId: z.string().optional(),
  optimizationType: z.nativeEnum(RouteOptimizationType).optional(),
  constraints: z.object({
    maxDuration: z.number().optional(),
    maxStops: z.number().optional(),
    minRevenue: z.number().optional(),
    avoidHighways: z.boolean().optional(),
    preferReturnTrips: z.boolean().optional(),
  }).optional(),
});

const OptimizationFilterSchema = z.object({
  optimizationType: z.nativeEnum(RouteOptimizationType).optional(),
  minScore: z.number().min(0).max(100).optional(),
  maxDistance: z.number().optional(),
  minRevenue: z.number().optional(),
  timeWindowStart: z.string().datetime().optional(),
  timeWindowEnd: z.string().datetime().optional(),
});

/**
 * POST /api/route-optimization/optimize
 * Main route optimization endpoint - analyzes transport requests and generates chaining opportunities
 */
router.post('/optimize', async (req: AuthRequest, res) => {
  try {
    console.log('[MedPort:RouteOptimization] POST /optimize - Request received:', req.body);

    // Validate request body
    const validationResult = RouteOptimizationRequestSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: validationResult.error.issues.map(e => `${e.path.join('.')}: ${e.message}`)
      });
    }

    const optimizationRequest = {
      ...validationResult.data,
      timeWindowStart: new Date(validationResult.data.timeWindowStart),
      timeWindowEnd: new Date(validationResult.data.timeWindowEnd),
    };

    // Perform route optimization
    const result = await routeOptimizationService.optimizeRoutes(optimizationRequest);

    res.status(200).json({
      message: 'Route optimization completed successfully',
      data: result
    });

  } catch (error) {
    console.error('[MedPort:RouteOptimization] Error during route optimization:', error);
    res.status(500).json({
      error: 'Route optimization failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/route-optimization/opportunities
 * Get chaining opportunities with filtering and pagination
 */
router.get('/opportunities', async (req: AuthRequest, res) => {
  try {
    console.log('[MedPort:RouteOptimization] GET /opportunities - Query params:', req.query);

    // Validate query parameters
    const validationResult = OptimizationFilterSchema.safeParse(req.query);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid query parameters',
        details: validationResult.error.issues.map(e => `${e.path.join('.')}: ${e.message}`)
      });
    }

    const filters = validationResult.data;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    // For now, we'll return a demo optimization result
    // In production, this would query the database for saved opportunities
    const demoRequest = {
      timeWindowStart: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      timeWindowEnd: new Date(Date.now() + 24 * 60 * 60 * 1000), // Next 24 hours
      transportLevels: filters.optimizationType ? undefined : [TransportLevel.BLS, TransportLevel.ALS, TransportLevel.CCT],
      constraints: {
        maxDuration: filters.maxDistance ? filters.maxDistance * 2 : undefined, // 2 minutes per mile
        minRevenue: filters.minRevenue,
      }
    };

    const result = await routeOptimizationService.optimizeRoutes(demoRequest);

    // Apply additional filters
    let filteredOpportunities = result.opportunities;

    if (filters.minScore) {
      filteredOpportunities = filteredOpportunities.filter(opp => opp.optimizationScore >= filters.minScore!);
    }

    if (filters.maxDistance) {
      filteredOpportunities = filteredOpportunities.filter(opp => opp.totalDistance <= filters.maxDistance!);
    }

    if (filters.minRevenue) {
      filteredOpportunities = filteredOpportunities.filter(opp => opp.revenueIncrease >= filters.minRevenue!);
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOpportunities = filteredOpportunities.slice(startIndex, endIndex);

    res.json({
      message: 'Chaining opportunities retrieved successfully',
      data: {
        opportunities: paginatedOpportunities,
        pagination: {
          page,
          limit,
          total: filteredOpportunities.length,
          totalPages: Math.ceil(filteredOpportunities.length / limit)
        },
        summary: {
          totalOpportunities: filteredOpportunities.length,
          totalMilesSaved: filteredOpportunities.reduce((sum, opp) => sum + opp.milesSaved, 0),
          totalRevenueIncrease: filteredOpportunities.reduce((sum, opp) => sum + opp.revenueIncrease, 0),
          averageOptimizationScore: filteredOpportunities.length > 0 
            ? filteredOpportunities.reduce((sum, opp) => sum + opp.optimizationScore, 0) / filteredOpportunities.length 
            : 0
        }
      }
    });

  } catch (error) {
    console.error('[MedPort:RouteOptimization] Error retrieving chaining opportunities:', error);
    res.status(500).json({
      error: 'Failed to retrieve chaining opportunities',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/route-optimization/opportunities/:id
 * Get specific chaining opportunity by ID
 */
router.get('/opportunities/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    console.log('[MedPort:RouteOptimization] GET /opportunities/:id - ID:', id);

    // For demo purposes, generate a new optimization to find the specific opportunity
    // In production, this would query the database for saved opportunities
    const demoRequest = {
      timeWindowStart: new Date(Date.now() - 24 * 60 * 60 * 1000),
      timeWindowEnd: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };

    const result = await routeOptimizationService.optimizeRoutes(demoRequest);
    const opportunity = result.opportunities.find(opp => opp.id === id);

    if (!opportunity) {
      return res.status(404).json({
        error: 'Chaining opportunity not found'
      });
    }

    res.json({
      message: 'Chaining opportunity retrieved successfully',
      data: opportunity
    });

  } catch (error) {
    console.error('[MedPort:RouteOptimization] Error retrieving chaining opportunity:', error);
    res.status(500).json({
      error: 'Failed to retrieve chaining opportunity',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/route-optimization/opportunities/:id/accept
 * Accept a chaining opportunity and create optimized route
 */
router.post('/opportunities/:id/accept', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { agencyId, unitId, notes } = req.body;
    
    console.log('[MedPort:RouteOptimization] POST /opportunities/:id/accept - ID:', id, 'Body:', req.body);

    if (!agencyId) {
      return res.status(400).json({
        error: 'Missing required field: agencyId'
      });
    }

    // For demo purposes, generate the opportunity and return success
    // In production, this would:
    // 1. Retrieve the saved opportunity
    // 2. Create the optimized route
    // 3. Assign the agency and unit
    // 4. Update transport request statuses
    // 5. Generate route documentation

    const demoRequest = {
      timeWindowStart: new Date(Date.now() - 24 * 60 * 60 * 1000),
      timeWindowEnd: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };

    const result = await routeOptimizationService.optimizeRoutes(demoRequest);
    const opportunity = result.opportunities.find(opp => opp.id === id);

    if (!opportunity) {
      return res.status(404).json({
        error: 'Chaining opportunity not found'
      });
    }

    // Mock route creation
    const createdRoute = {
      id: `ROUTE-${Date.now()}`,
      routeNumber: `OPT-${Date.now().toString().slice(-6)}`,
      agencyId,
      assignedUnitId: unitId || null,
      status: 'PLANNED',
      totalDistanceMiles: opportunity.totalDistance,
      estimatedTimeMinutes: opportunity.totalTime,
      emptyMilesReduction: opportunity.milesSaved,
      revenueOptimizationScore: opportunity.optimizationScore,
      chainedTripCount: opportunity.transportRequests.length,
      estimatedRevenue: opportunity.revenuePotential,
      milesSaved: opportunity.milesSaved,
      unitsSaved: opportunity.unitsSaved,
      optimizationType: opportunity.routeType,
      plannedStartTime: opportunity.estimatedStartTime,
      timeWindowStart: opportunity.estimatedStartTime,
      timeWindowEnd: opportunity.estimatedEndTime,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdById: req.user?.id || 'demo-user'
    };

    res.status(201).json({
      message: 'Chaining opportunity accepted successfully',
      data: {
        route: createdRoute,
        opportunity: opportunity,
        nextSteps: [
          'Route has been created and assigned to your agency',
          'Transport requests have been updated with route assignment',
          'Route documentation is being generated',
          'You will receive notifications for route updates'
        ]
      }
    });

  } catch (error) {
    console.error('[MedPort:RouteOptimization] Error accepting chaining opportunity:', error);
    res.status(500).json({
      error: 'Failed to accept chaining opportunity',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/route-optimization/opportunities/:id/reject
 * Reject a chaining opportunity
 */
router.post('/opportunities/:id/reject', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { reason, feedback } = req.body;
    
    console.log('[MedPort:RouteOptimization] POST /opportunities/:id/reject - ID:', id, 'Body:', req.body);

    // In production, this would:
    // 1. Mark the opportunity as rejected
    // 2. Store rejection reason and feedback
    // 3. Update optimization algorithms to avoid similar patterns
    // 4. Notify coordinators of rejection

    res.json({
      message: 'Chaining opportunity rejected successfully',
      data: {
        opportunityId: id,
        rejectedAt: new Date(),
        rejectedBy: req.user?.id || 'demo-user',
        reason: reason || 'No reason provided',
        feedback: feedback || 'No feedback provided'
      }
    });

  } catch (error) {
    console.error('[MedPort:RouteOptimization] Error rejecting chaining opportunity:', error);
    res.status(500).json({
      error: 'Failed to reject chaining opportunity',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/route-optimization/stats
 * Get route optimization statistics and performance metrics
 */
router.get('/stats', async (req: AuthRequest, res) => {
  try {
    console.log('[MedPort:RouteOptimization] GET /stats');

    const stats = await routeOptimizationService.getOptimizationStats();

    res.json({
      message: 'Route optimization statistics retrieved successfully',
      data: stats
    });

  } catch (error) {
    console.error('[MedPort:RouteOptimization] Error retrieving optimization statistics:', error);
    res.status(500).json({
      error: 'Failed to retrieve optimization statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/route-optimization/recommendations
 * Get optimization recommendations based on current transport requests
 */
router.get('/recommendations', async (req: AuthRequest, res) => {
  try {
    console.log('[MedPort:RouteOptimization] GET /recommendations');

    // Generate recommendations based on current time window
    const demoRequest = {
      timeWindowStart: new Date(Date.now() - 12 * 60 * 60 * 1000), // Last 12 hours
      timeWindowEnd: new Date(Date.now() + 12 * 60 * 60 * 1000), // Next 12 hours
    };

    const result = await routeOptimizationService.optimizeRoutes(demoRequest);

    res.json({
      message: 'Optimization recommendations retrieved successfully',
      data: {
        recommendations: result.recommendations,
        summary: result.summary,
        generatedAt: new Date(),
        timeWindow: {
          start: demoRequest.timeWindowStart,
          end: demoRequest.timeWindowEnd
        }
      }
    });

  } catch (error) {
    console.error('[MedPort:RouteOptimization] Error retrieving optimization recommendations:', error);
    res.status(500).json({
      error: 'Failed to retrieve optimization recommendations',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/route-optimization/quick-optimize
 * Quick optimization for immediate transport requests
 */
router.post('/quick-optimize', async (req: AuthRequest, res) => {
  try {
    console.log('[MedPort:RouteOptimization] POST /quick-optimize - Request received:', req.body);

    const { transportRequestIds, maxTimeWindow } = req.body;

    if (!transportRequestIds || !Array.isArray(transportRequestIds) || transportRequestIds.length === 0) {
      return res.status(400).json({
        error: 'Missing or invalid transportRequestIds array'
      });
    }

    // Quick optimization for specific transport requests
    const timeWindow = maxTimeWindow || 120; // Default 2 hours
    const demoRequest = {
      timeWindowStart: new Date(Date.now()),
      timeWindowEnd: new Date(Date.now() + timeWindow * 60 * 1000),
      constraints: {
        maxDuration: timeWindow,
        maxStops: Math.min(transportRequestIds.length * 2, 10), // Max 10 stops
      }
    };

    const result = await routeOptimizationService.optimizeRoutes(demoRequest);

    // Filter opportunities that include the specified transport requests
    const relevantOpportunities = result.opportunities.filter(opp => 
      opp.transportRequests.some(req => transportRequestIds.includes(req.id))
    );

    res.json({
      message: 'Quick optimization completed successfully',
      data: {
        opportunities: relevantOpportunities,
        summary: {
          totalOpportunities: relevantOpportunities.length,
          totalMilesSaved: relevantOpportunities.reduce((sum, opp) => sum + opp.milesSaved, 0),
          totalRevenueIncrease: relevantOpportunities.reduce((sum, opp) => sum + opp.revenueIncrease, 0),
          averageOptimizationScore: relevantOpportunities.length > 0 
            ? relevantOpportunities.reduce((sum, opp) => sum + opp.optimizationScore, 0) / relevantOpportunities.length 
            : 0
        },
        timeWindow: {
          start: demoRequest.timeWindowStart,
          end: demoRequest.timeWindowEnd,
          durationMinutes: timeWindow
        }
      }
    });

  } catch (error) {
    console.error('[MedPort:RouteOptimization] Error during quick optimization:', error);
    res.status(500).json({
      error: 'Quick optimization failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/route-optimization/health
 * Health check endpoint for route optimization service
 */
router.get('/health', async (req: AuthRequest, res) => {
  try {
    res.json({
      message: 'Route optimization service is healthy',
      status: 'OK',
      timestamp: new Date(),
      version: '1.0.0',
      features: [
        'Temporal proximity analysis',
        'Spatial proximity analysis',
        'Chained trip identification',
        'Return trip optimization',
        'Multi-stop route optimization',
        'Revenue maximization algorithms'
      ]
    });
  } catch (error) {
    res.status(500).json({
      message: 'Route optimization service health check failed',
      status: 'ERROR',
      timestamp: new Date(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
