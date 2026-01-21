import express from 'express';
import { analyticsService } from '../services/analyticsService';
import { authenticateAdmin, AuthenticatedRequest } from '../middleware/authenticateAdmin';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateAdmin);

/**
 * GET /api/tcc/analytics/overview
 * Get system overview metrics
 */
router.get('/overview', async (req, res) => {
  try {
    const overview = await analyticsService.getSystemOverview();

    res.json({
      success: true,
      data: overview
    });

  } catch (error) {
    console.error('Get system overview error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve system overview'
    });
  }
});

/**
 * GET /api/tcc/analytics/trips
 * Get trip statistics
 */
router.get('/trips', async (req, res) => {
  try {
    const tripStats = await analyticsService.getTripStatistics();

    res.json({
      success: true,
      data: tripStats
    });

  } catch (error) {
    console.error('Get trip statistics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve trip statistics'
    });
  }
});

/**
 * GET /api/tcc/analytics/agencies
 * Get agency performance data
 */
router.get('/agencies', async (req, res) => {
  try {
    const agencyPerformance = await analyticsService.getAgencyPerformance();

    res.json({
      success: true,
      data: agencyPerformance
    });

  } catch (error) {
    console.error('Get agency performance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve agency performance'
    });
  }
});

/**
 * GET /api/tcc/analytics/hospitals
 * Get hospital activity data
 */
router.get('/hospitals', async (req, res) => {
  try {
    const hospitalActivity = await analyticsService.getHospitalActivity();

    res.json({
      success: true,
      data: hospitalActivity
    });

  } catch (error) {
    console.error('Get hospital activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve hospital activity'
    });
  }
});

/**
 * GET /api/tcc/analytics/cost-breakdowns
 * Get trip cost breakdowns
 */
router.get('/cost-breakdowns', async (req, res) => {
  try {
    const { tripId, limit } = req.query;
    const limitNum = limit ? parseInt(limit as string) : 100;

    const breakdowns = await analyticsService.getTripCostBreakdowns(
      tripId as string,
      limitNum
    );

    res.json({
      success: true,
      data: breakdowns
    });

  } catch (error) {
    console.error('Get cost breakdowns error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve cost breakdowns'
    });
  }
});

/**
 * GET /api/tcc/analytics/cost-analysis
 * Get cost analysis summary
 */
router.get('/cost-analysis', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;

    const summary = await analyticsService.getCostAnalysisSummary(start, end);

    res.json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('Get cost analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve cost analysis'
    });
  }
});

/**
 * GET /api/tcc/analytics/profitability
 * Get profitability analysis
 */
router.get('/profitability', async (req, res) => {
  try {
    const { period } = req.query;
    const periodStr = (period as string) || 'month';

    const analysis = await analyticsService.getProfitabilityAnalysis(periodStr);

    res.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    console.error('Get profitability analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve profitability analysis'
    });
  }
});

/**
 * POST /api/tcc/analytics/cost-breakdown
 * Create a new trip cost breakdown
 */
router.post('/cost-breakdown', async (req, res) => {
  try {
    const { tripId, breakdownData } = req.body;

    if (!tripId) {
      return res.status(400).json({
        success: false,
        error: 'Trip ID is required'
      });
    }

    const breakdown = await analyticsService.createTripCostBreakdown(tripId, breakdownData);

    res.json({
      success: true,
      data: breakdown
    });

  } catch (error) {
    console.error('Create cost breakdown error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create cost breakdown'
    });
  }
});

/**
 * GET /api/tcc/analytics/accounts
 * Get account creation statistics
 */
router.get('/accounts', async (req, res) => {
  try {
    const accountStats = await analyticsService.getAccountStatistics();

    res.json({
      success: true,
      data: accountStats
    });

  } catch (error) {
    console.error('Get account statistics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve account statistics'
    });
  }
});

/**
 * GET /api/tcc/analytics/registrations
 * Get recent registrations (facilities or agencies) for a specific time period
 * Query params: type (facilities|agencies), days (60|90)
 */
router.get('/registrations', async (req, res) => {
  try {
    const { type, days } = req.query;

    if (!type || (type !== 'facilities' && type !== 'agencies')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid type parameter. Must be "facilities" or "agencies"'
      });
    }

    const daysNum = days ? parseInt(days as string) : 60;
    if (daysNum !== 60 && daysNum !== 90) {
      return res.status(400).json({
        success: false,
        error: 'Invalid days parameter. Must be 60 or 90'
      });
    }

    const registrations = await analyticsService.getRecentRegistrations(
      type as 'facilities' | 'agencies',
      daysNum as 60 | 90
    );

    res.json({
      success: true,
      data: registrations
    });

  } catch (error) {
    console.error('Get recent registrations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve recent registrations'
    });
  }
});

/**
 * GET /api/tcc/analytics/idle-accounts
 * Get detailed list of idle accounts for a specific time period
 * Query params: days (30|60|90)
 */
router.get('/idle-accounts', async (req, res) => {
  try {
    const { days } = req.query;

    const daysNum = days ? parseInt(days as string) : 30;
    if (daysNum !== 30 && daysNum !== 60 && daysNum !== 90) {
      return res.status(400).json({
        success: false,
        error: 'Invalid days parameter. Must be 30, 60, or 90'
      });
    }

    const idleAccounts = await analyticsService.getIdleAccountsList(daysNum as 30 | 60 | 90);

    res.json({
      success: true,
      data: idleAccounts
    });

  } catch (error) {
    console.error('Get idle accounts list error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve idle accounts list'
    });
  }
});

/**
 * GET /api/tcc/analytics/active-users
 * Get currently active users (one per facility/agency - most recently active)
 * Query params:
 *   - threshold: Minutes threshold (default: 15)
 *   - excludeCurrent: Exclude current user (default: true)
 */
router.get('/active-users', async (req: AuthenticatedRequest, res) => {
  try {
    const threshold = req.query.threshold 
      ? parseInt(req.query.threshold as string, 10) 
      : 15; // Default 15 minutes
    
    const excludeCurrent = req.query.excludeCurrent !== 'false'; // Default true
    const excludeUserId = excludeCurrent && req.user ? req.user.id : undefined;

    const activeUsers = await analyticsService.getActiveUsers(threshold, excludeUserId);

    res.json({
      success: true,
      data: activeUsers,
      threshold,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching active users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch active users'
    });
  }
});

/**
 * GET /api/tcc/analytics/facilities-online
 * Get facilities/agencies online statistics (24h and 7 days)
 */
router.get('/facilities-online', async (req: AuthenticatedRequest, res) => {
  try {
    const stats = await analyticsService.getFacilitiesOnlineStats();

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching facilities online stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch facilities online statistics'
    });
  }
});

export default router;
