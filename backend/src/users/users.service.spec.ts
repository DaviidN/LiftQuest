 jest.mock('bcrypt', () => ({
    compare: jest.fn(),
    hash: jest.fn(),
  }));

import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from 'prisma/prisma.service';
import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';                                                                                                                  
import { EmailService } from '../email/email.service';                                                                                                       
import * as bcrypt from 'bcrypt';        



const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  workout: {
    findMany: jest.fn()
  }
};

const mockJwt = {
  sign: jest.fn()
};

const mockEmail = {
  sendPasswordResetEmail: jest.fn(),
  sendVerificationEmail: jest.fn()
}

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: EmailService, useValue: mockEmail },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);

    jest.resetAllMocks();
    mockJwt.sign.mockReturnValue('mock-token');
  });

    const id = '1';
    const email = 'john@example.com';
    const currentPassword = 'john1234';
    const username = 'johndoe1';
    
    describe('getProfile', () => 
        it('should show you profile of the user', async() =>{
            const user = {
                'id': id,
                'email': email,
                'username': username,
                'totalXP': 0,
                'createdAt': new Date(),
                '_count': { workouts: 3, unlockedAchievements: 1 },
            }
        
            mockPrisma.user.findUnique.mockResolvedValue(user);
        
            const result = await service.getProfile(id);
    
            expect(result).toBe(user);
        })
    )

    describe('getStats', () => {
        it('should get stats of the user', async() =>{
            const  stats = [
                { type: 'strength', date: new Date('2026-04-27') },
                { type: 'cardio', date: new Date('2026-04-26') },
                { type: 'strength', date: new Date('2026-04-25') },
            ];
        
            mockPrisma.workout.findMany.mockResolvedValue(stats);
    
            const result = await service.getStats(id);
    
            expect(result.totalWorkouts).toBe(3);
            expect(result.cardioWorkouts).toBe(1);
            expect(result.strengthWorkouts).toBe(2);
            expect(result.currentStreak).toBe(3);
       })
    })
    
    describe('updateEmail', () => {
        const newEmail = 'john2@example.com'; 

        it('should throw error if the email is already used', async () =>{
            mockPrisma.user.findFirst.mockResolvedValue({});

            await expect(service.updateEmail(id, newEmail, currentPassword)).rejects.toThrow(ConflictException);
        })
    
        it('should throw error if user doesnt exists', async () =>{
            mockPrisma.user.findFirst
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce(null);

            await expect(service.updateEmail(id, newEmail, currentPassword)).rejects.toThrow(NotFoundException);
        })

        it('should throw error if account uses OAuth login', async () =>{
            mockPrisma.user.findFirst
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce({
                'id': id,
                'password': null
            });

            await expect(service.updateEmail(id, newEmail, currentPassword)).rejects.toThrow(UnauthorizedException);
        })

        it('should throw error if the current password is incorrect', async () =>{
            mockPrisma.user.findFirst
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce({
                'id': id,
                'password': currentPassword
            });

            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(service.updateEmail(id, newEmail, currentPassword)).rejects.toThrow(UnauthorizedException);
        })

        it('should throw error if the updated email is same as the current email', async () =>{
            mockPrisma.user.findFirst
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce({
                'id': id,
                'email': newEmail,
                'password': currentPassword
            });

            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            await expect(service.updateEmail(id, newEmail, currentPassword)).rejects.toThrow(ConflictException);
        })

        it('should update users email', async () =>{
            mockPrisma.user.findFirst
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce({
                'id': id,
                'email': email,
                'password': currentPassword
            });

            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            mockPrisma.user.update.mockResolvedValue({
                'id': id,
                'email': newEmail,
                'username': username,
                'totalXP': 0,
                'isEmailVerified': false,
            })

            const result = await service.updateEmail(id, newEmail, currentPassword);

            expect(mockEmail.sendVerificationEmail).toHaveBeenCalledWith(
                newEmail,
                username,
                expect.any(String),
                'email-update',
            );

            expect(result.token).toBe('mock-token');
            expect(result.user.email).toBe(newEmail);
            expect(result.user.isEmailVerified).toBe(false);
            expect(result.user.username).toBe(username);
        })
    })
    
    describe('updateUsername', () =>{
        const newUsername = 'johnpork';

        it('should throw error if the username is already used', async () => {
            mockPrisma.user.findFirst.mockResolvedValue({});
            
            await expect(service.updateUsername(id, newUsername)).rejects.toThrow(ConflictException);
        })

        it('should throw erro if the user does not exist', async () =>{
            mockPrisma.user.findFirst
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce(null);

            await expect(service.updateUsername(id, newUsername)).rejects.toThrow(NotFoundException);
        })

        it('should throw error if new username is the same as current username', async () =>{
            mockPrisma.user.findFirst
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce({'id': id, 'username': newUsername});

            await expect(service.updateUsername(id, newUsername)).rejects.toThrow(ConflictException);
        })

        it('should update users username', async () =>{
            mockPrisma.user.findFirst
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce({'id': id, 'username': username});

            mockPrisma.user.update.mockResolvedValue({'username': newUsername});

            const result = await service.updateUsername(id, newUsername);

            expect(result.token).toBe('mock-token');
            expect(result.user.username).toBe(newUsername);
        })
    })

    describe('updatePassword', () =>{
        const newPassword = 'john12345'

        it('should throw error if user does not exist', async () =>{
            mockPrisma.user.findFirst.mockResolvedValue(null);

            await expect(service.updatePassword(id, currentPassword, newPassword)).rejects.toThrow(NotFoundException);
        })

        it('should throw error if account uses OAuth login', async () =>{
            mockPrisma.user.findFirst.mockResolvedValue({'id': id, 'password': null});

            await expect(service.updatePassword(id, currentPassword, newPassword)).rejects.toThrow(UnauthorizedException);
        })

        it('should throw error if current password is incorrect', async () =>{
            mockPrisma.user.findFirst.mockResolvedValue({'id': id, 'password': currentPassword});
            
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(service.updatePassword(id, currentPassword, newPassword)).rejects.toThrow(UnauthorizedException);
        })

        it('should throw error if new password is same as current password', async () =>{
            mockPrisma.user.findFirst.mockResolvedValue({'id': id, 'password': currentPassword});
            
            (bcrypt.compare as jest.Mock)
                .mockResolvedValueOnce(true)
                .mockResolvedValueOnce(true);
            
            await expect(service.updatePassword(id, currentPassword, currentPassword)).rejects.toThrow(ConflictException);
        })

        it('should update users password', async () =>{
            mockPrisma.user.findFirst.mockResolvedValue({'id': id, 'password': currentPassword});
            
            (bcrypt.compare as jest.Mock)
                .mockResolvedValueOnce(true)
                .mockResolvedValueOnce(false);
            
            const result = await service.updatePassword(id, currentPassword, newPassword);

            expect(result.message).toBe('Password updated successfully');
        })
    })

    describe('requestEmail', () =>{
        it('should throw error if user does not exist', async () =>{
            mockPrisma.user.findFirst.mockResolvedValue(null);

            const result = await service.requestEmail(email);

            expect(result.message).toBe('If that email exists, a reset link has been sent.')
        })

        it('should send request email', async () =>{
            mockPrisma.user.findFirst.mockResolvedValue({});

            const result = await service.requestEmail(email);

            expect(result.message).toBe('If that email exists, a reset link has been sent.')
        })
    })

    describe('resetPassword', ()=>{
        const newPassword = 'john12345';
        const token = 'token123';
        
        it('should throw error if the reset token is invalid or expired', async () =>{
            mockPrisma.user.findFirst.mockResolvedValue(null);

           await expect(service.resetPassword(id, newPassword)).rejects.toThrow(UnauthorizedException);
        })

        it('should throw error if new password is the same as current password', async () =>{
            mockPrisma.user.findFirst.mockResolvedValue({
                'id': id, 
                'password': currentPassword, 
                'passwordResetToken': token, 
                'passwordResetExpires': new Date(Date.now() + 1000)
            });

            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            await expect(service.resetPassword(token, currentPassword)).rejects.toThrow(ConflictException);
        })

        it('should reset users password', async() =>{
            mockPrisma.user.findFirst.mockResolvedValue({
                'id': id, 
                'password': currentPassword, 
                'passwordResetToken': 'token123', 
                'passwordResetExpires': new Date(Date.now() + 1000)
            });

            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            const result = await service.resetPassword(token, newPassword);

            expect(result.message).toBe('Password has been reset successfully.');
        })
    })

    describe('deleteProfile', () =>{
        it('should throw error if the user does not exist', async() =>{
            mockPrisma.user.findFirst.mockResolvedValue(null)

            await expect(service.deleteProfile(id)).rejects.toThrow(NotFoundException);
        })

        it('should delete users profile', async() => {
            mockPrisma.user.findFirst.mockResolvedValue({'id': id});

            mockPrisma.user.delete.mockResolvedValue({});

            const result = await service.deleteProfile(id);

            expect(result.message).toBe('Account deleted successfully')
        })
    })
})