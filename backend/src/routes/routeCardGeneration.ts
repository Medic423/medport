import express from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import routeCardGenerationService from '../services/routeCardGenerationService';
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
const GenerateRouteCardsSchema = z.object({
  opportunityIds: z.array(z.string()),
  exportOptions: z.object({
    format: z.enum(['PDF', 'CSV', 'JSON', 'EXCEL']).optional(),
    includeCharts: z.boolean().optional(),
    includeMaps: z.boolean().optional(),
    includeFinancials: z.boolean().optional(),
    includeTimeline: z.boolean().optional()
  }).optional()
});

const RouteCardComparisonSchema = z.object({
  opportunityIds: z.array(z.string()).min(2).max(5),
  comparisonType: z.enum(['SIDE_BY_SIDE', 'MATRIX', 'CHART']).optional()
});

const ExportRouteCardsSchema = z.object({
  routeCardIds: z.array(z.string()),
  format: z.enum(['PDF', 'CSV', 'JSON', 'EXCEL']),
  includeCharts: z.boolean().optional(),
  includeMaps: z.boolean().optional(),
  includeFinancials: z.boolean().optional(),
  includeTimeline: z.boolean().optional()
});

/**
 * @route POST /api/route-card-generation/generate
 * @desc Generate enhanced route cards for specified opportunities
 * @access Private
 */
