import React from 'react';
import { Dumbbell } from 'lucide-react';
import type { Workout } from '../../types/workout.types';
import { WorkoutCard } from './WorkoutCard';

type WorkoutListProps = {
  workouts: Workout[];
  calculate1RM: (weight: number, reps: number) => number;
};

export const WorkoutList: React.FC<WorkoutListProps> = ({ workouts, calculate1RM }) => {
  if (workouts.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 text-center">
        <Dumbbell className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-400">No workouts yet. Start by adding your first!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {[...workouts].reverse().map(workout => (
        <WorkoutCard key={workout.id} workout={workout} calculate1RM={calculate1RM} />
      ))}
    </div>
  );
};