import React from 'react';
import { Trophy } from 'lucide-react';

interface LevelCardProps {
  level: number;
  totalXP: number;
  xpForNext: number;
  xpProgress: number;
};

export const LevelCard: React.FC<LevelCardProps> = ({
  level,
  totalXP,
  xpForNext,
  xpProgress
}) => {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-400" />
          <div>
            <div className="text-2xl font-bold">Level {level}</div>
            <div className="text-sm text-gray-300">{totalXP} total XP</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-300">To next level</div>
          <div className="font-bold">{xpForNext - totalXP} XP</div>
        </div>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-3">
        <div
          className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
          style={{ width: `${xpProgress}%` }}
        />
      </div>
    </div>
  );
};