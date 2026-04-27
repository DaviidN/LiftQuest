jest.mock('bcrypt', () => ({
    compare: jest.fn(),
    hash: jest.fn(),
  }));

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcrypt';  
import { UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';


const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

const mockJwt = {
  sign: jest.fn()
};

const mockEmail = {
  sendVerificationEmail: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: EmailService, useValue: mockEmail },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    // Reset all mocks before each test
    jest.resetAllMocks();
    mockJwt.sign.mockReturnValue('mock-token');
  });

  describe('generateUniqueUsername', () => {
    it('should return slugified username when it is not taken', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null); // username not taken

      const result = await (service as any).generateUniqueUsername('John Doe');

      expect(result).toBe('johndoe');
    });

    it('should append a number when username is already taken', async () => {
      mockPrisma.user.findUnique
        .mockResolvedValueOnce({ id: '1' }) // 'johndoe' is taken
        .mockResolvedValueOnce(null);        // 'johndoe1' is free

      const result = await (service as any).generateUniqueUsername('John Doe');

      expect(result).toBe('johndoe1');
    });

    it('should increment counter until a free username is found', async () => {
      mockPrisma.user.findUnique
        .mockResolvedValueOnce({ id: '1' }) // 'johndoe' is taken
        .mockResolvedValueOnce({ id: '2' }) // 'johndoe1' is taken
        .mockResolvedValueOnce(null);        // 'johndoe2' is free

      const result = await (service as any).generateUniqueUsername('John Doe');

      expect(result).toBe('johndoe2');
    });
  });

  describe('findOrCreateOAuthUser', () => {
    const oauthData = {
      provider: 'google',
      providerId: 'google-123',
      email: 'john@example.com',
      username: 'John Doe',
      avatarUrl: 'https://example.com/photo.jpg',
    };

    it('should return existing user if googleId already exists', async () => {
      const existingUser = { id: '1', email: 'john@example.com' };
      mockPrisma.user.findUnique.mockResolvedValue(existingUser);

      const result = await service.findOrCreateOAuthUser(oauthData);

      expect(result).toBe(existingUser);
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it('should link googleId to existing account when email already exists', async () => {
      const existingUser = { id: '2', email: 'john@example.com' };
      mockPrisma.user.findUnique
        .mockResolvedValueOnce(null)          // no user with this googleId
        .mockResolvedValueOnce(existingUser); // user with this email exists

      const updatedUser = { ...existingUser, googleId: 'google-123' };
      mockPrisma.user.update.mockResolvedValue(updatedUser);

      const result = await service.findOrCreateOAuthUser(oauthData);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
        data: { googleId: 'google-123' },
      });
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
      expect(result).toBe(updatedUser);
    });

    it('should create a new user if no existing account is found', async () => {
      mockPrisma.user.findUnique
        .mockResolvedValueOnce(null)  // no user with this googleId
        .mockResolvedValueOnce(null)  // no user with this email
        .mockResolvedValueOnce(null); // username 'johndoe' is free

      const newUser = { id: '2', email: 'john@example.com', username: 'johndoe' };
      mockPrisma.user.create.mockResolvedValue(newUser);

      const result = await service.findOrCreateOAuthUser(oauthData);

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'john@example.com',
          googleId: 'google-123',
          isEmailVerified: true,
        }),
      });
      expect(result).toBe(newUser);
    });
  });

  describe('login',() => {
    const user = {
      email: 'john@example.com',
      password: 'John1234.'
    }

    it('should throw error when user is not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login(user)).rejects.toThrow(UnauthorizedException);
    })

    it('should throw error when password is missing OAuth case', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: '1', password: null });

      await expect(service.login(user)).rejects.toThrow(UnauthorizedException);
    })

    it('should throw error when password is incorrect', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: '2', password: 'hashedpass' });

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(user)).rejects.toThrow(UnauthorizedException);
    })

    it('should login user', async () =>{
      mockPrisma.user.findUnique.mockResolvedValue({ id: '3', email: 'john@example.com', password: 'hashedpass', totalXP: 0, isEmailVerified: false });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(user);

      expect(result.token).toBe('mock-token');
      expect(result.user.email).toBe('john@example.com');
      expect(result.user.totalXP).toBe(0);
      expect(result.user.isEmailVerified).toBe(false);
    })
  });
  
  describe('signup', () => {
    const user = {
      email: 'john@example.com',
      username: 'John Doe',
      password: 'John1234.'
    }

    it('throw error when user already exists', async() => {
      mockPrisma.user.findFirst.mockResolvedValue({id: '1', email: 'john@example.com'});

      await expect(service.signup(user)).rejects.toThrow(ConflictException);
    })

    it('should sign up the user', async() => {
      mockPrisma.user.findFirst.mockResolvedValue(null)

      mockPrisma.user.create.mockResolvedValue({
        id: '1',
        email: 'john@example.com',
        username: 'John Doe',
        totalXP: 0,
        isEmailVerified: false,
      });

      const result = await service.signup(user); 

      expect(mockEmail.sendVerificationEmail).toHaveBeenCalledWith(       
        'john@example.com',                                                                                                                                     
        'John Doe',                                                                                                                                             
        expect.any(String),
        'signup'
      );

      expect(result.token).toBe('mock-token');
      expect(result.user.email).toBe('john@example.com');
      expect(result.user.username).toBe('John Doe');
    })
  })
  describe('verifyEmail', () => {
    const token = 'token-123'

    it('should throw error when verification token is incorrect', async() =>{
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(service.verifyEmail(token)).rejects.toThrow(BadRequestException);
    })

    it('should throw error if email is already verified', async() => {
      mockPrisma.user.findFirst.mockResolvedValue({'id': 1, 'isEmailVerified': true});

      await expect(service.verifyEmail(token)).rejects.toThrow(BadRequestException);
    })

    it('should throw error if token is expired', async() =>{
      mockPrisma.user.findFirst.mockResolvedValue({
        'id': 1, 
        'isEmailVerified': false,
        'emailVerificationExpires': new Date(Date.now() - 1000)
      });

      await expect(service.verifyEmail(token)).rejects.toThrow(BadRequestException);
    })

    it('should verify users using email verification', async() => {
      mockPrisma.user.findFirst.mockResolvedValue({
        'id': 1, 
        'isEmailVerified': false,
        'emailVerificationExpires': new Date(Date.now() + 1000)
      });

      mockPrisma.user.update.mockResolvedValue({
        'id': 1, 
        'email': 'john@example.com',
        'username': 'johndoe',
        'totalXP': 0,
        'isEmailVerified': true,
        'emailVerificationToken': null,
        'emailVerificationExpires': null
      });

      const result = await service.verifyEmail(token);

      expect(result.message).toBe('Email verified successfully');
      expect(result.token).toBe('mock-token');
      expect(result.user.email).toBe('john@example.com');
      expect(result.user.isEmailVerified).toBe(true);
    })
  })
  describe('resendVerificationEmail', () => {
    const email = 'john@example.com'

    it('should throw error when user is not found', async() =>{  
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.resendVerificationEmail(email)).rejects.toThrow(BadRequestException);
    })

    it('should throw error if email is already verified', async () =>{
      mockPrisma.user.findUnique.mockResolvedValue({
        'id': 1,
        'isEmailVerified': true
      });

      await expect(service.resendVerificationEmail(email)).rejects.toThrow(BadRequestException);
    })

    it('should send verification email', async () =>{
      mockPrisma.user.findUnique.mockResolvedValue({
        'id': 1,
        'email': email,
        'username': 'johndoe',
        'isEmailVerified': false
      });

      mockPrisma.user.update.mockResolvedValue({});

      const result = await service.resendVerificationEmail(email);

      expect(mockEmail.sendVerificationEmail).toHaveBeenCalledWith(
        'john@example.com',
        'johndoe',
        expect.any(String),
        'signup',
      );
      expect(result.message).toBe('Verification email sent');
    })
  })
});
