import twilio from 'twilio';
import { databaseManager } from './databaseManager';

interface TwilioConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
  cost?: number;
}

interface DeliveryStatus {
  messageId: string;
  status: 'queued' | 'sent' | 'delivered' | 'failed' | 'undelivered';
  errorCode?: string;
  errorMessage?: string;
}

class TwilioSMSService {
  private client: twilio.Twilio | null = null;
  private config: TwilioConfig | null = null;
  private isConfigured = false;

  constructor() {
    this.initializeTwilio();
  }

  private initializeTwilio() {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_PHONE_NUMBER;

      if (!accountSid || !authToken || !fromNumber) {
        console.log('TCC_DEBUG: Twilio credentials not configured');
        return;
      }

      this.config = {
        accountSid,
        authToken,
        fromNumber
      };

      this.client = twilio(accountSid, authToken);
      this.isConfigured = true;
      console.log('TCC_DEBUG: Twilio SMS service initialized successfully');
    } catch (error) {
      console.error('TCC_DEBUG: Failed to initialize Twilio:', error);
    }
  }

  async sendSMS(to: string, message: string): Promise<SMSResult> {
    if (!this.isConfigured || !this.client || !this.config) {
      return {
        success: false,
        error: 'Twilio SMS service not configured'
      };
    }

    try {
      // Format phone number (ensure it starts with +1 for US numbers)
      const formattedTo = this.formatPhoneNumber(to);
      
      console.log('TCC_DEBUG: Sending SMS via Twilio:', {
        to: formattedTo,
        from: this.config.fromNumber,
        message: message.substring(0, 50) + '...'
      });

      const result = await this.client.messages.create({
        body: message,
        from: this.config.fromNumber,
        to: formattedTo
      });

      console.log('TCC_DEBUG: Twilio SMS sent successfully:', {
        messageId: result.sid,
        status: result.status,
        price: result.price
      });

      return {
        success: true,
        messageId: result.sid,
        cost: parseFloat(result.price || '0')
      };
    } catch (error: any) {
      console.error('TCC_DEBUG: Twilio SMS failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to send SMS'
      };
    }
  }

  async getDeliveryStatus(messageId: string): Promise<DeliveryStatus | null> {
    if (!this.isConfigured || !this.client) {
      return null;
    }

    try {
      const message = await this.client.messages(messageId).fetch();
      
      return {
        messageId: message.sid,
        status: message.status as any,
        errorCode: message.errorCode?.toString(),
        errorMessage: message.errorMessage
      };
    } catch (error) {
      console.error('TCC_DEBUG: Failed to get delivery status:', error);
      return null;
    }
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured || !this.client) {
      return {
        success: false,
        error: 'Twilio not configured'
      };
    }

    try {
      // Test by fetching account info
      const account = await this.client.api.accounts(this.config!.accountSid).fetch();
      
      return {
        success: true
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Connection test failed'
      };
    }
  }

  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // If it's 10 digits, add +1
    if (digits.length === 10) {
      return `+1${digits}`;
    }
    
    // If it's 11 digits and starts with 1, add +
    if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`;
    }
    
    // If it already has +, return as is
    if (phone.startsWith('+')) {
      return phone;
    }
    
    // Default: add +1
    return `+1${digits}`;
  }

  isServiceConfigured(): boolean {
    return this.isConfigured;
  }

  getConfigurationStatus(): { configured: boolean; missing: string[] } {
    const missing: string[] = [];
    
    if (!process.env.TWILIO_ACCOUNT_SID) missing.push('TWILIO_ACCOUNT_SID');
    if (!process.env.TWILIO_AUTH_TOKEN) missing.push('TWILIO_AUTH_TOKEN');
    if (!process.env.TWILIO_PHONE_NUMBER) missing.push('TWILIO_PHONE_NUMBER');
    
    return {
      configured: missing.length === 0,
      missing
    };
  }
}

export const twilioSMSService = new TwilioSMSService();
export default twilioSMSService;
