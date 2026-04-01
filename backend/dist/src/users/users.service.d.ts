import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<any>;
    updateXP(userId: string, xpToAdd: number): Promise<any>;
    getStats(userId: string): Promise<{
        totalWorkouts: any;
        strengthWorkouts: any;
        airbikeWorkouts: any;
        currentStreak: number;
    }>;
}
