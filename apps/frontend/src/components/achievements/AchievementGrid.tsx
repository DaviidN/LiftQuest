import React from 'react';
import { AchievementCard } from './AchievementCard';

type Achievement = {
  id: string;
  name: string;
  desc: string;
  icon: string;
};

type AchievementGridProps = {
  achievements: Achievement[];
  unlockedAchievements: string[];
};

export const AchievementGrid: React.FC<AchievementGridProps> = ({
  achievements,
  unlockedAchievements
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {achievements.map(achievement => (
        <AchievementCard
          key={achievement.id}
          achievement={achievement}
          unlocked={unlockedAchievements.includes(achievement.id)}
        />
      ))}
    </div>
  );
};