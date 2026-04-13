import { UsersService } from './users.service';
import { UpdatePasswordDto } from './dto/update-password.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    requestEmail(email: string): Promise<{
        message: string;
    } | undefined>;
    resetPassword(token: string, { newPassword }: UpdatePasswordDto): Promise<{
        message: string;
    }>;
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
    updateEmail(req: any, email: string, currentPassword: string): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            username: string;
            totalXP: number;
            isEmailVerified: boolean;
        };
    }>;
    updateUsername(req: any, username: string): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            username: string;
            totalXP: number;
            isEmailVerified: boolean;
        };
    }>;
    updatePassword(req: any, currentPassword: string, { newPassword }: UpdatePasswordDto): Promise<{
        message: string;
    }>;
    deleteProfile(req: any): Promise<{
        message: string;
    }>;
}
