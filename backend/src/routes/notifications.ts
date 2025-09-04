import express from 'express';
import { z } from 'zod';
import { notificationService } from '../services/notificationService';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Demo mode middleware for testing
const demoModeMiddleware = (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader === 'Bearer demo-token') {
    req.user = { id: 'demo-user', email: 'demo@medport.com', role: 'admin', userType: 'hospital' };
    return next();
  }
  return authenticateToken(req, res, next);
};

// Apply demo mode middleware to all routes
router.use(demoModeMiddleware);

// Validation schemas
const SendSMSSchema = z.object({
  to: z.string().min(10).max(15),
  message: z.string().min(1).max(1600),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  template: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

const SendEmailSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1).max(200),
  body: z.string().min(1),
  template: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

const SendPushSchema = z.object({
  userId: z.string(),
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(500),
  data: z.record(z.string(), z.any()).optional(),
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
});

const UrgentTransportSchema = z.object({
  phoneNumber: z.string().min(10).max(15),
  facilityName: z.string().min(1),
  transportLevel: z.string().min(1),
  priority: z.string().min(1),
});

const StatusUpdateSchema = z.object({
  phoneNumber: z.string().min(10).max(15),
  requestId: z.string().min(1),
  status: z.string().min(1),
  estimatedTime: z.string().optional(),
});

const AgencyAssignmentSchema = z.object({
  phoneNumber: z.string().min(10).max(15),
  requestId: z.string().min(1),
  facilityName: z.string().min(1),
  transportLevel: z.string().min(1),
});

const RouteOptimizationSchema = z.object({
  phoneNumber: z.string().min(10).max(15),
  routeId: z.string().min(1),
  revenueIncrease: z.number().positive(),
  milesSaved: z.number().positive(),
});

/**
 * @route GET /api/notifications/status
 * @desc Check notification service status
 * @access Private
 */
router.get('/status', async (req, res) => {
  try {
    const status = await notificationService.checkServiceStatus();
    res.json({
      success: true,
      data: status,
      message: 'Notification service status retrieved successfully',
    });
  } catch (error) {
    console.error('Error checking notification status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check notification service status',
    });
  }
});

/**
 * @route GET /api/notifications/templates
 * @desc Get available notification templates
 * @access Private
 */
router.get('/templates', async (req, res) => {
  try {
    const templates = notificationService.getNotificationTemplates();
    res.json({
      success: true,
      data: templates,
      message: 'Notification templates retrieved successfully',
    });
  } catch (error) {
    console.error('Error retrieving notification templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve notification templates',
    });
  }
});

/**
 * @route POST /api/notifications/sms
 * @desc Send SMS notification
 * @access Private
 */
router.post('/sms', async (req, res) => {
  try {
    const validatedData = SendSMSSchema.parse(req.body);
    const result = await notificationService.sendSMS(validatedData);
    
    if (result.success) {
      res.json({
        success: true,
        data: result,
        message: 'SMS notification sent successfully',
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error || 'Failed to send SMS notification',
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.issues,
      });
    } else {
      console.error('Error sending SMS notification:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send SMS notification',
      });
    }
  }
});

/**
 * @route POST /api/notifications/email
 * @desc Send email notification
 * @access Private
 */
router.post('/email', async (req, res) => {
  try {
    const validatedData = SendEmailSchema.parse(req.body);
    const result = await notificationService.sendEmail(validatedData);
    
    if (result.success) {
      res.json({
        success: true,
        data: result,
        message: 'Email notification sent successfully',
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error || 'Failed to send email notification',
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.issues,
      });
    } else {
      console.error('Error sending email notification:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send email notification',
      });
    }
  }
});

/**
 * @route POST /api/notifications/push
 * @desc Send push notification
 * @access Private
 */
