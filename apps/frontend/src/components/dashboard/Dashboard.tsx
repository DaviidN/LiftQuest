import React from 'react';
import { Dumbbell, Activity, Flame } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { VolumeChart } from './VolumeChart';

interface DashboardProps {
  strengthWorkouts: number;
  airbikeWorkouts: number;
  currentStreak: number;
  volumeData: Array<{ date: string; volume: number }>;
}

export const Dashboard: React.FC<DashboardProps> = ({
  strengthWorkouts,
  airbikeWorkouts,
  currentStreak,
  volumeData
}) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatsCard
          icon={Dumbbell}
          label="Strength workouts"
          value={strengthWorkouts}
          iconColor="text-purple-400"
        />
        <StatsCard
          icon={Activity}
          label="Airbike"
          value={airbikeWorkouts}
          iconColor="text-pink-400"
        />
        <StatsCard
          icon={Flame}
          label="Current streak"
          value={currentStreak}
          iconColor="text-orange-400"
        />
      </div>
      <VolumeChart data={volumeData} />
    </>
  );
};