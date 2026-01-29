export type StrengthExerciseSet = {
  weight: number;
  reps: number;
};

export type StrengthExercise = {
  name: string;
  sets: StrengthExerciseSet[];
};

export type StrengthWorkout = {
  id?: number;
  type: 'strength';
  date: string;
  exercises: StrengthExercise[];
  xpEarned?: number;
};

export type AirbikeWorkout = {
  id?: number;
  type: 'airbike';
  date: string;
  time: number;
  calories: number;
  distance: number;
  xpEarned?: number;
};

export type Workout = StrengthWorkout | AirbikeWorkout;