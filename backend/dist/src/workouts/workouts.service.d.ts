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
                exerciseId: string;
                weight: number;
                reps: number;
            }[];
        } & {
            id: string;
            name: string;
            workoutId: string;
        })[];
    } & {
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
    }>;
    findAll(userId: string): Promise<({
        exercises: ({
            sets: {
                id: string;
                exerciseId: string;
                weight: number;
                reps: number;
            }[];
        } & {
            id: string;
            name: string;
            workoutId: string;
        })[];
    } & {
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
    })[]>;
    findOne(userId: string, workoutId: string): Promise<({
        exercises: ({
            sets: {
                id: string;
                exerciseId: string;
                weight: number;
                reps: number;
            }[];
        } & {
            id: string;
            name: string;
            workoutId: string;
        })[];
    } & {
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
