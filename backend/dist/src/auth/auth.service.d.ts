import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { EmailService } from '../email/email.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    private emailService;
    constructor(prisma: PrismaService, jwtService: JwtService, emailService: EmailService);
    signup(dto: SignupDto): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            username: string;
            totalXP: number;
            isEmailVerified: boolean;
        };
    }>;
    findOrCreateOAuthUser({ provider, providerId, email, username, avatarUrl }: {
        provider: string;
        providerId: string;
        email: string;
        username: string;
        avatarUrl?: string;
    }): Promise<{
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
    private generateUniqueUsername;
    signJwt(user: {
        id: string;
        email: string;
    }): string;
    login(dto: LoginDto): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            username: string;
            totalXP: number;
            isEmailVerified: boolean;
        };
    }>;
    validateUser(userId: string): Promise<{
        email: string;
        username: string;
        id: string;
        totalXP: number;
        workouts: {
            id: string;
            createdAt: Date;
            userId: string;
            date: Date;
            type: string;
            xpEarned: number;
            prAchieved: boolean;
            time: number | null;
            calories: number | null;
            distance: number | null;
        }[];
        unlockedAchievements: {
            id: string;
            userId: string;
            achievementId: string;
            unlockedAt: Date;
        }[];
    } | null>;
    verifyEmail(token: string): Promise<{
        message: string;
        token: string;
        user: {
            id: string;
            email: string;
            username: string;
            totalXP: number;
            isEmailVerified: boolean;
        };
    }>;
    resendVerificationEmail(email: string): Promise<{
        message: string;
    }>;
}
