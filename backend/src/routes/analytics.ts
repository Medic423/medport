import express from 'express';
import { analyticsService } from '../services/analyticsService';
import { authenticateAdmin } from '../middleware/authenticateAdmin';

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

export default router;
