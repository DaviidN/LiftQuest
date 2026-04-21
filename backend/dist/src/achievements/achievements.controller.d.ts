import { AchievementsService } from './achievements.service';
export declare class AchievementsController {
    private achievementsService;
    constructor(achievementsService: AchievementsService);
    findAll(): Promise<{
        name: string;
        id: string;
        code: string;
        description: string;
        icon: string;
        xp: number;
    }[]>;
    getUserAchievements(req: any): Promise<({
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
    checkAchievements(req: any): Promise<string[]>;
}
