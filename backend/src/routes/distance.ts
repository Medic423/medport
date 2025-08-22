import express from 'express';
import { authenticateToken } from '../middleware/auth';
import distanceService from '../services/distanceService';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route GET /api/distance/matrix
 * @desc Get distance matrix for a specific facility pair
 * @access Private
 */
router.get('/matrix', async (req, res) => {
  try {
    const { fromFacilityId, toFacilityId } = req.query;

    if (!fromFacilityId || !toFacilityId) {
      return res.status(400).json({
        message: 'Both fromFacilityId and toFacilityId are required',
        error: 'MISSING_PARAMETERS'
      });
    }

    const distanceMatrix = await distanceService.getDistanceMatrix(
      fromFacilityId as string,
      toFacilityId as string
    );

    if (!distanceMatrix) {
      return res.status(404).json({
        message: 'Distance matrix not found for this facility pair',
        error: 'NOT_FOUND'
      });
    }

    res.json({
      message: 'Distance matrix retrieved successfully',
      data: distanceMatrix
    });
  } catch (error) {
    console.error('DISTANCE_ROUTE: Error getting distance matrix:', error);
    res.status(500).json({
      message: 'Error retrieving distance matrix',
      error: 'INTERNAL_SERVER_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route POST /api/distance/matrix
 * @desc Create or update distance matrix entry
 * @access Private
 */
router.post('/matrix', async (req, res) => {
  try {
    const { fromFacilityId, toFacilityId, routeType = 'FASTEST' } = req.body;

    if (!fromFacilityId || !toFacilityId) {
      return res.status(400).json({
        message: 'Both fromFacilityId and toFacilityId are required',
        error: 'MISSING_PARAMETERS'
      });
    }

    // Check if facilities exist
    const [fromFacility, toFacility] = await Promise.all([
      prisma.facility.findUnique({ where: { id: fromFacilityId } }),
      prisma.facility.findUnique({ where: { id: toFacilityId } })
    ]);

    if (!fromFacility || !toFacility) {
      return res.status(404).json({
        message: 'One or both facilities not found',
        error: 'FACILITIES_NOT_FOUND'
      });
    }

    // Get or create distance matrix
    const distanceMatrix = await distanceService.getOrCreateDistanceMatrix(
      fromFacilityId,
      toFacilityId,
      routeType
    );

    res.status(201).json({
      message: 'Distance matrix created/updated successfully',
      data: distanceMatrix
    });
  } catch (error) {
    console.error('DISTANCE_ROUTE: Error creating/updating distance matrix:', error);
    res.status(500).json({
      message: 'Error creating/updating distance matrix',
      error: 'INTERNAL_SERVER_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route PUT /api/distance/matrix
 * @desc Update distance matrix entry manually
 * @access Private
 */
router.put('/matrix', async (req, res) => {
  try {
    const { fromFacilityId, toFacilityId, distanceMiles, estimatedTimeMinutes, trafficFactor, tolls, routeType } = req.body;

    if (!fromFacilityId || !toFacilityId) {
      return res.status(400).json({
        message: 'Both fromFacilityId and toFacilityId are required',
        error: 'MISSING_PARAMETERS'
      });
    }

    if (distanceMiles === undefined || estimatedTimeMinutes === undefined) {
      return res.status(400).json({
        message: 'distanceMiles and estimatedTimeMinutes are required',
        error: 'MISSING_PARAMETERS'
      });
    }

    const updateData: any = {};
    if (distanceMiles !== undefined) updateData.distanceMiles = distanceMiles;
    if (estimatedTimeMinutes !== undefined) updateData.estimatedTimeMinutes = estimatedTimeMinutes;
    if (trafficFactor !== undefined) updateData.trafficFactor = trafficFactor;
    if (tolls !== undefined) updateData.tolls = tolls;
    if (routeType !== undefined) updateData.routeType = routeType;

    const distanceMatrix = await distanceService.updateDistanceMatrix(
      fromFacilityId,
      toFacilityId,
      updateData
    );

    res.json({
      message: 'Distance matrix updated successfully',
      data: distanceMatrix
    });
  } catch (error) {
    console.error('DISTANCE_ROUTE: Error updating distance matrix:', error);
    res.status(500).json({
      message: 'Error updating distance matrix',
      error: 'INTERNAL_SERVER_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route DELETE /api/distance/matrix
 * @desc Delete distance matrix entry
 * @access Private
 */
router.delete('/matrix', async (req, res) => {
  try {
    const { fromFacilityId, toFacilityId } = req.query;

    if (!fromFacilityId || !toFacilityId) {
      return res.status(400).json({
        message: 'Both fromFacilityId and toFacilityId are required',
        error: 'MISSING_PARAMETERS'
      });
    }

    await distanceService.deleteDistanceMatrix(
      fromFacilityId as string,
      toFacilityId as string
    );

    res.json({
      message: 'Distance matrix deleted successfully'
    });
  } catch (error) {
    console.error('DISTANCE_ROUTE: Error deleting distance matrix:', error);
    res.status(500).json({
      message: 'Error deleting distance matrix',
      error: 'INTERNAL_SERVER_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/distance/from/:facilityId
 * @desc Get all distances from a specific facility
 * @access Private
 */
router.get('/from/:facilityId', async (req, res) => {
  try {
    const { facilityId } = req.params;

    const distances = await distanceService.getDistancesFromFacility(facilityId);

    res.json({
      message: 'Distances from facility retrieved successfully',
      data: distances,
      total: distances.length
    });
  } catch (error) {
    console.error('DISTANCE_ROUTE: Error getting distances from facility:', error);
    res.status(500).json({
      message: 'Error retrieving distances from facility',
      error: 'INTERNAL_SERVER_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/distance/to/:facilityId
 * @desc Get all distances to a specific facility
 * @access Private
 */
router.get('/to/:facilityId', async (req, res) => {
  try {
    const { facilityId } = req.params;

    const distances = await distanceService.getDistancesToFacility(facilityId);

    res.json({
      message: 'Distances to facility retrieved successfully',
      data: distances,
      total: distances.length
    });
  } catch (error) {
    console.error('DISTANCE_ROUTE: Error getting distances to facility:', error);
    res.status(500).json({
      message: 'Error retrieving distances to facility',
      error: 'INTERNAL_SERVER_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/distance/calculate
 * @desc Calculate distance between two facilities
 * @access Private
 */
router.get('/calculate', async (req, res) => {
  try {
    const { fromFacilityId, toFacilityId, routeType = 'FASTEST' } = req.query;

    if (!fromFacilityId || !toFacilityId) {
      return res.status(400).json({
        message: 'Both fromFacilityId and toFacilityId are required',
        error: 'MISSING_PARAMETERS'
      });
    }

    // Get facility details
    const [fromFacility, toFacility] = await Promise.all([
      prisma.facility.findUnique({ where: { id: fromFacilityId as string } }),
      prisma.facility.findUnique({ where: { id: toFacilityId as string } })
    ]);

    if (!fromFacility || !toFacility) {
      return res.status(404).json({
        message: 'One or both facilities not found',
        error: 'FACILITIES_NOT_FOUND'
      });
    }

    // Calculate distance
    const distanceResult = await distanceService.calculateDistance(
      fromFacility,
      toFacility,
      routeType as any
    );

    res.json({
      message: 'Distance calculated successfully',
      data: distanceResult
    });
  } catch (error) {
    console.error('DISTANCE_ROUTE: Error calculating distance:', error);
    res.status(500).json({
      message: 'Error calculating distance',
      error: 'INTERNAL_SERVER_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/distance/loaded-miles
 * @desc Calculate loaded miles for a transport request
 * @access Private
 */
router.get('/loaded-miles', async (req, res) => {
  try {
    const { originFacilityId, destinationFacilityId } = req.query;

    if (!originFacilityId || !destinationFacilityId) {
      return res.status(400).json({
        message: 'Both originFacilityId and destinationFacilityId are required',
        error: 'MISSING_PARAMETERS'
      });
    }

    const loadedMiles = await distanceService.calculateLoadedMiles(
      originFacilityId as string,
      destinationFacilityId as string
    );

    res.json({
      message: 'Loaded miles calculated successfully',
      data: { loadedMiles }
    });
  } catch (error) {
    console.error('DISTANCE_ROUTE: Error calculating loaded miles:', error);
    res.status(500).json({
      message: 'Error calculating loaded miles',
      error: 'INTERNAL_SERVER_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/distance/route-id
 * @desc Generate a new route ID for optimization tracking
 * @access Private
 */
router.get('/route-id', async (req, res) => {
  try {
    const routeId = distanceService.generateRouteId();

    res.json({
      message: 'Route ID generated successfully',
      data: { routeId }
    });
  } catch (error) {
    console.error('DISTANCE_ROUTE: Error generating route ID:', error);
    res.status(500).json({
      message: 'Error generating route ID',
      error: 'INTERNAL_SERVER_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/distance/cache/stats
 * @desc Get distance cache statistics
 * @access Private
 */
router.get('/cache/stats', async (req, res) => {
  try {
    const cacheStats = distanceService.getCacheStats();

    res.json({
      message: 'Cache statistics retrieved successfully',
      data: cacheStats
    });
  } catch (error) {
    console.error('DISTANCE_ROUTE: Error getting cache stats:', error);
    res.status(500).json({
      message: 'Error retrieving cache statistics',
      error: 'INTERNAL_SERVER_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route DELETE /api/distance/cache
 * @desc Clear distance cache
 * @access Private
 */
router.delete('/cache', async (req, res) => {
  try {
    distanceService.clearCache();

    res.json({
      message: 'Distance cache cleared successfully'
    });
  } catch (error) {
    console.error('DISTANCE_ROUTE: Error clearing cache:', error);
    res.status(500).json({
      message: 'Error clearing distance cache',
      error: 'INTERNAL_SERVER_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/distance/matrix/all
 * @desc Get all distance matrix entries with pagination
 * @access Private
 */
router.get('/matrix/all', async (req, res) => {
  try {
    const { page = 1, limit = 50, fromFacilityId, toFacilityId } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};
    if (fromFacilityId) where.fromFacilityId = fromFacilityId;
    if (toFacilityId) where.toFacilityId = toFacilityId;

    // Get total count
    const total = await prisma.distanceMatrix.count({ where });

    // Get paginated results
    const distanceMatrices = await prisma.distanceMatrix.findMany({
      where,
      skip: offset,
      take: limitNum,
      include: {
        fromFacility: {
          select: {
            id: true,
            name: true,
            type: true,
            city: true,
            state: true
          }
        },
        toFacility: {
          select: {
            id: true,
            name: true,
            type: true,
            city: true,
            state: true
          }
        }
      },
      orderBy: { lastUpdated: 'desc' }
    });

    res.json({
      message: 'Distance matrices retrieved successfully',
      data: distanceMatrices,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('DISTANCE_ROUTE: Error getting all distance matrices:', error);
    res.status(500).json({
      message: 'Error retrieving distance matrices',
      error: 'INTERNAL_SERVER_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
