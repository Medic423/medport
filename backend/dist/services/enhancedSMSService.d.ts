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
    reliability: number;
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
declare class EnhancedSMSService {
    private carriers;
    private costTracking;
    constructor();
    /**
     * Initialize carrier information and costs
     */
    private initializeCarriers;
    /**
     * Detect carrier from phone number
     */
    private detectCarrier;
    /**
     * Get all possible gateways for a phone number
     */
    private getAllGateways;
    /**
     * Validate phone number format
     */
    private validatePhoneNumber;
    /**
     * Truncate message to carrier limits
     */
    private truncateMessage;
    /**
     * Send SMS with enhanced features
     */
    sendSMS(data: SMSData): Promise<DeliveryResult>;
    /**
     * Send SMS with retry logic
     */
    sendSMSWithRetry(data: SMSData, maxRetries?: number): Promise<DeliveryResult>;
    /**
     * Send bulk SMS with rate limiting
     */
    sendBulkSMS(messages: SMSData[], rateLimit?: number): Promise<{
        successful: number;
        failed: number;
        results: DeliveryResult[];
    }>;
    /**
     * Track SMS costs
     */
    private trackCost;
    /**
     * Get SMS cost statistics
     */
    getSMSCostStats(): {
        totalCost: number;
        byCarrier: SMSCost[];
        messageCount: number;
    };
    /**
     * Get carrier information
     */
    getCarrierInfo(phoneNumber: string): CarrierInfo | null;
    /**
     * Get all available carriers
     */
    getAllCarriers(): CarrierInfo[];
    /**
     * Test SMS service
     */
    testSMSService(): Promise<{
        phoneValidation: boolean;
        carrierDetection: boolean;
        gatewayConversion: boolean;
        overall: boolean;
    }>;
    /**
     * Log SMS delivery
     */
    private logSMSDelivery;
    /**
     * Get SMS delivery statistics
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
}
declare const _default: EnhancedSMSService;
export default _default;
//# sourceMappingURL=enhancedSMSService.d.ts.map