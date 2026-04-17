import React from 'react';
import { Dumbbell, Activity, Flame } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { VolumeChart } from './VolumeChart';

interface DashboardProps {
  strengthWorkouts: number;
  cardioWorkouts: number;
  workoutStreak: {current: number, best: number};
  volumeData: Array<{ date: string; volume: number }>;
}

export const Dashboard: React.FC<DashboardProps> = ({
  strengthWorkouts,
  cardioWorkouts,
  workoutStreak,
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
          label="Cardio"
          value={cardioWorkouts}
          iconColor="text-pink-400"
        />
        <StatsCard
          icon={Flame}
          label="Current streak"
          value={workoutStreak}
          iconColor="text-orange-400"
        />
      </div>
      <VolumeChart data={volumeData} />
    </>
  );
};