import React from 'react';

type Achievement = {
  id: string;
  name: string;
  desc: string;
  icon: string;
};

type AchievementCardProps = {
  achievement: Achievement;
  unlocked: boolean;
};

export const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, unlocked }) => {
  return (
    <div
      className={`rounded-xl p-6 transition-all ${
        unlocked
          ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500'
          : 'bg-white/5 border-2 border-gray-700 opacity-50'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="text-4xl">{achievement.icon}</div>
        <div className="flex-1">
          <div className="font-bold text-lg mb-1">{achievement.name}</div>
          <div className="text-sm text-gray-300">{achievement.desc}</div>
          {unlocked && (
            <div className="mt-2 text-xs text-yellow-400 font-semibold">
              ✓ ODEMČENO
            </div>
          )}
        </div>
      </div>
    </div>
  );
};