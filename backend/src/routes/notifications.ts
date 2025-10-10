import express from 'express';
import { databaseManager } from '../services/databaseManager';
import { authenticateAdmin, AuthenticatedRequest } from '../middleware/authenticateAdmin';
import enhancedEmailService from '../services/enhancedEmailService';
import notificationManager from '../services/notificationManager';
import twilioSMSService from '../services/twilioSMSService';

const router = express.Router();
const prisma = databaseManager.getPrismaClient();

/**
 * GET /api/notifications
 * Get notifications for the authenticated user
 */
router.get('/', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('TCC_DEBUG: Get notifications request for user:', req.user?.id);
    
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Get notifications from system analytics
    const notifications = await prisma.systemAnalytics.findMany({
      where: {
        metricName: 'notification',
        userId: userId
      },
      orderBy: {
        timestamp: 'desc'
      },
      select: {
        id: true,
        metricName: true,
        metricValue: true,
        timestamp: true,
        userId: true
      },
      take: 50 // Limit to last 50 notifications
    });

    // Transform notifications
    const transformedNotifications = notifications.map(notif => ({
      id: notif.id,
      type: (notif.metricValue as any)?.type || 'info',
      title: (notif.metricValue as any)?.title || 'Notification',
      message: (notif.metricValue as any)?.message || '',
      read: (notif.metricValue as any)?.read || false,
      createdAt: notif.timestamp
    }));

    res.json({
      success: true,
      data: transformedNotifications
    });

  } catch (error) {
    console.error('TCC_DEBUG: Get notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * PUT /api/notifications/:id/read
 * Mark a notification as read
 */
router.put('/:id/read', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('TCC_DEBUG: Mark notification as read:', req.params.id);
    
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const { id } = req.params;

    // Update notification read status
    const notification = await prisma.systemAnalytics.findFirst({
      where: {
        id: id,
        userId: userId,
        metricName: 'notification'
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    const updatedValue = {
      ...(notification.metricValue as any),
      read: true,
      readAt: new Date().toISOString()
    };

    await prisma.systemAnalytics.update({
      where: { id: id },
      data: {
        metricValue: updatedValue
      }
    });

    res.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('TCC_DEBUG: Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read for the user
 */
router.put('/read-all', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('TCC_DEBUG: Mark all notifications as read for user:', req.user?.id);
    
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Get all unread notifications for the user
    const notifications = await prisma.systemAnalytics.findMany({
      where: {
        metricName: 'notification',
        userId: userId
      }
    });

    // Update all notifications to read
    for (const notification of notifications) {
      const updatedValue = {
        ...(notification.metricValue as any),
        read: true,
        readAt: new Date().toISOString()
      };

      await prisma.systemAnalytics.update({
        where: { id: notification.id },
        data: {
          metricValue: updatedValue
        }
      });
    }

    res.json({
      success: true,
      message: `Marked ${notifications.length} notifications as read`
    });

  } catch (error) {
    console.error('TCC_DEBUG: Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/notifications/test
 * Create a test notification
 */
router.post('/test', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('TCC_DEBUG: Create test notification for user:', req.user?.id);
    
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const { type = 'info', title = 'Test Notification', message = 'This is a test notification' } = req.body;

    // Create test notification
    const notification = await prisma.systemAnalytics.create({
      data: {
        metricName: 'notification',
        metricValue: {
          type: type,
          title: title,
          message: message,
          read: false,
          createdAt: new Date().toISOString()
        },
        userId: userId
      }
    });

    res.json({
      success: true,
      message: 'Test notification created',
      data: notification
    });

  } catch (error) {
    console.error('TCC_DEBUG: Create test notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/notifications/preferences
 * Get user notification preferences
 */
router.get('/preferences', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('TCC_DEBUG: Get notification preferences for user:', req.user?.id);
    
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const preferences = await enhancedEmailService.getUserNotificationPreferences(userId);
    
    res.json({
      success: true,
      data: preferences
    });

  } catch (error) {
    console.error('TCC_DEBUG: Get notification preferences error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * PUT /api/notifications/preferences
 * Update user notification preferences
 */
router.put('/preferences', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('TCC_DEBUG: Update notification preferences for user:', req.user?.id);
    
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const { 
      emailNotifications, 
      smsNotifications, 
      phone, 
      notificationTypes 
    } = req.body;

    // Update user's global notification settings
    if (emailNotifications !== undefined || smsNotifications !== undefined || phone !== undefined) {
      await prisma.centerUser.update({
        where: { id: userId },
        data: {
          emailNotifications: emailNotifications,
          smsNotifications: smsNotifications,
          phone: phone
        }
      });
    }

    // Update specific notification type preferences
    if (notificationTypes) {
      for (const [type, settings] of Object.entries(notificationTypes)) {
        await prisma.notificationPreference.upsert({
          where: {
            userId_notificationType: {
              userId: userId,
              notificationType: type
            }
          },
          update: {
            emailEnabled: (settings as any).email,
            smsEnabled: (settings as any).sms
          },
          create: {
            userId: userId,
            notificationType: type,
            emailEnabled: (settings as any).email || true,
            smsEnabled: (settings as any).sms || false
          }
        });
      }
    }

    // Get updated preferences
    const updatedPreferences = await enhancedEmailService.getUserNotificationPreferences(userId);

    res.json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: updatedPreferences
    });

  } catch (error) {
    console.error('TCC_DEBUG: Update notification preferences error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/notifications/log
 * Get notification delivery log for user
 */
router.get('/log', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('TCC_DEBUG: Get notification log for user:', req.user?.id);
    
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const { days = 30, limit = 50 } = req.query;

    const logs = await prisma.notificationLog.findMany({
      where: {
        userId: userId,
        sentAt: {
          gte: new Date(Date.now() - parseInt(days as string) * 24 * 60 * 60 * 1000)
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
    console.error('TCC_DEBUG: Get notification log error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/notifications/send
 * Send notification to user
 */
router.post('/send', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('TCC_DEBUG: Send notification request:', req.body);
    
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const { 
      targetUserId, 
      notificationType, 
      emailData, 
      smsData 
    } = req.body;

    if (!targetUserId || !notificationType) {
      return res.status(400).json({
        success: false,
        error: 'targetUserId and notificationType are required'
      });
    }

    const result = await notificationManager.sendNotification({
      userId: targetUserId,
      notificationType,
      emailData,
      smsData
    });

    res.json({
      success: result.success,
      message: result.success ? 'Notification sent successfully' : 'Failed to send notification',
      data: result
    });

  } catch (error) {
    console.error('TCC_DEBUG: Send notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/notifications/test-email
 * Test email service
 */
router.post('/test-email', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('TCC_DEBUG: Test email service request');
    
    const { to, template = 'newTripRequest', data = {} } = req.body;

    if (!to) {
      return res.status(400).json({
        success: false,
        error: 'Email address is required'
      });
    }

    const result = await enhancedEmailService.sendEmail({
      to,
      template,
      data: {
        ...data,
        tripId: 'test-trip-id',
        patientId: 'TEST123',
        transportLevel: 'BASIC',
        priority: 'NORMAL',
        originFacility: 'Test Hospital',
        destinationFacility: 'Test Destination',
        readyStart: new Date().toLocaleString(),
        readyEnd: new Date(Date.now() + 2 * 60 * 60 * 1000).toLocaleString()
      }
    });

    res.json({
      success: result,
      message: result ? 'Test email sent successfully' : 'Failed to send test email'
    });

  } catch (error) {
    console.error('TCC_DEBUG: Test email error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/notifications/test-sms
 * Test SMS service
 */
router.post('/test-sms', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('TCC_DEBUG: Test SMS service request');
    
    const { to, message = 'Test SMS from TCC system' } = req.body;

    if (!to) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }

    // Test Twilio SMS service
    const twilioResult = await twilioSMSService.sendSMS(to, message);
    
    if (twilioResult.success) {
      return res.json({
        success: true,
        message: 'SMS sent successfully via Twilio',
        messageId: twilioResult.messageId,
        cost: twilioResult.cost
      });
    } else {
      return res.status(500).json({
        success: false,
        error: twilioResult.error || 'Failed to send SMS'
      });
    }

  } catch (error) {
    console.error('TCC_DEBUG: Test SMS error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/notifications/stats
 * Get notification statistics for user
 */
router.get('/stats', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('TCC_DEBUG: Get notification stats for user:', req.user?.id);
    
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const { days = 30 } = req.query;

    const stats = await notificationManager.getUserNotificationStats(userId, parseInt(days as string));

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('TCC_DEBUG: Get notification stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/notifications/status
 * Check notification service status
 */
router.get('/status', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('TCC_DEBUG: Check notification service status');
    
    const emailStatus = await enhancedEmailService.testEmailConnection();
    const smsStatus = await enhancedEmailService.testSMSConnection();

    res.json({
      success: true,
      data: {
        email: {
          status: emailStatus ? 'connected' : 'disconnected',
          working: emailStatus
        },
        sms: {
          status: smsStatus ? 'connected' : 'disconnected',
          working: smsStatus
        },
        overall: emailStatus || smsStatus
      }
    });

  } catch (error) {
    console.error('TCC_DEBUG: Check notification status error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
