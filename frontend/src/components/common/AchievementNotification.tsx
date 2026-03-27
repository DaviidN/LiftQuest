import React from 'react';
import { Award } from 'lucide-react';

interface AchievementNotificationProps {
  achievementName: string;
}

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievementName
}) => {
  return (
    <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-yellow-500 to-orange-500 p-4 rounded-lg shadow-2xl animate-bounce">
      <div className="flex items-center gap-3">
        <Award className="w-8 h-8" />
        <div>
          <div className="font-bold">Achievement Unlocked!</div>
          <div className="text-sm">{achievementName}</div>
        </div>
      </div>
    </div>
  );
};