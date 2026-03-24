import React from 'react';
import { Dumbbell, Activity } from 'lucide-react';
import type { Workout } from '../../types/workout.types';

type WorkoutCardProps = {
  workout: Workout;
  calculate1RM: (weight: number, reps: number) => number;
};

export const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, calculate1RM }) => {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {workout.type === 'strength' ? (
              <Dumbbell className="w-5 h-5 text-purple-400" />
            ) : (
              <Activity className="w-5 h-5 text-pink-400" />
            )}
            <span className="font-bold">
              {workout.type === 'strength' ? 'Strength Workout' : 'Airbike'}
            </span>
          </div>
          <div className="text-sm text-gray-400">
            {new Date(workout.date).toLocaleDateString('cs-CZ')}
          </div>
        </div>
        <div className="text-right">
          <div className="text-yellow-400 font-bold">+{workout.xpEarned} XP</div>
        </div>
      </div>
      
      {workout.type === 'strength' && workout.exercises.map((ex, i) => (
        <div key={i} className="mb-3 last:mb-0">
          <div className="font-semibold text-purple-300 mb-1">{ex.name}</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {ex.sets.map((set, j) => (
              <div key={j} className="bg-white/5 rounded px-3 py-1">
                {set.weight}kg × {set.reps}
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Est. 1RM: {Math.max(...ex.sets.map(s => calculate1RM(s.weight, s.reps)))}kg
          </div>
        </div>
      ))}
      
      {workout.type === 'airbike' && (
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-gray-400">Time</div>
            <div className="font-bold">{workout.time} min</div>
          </div>
          <div>
            <div className="text-gray-400">Calories</div>
            <div className="font-bold">{workout.calories} kcal</div>
          </div>
          <div>
            <div className="text-gray-400">Distance</div>
            <div className="font-bold">{workout.distance} km</div>
          </div>
        </div>
      )}
    </div>
  );
};