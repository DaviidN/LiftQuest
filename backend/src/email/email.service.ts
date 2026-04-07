import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  async sendVerificationEmail(email: string, username: string, token: string) {
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:8080';
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Verify your LiftQuest account',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Welcome to LiftQuest!</h1>
          </div>

          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Hey <strong>${username}</strong>,</p>

            <p>Thanks for signing up! Please verify your email address to start tracking your fitness journey.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}"
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 15px 30px;
                        text-decoration: none;
                        border-radius: 5px;
                        font-weight: bold;
                        display: inline-block;">
                Verify Email
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
              If you didn't create an account with LiftQuest, you can safely ignore this email.
            </p>
          </div>
        </body>
        </html>
      `,
    });
  }
}
