import React from 'react';
import { Plus } from 'lucide-react';

type HeaderProps = {
  onAddWorkout: () => void;
};

export const Header: React.FC<HeaderProps> = ({ onAddWorkout }) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
        Tréninkový Deník
      </h1>
      <button
        onClick={onAddWorkout}
        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
      >
        <Plus className="w-5 h-5" />
        Nový trénink
      </button>
    </div>
  );
};