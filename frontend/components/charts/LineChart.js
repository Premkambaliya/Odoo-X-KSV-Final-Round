'use client';

import { memo } from 'react';
import {
  ResponsiveContainer,
  LineChart as ReLineChart,
  Line,
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

function LineChart({
  data = [],
  dataKey = 'value',
  xKey = 'label',
  color = '#2563EB',
  formatter,
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ReLineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
        <XAxis
          dataKey={xKey}
          tick={{ fill: '#6B7280', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#6B7280', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={48}
          tickFormatter={formatter}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value) => (formatter ? formatter(value) : value)}
        />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 5, strokeWidth: 0 }}
          animationDuration={900}
        />
      </ReLineChart>
    </ResponsiveContainer>
  );
}

export default memo(LineChart);
