import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { EmailService } from "./email.service";

const mockSendTransacEmail =
  jest.fn().mockResolvedValue({});

jest.mock("@getbrevo/brevo", () => ({
    BrevoClient: jest.fn().mockImplementation(() => ({
        transactionalEmails: {
            sendTransacEmail: mockSendTransacEmail,
        },
    })),
    BrevoEnvironment: {
        Default: "default",
    },
}));

const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        BREVO_API_KEY: 'test-key',
        SMTP_FROM: 'test@liftquest.com',
        FRONTEND_URL: 'http://localhost:8080',
      };
      return config[key];
    }),
  };

describe("EmailService", () => {
   let service: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await
    Test.createTestingModule({
            providers: [
            EmailService,
            { provide: ConfigService, useValue: mockConfigService },
            ],
        }).compile();

        service = module.get<EmailService>(EmailService);    
        jest.clearAllMocks();
  });

  describe('sendPasswordResetEmail', () => {
      it('should call sendTransacEmail with correct recipient and subject', async () => {
        await service.sendPasswordResetEmail('user@example.com', 'Dave', 'abc123');

  expect(mockSendTransacEmail).toHaveBeenCalledTimes(1);   
        const call = mockSendTransacEmail.mock.calls[0][0];
        expect(call.to).toEqual([{ email: 'user@example.com' }]);
        expect(call.subject).toBe('Reset your LiftQuest password');
        expect(call.sender).toEqual({ email: 'test@liftquest.com', name: 'LiftQuest' });
      });

      it('should include the reset URL with the token in htmlContent', async () => {
        await service.sendPasswordResetEmail('user@example.com', 'Dave', 'mytoken');

        const html = mockSendTransacEmail.mock.calls[0][0].htmlContent;
        expect(html).toContain('mytoken');
        expect(html).toContain('http://localhost:8080/update-user?field=password_reset&token=mytoken');
      });
    });

    describe('sendVerificationEmail', () => {
      it('should send signup verification email by default', async () => {
        await service.sendVerificationEmail('user@example.com', 'Dave', 'tok123');

        const call = mockSendTransacEmail.mock.calls[0][0];
        expect(call.subject).toBe('Verify your LiftQuest account');
        expect(call.htmlContent).toContain('Welcome to LiftQuest!');
        expect(call.htmlContent).toContain('Verify Email');
      });

      it('should send email-update verification email when context is email-update', async () => {
        await service.sendVerificationEmail('user@example.com', 'Dave', 'tok123', 'email-update');

        const call = mockSendTransacEmail.mock.calls[0][0];
        expect(call.subject).toBe('Confirm your new LiftQuest email');
        expect(call.htmlContent).toContain('Email Change Request');
        expect(call.htmlContent).toContain('Confirm New Email');
      });

      it('should include the verification URL with the token', async () => {
        await service.sendVerificationEmail('user@example.com', 'Dave', 'tok456');

        const html = mockSendTransacEmail.mock.calls[0][0].htmlContent;       
        expect(html).toContain('http://localhost:8080/verify-email?token=tok456');
      });
    });
});