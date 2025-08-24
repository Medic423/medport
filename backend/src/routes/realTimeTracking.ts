import express from 'express';
import realTimeTrackingService from '../services/realTimeTrackingService';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route POST /api/real-time-tracking/location
 * @desc Update unit location
 * @access Private
 */
router.post('/location', async (req, res) => {
  try {
    const { unitId, location, source } = req.body;

    if (!unitId || !location || !location.latitude || !location.longitude) {
      return res.status(400).json({
        success: false,
        message: 'Unit ID and location coordinates are required',
      });
    }

    const result = await realTimeTrackingService.updateUnitLocation({
      unitId,
      location,
      source,
    });

    res.json({
      success: true,
      message: 'Location updated successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update location',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @route POST /api/real-time-tracking/eta
 * @desc Calculate ETA for unit to destination
 * @access Private
 */
router.post('/eta', async (req, res) => {
  try {
    const { unitId, destinationId, destinationType } = req.body;

    if (!unitId || !destinationId || !destinationType) {
      return res.status(400).json({
        success: false,
        message: 'Unit ID, destination ID, and destination type are required',
      });
    }

    const result = await realTimeTrackingService.calculateETA({
      unitId,
      destinationId,
      destinationType,
    });

    res.json({
      success: true,
      message: 'ETA calculated successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error calculating ETA:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate ETA',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @route GET /api/real-time-tracking/units/active
 * @desc Get real-time locations of all active units
 * @access Private
 */
router.get('/units/active', async (req, res) => {
  try {
    const activeUnits = await realTimeTrackingService.getActiveUnitLocations();

    res.json({
      success: true,
      message: 'Active unit locations retrieved successfully',
      data: activeUnits,
    });
  } catch (error) {
    console.error('Error getting active unit locations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get active unit locations',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @route GET /api/real-time-tracking/units/:unitId/location-history
 * @desc Get location history for a specific unit
 * @access Private
 */
router.get('/units/:unitId/location-history', async (req, res) => {
  try {
    const { unitId } = req.params;
    const { hours = 24 } = req.query;

    const history = await realTimeTrackingService.getUnitLocationHistory(
      unitId,
      parseInt(hours as string)
    );

    res.json({
      success: true,
      message: 'Unit location history retrieved successfully',
      data: history,
    });
  } catch (error) {
    console.error('Error getting unit location history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unit location history',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @route GET /api/real-time-tracking/units/:unitId/geofence-events
 * @desc Get geofence events for a specific unit
 * @access Private
 */
router.get('/units/:unitId/geofence-events', async (req, res) => {
  try {
    const { unitId } = req.params;
    const { hours = 24 } = req.query;

    const events = await realTimeTrackingService.getUnitGeofenceEvents(
      unitId,
      parseInt(hours as string)
    );

    res.json({
      success: true,
      message: 'Unit geofence events retrieved successfully',
      data: events,
    });
  } catch (error) {
    console.error('Error getting unit geofence events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unit geofence events',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @route GET /api/real-time-tracking/units/:unitId/route-deviations
 * @desc Get route deviations for a specific unit
 * @access Private
 */
router.get('/units/:unitId/route-deviations', async (req, res) => {
  try {
    const { unitId } = req.params;
    const { hours = 24 } = req.query;

    const deviations = await realTimeTrackingService.getUnitRouteDeviations(
      unitId,
      parseInt(hours as string)
    );

    res.json({
      success: true,
      message: 'Unit route deviations retrieved successfully',
      data: deviations,
    });
  } catch (error) {
    console.error('Error getting unit route deviations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unit route deviations',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @route GET /api/real-time-tracking/units/:unitId/status
 * @desc Get comprehensive status for a specific unit
 * @access Private
 */
router.get('/units/:unitId/status', async (req, res) => {
  try {
    const { unitId } = req.params;

    // Get current location
    const activeUnits = await realTimeTrackingService.getActiveUnitLocations();
    const unitLocation = activeUnits.find(unit => unit.unitId === unitId);

    if (!unitLocation) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found or not actively tracked',
      });
    }

    // Get recent history, events, and deviations
    const [history, geofenceEvents, routeDeviations] = await Promise.all([
      realTimeTrackingService.getUnitLocationHistory(unitId, 1), // Last hour
      realTimeTrackingService.getUnitGeofenceEvents(unitId, 1),
      realTimeTrackingService.getUnitRouteDeviations(unitId, 1),
    ]);

    const unitStatus = {
      ...unitLocation,
      recentHistory: history.slice(-10), // Last 10 location points
      recentGeofenceEvents: geofenceEvents.slice(-5), // Last 5 events
      recentRouteDeviations: routeDeviations.slice(-5), // Last 5 deviations
      isOnline: true, // Assuming if we have recent data, unit is online
      lastUpdateAge: Date.now() - new Date(unitLocation.timestamp).getTime(),
    };

    res.json({
      success: true,
      message: 'Unit status retrieved successfully',
      data: unitStatus,
    });
  } catch (error) {
    console.error('Error getting unit status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unit status',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @route GET /api/real-time-tracking/dashboard
 * @desc Get dashboard data for real-time tracking
 * @access Private
 */
router.get('/dashboard', async (req, res) => {
  try {
    // Get all active units
    const activeUnits = await realTimeTrackingService.getActiveUnitLocations();

    // Get summary statistics
    const totalUnits = activeUnits.length;
    const unitsWithIssues = activeUnits.filter(unit => {
      // Check for potential issues (low battery, poor signal, etc.)
      return (unit.batteryLevel && unit.batteryLevel < 20) ||
             (unit.signalStrength && unit.signalStrength < 30);
    }).length;

    const dashboardData = {
      summary: {
        totalUnits,
        activeUnits: totalUnits,
        unitsWithIssues,
        lastUpdated: new Date().toISOString(),
      },
      units: activeUnits,
      alerts: {
        lowBattery: activeUnits.filter(unit => unit.batteryLevel && unit.batteryLevel < 20).length,
        poorSignal: activeUnits.filter(unit => unit.signalStrength && unit.signalStrength < 30).length,
        offline: 0, // Would need to implement offline detection logic
      },
    };

    res.json({
      success: true,
      message: 'Dashboard data retrieved successfully',
      data: dashboardData,
    });
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @route POST /api/real-time-tracking/demo/simulate-location
 * @desc Simulate location updates for demo purposes
 * @access Private
 */
router.post('/demo/simulate-location', async (req, res) => {
  try {
    const { unitId, targetLatitude, targetLongitude, steps = 10 } = req.body;

    if (!unitId || !targetLatitude || !targetLongitude) {
      return res.status(400).json({
        success: false,
        message: 'Unit ID and target coordinates are required',
      });
    }

    // Get current unit location
    const activeUnits = await realTimeTrackingService.getActiveUnitLocations();
    const currentUnit = activeUnits.find(unit => unit.unitId === unitId);

    if (!currentUnit) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found or not actively tracked',
      });
    }

    // Simulate movement towards target
    const currentLat = currentUnit.latitude;
    const currentLon = currentUnit.longitude;
    const latStep = (targetLatitude - currentLat) / steps;
    const lonStep = (targetLongitude - currentLon) / steps;

    const simulatedUpdates = [];
    
    for (let i = 1; i <= steps; i++) {
      const newLat = currentLat + (latStep * i);
      const newLon = currentLon + (lonStep * i);
      
      // Simulate realistic movement (add some randomness)
      const randomLat = newLat + (Math.random() - 0.5) * 0.001; // ±0.001 degrees
      const randomLon = newLon + (Math.random() - 0.5) * 0.001;
      
      const simulatedLocation = {
        unitId,
        location: {
          latitude: randomLat,
          longitude: randomLon,
          speed: 25 + Math.random() * 15, // 25-40 mph
          heading: Math.random() * 360,
          accuracy: 5 + Math.random() * 10, // 5-15 meters
          batteryLevel: 80 + Math.random() * 20, // 80-100%
          signalStrength: 70 + Math.random() * 30, // 70-100%
        },
        source: 'DEMO_SIMULATION' as any,
      };

      // Update location
      const result = await realTimeTrackingService.updateUnitLocation(simulatedLocation);
      simulatedUpdates.push(result);

      // Wait a bit between updates to simulate real-time
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    res.json({
      success: true,
      message: 'Location simulation completed successfully',
      data: {
        steps: simulatedUpdates.length,
        finalLocation: simulatedUpdates[simulatedUpdates.length - 1],
        allUpdates: simulatedUpdates,
      },
    });
  } catch (error) {
    console.error('Error simulating location:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to simulate location',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
