import React, { useState } from 'react';
import { Dumbbell, Activity, X } from 'lucide-react';
import type { Workout } from '../../types/workout.types';

type AddWorkoutModalProps = {
  onClose: () => void;
  onAdd: (workout: Workout) => void;
};

export const AddWorkoutModal: React.FC<AddWorkoutModalProps> = ({ onClose, onAdd }) => {
  const [workoutType, setWorkoutType] = useState<'strength' | 'airbike'>('strength');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Strength workout state
  const [exercises, setExercises] = useState([
    { name: '', sets: [{ weight: '', reps: '' }] }
  ]);
  
  // Airbike state
  const [time, setTime] = useState('');
  const [calories, setCalories] = useState('');
  const [distance, setDistance] = useState('');

  const addExercise = () => {
    setExercises([...exercises, { name: '', sets: [{ weight: '', reps: '' }] }]);
  };

  const addSet = (exerciseIndex: number) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].sets.push({ weight: '', reps: '' });
    setExercises(newExercises);
  };

  const updateExercise = (index: number, field: string, value: string) => {
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
    } else {
      if (!time || !calories || !distance) return;
      
      onAdd({
        type: 'airbike',
        date,
        time: parseInt(time),
        calories: parseInt(calories),
        distance: parseFloat(distance)
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Nový trénink</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Datum</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Typ tréninku</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setWorkoutType('strength')}
                  className={`flex-1 py-2 rounded-lg transition-all ${
                    workoutType === 'strength'
                      ? 'bg-purple-500'
                      : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  <Dumbbell className="w-5 h-5 mx-auto mb-1" />
                  Silový
                </button>
                <button
                  onClick={() => setWorkoutType('airbike')}
                  className={`flex-1 py-2 rounded-lg transition-all ${
                    workoutType === 'airbike'
                      ? 'bg-pink-500'
                      : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  <Activity className="w-5 h-5 mx-auto mb-1" />
                  Airbike
                </button>
              </div>
            </div>

            {workoutType === 'strength' ? (
              <div className="space-y-4">
                {exercises.map((exercise, exIndex) => (
                  <div key={exIndex} className="bg-slate-700 rounded-lg p-4">
                    <input
                      type="text"
                      placeholder="Název cviku (dřep, bench...)"
                      value={exercise.name}
                      onChange={(e) => updateExercise(exIndex, 'name', e.target.value)}
                      className="w-full bg-slate-600 rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    
                    {exercise.sets.map((set, setIndex) => (
                      <div key={setIndex} className="flex gap-2 mb-2">
                        <input
                          type="number"
                          placeholder="Váha (kg)"
                          value={set.weight}
                          onChange={(e) => updateSet(exIndex, setIndex, 'weight', e.target.value)}
                          className="flex-1 bg-slate-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <input
                          type="number"
                          placeholder="Opakování"
                          value={set.reps}
                          onChange={(e) => updateSet(exIndex, setIndex, 'reps', e.target.value)}
                          className="flex-1 bg-slate-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    ))}
                    
                    <button
                      onClick={() => addSet(exIndex)}
                      className="text-sm text-purple-400 hover:text-purple-300 mt-2"
                    >
                      + Přidat sérii
                    </button>
                  </div>
                ))}
                
                <button
                  onClick={addExercise}
                  className="w-full py-2 border-2 border-dashed border-gray-600 rounded-lg hover:border-purple-500 hover:bg-purple-500/10 transition-all"
                >
                  + Přidat cvik
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Čas (minuty)</label>
                  <input
                    type="number"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Kalorie</label>
                  <input
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    className="w-full bg-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Vzdálenost (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    className="w-full bg-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-all"
            >
              Zrušit
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg transition-all"
            >
              Uložit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};