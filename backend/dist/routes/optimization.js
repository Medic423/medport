"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const revenueOptimizer_1 = require("../services/revenueOptimizer");
const backhaulDetector_1 = require("../services/backhaulDetector");
const multiUnitOptimizer_1 = require("../services/multiUnitOptimizer");
const databaseManager_1 = require("../services/databaseManager");
const authService_1 = require("../services/authService");
const coordinateService_1 = require("../services/coordinateService");
const router = express_1.default.Router();
// Initialize optimization services
const revenueOptimizer = new revenueOptimizer_1.RevenueOptimizer(databaseManager_1.databaseManager);
const backhaulDetector = new backhaulDetector_1.BackhaulDetector();
const multiUnitOptimizer = new multiUnitOptimizer_1.MultiUnitOptimizer(revenueOptimizer, backhaulDetector);
/**
 * POST /api/optimize/routes
 * Optimize routes for a specific unit
 */
router.post('/routes', async (req, res) => {
    try {
        const { unitId, requestIds, constraints } = req.body;
        if (!unitId || !requestIds || !Array.isArray(requestIds)) {
            return res.status(400).json({
                success: false,
                error: 'unitId and requestIds array are required'
            });
        }
        // Get unit information
        const unit = await getUnitById(unitId);
        if (!unit) {
            return res.status(404).json({
                success: false,
                error: 'Unit not found'
            });
        }
        // Get request information
        const requests = await getRequestsByIds(requestIds);
        if (requests.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No valid requests found'
            });
        }
        // Calculate optimization scores
        const currentTime = new Date();
        const optimizationResults = requests
            .filter(request => revenueOptimizer.canHandleRequest(unit, request))
            .map(request => {
            const score = revenueOptimizer.calculateScore(unit, request, currentTime);
            const revenue = revenueOptimizer.calculateRevenue(request);
            const deadheadMiles = revenueOptimizer.calculateDeadheadMiles(unit, request);
            const waitTime = revenueOptimizer.calculateWaitTime(unit, request, currentTime);
            const overtimeRisk = revenueOptimizer.calculateOvertimeRisk(unit, request, currentTime);
            return {
                requestId: request.id,
                score,
                revenue,
                deadheadMiles,
                waitTime,
                overtimeRisk,
                canHandle: true
            };
        })
            .sort((a, b) => b.score - a.score); // Sort by score descending
        // Find backhaul opportunities
        const backhaulPairs = backhaulDetector.findPairs(requests);
        res.json({
            success: true,
            data: {
                unitId,
                optimizedRequests: optimizationResults,
                backhaulPairs: backhaulPairs.slice(0, 5), // Top 5 pairs
                totalRevenue: optimizationResults.reduce((sum, result) => sum + result.revenue, 0),
                totalDeadheadMiles: optimizationResults.reduce((sum, result) => sum + result.deadheadMiles, 0),
                totalWaitTime: optimizationResults.reduce((sum, result) => sum + result.waitTime, 0),
                averageScore: optimizationResults.length > 0
                    ? optimizationResults.reduce((sum, result) => sum + result.score, 0) / optimizationResults.length
                    : 0
            }
        });
    }
    catch (error) {
        console.error('Route optimization error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during route optimization'
        });
    }
});
/**
 * GET /api/optimize/revenue
 * Get revenue analytics for a time period
 * SIMPLIFIED: Commented out complex revenue calculations for Phase 3 simplification
 */
/*
router.get('/revenue', async (req, res) => {
  try {
    const { timeframe = '24h', agencyId } = req.query;

    // Calculate time range
    const now = new Date();
    const timeRanges = {
      '1h': 1 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };

    const timeRange = timeRanges[timeframe as keyof typeof timeRanges] || timeRanges['24h'];
    const startTime = new Date(now.getTime() - timeRange);

    // Get completed trips in time range
    const trips = await getCompletedTripsInRange(startTime, now, agencyId as string);
    console.log('TCC_DEBUG: Revenue analytics - trips found:', trips.length);
    console.log('TCC_DEBUG: Revenue analytics - sample trip:', trips[0]);

    // Calculate metrics using new database fields when available
    const totalRevenue = trips.reduce((sum, trip) => sum + calculateTripRevenue(trip), 0);
    const totalMiles = trips.reduce((sum, trip) => sum + calculateTripMiles(trip), 0);
    const loadedMiles = trips.reduce((sum, trip) => sum + calculateLoadedMiles(trip), 0);
    const loadedMileRatio = totalMiles > 0 ? loadedMiles / totalMiles : 0;
    
    // Use stored revenuePerHour if available, otherwise calculate
    const storedRevenuePerHour = trips.find(trip => trip.revenuePerHour)?.revenuePerHour;
    const revenuePerHour = storedRevenuePerHour ? Number(storedRevenuePerHour) : totalRevenue / (timeRange / (1000 * 60 * 60));
    
    console.log('TCC_DEBUG: Revenue analytics - calculated values:', {
      totalRevenue,
      totalMiles,
      loadedMiles,
      loadedMileRatio,
      revenuePerHour
    });

    res.json({
      success: true,
      data: {
        timeframe,
        totalRevenue,
        loadedMileRatio,
        revenuePerHour,
        totalTrips: trips.length,
        averageRevenuePerTrip: trips.length > 0 ? totalRevenue / trips.length : 0,
        totalMiles,
        loadedMiles
      }
    });
  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during revenue analytics'
    });
  }
});
*/
// SIMPLIFIED: Basic revenue endpoint that returns minimal data
router.get('/revenue', async (req, res) => {
    try {
        const { timeframe = '24h', agencyId } = req.query;
        // For simplification, just return basic trip count
        res.json({
            success: true,
            data: {
                timeframe,
                totalTrips: 0, // Will be populated when trips are implemented
                message: 'Simplified revenue endpoint - complex calculations removed for Phase 3'
            }
        });
    }
    catch (error) {
        console.error('Revenue analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during revenue analytics'
        });
    }
});
/**
 * POST /api/optimize/backhaul
 * Find backhaul opportunities for given requests
 */
