import { AchievementsService } from './achievements.service';
export declare class AchievementsController {
    private achievementsService;
    constructor(achievementsService: AchievementsService);
    findAll(): Promise<any>;
    getUserAchievements(req: any): Promise<any>;
    checkAchievements(req: any): Promise<string[]>;
}
