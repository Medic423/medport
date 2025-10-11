interface SMSData {
    to: string;
    message: string;
    priority?: 'high' | 'normal' | 'low';
}
interface EmailData {
    to: string | string[];
    template: string;
    data: Record<string, any>;
    priority?: 'high' | 'normal' | 'low';
    userId?: string;
    notificationType?: string;
}
interface NotificationPreferences {
    emailEnabled: boolean;
    smsEnabled: boolean;
    phone: string;
    notificationTypes: {
        [key: string]: {
            email: boolean;
            sms: boolean;
        };
    };
}
interface DeliveryResult {
    success: boolean;
    messageId?: string;
    error?: string;
    channel: 'email' | 'sms';
}
declare class EnhancedEmailService {
    private transporter;
    constructor();
    /**
     * Get user notification preferences
     */
    getUserNotificationPreferences(userId: string): Promise<NotificationPreferences>;
    /**
     * Check if user should receive notification for specific type
     */
    shouldSendNotification(userId: string, notificationType: string, channel: 'email' | 'sms'): Promise<boolean>;
    /**
     * Send notification with preference checking
     */
    sendNotification(userId: string, notificationType: string, emailData: EmailData, smsData?: SMSData): Promise<{
        email: DeliveryResult;
        sms: DeliveryResult;
    }>;
    /**
     * Send email with enhanced logging
     */
    private sendEmailWithLogging;
    /**
     * Send SMS with enhanced logging using Twilio
     */
    private sendSMSWithLogging;
    /**
     * Log notification delivery attempt
     */
    private logNotificationDelivery;
    /**
     * Get notification delivery statistics for a user
     */
    getNotificationStats(userId: string, days?: number): Promise<{
        totalSent: number;
        totalDelivered: number;
        totalFailed: number;
        deliveryRate: number;
        byChannel: {
            email: {
                sent: number;
                delivered: number;
                failed: number;
            };
            sms: {
                sent: number;
                delivered: number;
                failed: number;
            };
        };
    }>;
    private getEmailTemplates;
    private replaceTemplateVariables;
    private getPriorityColor;
    sendEmail(emailData: EmailData): Promise<boolean>;
    sendSMS(data: SMSData): Promise<boolean>;
    private convertPhoneToSMSGateway;
    testEmailConnection(): Promise<boolean>;
    testSMSConnection(): Promise<boolean>;
    /**
     * Get SMS statistics using enhanced SMS service
     */
    getSMSStats(userId?: string, days?: number): Promise<{
        totalSent: number;
        totalDelivered: number;
        totalFailed: number;
        deliveryRate: number;
        averageDeliveryTime: number;
        totalCost: number;
        byCarrier: {
            [carrier: string]: {
                sent: number;
                delivered: number;
                failed: number;
                cost: number;
            };
        };
    }>;
    /**
     * Get SMS cost statistics
     */
    getSMSCostStats(): Promise<any>;
    /**
     * Get carrier information for a phone number
     */
    getCarrierInfo(phoneNumber: string): Promise<any>;
    /**
     * Send SMS with retry logic
     */
    sendSMSWithRetry(smsData: SMSData, maxRetries?: number): Promise<any>;
    /**
     * Send bulk SMS with rate limiting
     */
    sendBulkSMS(messages: SMSData[], rateLimit?: number): Promise<any>;
    /**
     * Get all available carriers
     */
    getAllCarriers(): Promise<any>;
}
declare const _default: EnhancedEmailService;
export default _default;
//# sourceMappingURL=enhancedEmailService.d.ts.map