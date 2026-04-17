import { PrismaService } from 'prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';
export declare class WorkoutsService {
    private prisma;
    private usersService;
    constructor(prisma: PrismaService, usersService: UsersService);
    create(userId: string, dto: CreateWorkoutDto): Promise<{
        exercises: ({
            sets: {
                id: string;
                weight: number;
                reps: number;
                exerciseId: string;
            }[];
        } & {
            id: string;
            name: string;
            workoutId: string;
        })[];
    } & {
        id: string;
        date: Date;
        type: string;
        xpEarned: number;
        createdAt: Date;
        prAchieved: boolean;
        time: number | null;
        calories: number | null;
        distance: number | null;
        userId: string;
    }>;
    findAll(userId: string): Promise<({
        exercises: ({
            sets: {
                id: string;
                weight: number;
                reps: number;
                exerciseId: string;
            }[];
        } & {
            id: string;
            name: string;
            workoutId: string;
        })[];
    } & {
        id: string;
        date: Date;
        type: string;
        xpEarned: number;
        createdAt: Date;
        prAchieved: boolean;
        time: number | null;
        calories: number | null;
        distance: number | null;
        userId: string;
    })[]>;
    findOne(userId: string, workoutId: string): Promise<({
        exercises: ({
            sets: {
                id: string;
                weight: number;
                reps: number;
                exerciseId: string;
            }[];
        } & {
            id: string;
            name: string;
            workoutId: string;
        })[];
    } & {
        id: string;
        date: Date;
        type: string;
        xpEarned: number;
        createdAt: Date;
        prAchieved: boolean;
        time: number | null;
        calories: number | null;
        distance: number | null;
        userId: string;
    }) | null>;
    delete(userId: string, workoutId: string): Promise<{
        deleted: boolean;
    }>;
    getVolumeData(userId: string, days?: number): Promise<{
        date: string;
        volume: number;
    }[]>;
    private calculate1RM;
}
