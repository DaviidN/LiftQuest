import { Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private authService;
    constructor(authService: AuthService);
    validate(payload: {
        sub: string;
        email: string;
    }): Promise<{
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
    }>;
}
export {};
