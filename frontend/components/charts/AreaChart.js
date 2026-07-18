'use client';

import { memo } from 'react';
import {
  ResponsiveContainer,
  AreaChart as ReAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #E5E7EB',
  boxShadow: '0 8px 24px rgba(17,24,39,0.08)',
  fontSize: 12,
};

function AreaChart({
  data = [],
  dataKey = 'value',
  xKey = 'label',
  color = '#2563EB',
}) {
  const gradientId = `area-${color.replace('#', '')}`;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ReAreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
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
        <Tooltip contentStyle={tooltipStyle} />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2.5}
          fill={`url(#${gradientId})`}
          animationDuration={900}
        />
      </ReAreaChart>
    </ResponsiveContainer>
  );
}

export default memo(AreaChart);
