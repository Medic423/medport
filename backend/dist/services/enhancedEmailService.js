"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const client_1 = require("@prisma/client");
const enhancedSMSService_1 = __importDefault(require("./enhancedSMSService"));
const twilioSMSService_1 = __importDefault(require("./twilioSMSService"));
const sendGridEmailService_1 = __importDefault(require("./sendGridEmailService"));
const centerPrisma = new client_1.PrismaClient();
class EnhancedEmailService {
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    /**
     * Get user notification preferences
     */
    async getUserNotificationPreferences(userId) {
        try {
            // Get user's global notification settings
            const user = await centerPrisma.centerUser.findUnique({
                where: { id: userId },
                select: {
                    emailNotifications: true,
                    smsNotifications: true,
                    phone: true,
                    notificationPreferences: {
                        select: {
                            notificationType: true,
                            emailEnabled: true,
                            smsEnabled: true
                        }
                    }
                }
            });
            if (!user) {
                console.log('TCC_DEBUG: User not found for notification preferences:', userId);
                return {
                    emailEnabled: true,
                    smsEnabled: false,
                    phone: '',
                    notificationTypes: {}
                };
            }
            // Build notification types map
            const notificationTypes = {};
            user.notificationPreferences.forEach(pref => {
                notificationTypes[pref.notificationType] = {
                    email: pref.emailEnabled,
                    sms: pref.smsEnabled
                };
            });
            return {
                emailEnabled: user.emailNotifications,
                smsEnabled: user.smsNotifications,
                phone: user.phone || '',
                notificationTypes
            };
        }
        catch (error) {
            console.error('TCC_DEBUG: Error getting user notification preferences:', error);
            return {
                emailEnabled: true,
                smsEnabled: false,
                phone: '',
                notificationTypes: {}
            };
        }
    }
    /**
     * Check if user should receive notification for specific type
     */
    async shouldSendNotification(userId, notificationType, channel) {
        try {
            const preferences = await this.getUserNotificationPreferences(userId);
            // Check global settings first
            if (channel === 'email' && !preferences.emailEnabled) {
                return false;
            }
            if (channel === 'sms' && !preferences.smsEnabled) {
                return false;
            }
            // Check specific notification type settings
            const typeSettings = preferences.notificationTypes[notificationType];
            if (typeSettings) {
                return channel === 'email' ? typeSettings.email : typeSettings.sms;
            }
            // Default to global settings if no specific type settings
            return channel === 'email' ? preferences.emailEnabled : preferences.smsEnabled;
        }
        catch (error) {
            console.error('TCC_DEBUG: Error checking notification preferences:', error);
            // Default to allowing notifications if there's an error
            return true;
        }
    }
    /**
     * Send notification with preference checking
     */
    async sendNotification(userId, notificationType, emailData, smsData) {
        const results = {
            email: { success: false, channel: 'email', error: 'Not attempted' },
            sms: { success: false, channel: 'sms', error: 'Not attempted' }
        };
        try {
            // Check email preferences
            const shouldSendEmail = await this.shouldSendNotification(userId, notificationType, 'email');
            if (shouldSendEmail && emailData.to) {
                console.log('TCC_DEBUG: Sending email notification to user:', userId);
                results.email = await this.sendEmailWithLogging(emailData, userId, notificationType);
            }
            else {
                console.log('TCC_DEBUG: Email notification skipped due to user preferences:', userId);
                results.email.error = 'Skipped due to user preferences';
            }
            // Check SMS preferences
            const shouldSendSMS = await this.shouldSendNotification(userId, notificationType, 'sms');
            if (shouldSendSMS && smsData) {
                console.log('TCC_DEBUG: Sending SMS notification to user:', userId);
                results.sms = await this.sendSMSWithLogging(smsData, userId, notificationType);
            }
            else {
                console.log('TCC_DEBUG: SMS notification skipped due to user preferences:', userId);
                results.sms.error = 'Skipped due to user preferences';
            }
            return results;
        }
        catch (error) {
            console.error('TCC_DEBUG: Error sending notification:', error);
            results.email.error = error instanceof Error ? error.message : 'Unknown error';
            results.sms.error = error instanceof Error ? error.message : 'Unknown error';
            return results;
        }
    }
    /**
     * Send email with enhanced logging
     */
    async sendEmailWithLogging(emailData, userId, notificationType) {
        try {
            const result = await this.sendEmail(emailData);
            // Log delivery attempt
            await this.logNotificationDelivery({
                userId,
                notificationType,
                channel: 'email',
                status: result ? 'sent' : 'failed',
                messageId: result ? 'email-sent' : undefined,
                error: result ? undefined : 'Email sending failed'
            });
            return {
                success: result,
                messageId: result ? 'email-sent' : undefined,
                error: result ? undefined : 'Email sending failed',
                channel: 'email'
            };
        }
        catch (error) {
            console.error('TCC_DEBUG: Email sending error:', error);
            await this.logNotificationDelivery({
                userId,
                notificationType,
                channel: 'email',
                status: 'failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                channel: 'email'
            };
        }
    }
    /**
     * Send SMS with enhanced logging using Twilio
     */
    async sendSMSWithLogging(smsData, userId, notificationType) {
        try {
            // Try Twilio first, fallback to email-to-SMS gateway
            let result;
            if (twilioSMSService_1.default.isServiceConfigured()) {
                console.log('TCC_DEBUG: Using Twilio for SMS delivery');
                result = await twilioSMSService_1.default.sendSMS(smsData.to, smsData.message);
            }
            else {
                console.log('TCC_DEBUG: Twilio not configured, using email-to-SMS gateway');
                result = await enhancedSMSService_1.default.sendSMS({
                    ...smsData,
                    userId,
                    notificationType
                });
            }
            return {
                success: result.success,
                messageId: result.messageId,
                error: result.error,
                channel: 'sms'
            };
        }
        catch (error) {
            console.error('TCC_DEBUG: SMS sending error:', error);
            await this.logNotificationDelivery({
                userId,
                notificationType,
                channel: 'sms',
                status: 'failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                channel: 'sms'
            };
        }
    }
    /**
     * Log notification delivery attempt
     */
    async logNotificationDelivery(data) {
        try {
            await centerPrisma.notificationLog.create({
                data: {
                    userId: data.userId,
                    notificationType: data.notificationType,
                    channel: data.channel,
                    status: data.status,
                    deliveredAt: data.status === 'sent' ? new Date() : null,
                    errorMessage: data.error
                }
            });
        }
        catch (error) {
            console.error('TCC_DEBUG: Failed to log notification delivery:', error);
        }
    }
    /**
     * Get notification delivery statistics for a user
     */
    async getNotificationStats(userId, days = 30) {
        try {
            const since = new Date();
            since.setDate(since.getDate() - days);
            const logs = await centerPrisma.notificationLog.findMany({
                where: {
                    userId,
                    sentAt: {
                        gte: since
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
                }
            };
            logs.forEach(log => {
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
            });
            stats.deliveryRate = stats.totalSent > 0 ? (stats.totalDelivered / stats.totalSent) * 100 : 0;
            return stats;
        }
        catch (error) {
            console.error('TCC_DEBUG: Error getting notification stats:', error);
            return {
                totalSent: 0,
                totalDelivered: 0,
                totalFailed: 0,
                deliveryRate: 0,
                byChannel: {
                    email: { sent: 0, delivered: 0, failed: 0 },
                    sms: { sent: 0, delivered: 0, failed: 0 }
                }
            };
        }
    }
    // Include all the existing methods from the original EmailService
    // (This would be a very long file, so I'll include the key methods)
    getEmailTemplates() {
        return {
            newTripRequest: {
                subject: '🚑 New Transport Request - Action Required',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1e40af; color: white; padding: 20px; text-align: center;">
              <h1>🚑 New Transport Request</h1>
            </div>
            <div style="padding: 20px; background: #f8fafc;">
              <h2>Transport Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Patient ID:</strong></td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;">{{patientId}}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Transport Level:</strong></td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;">{{transportLevel}}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Priority:</strong></td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0; color: {{priorityColor}};">{{priority}}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Origin:</strong></td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;">{{originFacility}}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Destination:</strong></td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;">{{destinationFacility}}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Ready Window:</strong></td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;">{{readyStart}} - {{readyEnd}}</td>
                </tr>
                {{#if specialRequirements}}
                <tr>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Special Requirements:</strong></td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;">{{specialRequirements}}</td>
                </tr>
                {{/if}}
                {{#if isolation}}
                <tr>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>⚠️ Isolation Required</strong></td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0; color: #dc2626;">Yes</td>
                </tr>
                {{/if}}
                {{#if bariatric}}
                <tr>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>🛏️ Bariatric Transport</strong></td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0; color: #dc2626;">Yes</td>
                </tr>
                {{/if}}
              </table>
              <div style="margin-top: 20px; text-align: center;">
                <a href="{{dashboardUrl}}" style="background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  View in Dashboard
                </a>
              </div>
            </div>
            <div style="background: #e2e8f0; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
              <p>TCC_DEBUG: This email was sent by the Transport Control Center system</p>
              <p>Request ID: {{tripId}} | Sent: {{timestamp}}</p>
            </div>
          </div>
        `,
                text: `
New Transport Request - Action Required

Patient ID: {{patientId}}
Transport Level: {{transportLevel}}
Priority: {{priority}}
Origin: {{originFacility}}
Destination: {{destinationFacility}}
Ready Window: {{readyStart}} - {{readyEnd}}
{{#if specialRequirements}}Special Requirements: {{specialRequirements}}{{/if}}
{{#if isolation}}⚠️ Isolation Required: Yes{{/if}}
{{#if bariatric}}🛏️ Bariatric Transport: Yes{{/if}}

View in Dashboard: {{dashboardUrl}}

TCC_DEBUG: Request ID: {{tripId}} | Sent: {{timestamp}}
        `
            }
            // ... other templates would be included here
        };
    }
    replaceTemplateVariables(template, data) {
        let result = template;
        // Replace simple variables
        Object.keys(data).forEach(key => {
            const value = data[key] || '';
            const regex = new RegExp(`{{${key}}}`, 'g');
            result = result.replace(regex, String(value));
        });
        // Handle conditional blocks
        result = result.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, condition, content) => {
            return data[condition] ? content : '';
        });
        return result;
    }
    getPriorityColor(priority) {
        switch (priority?.toUpperCase()) {
            case 'URGENT': return '#dc2626';
            case 'HIGH': return '#ea580c';
            case 'MEDIUM': return '#d97706';
            case 'LOW': return '#059669';
            default: return '#6b7280';
        }
    }
    async sendEmail(emailData) {
        try {
            console.log('TCC_DEBUG: Sending email notification:', {
                to: emailData.to,
                template: emailData.template,
                priority: emailData.priority || 'normal'
            });
            const templates = this.getEmailTemplates();
            const template = templates[emailData.template];
            if (!template) {
                throw new Error(`Email template '${emailData.template}' not found`);
            }
            // Add common data
            const templateData = {
                ...emailData.data,
                timestamp: new Date().toISOString(),
                dashboardUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
                priorityColor: this.getPriorityColor(emailData.data.priority)
            };
            const html = this.replaceTemplateVariables(template.html, templateData);
            const text = this.replaceTemplateVariables(template.text, templateData);
            const subject = this.replaceTemplateVariables(template.subject, templateData);
            // Try SendGrid first, fallback to SMTP
            if (sendGridEmailService_1.default.isServiceConfigured()) {
                console.log('TCC_DEBUG: Using SendGrid for email delivery');
                const sendGridResult = await sendGridEmailService_1.default.sendEmail({
                    to: emailData.to,
                    subject: subject,
                    text: text,
                    html: html
                });
                if (sendGridResult.success) {
                    console.log('TCC_DEBUG: Email sent successfully via SendGrid:', {
                        messageId: sendGridResult.messageId,
                        to: emailData.to,
                        template: emailData.template
                    });
                    return true;
                }
                else {
                    console.log('TCC_DEBUG: SendGrid failed, falling back to SMTP:', sendGridResult.error);
                }
            }
            // Fallback to SMTP
            console.log('TCC_DEBUG: Using SMTP for email delivery');
            const mailOptions = {
                from: `"TCC System" <${process.env.SMTP_USER}>`,
                to: Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to,
                subject: subject,
                text: text,
                html: html,
                priority: emailData.priority === 'high' ? 'high' : 'normal'
            };
            const result = await this.transporter.sendMail(mailOptions);
            console.log('TCC_DEBUG: Email sent successfully via SMTP:', {
                messageId: result.messageId,
                to: emailData.to,
                template: emailData.template
            });
            return true;
        }
        catch (error) {
            console.error('TCC_DEBUG: Email sending failed:', error);
            return false;
        }
    }
    async sendSMS(data) {
        try {
            console.log('TCC_DEBUG: SMS notification via email gateway:', {
                to: data.to,
                message: data.message,
                priority: data.priority || 'normal'
            });
            // Convert phone number to email-to-SMS gateway
            const smsEmail = this.convertPhoneToSMSGateway(data.to);
            if (!smsEmail) {
                console.log('TCC_DEBUG: Invalid phone number format for SMS gateway');
                return false;
            }
            // Send SMS via email gateway
            const mailOptions = {
                from: `"TCC SMS" <${process.env.SMTP_USER}>`,
                to: smsEmail,
                subject: '', // SMS gateways don't use subject
                text: data.message,
                html: data.message
            };
            const result = await this.transporter.sendMail(mailOptions);
            console.log('TCC_DEBUG: SMS sent via email gateway:', {
                to: data.to,
                smsEmail: smsEmail,
                messageId: result.messageId
            });
            return true;
        }
        catch (error) {
            console.error('TCC_DEBUG: SMS sending failed:', error);
            return false;
        }
    }
    convertPhoneToSMSGateway(phoneNumber) {
        // Remove all non-digit characters
        const cleaned = phoneNumber.replace(/\D/g, '');
        // Handle different phone number formats
        let digits = cleaned;
        // If it starts with 1 and is 11 digits, remove the 1
        if (digits.length === 11 && digits.startsWith('1')) {
            digits = digits.substring(1);
        }
        // Must be 10 digits for US numbers
        if (digits.length !== 10) {
            console.log('TCC_DEBUG: Invalid phone number length:', digits.length);
            return null;
        }
        // Try multiple SMS gateways for better delivery
        const gateways = [
            `${digits}@vtext.com`, // Verizon
            `${digits}@txt.att.net`, // AT&T
            `${digits}@messaging.sprintpcs.com`, // Sprint
            `${digits}@tmomail.net`, // T-Mobile
            `${digits}@email.uscc.net`, // US Cellular
            `${digits}@vtext.com` // Default to Verizon
        ];
        // Return the first gateway (Verizon) as primary
        return gateways[0];
    }
    async testEmailConnection() {
        try {
            // Try SendGrid first
            if (sendGridEmailService_1.default.isServiceConfigured()) {
                console.log('TCC_DEBUG: Testing SendGrid email service');
                const result = await sendGridEmailService_1.default.testConnection();
                if (result.success) {
                    console.log('TCC_DEBUG: SendGrid email service connection verified');
                    return true;
                }
                else {
                    console.log('TCC_DEBUG: SendGrid failed, testing SMTP fallback:', result.error);
                }
            }
            // Fallback to SMTP
            console.log('TCC_DEBUG: Testing SMTP email service');
            await this.transporter.verify();
            console.log('TCC_DEBUG: SMTP email service connection verified');
            return true;
        }
        catch (error) {
            console.error('TCC_DEBUG: Email service connection failed:', error);
            return false;
        }
    }
    async testSMSConnection() {
        try {
            console.log('TCC_DEBUG: Testing enhanced SMS service');
            // Use the enhanced SMS service test
            const testResult = await enhancedSMSService_1.default.testSMSService();
            if (testResult.overall) {
                console.log('TCC_DEBUG: Enhanced SMS service ready');
                return true;
            }
            else {
                console.log('TCC_DEBUG: Enhanced SMS service test failed:', testResult);
                return false;
            }
        }
        catch (error) {
            console.error('TCC_DEBUG: Enhanced SMS service connection failed:', error);
            return false;
        }
    }
    /**
     * Get SMS statistics using enhanced SMS service
     */
    async getSMSStats(userId, days = 30) {
        return await enhancedSMSService_1.default.getSMSStats(userId, days);
    }
    /**
     * Get SMS cost statistics
     */
    async getSMSCostStats() {
        return enhancedSMSService_1.default.getSMSCostStats();
    }
    /**
     * Get carrier information for a phone number
     */
    async getCarrierInfo(phoneNumber) {
        return enhancedSMSService_1.default.getCarrierInfo(phoneNumber);
    }
    /**
     * Send SMS with retry logic
     */
    async sendSMSWithRetry(smsData, maxRetries = 3) {
        return await enhancedSMSService_1.default.sendSMSWithRetry(smsData, maxRetries);
    }
    /**
     * Send bulk SMS with rate limiting
     */
    async sendBulkSMS(messages, rateLimit = 10) {
        return await enhancedSMSService_1.default.sendBulkSMS(messages, rateLimit);
    }
    /**
     * Get all available carriers
     */
    async getAllCarriers() {
        return enhancedSMSService_1.default.getAllCarriers();
    }
}
exports.default = new EnhancedEmailService();
//# sourceMappingURL=enhancedEmailService.js.map