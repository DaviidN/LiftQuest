import React, { useState } from 'react';
import { Dumbbell, Activity, X } from 'lucide-react';
import type { Workout } from '../../types/workout.types';
import { Button } from '../UI/Button';

interface AddWorkoutModalProps {
  onClose: () => void;
  onAdd: (workout: Workout) => void;
};

type StrengthExerciseName = 'Squat' | 'Bench Press' | 'Deadlift';

interface StrengthExercise {
  name: StrengthExerciseName;
  sets: {
    weight: string;
    reps: string;
  }[];
}

export const AddWorkoutModal: React.FC<AddWorkoutModalProps> = ({ onClose, onAdd }) => {
  const [workoutType, setWorkoutType] = useState<'strength' | 'airbike'>('strength');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Strength workout state
  const [exercises, setExercises] = useState<StrengthExercise[]>([
    { name: 'Squat', sets: [{ weight: '', reps: '' }] }
  ]);
  
  // Airbike state
  const [time, setTime] = useState('');
  const [calories, setCalories] = useState('');
  const [distance, setDistance] = useState('');

  const addExercise = () => {
    setExercises([...exercises, { name: 'Squat', sets: [{ weight: '', reps: '' }] }]);
  };

  const addSet = (exerciseIndex: number) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].sets.push({ weight: '', reps: '' });
    setExercises(newExercises);
  };

  const updateExercise = (index: number, field: string, value: StrengthExerciseName) => {
    const newExercises = [...exercises];
    if (field === 'name') {
      newExercises[index].name = value;
    }
    setExercises(newExercises);
  };

  const updateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: 'weight' | 'reps',
    value: string
  ) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].sets[setIndex][field] = value;
    setExercises(newExercises);
  };

  const handleSubmit = () => {
    if (workoutType === 'strength') {
      const validExercises = exercises.filter(ex => 
        ex.name && ex.sets.some(s => s.weight && s.reps)
      ).map(ex => ({
        ...ex,
        sets: ex.sets.filter(s => s.weight && s.reps).map(s => ({
          weight: parseFloat(s.weight),
          reps: parseInt(s.reps)
        }))
      }));
      
      if (validExercises.length === 0) return;
      
      onAdd({
        type: 'strength',
        date,
        exercises: validExercises
      });
      onClose();
    } else {
      if (!time || !calories || !distance) return;
      
      onAdd({
        type: 'airbike',
        date,
        time: parseInt(time),
        calories: parseInt(calories),
        distance: parseFloat(distance)
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">New workout</h2>
            <Button onClick={onClose} variant='secondary'>
              <X/>
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Workout type</label>
              <div className="flex gap-2">
                <Button
                  onClick={() => setWorkoutType('strength')}
                  size='lg'
                  className={`flex-1 py-2 rounded-lg transition-all ${
                    workoutType === 'strength'
                      ? 'bg-purple-500'
                      : 'bg-slate-700 hover:bg-slate-600'
                  } `}
                >
                  <Dumbbell/>
                  Strength
                </Button>
                <Button
                  onClick={() => setWorkoutType('airbike')}
                  size='lg'
                  className={`flex-1 py-2 rounded-lg transition-all  ${
                    workoutType === 'airbike'
                      ? 'bg-pink-500'
                      : 'bg-slate-700 hover:bg-slate-600'
                  } `}
                >
                  <Activity/>
                  Airbike
                </Button>
              </div>
            </div>

            {workoutType === 'strength' ? (
              <div className="space-y-4">
                {exercises.map((exercise, exIndex) => (
                  <div key={exIndex} className="bg-slate-700 rounded-lg p-4">
                    <select
                      value={exercise.name}
                      onChange={(e) => updateExercise(exIndex, 'name', e.target.value as "Squat" | "Bench Press" | "Deadlift")}
                      className="w-full bg-slate-600 rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="Squat">Squat</option>
                      <option value="Bench Press">Bench Press</option>
                      <option value="Deadlift">Deadlift</option>
                    </select>
                    
                    {exercise.sets.map((set, setIndex) => (
                      <div key={setIndex} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          inputMode="numeric"
                          onInput={(e) => {
                            const input = e.target as HTMLInputElement;
                            input.value = input.value.replace(/[^0-9]/g, '');
                          }}
                          placeholder="Weight (kg)"
                          value={set.weight}
                          onChange={(e) => updateSet(exIndex, setIndex, 'weight', e.target.value)}
                          className="w-full flex-1 bg-slate-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <input
                          type="text"
                          inputMode="numeric"
                          onInput={(e) => {
                            const input = e.target as HTMLInputElement;
                            input.value = input.value.replace(/[^0-9]/g, '');
                          }}
                          placeholder="Repetitions"
                          value={set.reps}
                          onChange={(e) => updateSet(exIndex, setIndex, 'reps', e.target.value)}
                          className="w-full flex-1 bg-slate-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    ))}

                    <Button
                      onClick={() => addSet(exIndex)}
                      variant='tertiary'
                    >
                      + Add set
                    </Button>
                  </div>
                ))}
                
                <Button
                  onClick={addExercise}
                  variant='tertiary'
                  fullWidth
                >
                  + Add exercise
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Time (minutes)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    onInput={(e) => {
                      const input = e.target as HTMLInputElement;
                      input.value = input.value.replace(/[^0-9]/g, '');
                    }}
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Calories</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    onInput={(e) => {
                      const input = e.target as HTMLInputElement;
                      input.value = input.value.replace(/[^0-9]/g, '');
                    }}
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    className="w-full bg-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Distance (km)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    onInput={(e) => {
                      const input = e.target as HTMLInputElement;
                      input.value = input.value.replace(/[^0-9.]/g, '');
                    }}
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    className="w-full bg-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant='secondary'
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
            >
              Save
            </Button>
          </div>
      </div>
    </div>
  );
};