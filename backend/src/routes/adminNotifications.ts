import express from 'express';
import { databaseManager } from '../services/databaseManager';
import { authenticateAdmin, AuthenticatedRequest } from '../middleware/authenticateAdmin';
import enhancedEmailService from '../services/enhancedEmailService';
import notificationManager from '../services/notificationManager';

const router = express.Router();
const prisma = databaseManager.getPrismaClient();

/**
 * GET /api/admin/notifications/stats
 * Get system-wide notification statistics (Admin only)
 */
router.get('/stats', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('TCC_DEBUG: Get admin notification stats');
    
    // Check if user is admin
    if (req.user?.userType !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const { days = 30 } = req.query;

    const stats = await notificationManager.getAllNotificationStats(parseInt(days as string));

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('TCC_DEBUG: Get admin notification stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/admin/notifications/broadcast
 * Send notification to all users (Admin only)
 */
router.post('/broadcast', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('TCC_DEBUG: Admin broadcast notification request');
    
    // Check if user is admin
    if (req.user?.userType !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const { 
      notificationType, 
      emailData, 
      smsData, 
      userTypes = ['ADMIN', 'USER', 'HEALTHCARE', 'EMS'] 
    } = req.body;

    if (!notificationType) {
      return res.status(400).json({
        success: false,
        error: 'notificationType is required'
      });
    }

    // Get all users of specified types
    const users = await prisma.centerUser.findMany({
      where: {
        userType: { in: userTypes },
        isActive: true
      },
      select: {
        id: true,
        email: true,
        name: true,
        userType: true
      }
    });

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No users found for broadcast'
      });
    }

    // Send bulk notification
    const result = await notificationManager.sendBulkNotification(
      users.map(u => u.id),
      notificationType,
      emailData,
      smsData
    );

    res.json({
      success: result.successful > 0,
      message: `Broadcast sent to ${result.successful} users, ${result.failed} failed`,
      data: {
        totalSent: result.totalSent,
        successful: result.successful,
        failed: result.failed,
        results: result.results
      }
    });

  } catch (error) {
    console.error('TCC_DEBUG: Admin broadcast notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/admin/notifications/templates
 * Get available notification templates (Admin only)
 */
router.get('/templates', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('TCC_DEBUG: Get notification templates');
    
    // Check if user is admin
    if (req.user?.userType !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    // Get available email templates
    const emailTemplates = {
      newTripRequest: {
        name: 'New Trip Request',
        description: 'Notification sent to EMS agencies for new transport requests',
        subject: '🚑 New Transport Request - Action Required'
      },
      tripAccepted: {
        name: 'Trip Accepted',
        description: 'Notification sent to hospitals when trip is accepted',
        subject: '✅ Transport Request Accepted'
      },
      tripStatusUpdate: {
        name: 'Trip Status Update',
        description: 'Notification sent for trip status changes',
        subject: '📋 Transport Status Update'
      }
    };

    // Get SMS templates
    const smsTemplates = {
      newTripRequest: {
        name: 'New Trip Request SMS',
        description: 'SMS notification for new transport requests',
        maxLength: 160
      },
      tripStatusUpdate: {
        name: 'Trip Status Update SMS',
        description: 'SMS notification for status updates',
        maxLength: 160
      }
    };

    res.json({
      success: true,
      data: {
        email: emailTemplates,
        sms: smsTemplates
      }
    });

  } catch (error) {
    console.error('TCC_DEBUG: Get notification templates error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/admin/notifications/users
 * Get all users for notification management (Admin only)
 */
router.get('/users', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('TCC_DEBUG: Get users for notification management');
    
    // Check if user is admin
    if (req.user?.userType !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const { userType, limit = 100 } = req.query;

    const whereClause = userType ? { userType: userType as string } : {};

    const users = await prisma.centerUser.findMany({
      where: {
        ...whereClause,
        isActive: true
      },
      select: {
        id: true,
        email: true,
        name: true,
        userType: true,
        phone: true,
        emailNotifications: true,
        smsNotifications: true,
        createdAt: true
      },
      take: parseInt(limit as string),
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: users
    });

  } catch (error) {
    console.error('TCC_DEBUG: Get users for notification management error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/admin/notifications/sms-stats
 * Get SMS-specific statistics (Admin only)
 */
router.get('/sms-stats', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('TCC_DEBUG: Get SMS stats for admin');
    
    // Check if user is admin
    if (req.user?.userType !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const { days = 30 } = req.query;

    const smsStats = await enhancedEmailService.getSMSStats(undefined, parseInt(days as string));
    const costStats = await enhancedEmailService.getSMSCostStats();

    res.json({
      success: true,
      data: {
        ...smsStats,
        costStats
      }
    });

  } catch (error) {
    console.error('TCC_DEBUG: Get SMS stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/admin/notifications/carriers
 * Get carrier information (Admin only)
 */
router.get('/carriers', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('TCC_DEBUG: Get carrier information');
    
    // Check if user is admin
    if (req.user?.userType !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const carriers = await enhancedEmailService.getAllCarriers();

    res.json({
      success: true,
      data: carriers
    });

  } catch (error) {
    console.error('TCC_DEBUG: Get carrier information error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/admin/notifications/test-system
 * Test the entire notification system (Admin only)
 */
router.post('/test-system', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('TCC_DEBUG: Test notification system');
    
    // Check if user is admin
    if (req.user?.userType !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const userId = req.user.id;

    // Test the notification system
    const testResult = await notificationManager.testNotificationSystem(userId);

    res.json({
      success: testResult.email && testResult.sms,
      message: 'Notification system test completed',
      data: testResult
    });

  } catch (error) {
    console.error('TCC_DEBUG: Test notification system error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/admin/notifications/logs
 * Get system-wide notification logs (Admin only)
 */
router.get('/logs', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('TCC_DEBUG: Get admin notification logs');
    
    // Check if user is admin
    if (req.user?.userType !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const { 
      days = 30, 
      limit = 100, 
      userId, 
      channel, 
      status 
    } = req.query;

    const whereClause: any = {
      sentAt: {
        gte: new Date(Date.now() - parseInt(days as string) * 24 * 60 * 60 * 1000)
      }
    };

    if (userId) whereClause.userId = userId;
    if (channel) whereClause.channel = channel;
    if (status) whereClause.status = status;

    const logs = await prisma.notificationLog.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            userType: true
          }
        }
      },
      orderBy: {
        sentAt: 'desc'
      },
      take: parseInt(limit as string)
    });

    res.json({
      success: true,
      data: logs
    });

  } catch (error) {
    console.error('TCC_DEBUG: Get admin notification logs error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
