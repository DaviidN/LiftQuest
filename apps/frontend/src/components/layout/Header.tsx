import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../UI/Button';

type HeaderProps = {
  onAddWorkout: () => void;
};

export const Header: React.FC<HeaderProps> = ({ onAddWorkout }) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent pb-1">
        Training Tracker
      </h1>
      <Button onClick={onAddWorkout} icon={Plus}>
        New Workout
      </Button>
    </div>
  );
};