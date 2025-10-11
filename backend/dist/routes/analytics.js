"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const analyticsService_1 = require("../services/analyticsService");
const authenticateAdmin_1 = require("../middleware/authenticateAdmin");
const router = express_1.default.Router();
// Apply authentication to all routes
router.use(authenticateAdmin_1.authenticateAdmin);
/**
 * GET /api/tcc/analytics/overview
 * Get system overview metrics
 */
router.get('/overview', async (req, res) => {
    try {
        const overview = await analyticsService_1.analyticsService.getSystemOverview();
        res.json({
            success: true,
            data: overview
        });
    }
    catch (error) {
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
        const tripStats = await analyticsService_1.analyticsService.getTripStatistics();
        res.json({
            success: true,
            data: tripStats
        });
    }
    catch (error) {
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
        const agencyPerformance = await analyticsService_1.analyticsService.getAgencyPerformance();
        res.json({
            success: true,
            data: agencyPerformance
        });
    }
    catch (error) {
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
        const hospitalActivity = await analyticsService_1.analyticsService.getHospitalActivity();
        res.json({
            success: true,
            data: hospitalActivity
        });
    }
    catch (error) {
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
        const limitNum = limit ? parseInt(limit) : 100;
        const breakdowns = await analyticsService_1.analyticsService.getTripCostBreakdowns(tripId, limitNum);
        res.json({
            success: true,
            data: breakdowns
        });
    }
    catch (error) {
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
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        const summary = await analyticsService_1.analyticsService.getCostAnalysisSummary(start, end);
        res.json({
            success: true,
            data: summary
        });
    }
    catch (error) {
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
        const periodStr = period || 'month';
        const analysis = await analyticsService_1.analyticsService.getProfitabilityAnalysis(periodStr);
        res.json({
            success: true,
            data: analysis
        });
    }
    catch (error) {
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
        const breakdown = await analyticsService_1.analyticsService.createTripCostBreakdown(tripId, breakdownData);
        res.json({
            success: true,
            data: breakdown
        });
    }
    catch (error) {
        console.error('Create cost breakdown error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create cost breakdown'
        });
    }
});
exports.default = router;
//# sourceMappingURL=analytics.js.map