router.post('/push', async (req, res) => {
  try {
    const validatedData = SendPushSchema.parse(req.body);
    const result = await notificationService.sendPushNotification(validatedData);
    
    if (result.success) {
      res.json({
        success: true,
        data: result,
        message: 'Push notification sent successfully',
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error || 'Failed to send push notification',
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.issues,
      });
    } else {
      console.error('Error sending push notification:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send push notification',
      });
    }
  }
});

/**
 * @route POST /api/notifications/urgent-transport
 * @desc Send urgent transport request notification
 * @access Private
 */
router.post('/urgent-transport', async (req, res) => {
  try {
    const validatedData = UrgentTransportSchema.parse(req.body);
    const result = await notificationService.sendUrgentTransportNotification(
      validatedData.phoneNumber,
      validatedData.facilityName,
      validatedData.transportLevel,
      validatedData.priority
    );
    
    if (result.success) {
      res.json({
        success: true,
        data: result,
        message: 'Urgent transport notification sent successfully',
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error || 'Failed to send urgent transport notification',
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.issues,
      });
    } else {
      console.error('Error sending urgent transport notification:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send urgent transport notification',
      });
    }
  }
});

/**
 * @route POST /api/notifications/status-update
 * @desc Send transport status update notification
 * @access Private
 */
router.post('/status-update', async (req, res) => {
  try {
    const validatedData = StatusUpdateSchema.parse(req.body);
    const result = await notificationService.sendStatusUpdateNotification(
      validatedData.phoneNumber,
      validatedData.requestId,
      validatedData.status,
      validatedData.estimatedTime
    );
    
    if (result.success) {
      res.json({
        success: true,
        data: result,
        message: 'Status update notification sent successfully',
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error || 'Failed to send status update notification',
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.issues,
      });
    } else {
      console.error('Error sending status update notification:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send status update notification',
      });
    }
  }
});

/**
 * @route POST /api/notifications/agency-assignment
 * @desc Send agency assignment notification
 * @access Private
 */
router.post('/agency-assignment', async (req, res) => {
  try {
    const validatedData = AgencyAssignmentSchema.parse(req.body);
    const result = await notificationService.sendAgencyAssignmentNotification(
      validatedData.phoneNumber,
      validatedData.requestId,
      validatedData.facilityName,
      validatedData.transportLevel
    );
    
    if (result.success) {
      res.json({
        success: true,
        data: result,
        message: 'Agency assignment notification sent successfully',
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error || 'Failed to send agency assignment notification',
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.issues,
      });
    } else {
      console.error('Error sending agency assignment notification:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send agency assignment notification',
      });
    }
  }
});

/**
 * @route POST /api/notifications/route-optimization
 * @desc Send route optimization notification
 * @access Private
 */
router.post('/route-optimization', async (req, res) => {
  try {
    const validatedData = RouteOptimizationSchema.parse(req.body);
    const result = await notificationService.sendRouteOptimizationNotification(
      validatedData.phoneNumber,
      validatedData.routeId,
      validatedData.revenueIncrease,
      validatedData.milesSaved
    );
    
    if (result.success) {
      res.json({
        success: true,
        data: result,
        message: 'Route optimization notification sent successfully',
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error || 'Failed to send route optimization notification',
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.issues,
      });
    } else {
      console.error('Error sending route optimization notification:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send route optimization notification',
      });
    }
  }
});

/**
 * @route POST /api/notifications/test
 * @desc Test notification system (demo mode)
 * @access Private
 */
router.post('/test', async (req, res) => {
  try {
    const testPhoneNumber = req.body.phoneNumber || '+15551234567';
    const testResult = await notificationService.sendSMS({
      to: testPhoneNumber,
      message: '🧪 TEST NOTIFICATION\n\nThis is a test message from MedPort notification system.\n\nTimestamp: ' + new Date().toLocaleString(),
      priority: 'normal',
      template: 'test',
      metadata: { type: 'test', timestamp: new Date().toISOString() },
    });
    
    res.json({
      success: true,
      data: testResult,
      message: 'Test notification sent successfully',
      demoMode: !notificationService['isInitialized'],
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send test notification',
    });
  }
});

export default router;
