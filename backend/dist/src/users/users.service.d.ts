import { PrismaService } from 'prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
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
        password: string;
        id: string;
        totalXP: number;
        isEmailVerified: boolean;
        emailVerificationToken: string | null;
        emailVerificationExpires: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getStats(userId: string): Promise<{
        totalWorkouts: number;
        strengthWorkouts: number;
        airbikeWorkouts: number;
        currentStreak: number;
    }>;
}
