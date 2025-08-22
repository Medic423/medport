import express from 'express';
import EmergencyDepartmentService, { 
  EmergencyDepartmentData, 
  BedStatusUpdateData, 
  TransportQueueData, 
  ProviderForecastData,
  DemandPatternData 
} from '../services/emergencyDepartmentService';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const emergencyDepartmentService = new EmergencyDepartmentService();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Emergency Department Management
router.post('/departments', async (req, res) => {
  try {
    console.log('ED_ROUTE: Creating emergency department');
    const data: EmergencyDepartmentData = req.body;
    const ed = await emergencyDepartmentService.createEmergencyDepartment(data);
    res.status(201).json(ed);
  } catch (error) {
    console.error('ED_ROUTE: Error creating emergency department:', error);
    res.status(500).json({ error: 'Failed to create emergency department' });
  }
});

router.get('/departments/:facilityId', async (req, res) => {
  try {
    console.log('ED_ROUTE: Fetching emergency department for facility:', req.params.facilityId);
    const ed = await emergencyDepartmentService.getEmergencyDepartment(req.params.facilityId);
    if (!ed) {
      return res.status(404).json({ error: 'Emergency department not found' });
    }
    res.json(ed);
  } catch (error) {
    console.error('ED_ROUTE: Error fetching emergency department:', error);
    res.status(500).json({ error: 'Failed to fetch emergency department' });
  }
});

router.put('/departments/:facilityId', async (req, res) => {
  try {
    console.log('ED_ROUTE: Updating emergency department for facility:', req.params.facilityId);
    const data: Partial<EmergencyDepartmentData> = req.body;
    const ed = await emergencyDepartmentService.updateEmergencyDepartment(req.params.facilityId, data);
    res.json(ed);
  } catch (error) {
    console.error('ED_ROUTE: Error updating emergency department:', error);
    res.status(500).json({ error: 'Failed to update emergency department' });
  }
});

// Bed Status Management
router.post('/bed-status', async (req, res) => {
  try {
    console.log('ED_ROUTE: Updating bed status');
    const data: BedStatusUpdateData = req.body;
    const bedUpdate = await emergencyDepartmentService.updateBedStatus(data);
    res.status(201).json(bedUpdate);
  } catch (error) {
    console.error('ED_ROUTE: Error updating bed status:', error);
    res.status(500).json({ error: 'Failed to update bed status' });
  }
});

// Transport Queue Management
router.post('/transport-queue', async (req, res) => {
  try {
    console.log('ED_ROUTE: Adding transport request to queue');
    const data: TransportQueueData = req.body;
    const queueEntry = await emergencyDepartmentService.addToTransportQueue(data);
    res.status(201).json(queueEntry);
  } catch (error) {
    console.error('ED_ROUTE: Error adding to transport queue:', error);
    res.status(500).json({ error: 'Failed to add to transport queue' });
  }
});

router.get('/transport-queue/:emergencyDepartmentId', async (req, res) => {
  try {
    console.log('ED_ROUTE: Fetching transport queue for ED:', req.params.emergencyDepartmentId);
    const queue = await emergencyDepartmentService.getTransportQueue(req.params.emergencyDepartmentId);
    res.json(queue);
  } catch (error) {
    console.error('ED_ROUTE: Error fetching transport queue:', error);
    res.status(500).json({ error: 'Failed to fetch transport queue' });
  }
});

router.put('/transport-queue/:queueId/status', async (req, res) => {
  try {
    console.log('ED_ROUTE: Updating transport queue status for queue:', req.params.queueId);
    const { status, assignedProviderId, assignedUnitId } = req.body;
    const queueEntry = await emergencyDepartmentService.updateTransportQueueStatus(
      req.params.queueId, 
      status, 
      assignedProviderId, 
      assignedUnitId
    );
    res.json(queueEntry);
  } catch (error) {
    console.error('ED_ROUTE: Error updating transport queue status:', error);
    res.status(500).json({ error: 'Failed to update transport queue status' });
  }
});

