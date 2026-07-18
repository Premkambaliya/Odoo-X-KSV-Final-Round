'use client';

import { memo } from 'react';
import {
  ResponsiveContainer,
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#6366F1', '#94A3B8'];

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #E5E7EB',
  boxShadow: '0 8px 24px rgba(17,24,39,0.08)',
  fontSize: 12,
};

function BarChart({ data = [], dataKey = 'value', xKey = 'name' }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ReBarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
        <XAxis
          dataKey={xKey}
          tick={{ fill: '#6B7280', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: '#6B7280', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={36}
        />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(37,99,235,0.06)' }} />
        <Bar dataKey={dataKey} radius={[10, 10, 10, 10]} animationDuration={900}>
          {data.map((entry, index) => (
            <Cell key={entry.key || entry.name || index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </ReBarChart>
    </ResponsiveContainer>
  );
}

export default memo(BarChart);
