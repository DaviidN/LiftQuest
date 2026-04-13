import React, { useState } from 'react';
import { Dumbbell } from 'lucide-react';
import type { Workout } from '../../types/workout.types';
import { WorkoutCard } from './WorkoutCard';
import { Button } from '../UI/Button';

interface WorkoutListProps {
  workouts: Workout[];
  calculate1RM: (weight: number, reps: number) => number;
}

type TypeFilter = 'all' | 'strength' | 'airbike';
type ExerciseFilter = 'all' | 'Squat' | 'Bench Press' | 'Deadlift';

export const WorkoutList: React.FC<WorkoutListProps> = ({ workouts, calculate1RM }) => {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [exerciseFilter, setExerciseFilter] = useState<ExerciseFilter>('all');

  const filtered = [...workouts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .filter(w => {
      if (typeFilter !== 'all' && w.type !== typeFilter) return false;
      if (typeFilter === 'strength' && exerciseFilter !== 'all') {
        return w.type === 'strength' && w.exercises.some(ex => ex.name === exerciseFilter);
      }
      return true;
    });

  if (workouts.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 text-center">
        <Dumbbell size={64} className="mx-auto mb-4 text-gray-400" />
        <p className="text-gray-400">No workouts yet. Start by adding your first!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(['all', 'strength', 'airbike'] as TypeFilter[]).map(type => (
          <Button
            key={type}
            size="sm"
            variant={typeFilter === type ? 'primary' : 'secondary'}
            onClick={() => {
              setTypeFilter(type);
              setExerciseFilter('all');
            }}
          >
            {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
          </Button>
        ))}
      </div>

      {typeFilter === 'strength' && (
        <div className="flex flex-wrap gap-2">
          {(['all', 'Squat', 'Bench Press', 'Deadlift'] as ExerciseFilter[]).map(ex => (
            <Button
              key={ex}
              size="sm"
              variant={exerciseFilter === ex ? 'primary' : 'secondary'}
              onClick={() => setExerciseFilter(ex)}
            >
              {ex === 'all' ? 'All exercises' : ex}
            </Button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 text-center">
          <p className="text-gray-400">No workouts match this filter.</p>
        </div>
      ) : (
        filtered.map(workout => (
          <WorkoutCard key={workout.id} workout={workout} calculate1RM={calculate1RM} />
        ))
      )}
    </div>
  );
};