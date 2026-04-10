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
        id: string;
        email: string;
        username: string;
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