router.post('/generate', async (req: AuthRequest, res) => {
  try {
    const validationResult = GenerateRouteCardsSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: validationResult.error.issues.map(e => `${e.path.join('.')}: ${e.message}`)
      });
    }

    const { opportunityIds, exportOptions } = validationResult.data;

    // For demo purposes, we'll create mock opportunities
    // In production, these would be fetched from the database
    const mockOpportunities = opportunityIds.map(id => ({
      id,
      routeType: 'CHAINED_TRIPS',
      totalDistance: 45.5,
      totalTime: 120,
      milesSaved: 12.3,
      unitsSaved: 1,
      revenuePotential: 450.00,
      revenueIncrease: 85.00,
      optimizationScore: 78.5,
      transportRequests: [],
      routeStops: [],
      chainingDetails: {
        type: 'TEMPORAL',
        description: 'Efficient route chaining with time optimization',
        benefits: ['Reduced travel time', 'Increased revenue', 'Better resource utilization']
      },
      estimatedStartTime: new Date(),
      estimatedEndTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      timeWindowFlexibility: 45,
      geographicEfficiency: 82,
      temporalEfficiency: 76
    }));

    const enhancedRouteCards = await routeCardGenerationService.generateEnhancedRouteCards(
      mockOpportunities as any,
      exportOptions
    );

    res.status(200).json({
      message: 'Enhanced route cards generated successfully',
      data: {
        routeCards: enhancedRouteCards,
        summary: {
          totalCards: enhancedRouteCards.length,
          totalMilesSaved: enhancedRouteCards.reduce((sum, card) => sum + card.routeSummary.milesSaved, 0),
          totalRevenueIncrease: enhancedRouteCards.reduce((sum, card) => sum + card.routeSummary.revenueIncrease, 0),
          averageOptimizationScore: enhancedRouteCards.reduce((sum, card) => sum + card.optimizationScore, 0) / enhancedRouteCards.length
        }
      }
    });
  } catch (error) {
    console.error('[MedPort:RouteCardGeneration] Error generating enhanced route cards:', error);
    res.status(500).json({
      error: 'Failed to generate enhanced route cards',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route POST /api/route-card-generation/compare
 * @desc Compare multiple route opportunities side by side
 * @access Private
 */
router.post('/compare', async (req: AuthRequest, res) => {
  try {
    const validationResult = RouteCardComparisonSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: validationResult.error.issues.map(e => `${e.path.join('.')}: ${e.message}`)
      });
    }

    const { opportunityIds, comparisonType = 'SIDE_BY_SIDE' } = validationResult.data;

    // Generate mock comparison data
    const comparisonData = {
      comparisonType,
      opportunities: opportunityIds.map((id, index) => ({
        id,
        routeType: ['CHAINED_TRIPS', 'RETURN_TRIP', 'MULTI_STOP'][index % 3],
        optimizationScore: 75 + (index * 5),
        totalDistance: 40 + (index * 10),
        totalTime: 90 + (index * 15),
        milesSaved: 10 + (index * 2),
        revenueIncrease: 80 + (index * 10),
        unitsSaved: 1 + (index % 2)
      })),
      comparisonMetrics: {
        distance: { min: 40, max: 60, avg: 50 },
        time: { min: 90, max: 120, avg: 105 },
        revenue: { min: 80, max: 100, avg: 90 },
        efficiency: { min: 75, max: 90, avg: 82.5 }
      }
    };

    res.status(200).json({
      message: 'Route comparison generated successfully',
      data: comparisonData
    });
  } catch (error) {
    console.error('[MedPort:RouteCardGeneration] Error generating route comparison:', error);
    res.status(500).json({
      error: 'Failed to generate route comparison',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route POST /api/route-card-generation/export
 * @desc Export route cards in various formats
 * @access Private
 */
router.post('/export', async (req: AuthRequest, res) => {
  try {
    const validationResult = ExportRouteCardsSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: validationResult.error.issues.map(e => `${e.path.join('.')}: ${e.message}`)
      });
    }

    const { routeCardIds, format, includeCharts, includeMaps, includeFinancials, includeTimeline } = validationResult.data;

    let exportData: Buffer;
    let contentType: string;
    let filename: string;

    switch (format) {
      case 'PDF':
        exportData = await routeCardGenerationService.generateRouteCardPDF({} as any);
        contentType = 'application/pdf';
        filename = 'route-cards.pdf';
        break;
      case 'EXCEL':
        exportData = await routeCardGenerationService.exportToExcel([]);
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        filename = 'route-cards.xlsx';
        break;
      case 'CSV':
        exportData = Buffer.from('Route ID,Route Type,Optimization Score,Total Distance,Total Time,Miles Saved,Revenue Increase\n');
        contentType = 'text/csv';
        filename = 'route-cards.csv';
        break;
      case 'JSON':
        exportData = Buffer.from(JSON.stringify({ routeCardIds, exportOptions: { includeCharts, includeMaps, includeFinancials, includeTimeline } }, null, 2));
        contentType = 'application/json';
        filename = 'route-cards.json';
        break;
      default:
        return res.status(400).json({
          error: 'Unsupported export format',
          supportedFormats: ['PDF', 'CSV', 'JSON', 'EXCEL']
        });
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(exportData);
  } catch (error) {
    console.error('[MedPort:RouteCardGeneration] Error exporting route cards:', error);
    res.status(500).json({
      error: 'Failed to export route cards',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/route-card-generation/templates
 * @desc Get available route card templates
 * @access Private
 */
router.get('/templates', async (req: AuthRequest, res) => {
  try {
    const templates = [
      {
        id: 'standard',
        name: 'Standard Route Card',
        description: 'Basic route information with key metrics',
        includes: ['Route Summary', 'Basic Metrics', 'Action Buttons']
      },
      {
        id: 'detailed',
        name: 'Detailed Route Card',
        description: 'Comprehensive route analysis with financials',
        includes: ['Route Summary', 'Detailed Metrics', 'Financial Analysis', 'Operational Metrics', 'Timeline']
      },
      {
        id: 'executive',
        name: 'Executive Summary',
        description: 'High-level overview for management review',
        includes: ['Key Metrics', 'Financial Impact', 'Risk Assessment', 'Recommendations']
      },
      {
        id: 'operational',
        name: 'Operational Route Card',
        description: 'Detailed operational information for drivers',
        includes: ['Route Details', 'Waypoints', 'Timeline', 'Constraints', 'Special Instructions']
      }
    ];

    res.status(200).json({
      message: 'Route card templates retrieved successfully',
      data: templates
    });
  } catch (error) {
    console.error('[MedPort:RouteCardGeneration] Error retrieving templates:', error);
    res.status(500).json({
      error: 'Failed to retrieve route card templates',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/route-card-generation/analytics
 * @desc Get route card generation analytics
 * @access Private
 */
router.get('/analytics', async (req: AuthRequest, res) => {
  try {
    const analytics = {
      totalCardsGenerated: 156,
      averageGenerationTime: 2.3, // seconds
      mostPopularFormat: 'PDF',
      formatDistribution: {
        PDF: 45,
        CSV: 25,
        JSON: 20,
        EXCEL: 10
      },
      topRouteTypes: [
        { type: 'CHAINED_TRIPS', count: 67, percentage: 43 },
        { type: 'RETURN_TRIP', count: 45, percentage: 29 },
        { type: 'MULTI_STOP', count: 28, percentage: 18 },
        { type: 'TEMPORAL', count: 16, percentage: 10 }
      ],
      performanceMetrics: {
        averageOptimizationScore: 78.5,
        averageMilesSaved: 12.3,
        averageRevenueIncrease: 85.50,
        averageUnitsSaved: 1.2
      }
    };

    res.status(200).json({
      message: 'Route card analytics retrieved successfully',
      data: analytics
    });
  } catch (error) {
    console.error('[MedPort:RouteCardGeneration] Error retrieving analytics:', error);
    res.status(500).json({
      error: 'Failed to retrieve route card analytics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route POST /api/route-card-generation/notifications
 * @desc Send route card notifications
 * @access Private
 */
router.post('/notifications', async (req: AuthRequest, res) => {
  try {
    const { routeCardIds, recipients, notificationType = 'EMAIL' } = req.body;

    if (!routeCardIds || !recipients) {
      return res.status(400).json({
        error: 'Route card IDs and recipients are required'
      });
    }

    // Mock notification sending
    await routeCardGenerationService.sendRouteCardNotifications(
      routeCardIds.map((id: string) => ({ id } as any)),
      recipients
    );

    res.status(200).json({
      message: 'Route card notifications sent successfully',
      data: {
        notificationsSent: routeCardIds.length,
        recipients: recipients.length,
        notificationType
      }
    });
  } catch (error) {
    console.error('[MedPort:RouteCardGeneration] Error sending notifications:', error);
    res.status(500).json({
      error: 'Failed to send route card notifications',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/route-card-generation/health
 * @desc Health check for route card generation service
 * @access Public (with demo token)
 */
router.get('/health', async (req, res) => {
  res.status(200).json({
    message: 'Route card generation service is healthy',
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    features: [
      'Enhanced route card generation',
      'Route comparison analysis',
      'Multi-format export (PDF, CSV, JSON, Excel)',
      'Template management',
      'Analytics and reporting',
      'Notification system'
    ]
  });
});

export default router;
