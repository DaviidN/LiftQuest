import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getProfile(req: any): Promise<{
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
    getStats(req: any): Promise<{
        totalWorkouts: number;
        strengthWorkouts: number;
        airbikeWorkouts: number;
        currentStreak: number;
    }>;
}