// Capacity Alert Management
router.get('/capacity-alerts/:emergencyDepartmentId', async (req, res) => {
  try {
    console.log('ED_ROUTE: Fetching capacity alerts for ED:', req.params.emergencyDepartmentId);
    const ed = await emergencyDepartmentService.getEmergencyDepartment(req.params.emergencyDepartmentId);
    if (!ed) {
      return res.status(404).json({ error: 'Emergency department not found' });
    }
    res.json(ed.capacityAlerts);
  } catch (error) {
    console.error('ED_ROUTE: Error fetching capacity alerts:', error);
    res.status(500).json({ error: 'Failed to fetch capacity alerts' });
  }
});

router.put('/capacity-alerts/:alertId/acknowledge', async (req, res) => {
  try {
    console.log('ED_ROUTE: Acknowledging capacity alert:', req.params.alertId);
    const { acknowledgedBy } = req.body;
    const alert = await emergencyDepartmentService.acknowledgeCapacityAlert(req.params.alertId, acknowledgedBy);
    res.json(alert);
  } catch (error) {
    console.error('ED_ROUTE: Error acknowledging capacity alert:', error);
    res.status(500).json({ error: 'Failed to acknowledge capacity alert' });
  }
});

// Provider Forecasting
router.post('/provider-forecasts', async (req, res) => {
  try {
    console.log('ED_ROUTE: Creating provider forecast');
    const data: ProviderForecastData = req.body;
    const forecast = await emergencyDepartmentService.createProviderForecast(data);
    res.status(201).json(forecast);
  } catch (error) {
    console.error('ED_ROUTE: Error creating provider forecast:', error);
    res.status(500).json({ error: 'Failed to create provider forecast' });
  }
});

router.get('/provider-forecasts', async (req, res) => {
  try {
    console.log('ED_ROUTE: Fetching provider forecasts');
    const { agencyId, forecastType } = req.query;
    const forecasts = await emergencyDepartmentService.getProviderForecasts(
      agencyId as string, 
      forecastType as string
    );
    res.json(forecasts);
  } catch (error) {
    console.error('ED_ROUTE: Error fetching provider forecasts:', error);
    res.status(500).json({ error: 'Failed to fetch provider forecasts' });
  }
});

router.post('/provider-forecasts/:agencyId/forecast', async (req, res) => {
  try {
    console.log('ED_ROUTE: Forecasting provider demand for agency:', req.params.agencyId);
    const { forecastDate } = req.body;
    const forecast = await emergencyDepartmentService.forecastProviderDemand(
      req.params.agencyId, 
      new Date(forecastDate)
    );
    res.json(forecast);
  } catch (error) {
    console.error('ED_ROUTE: Error forecasting provider demand:', error);
    res.status(500).json({ error: 'Failed to forecast provider demand' });
  }
});

// Demand Pattern Analysis
router.post('/demand-patterns', async (req, res) => {
  try {
    console.log('ED_ROUTE: Creating demand pattern');
    const data: DemandPatternData = req.body;
    const pattern = await emergencyDepartmentService.createDemandPattern(data);
    res.status(201).json(pattern);
  } catch (error) {
    console.error('ED_ROUTE: Error creating demand pattern:', error);
    res.status(500).json({ error: 'Failed to create demand pattern' });
  }
});

router.get('/demand-patterns', async (req, res) => {
  try {
    console.log('ED_ROUTE: Fetching demand patterns');
    const { facilityId, patternType } = req.query;
    const patterns = await emergencyDepartmentService.getDemandPatterns(
      facilityId as string, 
      patternType as string
    );
    res.json(patterns);
  } catch (error) {
    console.error('ED_ROUTE: Error fetching demand patterns:', error);
    res.status(500).json({ error: 'Failed to fetch demand patterns' });
  }
});

// Analytics and Metrics
router.get('/departments/:emergencyDepartmentId/metrics', async (req, res) => {
  try {
    console.log('ED_ROUTE: Calculating ED metrics for:', req.params.emergencyDepartmentId);
    const metrics = await emergencyDepartmentService.calculateEDMetrics(req.params.emergencyDepartmentId);
    res.json(metrics);
  } catch (error) {
    console.error('ED_ROUTE: Error calculating ED metrics:', error);
    res.status(500).json({ error: 'Failed to calculate ED metrics' });
  }
});

// Demo mode support - bypass authentication for testing
router.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader === 'demo-token') {
    console.log('ED_ROUTE: Demo mode authentication bypassed');
    return next();
  }
  next();
});

export default router;
