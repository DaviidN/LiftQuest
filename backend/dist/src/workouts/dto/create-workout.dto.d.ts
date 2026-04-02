declare class SetDto {
    weight: number;
    reps: number;
}
declare class ExerciseDto {
    name: string;
    sets: SetDto[];
}
export declare class CreateWorkoutDto {
    date: string;
    type: string;
    exercises?: ExerciseDto[];
    time?: number;
    calories?: number;
    distance?: number;
    prAchieved?: boolean;
}
export {};
