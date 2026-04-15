import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private configService;
    private resend;
    private from;
    constructor(configService: ConfigService);
    sendPasswordResetEmail(email: string, username: string, token: string): Promise<void>;
    sendVerificationEmail(email: string, username: string, token: string, context?: 'signup' | 'email-update'): Promise<void>;
}
