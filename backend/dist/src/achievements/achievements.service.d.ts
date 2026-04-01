import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
export declare class AchievementsService implements OnModuleInit {
    private prisma;
    private usersService;
    constructor(prisma: PrismaService, usersService: UsersService);
    onModuleInit(): Promise<void>;
    findAll(): Promise<any>;
    getUserAchievements(userId: string): Promise<any>;
    checkAndUnlock(userId: string): Promise<string[]>;
    private unlockAchievement;
}
