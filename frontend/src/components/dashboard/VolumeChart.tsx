import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface VolumeChartProps {
  strengthData: Array<{ date: string; volume: number }>;
  cardioData: Array<{ date: string; calories: number }>;
}

export const VolumeChart: React.FC<VolumeChartProps> = ({ strengthData, cardioData }) => {
  if (strengthData.length === 0 && cardioData.length === 0) return null;

  const merged: Record<string, { date: string; volume?: number; calories?: number }> = {};

  strengthData.forEach(d => {
    merged[d.date] = { ...merged[d.date], date: d.date, volume: (merged[d.date]?.volume ?? 0) + d.volume };
  });
  cardioData.forEach(d => {
    merged[d.date] = { ...merged[d.date], date: d.date, calories: (merged[d.date]?.calories ?? 0) + d.calories };
  });

  const data = Object.values(merged).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6">
      <h3 className="text-xl font-bold mb-4">Activity (last 30 days)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} cursor={false}
          />
          <Legend />
          <Bar dataKey="volume" name="Strength (kg)" fill="#8b5cf6" activeBar={{ fill: '#a78bfa' }} />
          <Bar dataKey="calories" name="Cardio (kcal)" fill="#ec4899" activeBar={{ fill: '#f472b6' }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};