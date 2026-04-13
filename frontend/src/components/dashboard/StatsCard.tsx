import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  iconColor: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ icon: Icon, label, value, iconColor }) => {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
      <div className="flex items-center gap-3 mb-2">
        <Icon size={24} className={iconColor} />
        <div className="text-sm text-gray-300">{label}</div>
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
};