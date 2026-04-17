import React, { useState, useRef, useEffect } from 'react';
import { Dumbbell, Activity, X } from 'lucide-react';
import type { Workout } from '../../types/workout.types';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';

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
  const [workoutType, setWorkoutType] = useState<'strength' | 'cardio'>('strength');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [errorMessage, setErrorMessage] = useState('');
  const [validExercises, setValidExercises] = useState<StrengthExercise[]>([]);
  const [validWorkout, setValidWorkout] = useState(false);

  const lastExerciseRef = useRef<HTMLDivElement | null>(null);

  // Strength workout state
  const [exercises, setExercises] = useState<StrengthExercise[]>([
    { name: 'Squat', sets: [{ weight: '', reps: '' }] }
  ]);
  
  // Cardio state
  const [time, setTime] = useState('');
  const [calories, setCalories] = useState('');
  const [distance, setDistance] = useState('');


  useEffect(() => {
    if (workoutType === 'strength') {
      const filtered = exercises.filter(ex =>
        ex.name && ex.sets.some(s => s.weight && s.reps)
      );
      setValidExercises(filtered);
      setValidWorkout(filtered.length > 0);
    } else {
      setValidWorkout(time !== '' && calories !== '' && distance !== '');
      setValidExercises([]); // Clear when not in strength mode
    }
  }, [workoutType, exercises, time, calories, distance]);

  const addExercise = () => {
    setExercises([...exercises, { name: 'Squat', sets: [{ weight: '', reps: '' }] }]);
    setTimeout(() => {
      lastExerciseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 0);
  };

  const removeExercise = () => {
    const newExercises = exercises.filter((_, index) => index !== exercises.length - 1);
    setExercises(newExercises);
    setTimeout(() => {
      lastExerciseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 0);
  }

  const addSet = (exerciseIndex: number) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].sets.push({ weight: '', reps: '' });
    setExercises(newExercises);
  };

  const removeSet = (exerciseIndex: number) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].sets.pop();
    setExercises(newExercises);
  }

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
      if (!validWorkout) {
          setErrorMessage('* Please fill in all fields!');
        return;
      }
      const mappedExercises = validExercises.map(ex => ({
      ...ex,
      sets: ex.sets
        .filter(s => s.weight && s.reps)
        .map(s => ({
          weight: parseFloat(s.weight),
          reps: parseInt(s.reps)
        }))
    }));


      onAdd({
        type: 'strength',
        date,
        exercises: mappedExercises
      });
      onClose();
    } else {
      if (!validWorkout) {
        setErrorMessage('* Please fill in all fields!');
        return;
      }
      
      onAdd({
        type: 'cardio',
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
      <div className="bg-secondary rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">New workout</h2>
            <Button onClick={onClose} variant='secondary'>
              <X size={20}/>
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Workout type</label>
              <div className="flex gap-2">
                <Button
                  variant={workoutType === 'strength' ? 'primary' : 'secondary'}
                  onClick={() => setWorkoutType('strength')}
                  size='lg'
                  className={'flex-1 py-2 rounded-lg transition-all'}
                >
                  <Dumbbell size={20}/>
                  Strength
                </Button>
                <Button
                  variant={workoutType === 'cardio' ? 'primary' : 'secondary'}
                  onClick={() => setWorkoutType('cardio')}
                  size='lg'
                  className={'flex-1 py-2 rounded-lg transition-all'}
                >
                  <Activity size={20}/>
                  Cardio
                </Button>
              </div>
            </div>

            {workoutType === 'strength' ? 
              <>
              <div className="space-y-4 max-sm:max-h-[300px] max-h-[600px] overflow-y-auto">
              {exercises.map((exercise, exIndex) => (
                  <div 
                    key={exIndex} 
                    ref={exIndex === exercises.length - 1 ? lastExerciseRef : null}
                    className="bg-slate-700 rounded-lg p-4" 
                  >
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
                        <Input
                          type="text"
                          placeholder="Weight (kg)"
                          value={set.weight}
                          onChange={(e) => updateSet(exIndex, setIndex, 'weight', e.target.value)}                 
                        />
                        <Input
                          type="text"
                          placeholder="Repetitions"
                          value={set.reps}
                          onChange={(e) => updateSet(exIndex, setIndex, 'reps', e.target.value)}
                        />
                      </div>
                    ))}
                    <div className="flex justify-between">
                      <Button
                        onClick={() => addSet(exIndex)}
                        variant='tertiary'
                      >
                        + Add set
                      </Button>
                     { exercise.sets.length > 1 &&
                      <Button
                        onClick={() => removeSet(exIndex)}
                        variant='secondary'
                      >
                        - Remove set
                      </Button>
                      }
                    </div>
                  </div>
                ))}
              </div>
                <div className="flex gap-2 justify-between">
                  <Button
                    onClick={addExercise}
                    variant='tertiary'
                    className={`transition-all duration-300 ${
                      exercises.length > 1 ? "w-1/2" : "w-full"
                    }`}
                  >
                    <span className="sm:hidden">+ Add</span>
                    <span className="hidden sm:inline">+ Add exercise</span>
                  </Button>

                {exercises.length > 1 && 
                  <Button
                    onClick={() => removeExercise()}
                    variant='secondary'
                    className='w-1/2'
                  >
                    <span className="sm:hidden">- Remove</span>
                    <span className="hidden sm:inline">- Remove exercise</span>
                  </Button>
                }
                </div>
                </>
             : 
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Time (minutes)</label>
                  <Input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Calories</label>
                  <Input
                    type="text"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Distance (km)</label>
                  <Input
                    type="text"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    />
                </div>
              </div>
            }
          </div>
            {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}
          <div className="flex gap-3 mt-6">
            <Button
              variant='secondary'
              onClick={onClose}
              className="flex-1"
              size='lg'
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              size='lg'
              variant='primary'
              disabled={!validWorkout}
            >
              Save
            </Button>
          </div>
      </div>
    </div>
  );
};