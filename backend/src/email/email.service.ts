import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BrevoClient, BrevoEnvironment } from '@getbrevo/brevo';

@Injectable()
export class EmailService {
  private client: BrevoClient;
  private from: string;

  constructor(private configService: ConfigService) {
    this.client = new BrevoClient({
      apiKey: () => this.configService.get<string>('BREVO_API_KEY'),
      environment: BrevoEnvironment.Default,
    });
    this.from = this.configService.get<string>('SMTP_FROM') || 'noreply.liftquest@gmail.com';
  }

  async sendPasswordResetEmail(email: string, username: string, token: string) {
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:8080';
    const resetUrl = `${frontendUrl}/update-user?field=password_reset&token=${token}`;

    await this.client.transactionalEmails.sendTransacEmail({
      sender: { email: this.from, name: 'LiftQuest' },
      to: [{ email }],
      subject: 'Reset your LiftQuest password',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Password Reset</h1>
          </div>

          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Hey <strong>${username}</strong>,</p>

            <p>We received a request to reset your LiftQuest password. Click the button below to set a new password.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}"
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 15px 30px;
                        text-decoration: none;
                        border-radius: 5px;
                        font-weight: bold;
                        display: inline-block;">
                Reset Password
              </a>
            </div>

            <p style="color: #666; font-size: 14px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
            </p>

            <p style="color: #666; font-size: 14px;">
              This link will expire in 1 hour.
            </p>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

            <p style="color: #999; font-size: 12px; text-align: center;">
              If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
            </p>
          </div>
        </body>
        </html>
      `,
    });
  }

  async sendVerificationEmail(email: string, username: string, token: string, context: 'signup' | 'email-update' = 'signup') {
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:8080';
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

    const isUpdate = context === 'email-update';

    const subject = isUpdate ? 'Confirm your new LiftQuest email' : 'Verify your LiftQuest account';
    const heading = isUpdate ? 'Email Change Request' : 'Welcome to LiftQuest!';
    const bodyText = isUpdate
      ? 'You recently requested to change your email address. Please verify your new email to apply the change.'
      : 'Thanks for signing up! Please verify your email address to start tracking your fitness journey.';
    const buttonLabel = isUpdate ? 'Confirm New Email' : 'Verify Email';
    const footerNote = isUpdate
      ? "If you didn't request an email change, you can safely ignore this email. Your account remains unchanged."
      : "If you didn't create an account with LiftQuest, you can safely ignore this email.";

    await this.client.transactionalEmails.sendTransacEmail({
      sender: { email: this.from, name: 'LiftQuest' },
      to: [{ email }],
      subject,
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">${heading}</h1>
          </div>

          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Hey <strong>${username}</strong>,</p>

            <p>${bodyText}</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}"
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 15px 30px;
                        text-decoration: none;
                        border-radius: 5px;
                        font-weight: bold;
                        display: inline-block;">
                ${buttonLabel}
              </a>
            </div>

            <p style="color: #666; font-size: 14px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">${verificationUrl}</a>
            </p>

            <p style="color: #666; font-size: 14px;">
              This link will expire in 24 hours.
            </p>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

            <p style="color: #999; font-size: 12px; text-align: center;">
              ${footerNote}
            </p>
          </div>
        </body>
        </html>
      `,
    });
  }
}
