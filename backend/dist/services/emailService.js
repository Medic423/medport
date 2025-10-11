"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const client_1 = require("@prisma/client");
const centerPrisma = new client_1.PrismaClient();
class EmailService {
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
            },
            tripAccepted: {
                subject: '✅ Transport Request Accepted',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #059669; color: white; padding: 20px; text-align: center;">
              <h1>✅ Transport Request Accepted</h1>
            </div>
            <div style="padding: 20px; background: #f0fdf4;">
              <p>Your transport request has been accepted by <strong>{{agencyName}}</strong>.</p>
              <h3>Transport Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Patient ID:</strong></td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;">{{patientId}}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Accepted by:</strong></td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;">{{agencyName}}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Unit Number:</strong></td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;">{{unitNumber}}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>ETA:</strong></td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;">{{eta}}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Contact:</strong></td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;">{{contactPhone}}</td>
                </tr>
              </table>
              <div style="margin-top: 20px; text-align: center;">
                <a href="{{dashboardUrl}}" style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
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
Transport Request Accepted

Your transport request has been accepted by {{agencyName}}.

Transport Details:
Patient ID: {{patientId}}
Accepted by: {{agencyName}}
Unit Number: {{unitNumber}}
ETA: {{eta}}
Contact: {{contactPhone}}

View in Dashboard: {{dashboardUrl}}

TCC_DEBUG: Request ID: {{tripId}} | Sent: {{timestamp}}
        `
            },
            tripStatusUpdate: {
                subject: '📋 Transport Status Update',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #7c3aed; color: white; padding: 20px; text-align: center;">
              <h1>📋 Transport Status Update</h1>
            </div>
            <div style="padding: 20px; background: #faf5ff;">
              <p>Your transport request status has been updated to <strong>{{status}}</strong>.</p>
              <h3>Transport Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Patient ID:</strong></td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;">{{patientId}}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Status:</strong></td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0; color: {{statusColor}};">{{status}}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Updated:</strong></td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;">{{updatedAt}}</td>
                </tr>
                {{#if notes}}
                <tr>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Notes:</strong></td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;">{{notes}}</td>
                </tr>
                {{/if}}
              </table>
              <div style="margin-top: 20px; text-align: center;">
                <a href="{{dashboardUrl}}" style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
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
Transport Status Update

Your transport request status has been updated to {{status}}.

Transport Details:
Patient ID: {{patientId}}
Status: {{status}}
Updated: {{updatedAt}}
{{#if notes}}Notes: {{notes}}{{/if}}

View in Dashboard: {{dashboardUrl}}

TCC_DEBUG: Request ID: {{tripId}} | Sent: {{timestamp}}
        `
            }
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
    getStatusColor(status) {
        switch (status?.toUpperCase()) {
            case 'PENDING': return '#d97706';
            case 'ACCEPTED': return '#059669';
            case 'IN_PROGRESS': return '#2563eb';
            case 'COMPLETED': return '#059669';
            case 'CANCELLED': return '#dc2626';
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
                priorityColor: this.getPriorityColor(emailData.data.priority),
                statusColor: this.getStatusColor(emailData.data.status)
            };
            const html = this.replaceTemplateVariables(template.html, templateData);
            const text = this.replaceTemplateVariables(template.text, templateData);
            const mailOptions = {
                from: `"TCC System" <${process.env.SMTP_USER}>`,
                to: Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to,
                subject: this.replaceTemplateVariables(template.subject, templateData),
                text: text,
                html: html,
                priority: emailData.priority === 'high' ? 'high' : 'normal'
            };
            const result = await this.transporter.sendMail(mailOptions);
            console.log('TCC_DEBUG: Email sent successfully:', {
                messageId: result.messageId,
                to: emailData.to,
                template: emailData.template
            });
            // Log email delivery
            await this.logEmailDelivery({
                to: Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to,
                subject: mailOptions.subject,
                template: emailData.template,
                messageId: result.messageId,
                status: 'sent',
                tripId: emailData.data.tripId
            });
            return true;
        }
        catch (error) {
            console.error('TCC_DEBUG: Email sending failed:', error);
            // Log email failure
            await this.logEmailDelivery({
                to: Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to,
                subject: emailData.template,
                template: emailData.template,
                messageId: null,
                status: 'failed',
                error: error instanceof Error ? error.message : 'Unknown error',
                tripId: emailData.data.tripId
            });
            return false;
        }
    }
    async logEmailDelivery(data) {
        try {
            await centerPrisma.systemAnalytics.create({
                data: {
                    metricName: 'email_delivery',
                    metricValue: {
                        to: data.to,
                        subject: data.subject,
                        template: data.template,
                        messageId: data.messageId,
                        status: data.status,
                        error: data.error,
                        tripId: data.tripId,
                        timestamp: new Date().toISOString()
                    }
                }
            });
        }
        catch (error) {
            console.error('TCC_DEBUG: Failed to log email delivery:', error);
        }
    }
    async sendNewTripNotification(tripData, agencyEmails) {
        if (!agencyEmails.length) {
            console.log('TCC_DEBUG: No agency emails provided for trip notification');
            return false;
        }
        return await this.sendEmail({
            to: agencyEmails,
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
            priority: tripData.priority === 'URGENT' ? 'high' : 'normal'
        });
    }
    async sendTripAcceptedNotification(tripData, hospitalEmail) {
        return await this.sendEmail({
            to: hospitalEmail,
            template: 'tripAccepted',
            data: {
                tripId: tripData.id,
                patientId: tripData.patientId,
                agencyName: tripData.assignedAgency?.name || 'Unknown Agency',
                unitNumber: tripData.assignedUnit?.unitNumber || 'TBD',
                eta: tripData.eta || 'TBD',
                contactPhone: tripData.assignedAgency?.phone || 'Contact TCC'
            }
        });
    }
    async sendTripStatusUpdate(tripData, hospitalEmail, notes) {
        return await this.sendEmail({
            to: hospitalEmail,
            template: 'tripStatusUpdate',
            data: {
                tripId: tripData.id,
                patientId: tripData.patientId,
                status: tripData.status,
                updatedAt: new Date(tripData.updatedAt).toLocaleString(),
                notes: notes
            }
        });
    }
    async testEmailConnection() {
        try {
            await this.transporter.verify();
            console.log('TCC_DEBUG: Email service connection verified');
            return true;
        }
        catch (error) {
            console.error('TCC_DEBUG: Email service connection failed:', error);
            return false;
        }
    }
    /**
     * Send SMS notification using email-to-SMS gateway
     */
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
            // Log SMS delivery
            await this.logSMSDelivery({
                to: data.to,
                message: data.message,
                status: 'sent',
                messageId: result.messageId,
                tripId: null
            });
            return true;
        }
        catch (error) {
            console.error('TCC_DEBUG: SMS sending failed:', error);
            // Log SMS failure
            await this.logSMSDelivery({
                to: data.to,
                message: data.message,
                status: 'failed',
                messageId: null,
                error: error instanceof Error ? error.message : 'Unknown error',
                tripId: null
            });
            return false;
        }
    }
    /**
     * Convert phone number to email-to-SMS gateway address
     */
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
        // In production, you might want to implement carrier detection
        return gateways[0];
    }
    /**
     * Get all SMS gateways for a phone number (for redundancy)
     */
    getAllSMSGateways(phoneNumber) {
        const cleaned = phoneNumber.replace(/\D/g, '');
        let digits = cleaned;
        if (digits.length === 11 && digits.startsWith('1')) {
            digits = digits.substring(1);
        }
        if (digits.length !== 10) {
            return [];
        }
        return [
            `${digits}@vtext.com`, // Verizon
            `${digits}@txt.att.net`, // AT&T
            `${digits}@messaging.sprintpcs.com`, // Sprint
            `${digits}@tmomail.net`, // T-Mobile
            `${digits}@email.uscc.net` // US Cellular
        ];
    }
    /**
     * Send SMS for new trip request
     */
    async sendNewTripSMS(tripData, agencyPhones) {
        if (!agencyPhones.length) {
            console.log('TCC_DEBUG: No agency phone numbers provided for SMS notification');
            return false;
        }
        const message = `🚑 NEW TRANSPORT REQUEST\n` +
            `Patient: ${tripData.patientId}\n` +
            `Level: ${tripData.transportLevel}\n` +
            `Priority: ${tripData.priority}\n` +
            `From: ${tripData.originFacility?.name || 'Unknown'}\n` +
            `To: ${tripData.destinationFacility?.name || 'Unknown'}\n` +
            `Ready: ${new Date(tripData.readyStart).toLocaleString()}\n` +
            `View: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`;
        let allSent = true;
        for (const phone of agencyPhones) {
            const success = await this.sendSMS({
                to: phone,
                message: message,
                priority: tripData.priority === 'URGENT' ? 'high' : 'normal'
            });
            if (!success)
                allSent = false;
        }
        return allSent;
    }
    /**
     * Send SMS for trip status update
     */
    async sendTripStatusSMS(tripData, hospitalPhone) {
        if (!hospitalPhone) {
            console.log('TCC_DEBUG: No hospital phone number provided for SMS notification');
            return false;
        }
        const message = `📋 TRANSPORT UPDATE\n` +
            `Patient: ${tripData.patientId}\n` +
            `Status: ${tripData.status}\n` +
            `Updated: ${new Date(tripData.updatedAt).toLocaleString()}\n` +
            `View: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`;
        return await this.sendSMS({
            to: hospitalPhone,
            message: message,
            priority: 'normal'
        });
    }
    async logSMSDelivery(data) {
        try {
            await centerPrisma.systemAnalytics.create({
                data: {
                    metricName: 'sms_delivery',
                    metricValue: {
                        to: data.to,
                        message: data.message,
                        messageId: data.messageId,
                        status: data.status,
                        error: data.error,
                        tripId: data.tripId,
                        timestamp: new Date().toISOString()
                    }
                }
            });
        }
        catch (error) {
            console.error('TCC_DEBUG: Failed to log SMS delivery:', error);
        }
    }
    async testSMSConnection() {
        try {
            console.log('TCC_DEBUG: Testing SMS service via email gateway');
            // Test with a dummy phone number to verify email gateway conversion
            const testPhone = '5551234567';
            const smsEmail = this.convertPhoneToSMSGateway(testPhone);
            if (!smsEmail) {
                console.log('TCC_DEBUG: SMS gateway conversion failed');
                return false;
            }
            console.log('TCC_DEBUG: SMS gateway conversion successful:', {
                phone: testPhone,
                smsEmail: smsEmail
            });
            // Test email service connection (SMS uses same SMTP)
            const emailConnected = await this.testEmailConnection();
            if (emailConnected) {
                console.log('TCC_DEBUG: SMS service ready (using email gateway)');
                return true;
            }
            else {
                console.log('TCC_DEBUG: SMS service failed (email service not available)');
                return false;
            }
        }
        catch (error) {
            console.error('TCC_DEBUG: SMS service connection failed:', error);
            return false;
        }
    }
}
exports.default = new EmailService();
//# sourceMappingURL=emailService.js.map