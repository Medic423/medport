"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const enhancedEmailService_1 = __importDefault(require("./enhancedEmailService"));
const centerPrisma = new client_1.PrismaClient();
class NotificationManager {
    /**
     * Send notification to a single user with preference checking
     */
    async sendNotification(data) {
        try {
            console.log('TCC_DEBUG: Sending notification to user:', data.userId, 'Type:', data.notificationType);
            // Get user's phone number for SMS if not provided
            if (data.smsData && !data.smsData.to) {
                const user = await centerPrisma.centerUser.findUnique({
                    where: { id: data.userId },
                    select: { phone: true }
                });
                if (user?.phone) {
                    data.smsData.to = user.phone;
                }
                else {
                    console.log('TCC_DEBUG: No phone number found for user:', data.userId);
                    delete data.smsData;
                }
            }
            // Send notification using enhanced email service
            const results = await enhancedEmailService_1.default.sendNotification(data.userId, data.notificationType, data.emailData || { to: '', template: '', data: {} }, data.smsData);
            return {
                success: results.email.success || results.sms.success,
                email: {
                    success: results.email.success,
                    error: results.email.error
                },
                sms: {
                    success: results.sms.success,
                    error: results.sms.error
                }
            };
        }
        catch (error) {
            console.error('TCC_DEBUG: Error in notification manager:', error);
            return {
                success: false,
                email: {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                },
                sms: {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                }
            };
        }
    }
    /**
     * Send notification to multiple users
     */
    async sendBulkNotification(userIds, notificationType, emailData, smsData) {
        console.log('TCC_DEBUG: Sending bulk notification to', userIds.length, 'users');
        const results = [];
        let successful = 0;
        let failed = 0;
        for (const userId of userIds) {
            try {
                const result = await this.sendNotification({
                    userId,
                    notificationType,
                    emailData,
                    smsData
                });
                results.push({ userId, result });
                if (result.success) {
                    successful++;
                }
                else {
                    failed++;
                }
            }
            catch (error) {
                console.error('TCC_DEBUG: Error sending notification to user:', userId, error);
                results.push({
                    userId,
                    result: {
                        success: false,
                        email: { success: false, error: 'Unknown error' },
                        sms: { success: false, error: 'Unknown error' }
                    }
                });
                failed++;
            }
        }
        return {
            totalSent: userIds.length,
            successful,
            failed,
            results
        };
    }
    /**
     * Send trip assignment notification to EMS agencies
     */
    async sendTripAssignmentNotification(tripData, agencyIds) {
        try {
            console.log('TCC_DEBUG: Sending trip assignment notification to agencies:', agencyIds);
            const emailData = {
                to: [], // Will be populated from agency emails
                template: 'newTripRequest',
                data: {
                    tripId: tripData.id,
                    patientId: tripData.patientId,
                    transportLevel: tripData.transportLevel,
                    priority: tripData.priority,
                    originFacility: tripData.originFacility?.name || 'Unknown',
                    destinationFacility: tripData.destinationFacility?.name || 'Unknown',
                    readyStart: new Date(tripData.readyStart).toLocaleString(),
                    readyEnd: new Date(tripData.readyEnd).toLocaleString(),
                    specialRequirements: tripData.specialRequirements,
                    isolation: tripData.isolation,
                    bariatric: tripData.bariatric
                },
                priority: (tripData.priority === 'URGENT' ? 'high' : 'normal')
            };
            const smsData = {
                to: '', // Will be populated from agency phones
                message: `🚑 NEW TRANSPORT REQUEST\n` +
                    `Patient: ${tripData.patientId}\n` +
                    `Level: ${tripData.transportLevel}\n` +
                    `Priority: ${tripData.priority}\n` +
                    `From: ${tripData.originFacility?.name || 'Unknown'}\n` +
                    `To: ${tripData.destinationFacility?.name || 'Unknown'}\n` +
                    `Ready: ${new Date(tripData.readyStart).toLocaleString()}\n` +
                    `View: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`,
                priority: (tripData.priority === 'URGENT' ? 'high' : 'normal')
            };
            // Get agency contact information
            const agencies = await centerPrisma.eMSAgency.findMany({
                where: {
                    id: { in: agencyIds },
                    isActive: true
                },
                select: {
                    id: true,
                    email: true,
                    phone: true
                }
            });
            const agencyEmails = agencies
                .filter(agency => agency.email)
                .map(agency => agency.email);
            const agencyPhones = agencies
                .filter(agency => agency.phone)
                .map(agency => agency.phone);
            emailData.to = agencyEmails;
            smsData.to = agencyPhones[0] || ''; // Use first phone for SMS
            // Send to all agencies
            const results = await this.sendBulkNotification(agencyIds, 'trip_assignment', emailData, smsData);
            return {
                success: results.successful > 0,
                email: {
                    success: results.successful > 0,
                    error: results.failed > 0 ? `${results.failed} agencies failed` : undefined
                },
                sms: {
                    success: results.successful > 0,
                    error: results.failed > 0 ? `${results.failed} agencies failed` : undefined
                }
            };
        }
        catch (error) {
            console.error('TCC_DEBUG: Error sending trip assignment notification:', error);
            return {
                success: false,
                email: {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                },
                sms: {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                }
            };
        }
    }
    /**
     * Send trip status update notification to hospital
     */
    async sendTripStatusUpdateNotification(tripData, hospitalUserId) {
        try {
            console.log('TCC_DEBUG: Sending trip status update notification to hospital:', hospitalUserId);
            const emailData = {
                to: '', // Will be populated from hospital email
                template: 'tripStatusUpdate',
                data: {
                    tripId: tripData.id,
                    patientId: tripData.patientId,
                    status: tripData.status,
                    updatedAt: new Date(tripData.updatedAt).toLocaleString(),
                    notes: tripData.notes
                }
            };
            const smsData = {
                to: '', // Will be populated from hospital phone
                message: `📋 TRANSPORT UPDATE\n` +
                    `Patient: ${tripData.patientId}\n` +
                    `Status: ${tripData.status}\n` +
                    `Updated: ${new Date(tripData.updatedAt).toLocaleString()}\n` +
                    `View: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`,
                priority: 'normal'
            };
            // Get hospital contact information
            const hospital = await centerPrisma.centerUser.findUnique({
                where: { id: hospitalUserId },
                select: {
                    email: true,
                    phone: true
                }
            });
            if (hospital?.email) {
                emailData.to = hospital.email;
            }
            if (hospital?.phone) {
                smsData.to = hospital.phone;
            }
            return await this.sendNotification({
                userId: hospitalUserId,
                notificationType: 'trip_status_update',
                emailData: emailData.to ? emailData : undefined,
                smsData: smsData.to ? smsData : undefined
            });
        }
        catch (error) {
            console.error('TCC_DEBUG: Error sending trip status update notification:', error);
            return {
                success: false,
                email: {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                },
                sms: {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                }
            };
        }
    }
    /**
     * Get notification statistics for a user
     */
    async getUserNotificationStats(userId, days = 30) {
        return await enhancedEmailService_1.default.getNotificationStats(userId, days);
    }
    /**
     * Get notification statistics for all users (admin)
     */
    async getAllNotificationStats(days = 30) {
        try {
            const since = new Date();
            since.setDate(since.getDate() - days);
            const logs = await centerPrisma.notificationLog.findMany({
                where: {
                    sentAt: {
                        gte: since
                    }
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true
                        }
                    }
                }
            });
            const stats = {
                totalSent: logs.length,
                totalDelivered: logs.filter(log => log.status === 'sent').length,
                totalFailed: logs.filter(log => log.status === 'failed').length,
                deliveryRate: 0,
                byChannel: {
                    email: { sent: 0, delivered: 0, failed: 0 },
                    sms: { sent: 0, delivered: 0, failed: 0 }
                },
                byUser: {},
                byType: {}
            };
            logs.forEach(log => {
                // Channel stats
                if (log.channel === 'email') {
                    stats.byChannel.email.sent++;
                    if (log.status === 'sent')
                        stats.byChannel.email.delivered++;
                    if (log.status === 'failed')
                        stats.byChannel.email.failed++;
                }
                else if (log.channel === 'sms') {
                    stats.byChannel.sms.sent++;
                    if (log.status === 'sent')
                        stats.byChannel.sms.delivered++;
                    if (log.status === 'failed')
                        stats.byChannel.sms.failed++;
                }
                // User stats
                if (!stats.byUser[log.userId]) {
                    stats.byUser[log.userId] = { sent: 0, delivered: 0, failed: 0 };
                }
                stats.byUser[log.userId].sent++;
                if (log.status === 'sent')
                    stats.byUser[log.userId].delivered++;
                if (log.status === 'failed')
                    stats.byUser[log.userId].failed++;
                // Type stats
                if (!stats.byType[log.notificationType]) {
                    stats.byType[log.notificationType] = { sent: 0, delivered: 0, failed: 0 };
                }
                stats.byType[log.notificationType].sent++;
                if (log.status === 'sent')
                    stats.byType[log.notificationType].delivered++;
                if (log.status === 'failed')
                    stats.byType[log.notificationType].failed++;
            });
            stats.deliveryRate = stats.totalSent > 0 ? (stats.totalDelivered / stats.totalSent) * 100 : 0;
            return stats;
        }
        catch (error) {
            console.error('TCC_DEBUG: Error getting all notification stats:', error);
            return {
                totalSent: 0,
                totalDelivered: 0,
                totalFailed: 0,
                deliveryRate: 0,
                byChannel: {
                    email: { sent: 0, delivered: 0, failed: 0 },
                    sms: { sent: 0, delivered: 0, failed: 0 }
                },
                byUser: {},
                byType: {}
            };
        }
    }
    /**
     * Test notification system
     */
    async testNotificationSystem(userId) {
        try {
            // Test email connection
            const emailTest = await enhancedEmailService_1.default.testEmailConnection();
            // Test SMS connection
            const smsTest = await enhancedEmailService_1.default.testSMSConnection();
            // Get user preferences
            const preferences = await enhancedEmailService_1.default.getUserNotificationPreferences(userId);
            return {
                email: emailTest,
                sms: smsTest,
                preferences
            };
        }
        catch (error) {
            console.error('TCC_DEBUG: Error testing notification system:', error);
            return {
                email: false,
                sms: false,
                preferences: null
            };
        }
    }
}
exports.default = new NotificationManager();
//# sourceMappingURL=notificationManager.js.map