import { PrismaService } from 'prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';
export declare class UsersService {
    private prisma;
    private jwtService;
    private emailService;
    constructor(prisma: PrismaService, jwtService: JwtService, emailService: EmailService);
    getProfile(userId: string): Promise<{
        email: string;
        username: string;
        id: string;
        totalXP: number;
        createdAt: Date;
        _count: {
            workouts: number;
            unlockedAchievements: number;
        };
    } | null>;
    updateXP(userId: string, xpToAdd: number): Promise<{
        email: string;
        username: string;
        password: string | null;
        id: string;
        googleId: string | null;
        appleId: string | null;
        provider: string;
        avatarUrl: string | null;
        totalXP: number;
        isEmailVerified: boolean;
        emailVerificationToken: string | null;
        emailVerificationExpires: Date | null;
        passwordResetToken: string | null;
        passwordResetExpires: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getStats(userId: string): Promise<{
        totalWorkouts: number;
        strengthWorkouts: number;
        cardioWorkouts: number;
        currentStreak: number;
    }>;
    updateEmail(userId: string, updatedEmail: string, currentPassword: string): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            username: string;
            totalXP: number;
            isEmailVerified: boolean;
        };
    }>;
    updateUsername(userId: string, updatedUsername: string): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            username: string;
            totalXP: number;
            isEmailVerified: boolean;
        };
    }>;
    updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
    requestEmail(email: string): Promise<{
        message: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
    deleteProfile(userId: string): Promise<{
        message: string;
    }>;
}
