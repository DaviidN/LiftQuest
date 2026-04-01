import { WorkoutsService } from './workouts.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';
export declare class WorkoutsController {
    private workoutsService;
    constructor(workoutsService: WorkoutsService);
    create(req: any, dto: CreateWorkoutDto): Promise<{
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
        createdAt: Date;
        userId: string;
        date: Date;
        type: string;
        xpEarned: number;
        time: number | null;
        calories: number | null;
        distance: number | null;
    }>;
    findAll(req: any): Promise<({
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
        createdAt: Date;
        userId: string;
        date: Date;
        type: string;
        xpEarned: number;
        time: number | null;
        calories: number | null;
        distance: number | null;
    })[]>;
    getVolumeData(req: any, days?: string): Promise<{
        date: string;
        volume: number;
    }[]>;
    findOne(req: any, id: string): Promise<({
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
        createdAt: Date;
        userId: string;
        date: Date;
        type: string;
        xpEarned: number;
        time: number | null;
        calories: number | null;
        distance: number | null;
    }) | null>;
    delete(req: any, id: string): Promise<{
        deleted: boolean;
    }>;
}