router.post('/backhaul', async (req, res) => {
    try {
        const { requestIds } = req.body;
        if (!requestIds || !Array.isArray(requestIds)) {
            return res.status(400).json({
                success: false,
                error: 'requestIds array is required'
            });
        }
        // Get request information
        const requests = await getRequestsByIds(requestIds);
        if (requests.length < 2) {
            return res.status(400).json({
                success: false,
                error: 'At least 2 requests are required for backhaul analysis'
            });
        }
        // Find backhaul pairs
        const pairs = backhaulDetector.findPairs(requests);
        const statistics = backhaulDetector.getBackhaulStatistics(requests);
        res.json({
            success: true,
            data: {
                pairs,
                statistics,
                recommendations: pairs.slice(0, 10).map(pair => ({
                    pairId: `${pair.request1.id}-${pair.request2.id}`,
                    efficiency: pair.efficiency,
                    distance: pair.distance,
                    timeWindow: pair.timeWindow,
                    revenueBonus: pair.revenueBonus,
                    potentialRevenue: backhaulDetector.calculatePairingRevenue(pair)
                }))
            }
        });
    }
    catch (error) {
        console.error('Backhaul analysis error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during backhaul analysis'
        });
    }
});
/**
 * GET /api/optimize/return-trips
 * Find return trip opportunities in the system (e.g., Altoona → Pittsburgh → Altoona)
 */
router.get('/return-trips', async (req, res) => {
    try {
        console.log('TCC_DEBUG: Finding return trip opportunities...');
        // Get all pending requests
        const allRequests = await getAllPendingRequests();
        console.log('TCC_DEBUG: Found pending requests:', allRequests.length);
        // Find return trip opportunities
        const returnTrips = backhaulDetector.findAllReturnTripOpportunities(allRequests);
        console.log('TCC_DEBUG: Found return trip opportunities:', returnTrips.length);
        // Calculate statistics
        const statistics = {
            totalRequests: allRequests.length,
            returnTripOpportunities: returnTrips.length,
            averageEfficiency: returnTrips.length > 0
                ? returnTrips.reduce((sum, pair) => sum + pair.efficiency, 0) / returnTrips.length
                : 0,
            potentialRevenueIncrease: returnTrips.reduce((sum, pair) => sum + backhaulDetector.calculatePairingRevenue(pair), 0)
        };
        res.json({
            success: true,
            data: {
                returnTrips: returnTrips.slice(0, 20), // Limit to top 20
                statistics,
                recommendations: returnTrips.slice(0, 10).map(pair => ({
                    pairId: `${pair.request1.id}-${pair.request2.id}`,
                    efficiency: pair.efficiency,
                    distance: pair.distance,
                    timeWindow: pair.timeWindow,
                    revenueBonus: pair.revenueBonus,
                    potentialRevenue: backhaulDetector.calculatePairingRevenue(pair),
                    isReturnTrip: true
                }))
            }
        });
    }
    catch (error) {
        console.error('Return trip analysis error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during return trip analysis'
        });
    }
});
/**
 * POST /api/optimize/multi-unit
 * Optimize assignments across multiple units
 */
router.post('/multi-unit', async (req, res) => {
    try {
        const { unitIds, requestIds, constraints } = req.body;
        if (!unitIds || !Array.isArray(unitIds) || !requestIds || !Array.isArray(requestIds)) {
            return res.status(400).json({
                success: false,
                error: 'unitIds and requestIds arrays are required'
            });
        }
        // Get units information
        const units = await getUnitsByIds(unitIds);
        if (units.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No valid units found'
            });
        }
        // Get requests information
        const requests = await getRequestsByIds(requestIds);
        if (requests.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No valid requests found'
            });
        }
        // Update constraints if provided
        if (constraints) {
            multiUnitOptimizer.updateConstraints(constraints);
        }
        // Run multi-unit optimization
        const currentTime = new Date();
        const optimizationResult = await multiUnitOptimizer.optimizeMultiUnit(units, requests, currentTime);
        res.json({
            success: true,
            data: optimizationResult
        });
    }
    catch (error) {
        console.error('Multi-unit optimization error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during multi-unit optimization'
        });
    }
});
/**
 * GET /api/optimize/performance
 * Get performance metrics for units
 */
