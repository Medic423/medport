import { SmsClient } from '@azure/communication-sms';

interface AzureConfig {
  connectionString: string;
  phoneNumber: string;
  endpoint: string;
}

interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
  cost?: number;
}

interface DeliveryStatus {
  messageId: string;
  status: 'sent' | 'delivered' | 'failed' | 'unknown';
  errorCode?: string;
  errorMessage?: string;
}

class AzureSMSService {
  private client: SmsClient | null = null;
  private config: AzureConfig | null = null;
  private isConfigured = false;

  constructor() {
    this.initializeClient();
  }

  /**
   * Check if SMS is enabled via feature flag
   */
  isEnabled(): boolean {
    return process.env.AZURE_SMS_ENABLED === 'true';
  }

  /**
   * Initialize Azure Communication Services SMS client
   */
  private initializeClient(): SmsClient | null {
    // Check feature flag first
    if (!this.isEnabled()) {
      console.log('TCC_DEBUG: Azure SMS is disabled via feature flag (AZURE_SMS_ENABLED=false)');
      return null;
    }

    try {
      const connectionString = process.env.AZURE_COMMUNICATION_CONNECTION_STRING;
      const phoneNumber = process.env.AZURE_COMMUNICATION_PHONE_NUMBER;
      const endpoint = process.env.AZURE_COMMUNICATION_ENDPOINT;

      if (!connectionString || !phoneNumber) {
        console.log('TCC_DEBUG: Azure Communication Services credentials not configured');
        return null;
      }

      this.config = {
        connectionString,
        phoneNumber,
        endpoint: endpoint || ''
      };

      this.client = new SmsClient(connectionString);
      this.isConfigured = true;
      console.log('TCC_DEBUG: Azure Communication Services SMS service initialized successfully');
      return this.client;
    } catch (error) {
      console.error('TCC_DEBUG: Failed to initialize Azure Communication Services:', error);
      return null;
    }
  }

  /**
   * Send SMS message
   * Returns success even if disabled (graceful degradation for testing)
   */
  async sendSMS(to: string, message: string): Promise<SMSResult> {
    // If disabled, return success without sending (allows testing without SMS)
    if (!this.isEnabled()) {
      console.log('TCC_DEBUG: Azure SMS disabled - returning success without sending');
      return {
        success: true,
        messageId: 'disabled'
      };
    }

    if (!this.isConfigured || !this.client || !this.config) {
      return {
        success: false,
        error: 'Azure Communication Services SMS service not configured'
      };
    }

    try {
      // Format phone number (Azure requires E.164 format)
      const formattedTo = this.formatPhoneNumber(to);
      
      console.log('TCC_DEBUG: Sending SMS via Azure Communication Services:', {
        to: formattedTo,
        toOriginal: to,
        from: this.config.phoneNumber,
        messageLength: message.length,
        messagePreview: message.substring(0, 50) + '...',
        fullMessage: message
      });

      // Azure Communication Services sends SMS using send method
      // The from parameter is the phone number from the connection string
      const sendResults = await this.client.send({
        from: this.config.phoneNumber,
        to: [formattedTo],
        message: message
      });

      // Azure returns an array of results
      const result = sendResults[0];
      
      // Log full Azure response for debugging
      console.log('TCC_DEBUG: Azure SMS API Response:', {
        successful: result.successful,
        messageId: result.messageId,
        httpStatusCode: result.httpStatusCode,
        errorMessage: result.errorMessage,
        fullResult: JSON.stringify(result, null, 2)
      });
      
      if (result.successful) {
        // HTTP 202 means "Accepted" - request was accepted but not necessarily delivered
        // Azure Communication Services returns 202 for accepted requests
        console.log('TCC_DEBUG: Azure SMS request accepted (HTTP 202):', {
          messageId: result.messageId,
          httpStatusCode: result.httpStatusCode,
          note: 'HTTP 202 means request was accepted. Check Azure portal for delivery status.'
        });

        return {
          success: true,
          messageId: result.messageId
        };
      } else {
        console.error('TCC_DEBUG: Azure SMS request failed:', {
          messageId: result.messageId,
          httpStatusCode: result.httpStatusCode,
          errorMessage: result.errorMessage
        });

        return {
          success: false,
          error: result.errorMessage || 'Failed to send SMS'
        };
      }
    } catch (error: any) {
      console.error('TCC_DEBUG: Azure SMS sending error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send SMS'
      };
    }
  }

  /**
   * Get delivery status (Azure Communication Services doesn't provide detailed delivery status)
   * Returns null as Azure doesn't have a delivery status API like Twilio
   */
  async getDeliveryStatus(messageId: string): Promise<DeliveryStatus | null> {
    // Azure Communication Services doesn't provide delivery status tracking
    // This method is kept for interface compatibility
    console.log('TCC_DEBUG: Azure Communication Services does not support delivery status tracking');
    return null;
  }

  /**
   * Test connection to Azure Communication Services
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.isEnabled()) {
      return {
        success: false,
        error: 'Azure SMS is disabled via feature flag'
      };
    }

    if (!this.isConfigured || !this.client) {
      return {
        success: false,
        error: 'Azure Communication Services not configured'
      };
    }

    try {
      // Test by attempting to initialize and check client exists
      // Azure doesn't have a simple "ping" endpoint, so we verify client is initialized
      if (this.client && this.config) {
        return {
          success: true
        };
      }
      
      return {
        success: false,
        error: 'Client not properly initialized'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Connection test failed'
      };
    }
  }

  /**
   * Format phone number to E.164 format (required by Azure)
   */
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

  /**
   * Check if service is configured
   */
  isServiceConfigured(): boolean {
    return this.isConfigured && this.isEnabled();
  }

  /**
   * Get configuration status
   */
  getConfigurationStatus(): { configured: boolean; missing: string[]; enabled: boolean } {
    const missing: string[] = [];
    
    if (!process.env.AZURE_COMMUNICATION_CONNECTION_STRING) {
      missing.push('AZURE_COMMUNICATION_CONNECTION_STRING');
    }
    if (!process.env.AZURE_COMMUNICATION_PHONE_NUMBER) {
      missing.push('AZURE_COMMUNICATION_PHONE_NUMBER');
    }
    
    const enabled = this.isEnabled();
    
    return {
      configured: missing.length === 0 && this.isConfigured,
      missing,
      enabled
    };
  }
}

export const azureSMSService = new AzureSMSService();
export default azureSMSService;

