import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { UsersService } from '../users/users.service';
export declare class AchievementsService implements OnModuleInit {
    private prisma;
    private usersService;
    constructor(prisma: PrismaService, usersService: UsersService);
    onModuleInit(): Promise<void>;
    findAll(): Promise<{
        name: string;
        id: string;
        code: string;
        description: string;
        icon: string;
        xp: number;
    }[]>;
    getUserAchievements(userId: string): Promise<({
        achievement: {
            name: string;
            id: string;
            code: string;
            description: string;
            icon: string;
            xp: number;
        };
    } & {
        id: string;
        userId: string;
        achievementId: string;
        unlockedAt: Date;
    })[]>;
    checkAndUnlock(userId: string): Promise<string[]>;
    private unlockAchievement;
}