router.get('/performance', async (req, res) => {
    try {
        const { timeframe = '24h', unitId } = req.query;
        // Calculate time range
        const now = new Date();
        const timeRanges = {
            '1h': 1 * 60 * 60 * 1000,
            '24h': 24 * 60 * 60 * 1000,
            '7d': 7 * 24 * 60 * 60 * 1000,
            '30d': 30 * 24 * 60 * 60 * 1000
        };
        const timeRange = timeRanges[timeframe] || timeRanges['24h'];
        const startTime = new Date(now.getTime() - timeRange);
        // Get performance data
        const performanceData = await getPerformanceMetrics(startTime, now, unitId);
        console.log('TCC_DEBUG: Performance metrics - data:', performanceData);
        res.json({
            success: true,
            data: {
                timeframe,
                ...performanceData
            }
        });
    }
    catch (error) {
        console.error('Performance metrics error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during performance analysis'
        });
    }
});
// ===== ROUTE OPTIMIZATION SETTINGS ENDPOINTS (Phase 3) =====
/**
 * GET /api/optimize/settings
 * Get route optimization settings for an agency or global defaults
 */
router.get('/settings', async (req, res) => {
    try {
        const { agencyId } = req.query;
        const prisma = databaseManager_1.databaseManager.getCenterDB();
        // Get settings for specific agency or global defaults
        let settings = await prisma.route_optimization_settings.findFirst({
            where: {
                agencyId: agencyId || null,
                isActive: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        // If no agency-specific settings, get global defaults
        if (!settings && agencyId) {
            settings = await prisma.route_optimization_settings.findFirst({
                where: {
                    agencyId: null,
                    isActive: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
        }
        // If no settings exist at all, create default global settings
        if (!settings) {
            settings = await prisma.route_optimization_settings.create({
                data: {
                    id: `global-${Date.now()}`,
                    agencyId: null,
                    updatedAt: new Date()
                }
            });
        }
        res.json({
            success: true,
            data: settings
        });
    }
    catch (error) {
        console.error('Get optimization settings error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error getting optimization settings'
        });
    }
});
/**
 * POST /api/optimize/settings
 * Create or update route optimization settings
 */
router.post('/settings', async (req, res) => {
    try {
        const { agencyId, ...settingsData } = req.body;
        const prisma = databaseManager_1.databaseManager.getCenterDB();
        // Check if settings already exist for this agency
        const existingSettings = await prisma.route_optimization_settings.findFirst({
            where: {
                agencyId: agencyId || null,
                isActive: true
            }
        });
        let settings;
        if (existingSettings) {
            // Update existing settings
            settings = await prisma.route_optimization_settings.update({
                where: { id: existingSettings.id },
                data: {
                    ...settingsData,
                    updatedAt: new Date()
                }
            });
        }
        else {
            // Create new settings
            settings = await prisma.route_optimization_settings.create({
                data: {
                    id: `agency-${agencyId}-${Date.now()}`,
                    agencyId: agencyId || null,
                    ...settingsData,
                    updatedAt: new Date()
                }
            });
        }
        res.json({
            success: true,
            data: settings
        });
    }
    catch (error) {
        console.error('Create/update optimization settings error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error creating/updating optimization settings'
        });
    }
});
/**
 * POST /api/optimize/settings/reset
 * Reset optimization settings to defaults
 */
router.post('/settings/reset', async (req, res) => {
    try {
        const { agencyId } = req.body;
        const prisma = databaseManager_1.databaseManager.getCenterDB();
        // Deactivate existing settings
        await prisma.route_optimization_settings.updateMany({
            where: {
                agencyId: agencyId || null,
                isActive: true
            },
            data: {
                isActive: false
            }
        });
        // Create new default settings
        const settings = await prisma.route_optimization_settings.create({
            data: {
                id: `default-${agencyId || 'global'}-${Date.now()}`,
                agencyId: agencyId || null,
                updatedAt: new Date()
            }
        });
        res.json({
            success: true,
            data: settings
        });
    }
    catch (error) {
        console.error('Reset optimization settings error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error resetting optimization settings'
        });
    }
});
/**
 * POST /api/optimize/preview
 * Preview optimization results with current settings
 */
router.post('/preview', async (req, res) => {
    try {
        const { unitIds, requestIds, settings } = req.body;
        if (!unitIds || !Array.isArray(unitIds) || !requestIds || !Array.isArray(requestIds)) {
            return res.status(400).json({
                success: false,
                error: 'unitIds and requestIds arrays are required'
            });
        }
        // Get units and requests
        const units = await getUnitsByIds(unitIds);
        const requests = await getRequestsByIds(requestIds);
        if (units.length === 0 || requests.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No valid units or requests found'
            });
        }
        // Use provided settings or get from database
        let optimizationSettings = settings;
        if (!optimizationSettings) {
            const prisma = databaseManager_1.databaseManager.getCenterDB();
            const dbSettings = await prisma.route_optimization_settings.findFirst({
                where: { isActive: true },
                orderBy: { createdAt: 'desc' }
            });
            optimizationSettings = dbSettings;
        }
        // Run optimization preview
        const currentTime = new Date();
        const previewResults = await runOptimizationPreview(units, requests, optimizationSettings, currentTime);
        res.json({
            success: true,
            data: previewResults
        });
    }
    catch (error) {
        console.error('Optimization preview error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during optimization preview'
        });
    }
});
/**
 * POST /api/optimize/what-if
 * Run what-if scenario analysis
 */
