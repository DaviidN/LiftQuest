import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface VolumeChartProps {
  data: Array<{ date: string; volume: number }>;
}

export const VolumeChart: React.FC<VolumeChartProps> = ({ data }) => {
  if (data.length === 0) return null;

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6">
      <h3 className="text-xl font-bold mb-4">Volume (last 30 days)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} cursor={false}
          />
          <Bar dataKey="volume" fill="#8b5cf6" activeBar={{ fill: '#a78bfa' }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};