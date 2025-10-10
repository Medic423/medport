import { PrismaClient } from '@prisma/client';

const centerPrisma = new PrismaClient();

interface SMSData {
  to: string;
  message: string;
  priority?: 'high' | 'normal' | 'low';
  userId?: string;
  notificationType?: string;
}

interface CarrierInfo {
  name: string;
  gateway: string;
  costPerMessage: number;
  reliability: number; // 0-1 scale
  maxLength: number;
}

interface DeliveryResult {
  success: boolean;
  messageId?: string;
  error?: string;
  carrier?: string;
  cost?: number;
  deliveryTime?: number;
}

interface SMSCost {
  carrier: string;
  costPerMessage: number;
  totalCost: number;
  messageCount: number;
}

class EnhancedSMSService {
  private carriers: Map<string, CarrierInfo> = new Map();
  private costTracking: Map<string, SMSCost> = new Map();

  constructor() {
    this.initializeCarriers();
  }

  /**
   * Initialize carrier information and costs
   */
  private initializeCarriers() {
    // US Carrier gateways and estimated costs
    this.carriers.set('verizon', {
      name: 'Verizon',
      gateway: '@vtext.com',
      costPerMessage: 0.01, // Estimated cost per SMS
      reliability: 0.95,
      maxLength: 160
    });

    this.carriers.set('att', {
      name: 'AT&T',
      gateway: '@txt.att.net',
      costPerMessage: 0.01,
      reliability: 0.93,
      maxLength: 160
    });

    this.carriers.set('sprint', {
      name: 'Sprint',
      gateway: '@messaging.sprintpcs.com',
      costPerMessage: 0.01,
      reliability: 0.90,
      maxLength: 160
    });

    this.carriers.set('tmobile', {
      name: 'T-Mobile',
      gateway: '@tmomail.net',
      costPerMessage: 0.01,
      reliability: 0.92,
      maxLength: 160
    });

    this.carriers.set('uscellular', {
      name: 'US Cellular',
      gateway: '@email.uscc.net',
      costPerMessage: 0.01,
      reliability: 0.88,
      maxLength: 160
    });

    console.log('TCC_DEBUG: SMS carriers initialized:', this.carriers.size);
  }

  /**
   * Detect carrier from phone number
   */
  private detectCarrier(phoneNumber: string): CarrierInfo | null {
    // This is a simplified carrier detection
    // In production, you might use a service like Twilio Lookup API
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    if (cleaned.length !== 10) {
      return null;
    }

    // For now, default to Verizon as it has high reliability
    // In production, you could implement more sophisticated detection
    return this.carriers.get('verizon') || null;
  }

  /**
   * Get all possible gateways for a phone number
   */
  private getAllGateways(phoneNumber: string): string[] {
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    if (cleaned.length !== 10) {
      return [];
    }

    const gateways: string[] = [];
    this.carriers.forEach((carrier, key) => {
      gateways.push(`${cleaned}${carrier.gateway}`);
    });

    return gateways;
  }

  /**
   * Validate phone number format
   */
  private validatePhoneNumber(phoneNumber: string): { valid: boolean; formatted?: string; error?: string } {
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Handle different formats
    let digits = cleaned;
    
    // If it starts with 1 and is 11 digits, remove the 1
    if (digits.length === 11 && digits.startsWith('1')) {
      digits = digits.substring(1);
    }
    
    // Must be 10 digits for US numbers
    if (digits.length !== 10) {
      return {
        valid: false,
        error: `Invalid phone number length: ${digits.length} digits. Expected 10 digits.`
      };
    }

    // Check if it's a valid US area code
    const areaCode = digits.substring(0, 3);
    if (areaCode.startsWith('0') || areaCode.startsWith('1')) {
      return {
        valid: false,
        error: 'Invalid area code'
      };
    }

    return {
      valid: true,
      formatted: digits
    };
  }

  /**
   * Truncate message to carrier limits
   */
  private truncateMessage(message: string, maxLength: number): string {
    if (message.length <= maxLength) {
      return message;
    }

    // Truncate and add indicator
    const truncated = message.substring(0, maxLength - 3);
    return `${truncated}...`;
  }

