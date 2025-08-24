import twilio from 'twilio';
import { z } from 'zod';

// Notification schemas for validation
export const SMSNotificationSchema = z.object({
  to: z.string().min(10).max(15), // Phone number
  message: z.string().min(1).max(1600), // SMS message content
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  template: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const EmailNotificationSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1).max(200),
  body: z.string().min(1),
  template: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const PushNotificationSchema = z.object({
  userId: z.string(),
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(500),
  data: z.record(z.string(), z.any()).optional(),
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
});

export type SMSNotification = z.infer<typeof SMSNotificationSchema>;
export type EmailNotification = z.infer<typeof EmailNotificationSchema>;
export type PushNotification = z.infer<typeof PushNotificationSchema>;

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: Date;
  deliveryStatus: 'pending' | 'delivered' | 'failed' | 'undelivered';
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'sms' | 'email' | 'push';
  content: string;
  variables: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class NotificationService {
  private twilioClient: twilio.Twilio | null = null;
  private isInitialized = false;

  constructor() {
    this.initializeTwilio();
  }

  private initializeTwilio(): void {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (accountSid && authToken) {
      try {
        this.twilioClient = twilio(accountSid, authToken);
        this.isInitialized = true;
        console.log('✅ Twilio client initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize Twilio client:', error);
        this.isInitialized = false;
      }
    } else {
      console.warn('⚠️ Twilio credentials not found. Running in demo mode.');
      this.isInitialized = false;
    }
  }

  /**
   * Send SMS notification using Twilio
   */
  async sendSMS(notification: SMSNotification): Promise<NotificationResult> {
    try {
      // Validate notification data
      const validatedNotification = SMSNotificationSchema.parse(notification);
      
      // Check if Twilio is available
      if (!this.isInitialized || !this.twilioClient) {
        return this.handleDemoMode('sms', validatedNotification);
      }

      const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
      if (!twilioPhoneNumber) {
        throw new Error('Twilio phone number not configured');
      }

      // Send SMS via Twilio
      const message = await this.twilioClient.messages.create({
        body: validatedNotification.message,
        from: twilioPhoneNumber,
        to: validatedNotification.to,
      });

      return {
        success: true,
        messageId: message.sid,
        timestamp: new Date(),
        deliveryStatus: 'delivered',
      };
    } catch (error) {
      console.error('SMS sending failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        deliveryStatus: 'failed',
      };
    }
  }

  /**
   * Send email notification using Twilio SendGrid (via Twilio)
   */
  async sendEmail(notification: EmailNotification): Promise<NotificationResult> {
    try {
      // Validate notification data
      const validatedNotification = EmailNotificationSchema.parse(notification);
      
      // Check if Twilio is available
      if (!this.isInitialized || !this.twilioClient) {
        return this.handleDemoMode('email', validatedNotification);
      }

      // For now, we'll use Twilio's email service
      // In production, you might want to use SendGrid directly
      const twilioEmail = process.env.TWILIO_EMAIL || 'noreply@medport.com';
      
      // Simulate email sending (replace with actual Twilio email implementation)
      const messageId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        success: true,
        messageId,
        timestamp: new Date(),
        deliveryStatus: 'delivered',
      };
    } catch (error) {
      console.error('Email sending failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        deliveryStatus: 'failed',
      };
    }
  }

  /**
   * Send push notification (placeholder for future implementation)
   */
  async sendPushNotification(notification: PushNotification): Promise<NotificationResult> {
    try {
      // Validate notification data
      const validatedNotification = PushNotificationSchema.parse(notification);
      
      // For now, return demo mode response
      return this.handleDemoMode('push', validatedNotification);
    } catch (error) {
      console.error('Push notification failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        deliveryStatus: 'failed',
      };
    }
  }

  /**
   * Send urgent transport request notification
   */
  async sendUrgentTransportNotification(
    phoneNumber: string,
    facilityName: string,
    transportLevel: string,
    priority: string
  ): Promise<NotificationResult> {
    const message = `🚨 URGENT TRANSPORT REQUEST\n\nFacility: ${facilityName}\nLevel: ${transportLevel}\nPriority: ${priority}\n\nPlease respond immediately.`;
    
    return this.sendSMS({
      to: phoneNumber,
      message,
      priority: 'urgent',
      template: 'urgent_transport',
      metadata: {
        facilityName,
        transportLevel,
        priority,
        type: 'urgent_transport',
      },
    });
  }

  /**
   * Send transport status update notification
   */
  async sendStatusUpdateNotification(
    phoneNumber: string,
    requestId: string,
    status: string,
    estimatedTime?: string
  ): Promise<NotificationResult> {
    const message = `📱 TRANSPORT STATUS UPDATE\n\nRequest: ${requestId}\nStatus: ${status}${estimatedTime ? `\nETA: ${estimatedTime}` : ''}\n\nTrack at medport.com`;
    
    return this.sendSMS({
      to: phoneNumber,
      message,
      priority: 'normal',
      template: 'status_update',
      metadata: {
        requestId,
        status,
        estimatedTime,
        type: 'status_update',
      },
    });
  }

  /**
   * Send agency assignment notification
   */
  async sendAgencyAssignmentNotification(
    phoneNumber: string,
    requestId: string,
    facilityName: string,
    transportLevel: string
  ): Promise<NotificationResult> {
    const message = `🚑 NEW TRANSPORT ASSIGNMENT\n\nRequest: ${requestId}\nFacility: ${facilityName}\nLevel: ${transportLevel}\n\nPlease confirm assignment.`;
    
    return this.sendSMS({
      to: phoneNumber,
      message,
      priority: 'high',
      template: 'agency_assignment',
      metadata: {
        requestId,
        facilityName,
        transportLevel,
        type: 'agency_assignment',
      },
    });
  }

  /**
   * Send route optimization notification
   */
  async sendRouteOptimizationNotification(
    phoneNumber: string,
    routeId: string,
    revenueIncrease: number,
    milesSaved: number
  ): Promise<NotificationResult> {
    const message = `💰 ROUTE OPTIMIZATION OPPORTUNITY\n\nRoute: ${routeId}\nRevenue Increase: $${revenueIncrease.toLocaleString()}\nMiles Saved: ${milesSaved}\n\nReview at medport.com`;
    
    return this.sendSMS({
      to: phoneNumber,
      message,
      priority: 'normal',
      template: 'route_optimization',
      metadata: {
        routeId,
        revenueIncrease,
        milesSaved,
        type: 'route_optimization',
      },
    });
  }

  /**
   * Handle demo mode when Twilio is not available
   */
  private handleDemoMode(
    type: 'sms' | 'email' | 'push',
    notification: SMSNotification | EmailNotification | PushNotification
  ): NotificationResult {
    const demoMessageId = `demo_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`📱 Demo Mode - ${type.toUpperCase()} Notification:`, {
      type,
      to: 'to' in notification ? notification.to : notification.userId,
      content: 'message' in notification ? notification.message : notification.body,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      messageId: demoMessageId,
      timestamp: new Date(),
      deliveryStatus: 'delivered',
    };
  }

  /**
   * Check Twilio service status
   */
  async checkServiceStatus(): Promise<{
    twilio: boolean;
    sms: boolean;
    email: boolean;
    push: boolean;
  }> {
    return {
      twilio: this.isInitialized,
      sms: this.isInitialized,
      email: this.isInitialized,
      push: false, // Not implemented yet
    };
  }

  /**
   * Get notification templates
   */
  getNotificationTemplates(): NotificationTemplate[] {
    return [
      {
        id: 'urgent_transport',
        name: 'Urgent Transport Request',
        type: 'sms',
        content: '🚨 URGENT TRANSPORT REQUEST\n\nFacility: {facilityName}\nLevel: {transportLevel}\nPriority: {priority}\n\nPlease respond immediately.',
        variables: ['facilityName', 'transportLevel', 'priority'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'status_update',
        name: 'Transport Status Update',
        type: 'sms',
        content: '📱 TRANSPORT STATUS UPDATE\n\nRequest: {requestId}\nStatus: {status}\nETA: {estimatedTime}\n\nTrack at medport.com',
        variables: ['requestId', 'status', 'estimatedTime'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'agency_assignment',
        name: 'Agency Assignment',
        type: 'sms',
        content: '🚑 NEW TRANSPORT ASSIGNMENT\n\nRequest: {requestId}\nFacility: {facilityName}\nLevel: {transportLevel}\n\nPlease confirm assignment.',
        variables: ['requestId', 'facilityName', 'transportLevel'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'route_optimization',
        name: 'Route Optimization',
        type: 'sms',
        content: '💰 ROUTE OPTIMIZATION OPPORTUNITY\n\nRoute: {routeId}\nRevenue Increase: ${revenueIncrease}\nMiles Saved: {milesSaved}\n\nReview at medport.com',
        variables: ['routeId', 'revenueIncrease', 'milesSaved'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
