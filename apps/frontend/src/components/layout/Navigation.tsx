import React from 'react';
import { Button } from '../UI/Button';

type NavigationProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
};

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'workouts', label: 'Workouts' },
    { id: 'achievements', label: 'Achievements' }
  ];

  return (
    <div className="flex gap-2 bg-white/10 backdrop-blur-lg rounded-lg p-2">
      {tabs.map(tab => (
        <Button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 py-2 px-4 rounded-lg transition-all border-none ${
            activeTab === tab.id
              ? 'bg-gradient-to-r from-purple-500 to-pink-500'
              : 'bg-black hover:bg-white/10'
          }`}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
};