  /**
   * Send SMS with enhanced features
   */
  async sendSMS(data: SMSData): Promise<DeliveryResult> {
    const startTime = Date.now();
    
    try {
      console.log('TCC_DEBUG: Enhanced SMS sending:', {
        to: data.to,
        messageLength: data.message.length,
        priority: data.priority || 'normal'
      });

      // Validate phone number
      const validation = this.validatePhoneNumber(data.to);
      if (!validation.valid) {
        console.log('TCC_DEBUG: Invalid phone number:', validation.error);
        return {
          success: false,
          error: validation.error
        };
      }

      // Detect carrier
      const carrier = this.detectCarrier(validation.formatted!);
      if (!carrier) {
        console.log('TCC_DEBUG: Could not detect carrier for:', data.to);
        return {
          success: false,
          error: 'Could not detect carrier'
        };
      }

      // Truncate message if needed
      const message = this.truncateMessage(data.message, carrier.maxLength);
      if (message !== data.message) {
        console.log('TCC_DEBUG: Message truncated for carrier limits');
      }

      // Convert to SMS gateway
      const smsEmail = `${validation.formatted}${carrier.gateway}`;
      
      // Import nodemailer dynamically to avoid circular dependencies
      const nodemailer = require('nodemailer');
      
      // Create transporter (reuse from email service)
      const transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      // Send SMS via email gateway
      const mailOptions = {
        from: `"TCC SMS" <${process.env.SMTP_USER}>`,
        to: smsEmail,
        subject: '', // SMS gateways don't use subject
        text: message,
        html: message
      };

      const result = await transporter.sendMail(mailOptions);
      const deliveryTime = Date.now() - startTime;
      
      console.log('TCC_DEBUG: Enhanced SMS sent successfully:', {
        to: data.to,
        carrier: carrier.name,
        smsEmail: smsEmail,
        messageId: (result as any).messageId,
        deliveryTime: `${deliveryTime}ms`
      });

      // Track cost
      this.trackCost(carrier.name, carrier.costPerMessage);

      // Log delivery
      if (data.userId && data.notificationType) {
        await this.logSMSDelivery({
          userId: data.userId,
          notificationType: data.notificationType,
          phoneNumber: data.to,
          carrier: carrier.name,
          messageId: (result as any).messageId,
          status: 'sent',
          deliveryTime,
          cost: carrier.costPerMessage
        });
      }

      return {
        success: true,
        messageId: (result as any).messageId,
        carrier: carrier.name,
        cost: carrier.costPerMessage,
        deliveryTime
      };

    } catch (error) {
      const deliveryTime = Date.now() - startTime;
      console.error('TCC_DEBUG: Enhanced SMS sending failed:', error);
      
      // Log failure
      if (data.userId && data.notificationType) {
        await this.logSMSDelivery({
          userId: data.userId,
          notificationType: data.notificationType,
          phoneNumber: data.to,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          deliveryTime
        });
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        deliveryTime
      };
    }
  }

  /**
   * Send SMS with retry logic
   */
  async sendSMSWithRetry(data: SMSData, maxRetries: number = 3): Promise<DeliveryResult> {
    let lastError: string | undefined;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`TCC_DEBUG: SMS attempt ${attempt}/${maxRetries} for ${data.to}`);
      
      const result = await this.sendSMS(data);
      
      if (result.success) {
        console.log(`TCC_DEBUG: SMS sent successfully on attempt ${attempt}`);
        return result;
      }
      
      lastError = result.error;
      
