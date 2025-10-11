interface NotificationData {
    userId: string;
    notificationType: string;
    emailData?: {
        to: string | string[];
        template: string;
        data: Record<string, any>;
        priority?: 'high' | 'normal' | 'low';
    };
    smsData?: {
        to: string;
        message: string;
        priority?: 'high' | 'normal' | 'low';
    };
}
interface NotificationResult {
    success: boolean;
    email: {
        success: boolean;
        error?: string;
    };
    sms: {
        success: boolean;
        error?: string;
    };
}
declare class NotificationManager {
    /**
     * Send notification to a single user with preference checking
     */
    sendNotification(data: NotificationData): Promise<NotificationResult>;
    /**
     * Send notification to multiple users
     */
    sendBulkNotification(userIds: string[], notificationType: string, emailData?: NotificationData['emailData'], smsData?: NotificationData['smsData']): Promise<{
        totalSent: number;
        successful: number;
        failed: number;
        results: {
            userId: string;
            result: NotificationResult;
        }[];
    }>;
    /**
     * Send trip assignment notification to EMS agencies
     */
    sendTripAssignmentNotification(tripData: any, agencyIds: string[]): Promise<NotificationResult>;
    /**
     * Send trip status update notification to hospital
     */
    sendTripStatusUpdateNotification(tripData: any, hospitalUserId: string): Promise<NotificationResult>;
    /**
     * Get notification statistics for a user
     */
    getUserNotificationStats(userId: string, days?: number): Promise<{
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
    /**
     * Get notification statistics for all users (admin)
     */
    getAllNotificationStats(days?: number): Promise<{
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
        byUser: {
            [userId: string]: {
                sent: number;
                delivered: number;
                failed: number;
            };
        };
        byType: {
            [type: string]: {
                sent: number;
                delivered: number;
                failed: number;
            };
        };
    }>;
    /**
     * Test notification system
     */
    testNotificationSystem(userId: string): Promise<{
        email: boolean;
        sms: boolean;
        preferences: any;
    }>;
}
declare const _default: NotificationManager;
export default _default;
//# sourceMappingURL=notificationManager.d.ts.map