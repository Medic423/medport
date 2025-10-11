"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mail_1 = __importDefault(require("@sendgrid/mail"));
class SendGridEmailService {
    constructor() {
        this.isConfigured = false;
        this.loadConfig();
    }
    loadConfig() {
        const apiKey = process.env.SENDGRID_API_KEY;
        const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@tcc-system.com';
        if (apiKey) {
            mail_1.default.setApiKey(apiKey);
            this.isConfigured = true;
            console.log('TCC_DEBUG: SendGrid email service initialized successfully');
        }
        else {
            console.log('TCC_DEBUG: SendGrid API key not configured');
            this.isConfigured = false;
        }
    }
    isServiceConfigured() {
        return this.isConfigured;
    }
    async sendEmail(emailData) {
        if (!this.isConfigured) {
            return { success: false, error: 'SendGrid service not configured' };
        }
        try {
            const content = [];
            if (emailData.text) {
                content.push({ type: 'text/plain', value: emailData.text });
            }
            if (emailData.html) {
                content.push({ type: 'text/html', value: emailData.html });
            }
            const msg = {
                to: emailData.to,
                from: emailData.from || process.env.SENDGRID_FROM_EMAIL || 'noreply@tcc-system.com',
                subject: emailData.subject,
                content: content
            };
            const response = await mail_1.default.send(msg);
            console.log('TCC_DEBUG: SendGrid email sent successfully:', {
                messageId: response[0].headers['x-message-id'],
                status: response[0].statusCode
            });
            return {
                success: true,
                messageId: response[0].headers['x-message-id']
            };
        }
        catch (error) {
            console.error('TCC_DEBUG: SendGrid email sending failed:', error);
            return {
                success: false,
                error: error.message || 'Unknown SendGrid error'
            };
        }
    }
    async testConnection() {
        if (!this.isConfigured) {
            return { success: false, error: 'SendGrid service not configured' };
        }
        try {
            // Send a test email to verify connection
            const testEmail = {
                to: process.env.SENDGRID_FROM_EMAIL || 'noreply@tcc-system.com',
                from: process.env.SENDGRID_FROM_EMAIL || 'noreply@tcc-system.com',
                subject: 'TCC System - Email Test',
                text: 'This is a test email from the TCC notification system.',
                html: '<p>This is a test email from the TCC notification system.</p>'
            };
            await this.sendEmail(testEmail);
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
}
const sendGridEmailService = new SendGridEmailService();
exports.default = sendGridEmailService;
//# sourceMappingURL=sendGridEmailService.js.map