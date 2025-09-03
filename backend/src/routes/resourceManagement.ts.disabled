import express from 'express';
import { authenticateToken } from '../middleware/auth';
import ResourceManagementService from '../services/resourceManagementService';
import { Priority, UnitStatus } from '../types/transport';
import { EscalationRequest, ResourceAllocation } from '../types/resource';

const router = express.Router();
const resourceService = new ResourceManagementService();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// CCT Unit Management Routes
router.get('/cct-units', async (req, res) => {
  try {
    console.log('[RESOURCE_ROUTES] GET /cct-units - Request received');
    
    const filters = {
      status: req.query.status as UnitStatus,
      agencyId: req.query.agencyId as string,
      availableNow: req.query.availableNow === 'true',
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50
    };

    const cctUnits = await resourceService.getCCTUnits(filters);
    
    res.json({
      message: 'CCT units retrieved successfully',
      data: cctUnits,
      total: cctUnits.length
    });
  } catch (error) {
    console.error('[RESOURCE_ROUTES] Error getting CCT units:', error);
    res.status(500).json({
      message: 'Failed to get CCT units',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Resource Availability Route
router.get('/availability', async (req, res) => {
  try {
    console.log('[RESOURCE_ROUTES] GET /availability - Request received');
    
    const availability = await resourceService.getResourceAvailability();
    
    res.json({
      message: 'Resource availability retrieved successfully',
      data: availability
    });
  } catch (error) {
    console.error('[RESOURCE_ROUTES] Error getting resource availability:', error);
    res.status(500).json({
      message: 'Failed to get resource availability',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Escalation Management Routes
router.post('/escalations', async (req, res) => {
  try {
    console.log('[RESOURCE_ROUTES] POST /escalations - Request received:', req.body);
    
    const { transportRequestId, escalationLevel, reason, requestedBy, autoEscalation } = req.body;
    
    if (!transportRequestId || !escalationLevel || !reason || !requestedBy) {
      return res.status(400).json({
        message: 'Missing required fields',
        error: 'transportRequestId, escalationLevel, reason, and requestedBy are required'
      });
    }

    const escalation = await resourceService.createEscalationRequest({
      transportRequestId,
      escalationLevel,
      reason,
      requestedBy,
      autoEscalation: autoEscalation || false
    });
    
    res.status(201).json({
      message: 'Escalation request created successfully',
      data: escalation
    });
  } catch (error) {
    console.error('[RESOURCE_ROUTES] Error creating escalation request:', error);
    res.status(500).json({
      message: 'Failed to create escalation request',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/escalations', async (req, res) => {
  try {
    console.log('[RESOURCE_ROUTES] GET /escalations - Request received');
    
    const filters = {
      status: req.query.status as EscalationRequest['status'],
      escalationLevel: req.query.escalationLevel as EscalationRequest['escalationLevel'],
      facilityId: req.query.facilityId as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50
    };

    const escalations = await resourceService.getEscalationRequests(filters);
    
    res.json({
      message: 'Escalation requests retrieved successfully',
      data: escalations,
      total: escalations.length
    });
  } catch (error) {
    console.error('[RESOURCE_ROUTES] Error getting escalation requests:', error);
    res.status(500).json({
      message: 'Failed to get escalation requests',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Resource Allocation Routes
router.post('/allocations', async (req, res) => {
  try {
    console.log('[RESOURCE_ROUTES] POST /allocations - Request received:', req.body);
    
    const {
      transportRequestId,
      cctUnitId,
      crewMembers,
      equipment,
      estimatedDeparture,
      estimatedArrival,
      notes,
      createdBy
    } = req.body;
    
    if (!transportRequestId || !cctUnitId || !crewMembers || !equipment || !estimatedDeparture || !estimatedArrival || !createdBy) {
      return res.status(400).json({
        message: 'Missing required fields',
        error: 'transportRequestId, cctUnitId, crewMembers, equipment, estimatedDeparture, estimatedArrival, and createdBy are required'
      });
    }

    const allocation = await resourceService.allocateResource({
      transportRequestId,
      cctUnitId,
      crewMembers,
      equipment,
      estimatedDeparture,
      estimatedArrival,
      notes,
      createdBy
    });
    
    res.status(201).json({
      message: 'Resource allocation created successfully',
      data: allocation
    });
  } catch (error) {
    console.error('[RESOURCE_ROUTES] Error creating resource allocation:', error);
    res.status(500).json({
      message: 'Failed to create resource allocation',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/allocations', async (req, res) => {
  try {
    console.log('[RESOURCE_ROUTES] GET /allocations - Request received');
    
    const filters = {
      status: req.query.status as ResourceAllocation['status'],
      cctUnitId: req.query.cctUnitId as string,
      transportRequestId: req.query.transportRequestId as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50
    };

    const allocations = await resourceService.getResourceAllocations(filters);
    
    res.json({
      message: 'Resource allocations retrieved successfully',
      data: allocations,
      total: allocations.length
    });
  } catch (error) {
    console.error('[RESOURCE_ROUTES] Error getting resource allocations:', error);
    res.status(500).json({
      message: 'Failed to get resource allocations',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Priority Queue Route
router.get('/priority-queue', async (req, res) => {
  try {
    console.log('[RESOURCE_ROUTES] GET /priority-queue - Request received');
    
    const priorityQueue = await resourceService.getPriorityQueue();
    
    res.json({
      message: 'Priority queue retrieved successfully',
      data: priorityQueue,
      total: priorityQueue.length
    });
  } catch (error) {
    console.error('[RESOURCE_ROUTES] Error getting priority queue:', error);
    res.status(500).json({
      message: 'Failed to get priority queue',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Analytics and Reporting Routes
router.get('/analytics/call-volume', async (req, res) => {
  try {
    console.log('[RESOURCE_ROUTES] GET /analytics/call-volume - Request received');
    
    const period = (req.query.period as 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY') || 'DAILY';
    const analytics = await resourceService.getCallVolumeAnalytics(period);
    
    res.json({
      message: 'Call volume analytics retrieved successfully',
      data: analytics
    });
  } catch (error) {
    console.error('[RESOURCE_ROUTES] Error getting call volume analytics:', error);
    res.status(500).json({
      message: 'Failed to get call volume analytics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/analytics/capacity-planning', async (req, res) => {
  try {
    console.log('[RESOURCE_ROUTES] GET /analytics/capacity-planning - Request received');
    
    const capacityPlanning = await resourceService.getCapacityPlanning();
    
    res.json({
      message: 'Capacity planning data retrieved successfully',
      data: capacityPlanning,
      total: capacityPlanning.length
    });
  } catch (error) {
    console.error('[RESOURCE_ROUTES] Error getting capacity planning:', error);
    res.status(500).json({
      message: 'Failed to get capacity planning data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Unit Status Management Routes
router.put('/units/:unitId/status', async (req, res) => {
  try {
    console.log('[RESOURCE_ROUTES] PUT /units/:unitId/status - Request received:', { unitId: req.params.unitId, body: req.body });
    
    const { newStatus, reason, updatedBy, estimatedReturnTime, location, notes } = req.body;
    
    if (!newStatus || !reason || !updatedBy) {
      return res.status(400).json({
        message: 'Missing required fields',
        error: 'newStatus, reason, and updatedBy are required'
      });
    }

    const additionalData = {
      estimatedReturnTime,
      location,
      notes
    };

    const statusUpdate = await resourceService.updateUnitStatus(
      req.params.unitId,
      newStatus,
      reason,
      updatedBy,
      additionalData
    );
    
    res.json({
      message: 'Unit status updated successfully',
      data: statusUpdate
    });
  } catch (error) {
    console.error('[RESOURCE_ROUTES] Error updating unit status:', error);
    res.status(500).json({
      message: 'Failed to update unit status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/units/status-updates', async (req, res) => {
  try {
    console.log('[RESOURCE_ROUTES] GET /units/status-updates - Request received');
    
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const statusUpdates = await resourceService.getUnitStatusUpdates(limit);
    
    res.json({
      message: 'Unit status updates retrieved successfully',
      data: statusUpdates,
      total: statusUpdates.length
    });
  } catch (error) {
    console.error('[RESOURCE_ROUTES] Error getting unit status updates:', error);
    res.status(500).json({
      message: 'Failed to get unit status updates',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Resource Utilization Report Route
router.get('/reports/utilization', async (req, res) => {
  try {
    console.log('[RESOURCE_ROUTES] GET /reports/utilization - Request received');
    
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        message: 'Missing required parameters',
        error: 'startDate and endDate are required'
      });
    }

    const report = await resourceService.generateResourceUtilizationReport(
      startDate as string,
      endDate as string
    );
    
    res.json({
      message: 'Resource utilization report generated successfully',
      data: report
    });
  } catch (error) {
    console.error('[RESOURCE_ROUTES] Error generating utilization report:', error);
    res.status(500).json({
      message: 'Failed to generate utilization report',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Dashboard Data Route
router.get('/dashboard', async (req, res) => {
  try {
    console.log('[RESOURCE_ROUTES] GET /dashboard - Request received');
    
    const dashboardData = await resourceService.getResourceDashboardData();
    
    res.json({
      message: 'Resource dashboard data retrieved successfully',
      data: dashboardData
    });
  } catch (error) {
    console.error('[RESOURCE_ROUTES] Error getting dashboard data:', error);
    res.status(500).json({
      message: 'Failed to get dashboard data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Health Check Route
router.get('/health', (req, res) => {
  res.json({
    message: 'Resource Management API is healthy',
    timestamp: new Date().toISOString(),
    status: 'operational'
  });
});

export default router;