router.post('/what-if', async (req, res) => {
    try {
        const { unitIds, requestIds, scenarioSettings, baseSettings } = req.body;
        if (!unitIds || !Array.isArray(unitIds) || !requestIds || !Array.isArray(requestIds)) {
            return res.status(400).json({
                success: false,
                error: 'unitIds and requestIds arrays are required'
            });
        }
        // Get units and requests
        const units = await getUnitsByIds(unitIds);
        const requests = await getRequestsByIds(requestIds);
        if (units.length === 0 || requests.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No valid units or requests found'
            });
        }
        const currentTime = new Date();
        // Run base scenario
        const baseResults = await runOptimizationPreview(units, requests, baseSettings, currentTime);
        // Run what-if scenario
        const whatIfResults = await runOptimizationPreview(units, requests, scenarioSettings, currentTime);
        // Calculate differences
        const comparison = {
            baseScenario: baseResults,
            whatIfScenario: whatIfResults,
            differences: {
                revenueDifference: whatIfResults.totalRevenue - baseResults.totalRevenue,
                deadheadMilesDifference: whatIfResults.totalDeadheadMiles - baseResults.totalDeadheadMiles,
                efficiencyDifference: whatIfResults.averageEfficiency - baseResults.averageEfficiency,
                responseTimeDifference: whatIfResults.averageResponseTime - baseResults.averageResponseTime
            }
        };
        res.json({
            success: true,
            data: comparison
        });
    }
    catch (error) {
        console.error('What-if analysis error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during what-if analysis'
        });
    }
});
/**
 * GET /api/optimize/stream
 * Server-Sent Events stream for real-time optimization metrics
 */
