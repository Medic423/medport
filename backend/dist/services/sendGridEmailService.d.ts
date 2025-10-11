interface EmailData {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    from?: string;
}
declare class SendGridEmailService {
    private isConfigured;
    constructor();
    private loadConfig;
    isServiceConfigured(): boolean;
    sendEmail(emailData: EmailData): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
    testConnection(): Promise<{
        success: boolean;
        error?: string;
    }>;
}
declare const sendGridEmailService: SendGridEmailService;
export default sendGridEmailService;
//# sourceMappingURL=sendGridEmailService.d.ts.map