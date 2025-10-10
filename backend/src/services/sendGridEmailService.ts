import sgMail from '@sendgrid/mail';
import { databaseManager } from './databaseManager';

interface EmailData {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

class SendGridEmailService {
  private isConfigured: boolean = false;

  constructor() {
    this.loadConfig();
  }

  private loadConfig() {
    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@tcc-system.com';

    if (apiKey) {
      sgMail.setApiKey(apiKey);
      this.isConfigured = true;
      console.log('TCC_DEBUG: SendGrid email service initialized successfully');
    } else {
      console.log('TCC_DEBUG: SendGrid API key not configured');
      this.isConfigured = false;
    }
  }

  public isServiceConfigured(): boolean {
    return this.isConfigured;
  }

  public async sendEmail(emailData: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
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
        content: content as any
      };

      const response = await sgMail.send(msg);
      
      console.log('TCC_DEBUG: SendGrid email sent successfully:', {
        messageId: response[0].headers['x-message-id'],
        status: response[0].statusCode
      });

      return {
        success: true,
        messageId: response[0].headers['x-message-id'] as string
      };
    } catch (error: any) {
      console.error('TCC_DEBUG: SendGrid email sending failed:', error);
      return {
        success: false,
        error: error.message || 'Unknown SendGrid error'
      };
    }
  }

  public async testConnection(): Promise<{ success: boolean; error?: string }> {
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
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

const sendGridEmailService = new SendGridEmailService();
export default sendGridEmailService;