router.get('/stream', async (req, res) => {
    // Manual token verification for SSE
    const token = req.query.token || req.headers.authorization?.replace('Bearer ', '') || req.cookies?.tcc_token;
    if (!token) {
        res.status(401).json({ success: false, error: 'Access token required' });
        return;
    }
    try {
        const user = await authService_1.authService.verifyToken(token);
        if (!user) {
            res.status(401).json({ success: false, error: 'Invalid or expired token' });
            return;
        }
        // Set user for the request
        req.user = user;
    }
    catch (error) {
        console.error('SSE authentication error:', error);
        res.status(401).json({ success: false, error: 'Authentication failed' });
        return;
    }
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();
    const writeEvent = (event, data) => {
        res.write(`event: ${event}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };
    writeEvent('connected', { ok: true, timestamp: new Date().toISOString() });
    let isClosed = false;
    req.on('close', () => {
        isClosed = true;
    });
    const interval = setInterval(async () => {
        if (isClosed) {
            clearInterval(interval);
            return;
        }
        try {
            const now = new Date();
            const start = new Date(now.getTime() - 5 * 60 * 1000);
            const snapshot = await getPerformanceMetrics(start, now);
            writeEvent('metrics', {
                timestamp: new Date().toISOString(),
                summary: snapshot
            });
        }
        catch (error) {
            writeEvent('error', { message: 'Failed to compute metrics' });
        }
    }, 5000);
});
// Helper functions - Real database queries
async function getAllPendingRequests() {
    try {
        const prisma = databaseManager_1.databaseManager.getCenterDB();
        const trips = await prisma.transportRequest.findMany({
            where: {
                status: 'PENDING'
            },
            select: {
                id: true,
                patientId: true,
                originFacilityId: true,
                destinationFacilityId: true,
                fromLocation: true,
                toLocation: true,
                transportLevel: true,
                priority: true,
                scheduledTime: true,
                specialNeeds: true,
                createdAt: true
            }
        });
        console.log('TCC_DEBUG: getAllPendingRequests - Found trips:', trips.length);
        // Get unique facility IDs for coordinate lookup
        const facilityIds = new Set();
        trips.forEach(trip => {
            if (trip.originFacilityId)
                facilityIds.add(trip.originFacilityId);
            if (trip.destinationFacilityId)
                facilityIds.add(trip.destinationFacilityId);
        });
        console.log('TCC_DEBUG: Looking up coordinates for pending requests facilities:', Array.from(facilityIds));
        // Get coordinates for all facilities
        const facilityCoordinates = await coordinateService_1.coordinateService.getFacilitiesCoordinates(Array.from(facilityIds));
        console.log('TCC_DEBUG: Retrieved facility coordinates for pending requests:', facilityCoordinates.size, 'facilities');
        // Convert to TransportRequest format
        return trips.map(trip => {
            const originFacilityId = trip.originFacilityId || trip.fromLocation || 'unknown';
            const destinationFacilityId = trip.destinationFacilityId || trip.toLocation || 'unknown';
            // Get coordinates for origin and destination
            const originCoords = facilityCoordinates.get(originFacilityId) || coordinateService_1.coordinateService.getDefaultCoordinates();
            const destinationCoords = facilityCoordinates.get(destinationFacilityId) || coordinateService_1.coordinateService.getDefaultCoordinates();
            return {
                id: trip.id,
                patientId: trip.patientId,
                originFacilityId,
                destinationFacilityId,
                transportLevel: trip.transportLevel,
                priority: trip.priority,
                status: 'PENDING',
                specialRequirements: trip.specialNeeds || '',
                requestTimestamp: new Date(trip.createdAt),
                readyStart: trip.scheduledTime ? new Date(trip.scheduledTime) : new Date(trip.createdAt),
                readyEnd: trip.scheduledTime ? new Date(new Date(trip.scheduledTime).getTime() + 60 * 60 * 1000) : new Date(new Date(trip.createdAt).getTime() + 60 * 60 * 1000), // 1 hour window
                // Use real facility coordinates
                originLocation: { lat: originCoords.lat, lng: originCoords.lng },
                destinationLocation: { lat: destinationCoords.lat, lng: destinationCoords.lng },
                // Add facility names for debugging
                originFacilityName: originCoords.name || originFacilityId,
                destinationFacilityName: destinationCoords.name || destinationFacilityId
            };
        });
    }
    catch (error) {
        console.error('Error getting pending requests:', error);
        return [];
    }
}
async function getUnitById(unitId) {
    try {
        const prisma = databaseManager_1.databaseManager.getEMSDB();
        const unit = await prisma.unit.findUnique({
            where: { id: unitId },
            include: {
                agency: true
            }
        });
        if (!unit) {
            return null;
        }
        return {
            id: unit.id,
            agencyId: unit.agencyId,
            unitNumber: unit.unitNumber,
            type: unit.type,
            capabilities: unit.capabilities || [],
            currentStatus: unit.currentStatus,
            currentLocation: unit.latitude && unit.longitude ? {
                lat: unit.latitude,
                lng: unit.longitude
            } : { lat: 40.7128, lng: -74.0060 }, // Default to NYC if no location set
            shiftStart: unit.shiftStart || new Date(),
            shiftEnd: unit.shiftEnd || new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
            isActive: unit.isActive
        };
    }
    catch (error) {
        console.error('Error fetching unit by ID:', error);
        return null;
    }
}
async function getUnitsByIds(unitIds) {
    try {
        const prisma = databaseManager_1.databaseManager.getEMSDB();
        const units = await prisma.unit.findMany({
            where: {
                id: { in: unitIds },
                isActive: true
            },
            include: {
                agency: true
            }
        });
        return units.map((unit) => ({
            id: unit.id,
            agencyId: unit.agencyId,
            unitNumber: unit.unitNumber,
            type: unit.type,
            capabilities: unit.capabilities || [],
            currentStatus: unit.currentStatus,
            currentLocation: unit.latitude && unit.longitude ? {
                lat: unit.latitude,
                lng: unit.longitude
            } : { lat: 40.7128, lng: -74.0060 }, // Default to NYC if no location set
            shiftStart: unit.shiftStart || new Date(),
            shiftEnd: unit.shiftEnd || new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
            isActive: unit.isActive
        }));
    }
    catch (error) {
        console.error('Error fetching units by IDs:', error);
        return [];
    }
}
async function getRequestsByIds(requestIds) {
    try {
        const prisma = databaseManager_1.databaseManager.getCenterDB();
        const trips = await prisma.transportRequest.findMany({
            where: {
                id: { in: requestIds }
            }
        });
        console.log('TCC_DEBUG: getRequestsByIds - Found trips:', trips.length);
        if (trips.length > 0) {
            console.log('TCC_DEBUG: Sample trip:', trips[0]);
        }
        // Get unique facility IDs for coordinate lookup
        const facilityIds = new Set();
        trips.forEach(trip => {
            if (trip.originFacilityId)
                facilityIds.add(trip.originFacilityId);
            if (trip.destinationFacilityId)
                facilityIds.add(trip.destinationFacilityId);
        });
        console.log('TCC_DEBUG: Looking up coordinates for facilities:', Array.from(facilityIds));
        // Get coordinates for all facilities
        const facilityCoordinates = await coordinateService_1.coordinateService.getFacilitiesCoordinates(Array.from(facilityIds));
        console.log('TCC_DEBUG: Retrieved facility coordinates:', facilityCoordinates.size, 'facilities');
        return trips.map(trip => {
            const originFacilityId = trip.originFacilityId || trip.fromLocation || 'unknown';
            const destinationFacilityId = trip.destinationFacilityId || trip.toLocation || 'unknown';
            // Get coordinates for origin and destination
            const originCoords = facilityCoordinates.get(originFacilityId) || coordinateService_1.coordinateService.getDefaultCoordinates();
            const destinationCoords = facilityCoordinates.get(destinationFacilityId) || coordinateService_1.coordinateService.getDefaultCoordinates();
            return {
                id: trip.id,
                patientId: trip.patientId,
                originFacilityId,
                destinationFacilityId,
                transportLevel: trip.transportLevel,
                priority: trip.priority,
                status: trip.status,
                specialRequirements: trip.specialNeeds || trip.specialRequirements || '',
                requestTimestamp: trip.requestTimestamp || trip.createdAt,
                readyStart: trip.scheduledTime || trip.createdAt,
                readyEnd: new Date((trip.scheduledTime || trip.createdAt).getTime() + 30 * 60 * 1000), // 30 minutes window
                // Use real facility coordinates
                originLocation: { lat: originCoords.lat, lng: originCoords.lng },
                destinationLocation: { lat: destinationCoords.lat, lng: destinationCoords.lng },
                // Add facility names for debugging
                originFacilityName: originCoords.name || originFacilityId,
                destinationFacilityName: destinationCoords.name || destinationFacilityId
            };
        });
    }
    catch (error) {
        console.error('Error fetching requests by IDs:', error);
        return [];
    }
}
async function getCompletedTripsInRange(startTime, endTime, agencyId) {
    try {
        const prisma = databaseManager_1.databaseManager.getCenterDB();
        const whereClause = {
            status: 'COMPLETED',
            completionTimestamp: {
                gte: startTime,
                lte: endTime
            }
        };
        // If agencyId is provided, filter by assigned agency
        if (agencyId) {
            whereClause.assignedAgencyId = agencyId;
        }
        const trips = await prisma.transportRequest.findMany({
            where: whereClause,
            select: {
                id: true,
                transportLevel: true,
                priority: true,
                completionTimestamp: true,
                assignedAgencyId: true,
                createdAt: true
            }
        });
        return trips.map(trip => ({
            id: trip.id,
            transportLevel: trip.transportLevel,
            priority: trip.priority,
            completedAt: trip.completionTimestamp,
            revenue: 0, // TODO: Calculate from transportLevel
            miles: 0, // TODO: Calculate from facilities
            loadedMiles: 0,
            responseTimeMinutes: 0,
            actualTripTimeMinutes: 0,
            assignedAgencyId: trip.assignedAgencyId
        }));
    }
    catch (error) {
        console.error('Error fetching completed trips in range:', error);
        return [];
    }
}
function calculateTripRevenue(trip) {
    // Use stored trip cost if available
    if (trip.tripCost && trip.tripCost > 0) {
        return Number(trip.tripCost);
    }
    // Use stored revenue if available (new field)
    if (trip.revenue && trip.revenue > 0) {
        return Number(trip.revenue);
    }
    // Calculate base rate by transport level
    const baseRates = {
        'BLS': 150.0,
        'ALS': 250.0,
        'CCT': 400.0,
        'CRITICAL_CARE': 400.0,
        'NEONATAL': 500.0,
        'BARIATRIC': 300.0
    };
    const baseRate = baseRates[trip.transportLevel] || 150.0;
    // Apply priority multipliers
    const priorityMultipliers = {
        'LOW': 1.0,
        'MEDIUM': 1.1,
        'HIGH': 1.25,
        'URGENT': 1.5,
        'EMERGENCY': 1.5
    };
    const priorityMultiplier = priorityMultipliers[trip.priority] || 1.0;
    // Calculate distance-based pricing if coordinates are available
    let distanceMultiplier = 1.0;
    if (trip.originLocation && trip.destinationLocation) {
        const distance = coordinateService_1.coordinateService.calculateDistance(trip.originLocation, trip.destinationLocation);
        // Add $2 per mile for distances over 10 miles
        if (distance > 10) {
            distanceMultiplier = 1 + ((distance - 10) * 2 / baseRate);
        }
    }
    const totalRevenue = baseRate * priorityMultiplier * distanceMultiplier;
    return Math.round(totalRevenue * 100) / 100; // Round to 2 decimal places
}
function calculateTripMiles(trip) {
    // Use stored distance if available
    if (trip.distanceMiles && trip.distanceMiles > 0) {
        return Number(trip.distanceMiles);
    }
    // Calculate distance from coordinates if available
    if (trip.originLocation && trip.destinationLocation) {
        const distance = coordinateService_1.coordinateService.calculateDistance(trip.originLocation, trip.destinationLocation);
        return distance;
    }
    return 0;
}
function calculateLoadedMiles(trip) {
    // Use stored loadedMiles if available (new field)
    if (trip.loadedMiles && trip.loadedMiles > 0) {
        return Number(trip.loadedMiles);
    }
    // For now, assume all miles are loaded miles (no deadhead calculation)
    // In the future, this could subtract deadhead miles from total miles
    return calculateTripMiles(trip);
}
async function getPerformanceMetrics(startTime, endTime, unitId) {
    try {
        const prisma = databaseManager_1.databaseManager.getCenterDB();
        const whereClause = {
            status: 'COMPLETED',
            completionTimestamp: {
                gte: startTime,
                lte: endTime
            }
        };
        // If unitId is provided, filter by assigned unit
        if (unitId) {
            whereClause.assignedUnitId = unitId;
        }
        const trips = await prisma.transportRequest.findMany({
            where: whereClause,
            select: {
                id: true,
                completionTimestamp: true,
                createdAt: true
            }
        });
        const totalTrips = trips.length;
        const completedTrips = trips.filter(trip => trip.completionTimestamp).length;
        const totalRevenue = 0; // TODO: Calculate from trip data
        const averageResponseTime = 0; // TODO: Calculate from timestamps
        const averageTripTime = 0; // TODO: Calculate from timestamps
        const efficiency = totalTrips > 0 ? completedTrips / totalTrips : 0;
        return {
            totalTrips,
            completedTrips,
            averageResponseTime,
            averageTripTime,
            totalRevenue,
            efficiency,
            customerSatisfaction: 4.2 // Placeholder - would need customer feedback system
        };
    }
    catch (error) {
        console.error('Error fetching performance metrics:', error);
        return {
            totalTrips: 0,
            completedTrips: 0,
            averageResponseTime: 0,
            averageTripTime: 0,
            totalRevenue: 0,
            efficiency: 0,
            customerSatisfaction: 0
        };
    }
}
// ===== OPTIMIZATION PREVIEW FUNCTIONS (Phase 3) =====
async function runOptimizationPreview(units, requests, settings, currentTime) {
    try {
        // Initialize optimization weights from settings
        const weights = {
            deadheadMile: Number(settings?.deadheadMileWeight || 1.0),
            waitTime: Number(settings?.waitTimeWeight || 1.0),
            backhaulBonus: Number(settings?.backhaulBonusWeight || 1.0),
            overtimeRisk: Number(settings?.overtimeRiskWeight || 1.0),
            revenue: Number(settings?.revenueWeight || 1.0),
            crewAvailability: Number(settings?.crewAvailabilityWeight || 1.0),
            equipmentCompatibility: Number(settings?.equipmentCompatibilityWeight || 1.0),
            patientPriority: Number(settings?.patientPriorityWeight || 1.0)
        };
        // Initialize constraints from settings
        const constraints = {
            maxDeadheadMiles: Number(settings?.maxDeadheadMiles || 50.0),
            maxWaitTimeMinutes: Number(settings?.maxWaitTimeMinutes || 30),
            maxOvertimeHours: Number(settings?.maxOvertimeHours || 4.0),
            maxResponseTimeMinutes: Number(settings?.maxResponseTimeMinutes || 15),
            maxServiceDistance: Number(settings?.maxServiceDistance || 100.0)
        };
        // Calculate optimization scores for each unit-request combination
        const optimizationResults = [];
        let totalRevenue = 0;
        let totalDeadheadMiles = 0;
        let totalWaitTime = 0;
        let totalOvertimeRisk = 0;
        let backhaulPairs = 0;
        for (const unit of units) {
            for (const request of requests) {
                // Calculate individual metrics
                const deadheadMiles = calculateDeadheadMiles(unit, request);
                const waitTime = calculateWaitTime(unit, request, currentTime);
                const overtimeRisk = calculateOvertimeRisk(unit, request, currentTime);
                const revenue = calculateRequestRevenue(request);
                const responseTime = calculateResponseTime(unit, request);
                const distance = calculateDistance(unit, request);
                // Check constraints
                const constraintViolations = [];
                if (deadheadMiles > constraints.maxDeadheadMiles) {
                    constraintViolations.push('maxDeadheadMiles');
                }
                if (waitTime > constraints.maxWaitTimeMinutes) {
                    constraintViolations.push('maxWaitTimeMinutes');
                }
                if (overtimeRisk > constraints.maxOvertimeHours) {
                    constraintViolations.push('maxOvertimeHours');
                }
                if (responseTime > constraints.maxResponseTimeMinutes) {
                    constraintViolations.push('maxResponseTimeMinutes');
                }
                if (distance > constraints.maxServiceDistance) {
                    constraintViolations.push('maxServiceDistance');
                }
                // Calculate optimization score
                const score = calculateOptimizationScore({
                    deadheadMiles,
                    waitTime,
                    overtimeRisk,
                    revenue,
                    responseTime,
                    distance,
                    weights,
                    constraintViolations
                });
                optimizationResults.push({
                    unitId: unit.id,
                    requestId: request.id,
                    score,
                    deadheadMiles,
                    waitTime,
                    overtimeRisk,
                    revenue,
                    responseTime,
                    distance,
                    constraintViolations,
                    canHandle: constraintViolations.length === 0
                });
                // Accumulate totals
                if (constraintViolations.length === 0) {
                    totalRevenue += revenue;
                    totalDeadheadMiles += deadheadMiles;
                    totalWaitTime += waitTime;
                    totalOvertimeRisk += overtimeRisk;
                }
            }
        }
        // Find backhaul opportunities
        const backhaulOpportunities = findBackhaulOpportunities(requests, settings);
        backhaulPairs = backhaulOpportunities.length;
        // Calculate efficiency metrics
        const totalMiles = optimizationResults.reduce((sum, result) => sum + result.distance, 0);
        const loadedMiles = totalMiles - totalDeadheadMiles;
        const loadedMileRatio = totalMiles > 0 ? loadedMiles / totalMiles : 0;
        const averageEfficiency = optimizationResults.length > 0
            ? optimizationResults.reduce((sum, result) => sum + result.score, 0) / optimizationResults.length
            : 0;
        const averageResponseTime = optimizationResults.length > 0
            ? optimizationResults.reduce((sum, result) => sum + result.responseTime, 0) / optimizationResults.length
            : 0;
        return {
            totalRevenue,
            totalDeadheadMiles,
            totalWaitTime,
            totalOvertimeRisk,
            backhaulPairs,
            loadedMileRatio,
            averageEfficiency,
            averageResponseTime,
            totalMiles,
            loadedMiles,
            optimizationResults: optimizationResults.sort((a, b) => b.score - a.score),
            backhaulOpportunities: backhaulOpportunities.slice(0, 10), // Top 10
            settings: {
                weights,
                constraints
            }
        };
    }
    catch (error) {
        console.error('Error running optimization preview:', error);
        throw error;
    }
}
function calculateDeadheadMiles(unit, request) {
    // Calculate distance from unit's current location to request origin
    const unitLocation = unit.currentLocation || { lat: 0, lng: 0 };
    const requestOrigin = request.originLocation || { lat: 0, lng: 0 };
    // Simple distance calculation (in real implementation, use proper geospatial functions)
    const latDiff = unitLocation.lat - requestOrigin.lat;
    const lngDiff = unitLocation.lng - requestOrigin.lng;
    return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 69; // Rough conversion to miles
}
function calculateWaitTime(unit, request, currentTime) {
    // Calculate time from now until request is ready
    const requestTime = new Date(request.readyStart || request.scheduledTime);
    const waitTime = Math.max(0, (requestTime.getTime() - currentTime.getTime()) / (1000 * 60)); // minutes
    return waitTime;
}
function calculateOvertimeRisk(unit, request, currentTime) {
    // Calculate if this request would cause overtime
    const shiftStart = new Date(unit.shiftStart || currentTime);
    const shiftEnd = new Date(unit.shiftEnd || new Date(currentTime.getTime() + 8 * 60 * 60 * 1000));
    const estimatedTripTime = 2; // hours - would be calculated based on distance
    const estimatedEndTime = new Date(currentTime.getTime() + estimatedTripTime * 60 * 60 * 1000);
    if (estimatedEndTime > shiftEnd) {
        const overtimeHours = (estimatedEndTime.getTime() - shiftEnd.getTime()) / (1000 * 60 * 60);
        return overtimeHours;
    }
    return 0;
}
function calculateRequestRevenue(request) {
    // Use stored revenue if available
    if (request.tripCost && request.tripCost > 0) {
        return Number(request.tripCost);
    }
    // Fallback to calculated revenue
    const baseRates = { 'BLS': 150.0, 'ALS': 250.0, 'CCT': 400.0 };
    const baseRate = baseRates[request.transportLevel] || 150.0;
    const priorityMultipliers = { 'LOW': 1.0, 'MEDIUM': 1.1, 'HIGH': 1.25, 'URGENT': 1.5 };
    const multiplier = priorityMultipliers[request.priority] || 1.0;
    return baseRate * multiplier;
}
function calculateResponseTime(unit, request) {
    // Calculate estimated response time based on distance
    const distance = calculateDistance(unit, request);
    const averageSpeed = 30; // mph
    return (distance / averageSpeed) * 60; // minutes
}
function calculateDistance(unit, request) {
    const unitLocation = unit.currentLocation || { lat: 0, lng: 0 };
    const requestOrigin = request.originLocation || { lat: 0, lng: 0 };
    const latDiff = unitLocation.lat - requestOrigin.lat;
    const lngDiff = unitLocation.lng - requestOrigin.lng;
    return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 69; // Rough conversion to miles
}
function calculateOptimizationScore(params) {
    const { deadheadMiles, waitTime, overtimeRisk, revenue, responseTime, distance, weights, constraintViolations } = params;
    // Base score starts with revenue
    let score = revenue * weights.revenue;
    // Apply penalties
    score -= deadheadMiles * weights.deadheadMile;
    score -= waitTime * weights.waitTime;
    score -= overtimeRisk * weights.overtimeRisk;
    score -= responseTime * 0.1; // Small penalty for response time
    // Apply constraint violations penalty
    score -= constraintViolations.length * 100; // Heavy penalty for constraint violations
    return Math.max(0, score); // Ensure non-negative score
}
function findBackhaulOpportunities(requests, settings) {
    const opportunities = [];
    const timeWindow = Number(settings?.backhaulTimeWindow || 60); // minutes
    const distanceLimit = Number(settings?.backhaulDistanceLimit || 25.0); // miles
    for (let i = 0; i < requests.length; i++) {
        for (let j = i + 1; j < requests.length; j++) {
            const request1 = requests[i];
            const request2 = requests[j];
            // Check if requests are compatible for backhaul
            const timeDiff = Math.abs(new Date(request1.readyStart || request1.scheduledTime).getTime() -
                new Date(request2.readyStart || request2.scheduledTime).getTime()) / (1000 * 60); // minutes
            const distance = calculateDistanceBetweenRequests(request1, request2);
            if (timeDiff <= timeWindow && distance <= distanceLimit) {
                const efficiency = calculateBackhaulEfficiency(request1, request2);
                const revenueBonus = Number(settings?.backhaulRevenueBonus || 50.0);
                opportunities.push({
                    request1,
                    request2,
                    timeWindow: timeDiff,
                    distance,
                    efficiency,
                    revenueBonus,
                    totalRevenue: calculateRequestRevenue(request1) + calculateRequestRevenue(request2) + revenueBonus
                });
            }
        }
    }
    return opportunities.sort((a, b) => b.efficiency - a.efficiency);
}
function calculateDistanceBetweenRequests(request1, request2) {
    const origin1 = request1.originLocation || { lat: 0, lng: 0 };
    const destination1 = request1.destinationLocation || { lat: 0, lng: 0 };
    const origin2 = request2.originLocation || { lat: 0, lng: 0 };
    const destination2 = request2.destinationLocation || { lat: 0, lng: 0 };
    // Calculate distance from destination1 to origin2 (backhaul connection)
    const latDiff = destination1.lat - origin2.lat;
    const lngDiff = destination1.lng - origin2.lng;
    return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 69; // Rough conversion to miles
}
function calculateBackhaulEfficiency(request1, request2) {
    // Calculate efficiency based on distance savings and time compatibility
    const distance1 = calculateDistanceBetweenRequests(request1, request2);
    const distance2 = calculateDistanceBetweenRequests(request2, request1);
    const totalDistance = distance1 + distance2;
    // Higher efficiency for shorter total distance
    return totalDistance > 0 ? 100 / totalDistance : 0;
}
exports.default = router;
//# sourceMappingURL=optimization.js.map