      if (attempt < maxRetries) {
        // Wait before retry (exponential backoff)
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.log(`TCC_DEBUG: SMS failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    console.log(`TCC_DEBUG: SMS failed after ${maxRetries} attempts`);
    return {
      success: false,
      error: `Failed after ${maxRetries} attempts. Last error: ${lastError}`
    };
  }

  /**
   * Send bulk SMS with rate limiting
   */
  async sendBulkSMS(
    messages: SMSData[], 
    rateLimit: number = 10 // messages per second
  ): Promise<{ successful: number; failed: number; results: DeliveryResult[] }> {
    console.log(`TCC_DEBUG: Sending bulk SMS to ${messages.length} recipients`);
    
    const results: DeliveryResult[] = [];
    let successful = 0;
    let failed = 0;
    
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      
      // Rate limiting
      if (i > 0 && i % rateLimit === 0) {
        console.log('TCC_DEBUG: Rate limiting - waiting 1 second...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      try {
        const result = await this.sendSMS(message);
        results.push(result);
        
        if (result.success) {
          successful++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error('TCC_DEBUG: Error in bulk SMS:', error);
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        failed++;
      }
    }
    
    console.log(`TCC_DEBUG: Bulk SMS completed: ${successful} successful, ${failed} failed`);
    
    return {
      successful,
      failed,
      results
    };
  }

  /**
   * Track SMS costs
   */
  private trackCost(carrier: string, costPerMessage: number) {
    const existing = this.costTracking.get(carrier);
    
    if (existing) {
      existing.messageCount++;
      existing.totalCost += costPerMessage;
    } else {
      this.costTracking.set(carrier, {
        carrier,
        costPerMessage,
        totalCost: costPerMessage,
        messageCount: 1
      });
    }
  }

  /**
   * Get SMS cost statistics
   */
  getSMSCostStats(): { totalCost: number; byCarrier: SMSCost[]; messageCount: number } {
    let totalCost = 0;
    let messageCount = 0;
    const byCarrier: SMSCost[] = [];
    
    this.costTracking.forEach((cost) => {
      totalCost += cost.totalCost;
      messageCount += cost.messageCount;
      byCarrier.push({ ...cost });
    });
    
    return {
      totalCost,
      byCarrier,
      messageCount
    };
  }

  /**
   * Get carrier information
   */
  getCarrierInfo(phoneNumber: string): CarrierInfo | null {
    const validation = this.validatePhoneNumber(phoneNumber);
    if (!validation.valid) {
      return null;
    }
    
    return this.detectCarrier(validation.formatted!);
  }

  /**
   * Get all available carriers
   */
  getAllCarriers(): CarrierInfo[] {
    return Array.from(this.carriers.values());
  }

  /**
   * Test SMS service
   */
  async testSMSService(): Promise<{
    phoneValidation: boolean;
    carrierDetection: boolean;
    gatewayConversion: boolean;
    overall: boolean;
  }> {
    console.log('TCC_DEBUG: Testing enhanced SMS service...');
    
    const testPhone = '5551234567';
    
    // Test phone validation
    const validation = this.validatePhoneNumber(testPhone);
    const phoneValidation = validation.valid;
    
    // Test carrier detection
    const carrier = this.detectCarrier(testPhone);
    const carrierDetection = carrier !== null;
    
    // Test gateway conversion
    const gateways = this.getAllGateways(testPhone);
    const gatewayConversion = gateways.length > 0;
    
    const overall = phoneValidation && carrierDetection && gatewayConversion;
    
    console.log('TCC_DEBUG: SMS service test results:', {
      phoneValidation,
      carrierDetection,
      gatewayConversion,
      overall
    });
    
    return {
      phoneValidation,
      carrierDetection,
      gatewayConversion,
      overall
    };
  }

  /**
   * Log SMS delivery
   */
  private async logSMSDelivery(data: {
    userId: string;
    notificationType: string;
    phoneNumber: string;
    carrier?: string;
    messageId?: string;
    status: 'sent' | 'failed';
    error?: string;
    deliveryTime?: number;
    cost?: number;
  }) {
    try {
      await centerPrisma.notificationLog.create({
        data: {
          userId: data.userId,
          notificationType: data.notificationType,
          channel: 'sms',
          status: data.status,
          deliveredAt: data.status === 'sent' ? new Date() : null,
          errorMessage: data.error
        }
      });

      // Log additional SMS-specific data to system analytics
      await centerPrisma.systemAnalytics.create({
        data: {
          metricName: 'sms_delivery_details',
          metricValue: {
            phoneNumber: data.phoneNumber,
            carrier: data.carrier,
            messageId: data.messageId,
            deliveryTime: data.deliveryTime,
            cost: data.cost,
            timestamp: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('TCC_DEBUG: Failed to log SMS delivery:', error);
    }
  }

  /**
   * Get SMS delivery statistics
   */
  async getSMSStats(userId?: string, days: number = 30): Promise<{
    totalSent: number;
    totalDelivered: number;
    totalFailed: number;
    deliveryRate: number;
    averageDeliveryTime: number;
    totalCost: number;
    byCarrier: { [carrier: string]: { sent: number; delivered: number; failed: number; cost: number } };
  }> {
    try {
      const since = new Date();
      since.setDate(since.getDate() - days);

      const whereClause = userId ? { userId, sentAt: { gte: since } } : { sentAt: { gte: since } };

      const logs = await centerPrisma.notificationLog.findMany({
        where: {
          ...whereClause,
          channel: 'sms'
        }
      });

      const stats = {
        totalSent: logs.length,
        totalDelivered: logs.filter(log => log.status === 'sent').length,
        totalFailed: logs.filter(log => log.status === 'failed').length,
        deliveryRate: 0,
        averageDeliveryTime: 0,
        totalCost: 0,
        byCarrier: {} as { [carrier: string]: { sent: number; delivered: number; failed: number; cost: number } }
      };

      // Calculate delivery rate
      stats.deliveryRate = stats.totalSent > 0 ? (stats.totalDelivered / stats.totalSent) * 100 : 0;

      // Get detailed SMS analytics
      const smsDetails = await centerPrisma.systemAnalytics.findMany({
        where: {
          metricName: 'sms_delivery_details',
          ...(userId && { userId })
        }
      });

      let totalDeliveryTime = 0;
      let deliveryCount = 0;

      smsDetails.forEach(detail => {
        const data = detail.metricValue as any;
        const carrier = data.carrier || 'unknown';
        
        if (!stats.byCarrier[carrier]) {
          stats.byCarrier[carrier] = { sent: 0, delivered: 0, failed: 0, cost: 0 };
        }
        
        stats.byCarrier[carrier].sent++;
        if (data.deliveryTime) {
          totalDeliveryTime += data.deliveryTime;
          deliveryCount++;
        }
        if (data.cost) {
          stats.byCarrier[carrier].cost += data.cost;
          stats.totalCost += data.cost;
        }
      });

      stats.averageDeliveryTime = deliveryCount > 0 ? totalDeliveryTime / deliveryCount : 0;

      return stats;
    } catch (error) {
      console.error('TCC_DEBUG: Error getting SMS stats:', error);
      return {
        totalSent: 0,
        totalDelivered: 0,
        totalFailed: 0,
        deliveryRate: 0,
        averageDeliveryTime: 0,
        totalCost: 0,
        byCarrier: {}
      };
    }
  }
}

export default new EnhancedSMSService();
