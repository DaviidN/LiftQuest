import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private mailerService;
    private configService;
    constructor(mailerService: MailerService, configService: ConfigService);
    sendPasswordResetEmail(email: string, username: string, token: string): Promise<void>;
    sendVerificationEmail(email: string, username: string, token: string, context?: 'signup' | 'email-update'): Promise<void>;
}
