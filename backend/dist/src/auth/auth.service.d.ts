import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    signup(dto: SignupDto): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            username: string;
            totalXP: number;
        };
    }>;
    login(dto: LoginDto): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            username: string;
            totalXP: number;
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
}
