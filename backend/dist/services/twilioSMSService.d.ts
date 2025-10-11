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
declare class TwilioSMSService {
    private client;
    private config;
    private isConfigured;
    constructor();
    private initializeTwilio;
    sendSMS(to: string, message: string): Promise<SMSResult>;
    getDeliveryStatus(messageId: string): Promise<DeliveryStatus | null>;
    testConnection(): Promise<{
        success: boolean;
        error?: string;
    }>;
    private formatPhoneNumber;
    isServiceConfigured(): boolean;
    getConfigurationStatus(): {
        configured: boolean;
        missing: string[];
    };
}
export declare const twilioSMSService: TwilioSMSService;
export default twilioSMSService;
//# sourceMappingURL=twilioSMSService.d.ts.map