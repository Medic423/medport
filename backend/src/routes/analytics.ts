import express from 'express';
import { AuthRequest } from '../middleware/auth';
import AnalyticsService from '../services/analyticsService';

const router = express.Router();
const analyticsService = new AnalyticsService();

/**
 * @route GET /api/analytics/summary
 * @desc Get comprehensive analytics summary
 * @access Private
 */
router.get('/summary', async (req: AuthRequest, res) => {
  try {
    console.log('[ANALYTICS_ROUTES] GET /summary - Request received');
    
    // Parse time range from query parameters
    const timeRange = parseTimeRange(req.query);
    
    const analytics = await analyticsService.getAnalyticsSummary(timeRange);
    
    res.json({
      message: 'Analytics summary retrieved successfully',
      data: analytics
    });
  } catch (error) {
    console.error('[ANALYTICS_ROUTES] Error getting analytics summary:', error);
    res.status(500).json({
      message: 'Failed to get analytics summary',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/analytics/efficiency
 * @desc Get transport efficiency metrics
 * @access Private
 */
router.get('/efficiency', async (req: AuthRequest, res) => {
  try {
    console.log('[ANALYTICS_ROUTES] GET /efficiency - Request received');
    
    const timeRange = parseTimeRange(req.query);
    const analytics = await analyticsService.getAnalyticsSummary(timeRange);
    
    res.json({
      message: 'Efficiency metrics retrieved successfully',
      data: analytics.efficiency
    });
  } catch (error) {
    console.error('[ANALYTICS_ROUTES] Error getting efficiency metrics:', error);
    res.status(500).json({
      message: 'Failed to get efficiency metrics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/analytics/agency-performance
 * @desc Get agency performance metrics
 * @access Private
 */
router.get('/agency-performance', async (req: AuthRequest, res) => {
  try {
    console.log('[ANALYTICS_ROUTES] GET /agency-performance - Request received');
    
    const timeRange = parseTimeRange(req.query);
    const analytics = await analyticsService.getAnalyticsSummary(timeRange);
    
    res.json({
      message: 'Agency performance metrics retrieved successfully',
      data: analytics.agencyPerformance
    });
  } catch (error) {
    console.error('[ANALYTICS_ROUTES] Error getting agency performance metrics:', error);
    res.status(500).json({
      message: 'Failed to get agency performance metrics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/analytics/cost-analysis
 * @desc Get cost analysis metrics
 * @access Private
 */
router.get('/cost-analysis', async (req: AuthRequest, res) => {
  try {
    console.log('[ANALYTICS_ROUTES] GET /cost-analysis - Request received');
    
    const timeRange = parseTimeRange(req.query);
    const analytics = await analyticsService.getAnalyticsSummary(timeRange);
    
    res.json({
      message: 'Cost analysis metrics retrieved successfully',
      data: analytics.costAnalysis
    });
  } catch (error) {
    console.error('[ANALYTICS_ROUTES] Error getting cost analysis metrics:', error);
    res.status(500).json({
      message: 'Failed to get cost analysis metrics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/analytics/historical
 * @desc Get historical data analysis
 * @access Private
 */
router.get('/historical', async (req: AuthRequest, res) => {
  try {
    console.log('[ANALYTICS_ROUTES] GET /historical - Request received');
    
    const timeRange = parseTimeRange(req.query);
    const period = (req.query.period as any) || 'MONTHLY';
    const analytics = await analyticsService.getAnalyticsSummary(timeRange);
    
    res.json({
      message: 'Historical data analysis retrieved successfully',
      data: analytics.historicalData
    });
  } catch (error) {
    console.error('[ANALYTICS_ROUTES] Error getting historical data analysis:', error);
    res.status(500).json({
      message: 'Failed to get historical data analysis',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/analytics/recommendations
 * @desc Get optimization recommendations
 * @access Private
 */
router.get('/recommendations', async (req: AuthRequest, res) => {
  try {
    console.log('[ANALYTICS_ROUTES] GET /recommendations - Request received');
    
    const timeRange = parseTimeRange(req.query);
    const analytics = await analyticsService.getAnalyticsSummary(timeRange);
    
    res.json({
      message: 'Optimization recommendations retrieved successfully',
      data: {
        recommendations: analytics.recommendations,
        lastUpdated: analytics.lastUpdated
      }
    });
  } catch (error) {
    console.error('[ANALYTICS_ROUTES] Error getting recommendations:', error);
    res.status(500).json({
      message: 'Failed to get recommendations',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/analytics/export/csv
 * @desc Export analytics data to CSV
 * @access Private
 */
router.get('/export/csv', async (req: AuthRequest, res) => {
  try {
    console.log('[ANALYTICS_ROUTES] GET /export/csv - Request received');
    
    const timeRange = parseTimeRange(req.query);
    const csvData = await analyticsService.exportAnalyticsToCSV(timeRange);
    
    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="medport-analytics-${new Date().toISOString().split('T')[0]}.csv"`);
    
    res.send(csvData);
  } catch (error) {
    console.error('[ANALYTICS_ROUTES] Error exporting to CSV:', error);
    res.status(500).json({
      message: 'Failed to export analytics to CSV',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/analytics/overview
 * @desc Get overview metrics
 * @access Private
 */
router.get('/overview', async (req: AuthRequest, res) => {
  try {
    console.log('[ANALYTICS_ROUTES] GET /overview - Request received');
    
    const timeRange = parseTimeRange(req.query);
    const analytics = await analyticsService.getAnalyticsSummary(timeRange);
    
    res.json({
      message: 'Overview metrics retrieved successfully',
      data: analytics.overview
    });
  } catch (error) {
    console.error('[ANALYTICS_ROUTES] Error getting overview metrics:', error);
    res.status(500).json({
      message: 'Failed to get overview metrics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/analytics/performance
 * @desc Get performance metrics for specific entity
 * @access Private
 */
router.get('/performance/:entityType/:entityId', async (req: AuthRequest, res) => {
  try {
    console.log('[ANALYTICS_ROUTES] GET /performance/:entityType/:entityId - Request received');
    
    const { entityType, entityId } = req.params;
    const timeRange = parseTimeRange(req.query);
    
    if (!['unit', 'agency'].includes(entityType)) {
      return res.status(400).json({
        message: 'Invalid entity type. Must be "unit" or "agency"'
      });
    }
    
    // For now, return general analytics - in future could add entity-specific metrics
    const analytics = await analyticsService.getAnalyticsSummary(timeRange);
    
    res.json({
      message: `${entityType} performance metrics retrieved successfully`,
      data: {
        entityType,
        entityId,
        metrics: analytics.efficiency,
        lastUpdated: analytics.lastUpdated
      }
    });
  } catch (error) {
    console.error('[ANALYTICS_ROUTES] Error getting performance metrics:', error);
    res.status(500).json({
      message: 'Failed to get performance metrics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Helper function to parse time range from query parameters
 */
function parseTimeRange(query: any): { start: Date; end: Date } {
  const now = new Date();
  let start: Date;
  let end: Date = now;
  
  const period = query.period || '30d';
  
  switch (period) {
    case '24h':
      start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case '1y':
      start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    case 'custom':
      start = query.startDate ? new Date(query.startDate) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      end = query.endDate ? new Date(query.endDate) : now;
      break;
    default:
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  
  return { start, end };
}

export default router;
