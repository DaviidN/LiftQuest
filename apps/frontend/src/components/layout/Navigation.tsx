import React from 'react';

type NavigationProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
};

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'workouts', label: 'Tréninky' },
    { id: 'achievements', label: 'Achievementy' }
  ];

  return (
    <div className="flex gap-2 bg-white/10 backdrop-blur-lg rounded-lg p-2">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 py-2 px-4 rounded-lg transition-all ${
            activeTab === tab.id
              ? 'bg-gradient-to-r from-purple-500 to-pink-500'
              : 'hover:bg-white/10'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};