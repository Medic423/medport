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
}
declare class EmailService {
    private transporter;
    constructor();
    private getEmailTemplates;
    private replaceTemplateVariables;
    private getPriorityColor;
    private getStatusColor;
    sendEmail(emailData: EmailData): Promise<boolean>;
    private logEmailDelivery;
    sendNewTripNotification(tripData: any, agencyEmails: string[]): Promise<boolean>;
    sendTripAcceptedNotification(tripData: any, hospitalEmail: string): Promise<boolean>;
    sendTripStatusUpdate(tripData: any, hospitalEmail: string, notes?: string): Promise<boolean>;
    testEmailConnection(): Promise<boolean>;
    /**
     * Send SMS notification using email-to-SMS gateway
     */
    sendSMS(data: SMSData): Promise<boolean>;
    /**
     * Convert phone number to email-to-SMS gateway address
     */
    private convertPhoneToSMSGateway;
    /**
     * Get all SMS gateways for a phone number (for redundancy)
     */
    private getAllSMSGateways;
    /**
     * Send SMS for new trip request
     */
    sendNewTripSMS(tripData: any, agencyPhones: string[]): Promise<boolean>;
    /**
     * Send SMS for trip status update
     */
    sendTripStatusSMS(tripData: any, hospitalPhone: string): Promise<boolean>;
    private logSMSDelivery;
    testSMSConnection(): Promise<boolean>;
}
declare const _default: EmailService;
export default _default;
//# sourceMappingURL=emailService.d.ts.map