import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getProfile(req: any): Promise<any>;
    getStats(req: any): Promise<{
        totalWorkouts: any;
        strengthWorkouts: any;
        airbikeWorkouts: any;
        currentStreak: number;
    }>;
}
