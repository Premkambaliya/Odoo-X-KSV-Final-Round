'use client';

import { memo } from 'react';
import {
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

const COLORS = ['#10B981', '#2563EB', '#F59E0B', '#6366F1', '#94A3B8'];

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #E5E7EB',
  boxShadow: '0 8px 24px rgba(17,24,39,0.08)',
  fontSize: 12,
};

function PieChart({ data = [], dataKey = 'value', nameKey = 'name', innerRadius = 58 }) {
  const filtered = data.filter((d) => Number(d[dataKey]) > 0);
  const chartData = filtered.length ? filtered : data;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RePieChart>
        <Pie
          data={chartData}
          dataKey={dataKey}
          nameKey={nameKey}
          cx="50%"
          cy="46%"
          innerRadius={innerRadius}
          outerRadius={88}
          paddingAngle={3}
          animationDuration={900}
        >
          {chartData.map((entry, index) => (
            <Cell
              key={entry.name || index}
              fill={entry.color || COLORS[index % COLORS.length]}
              stroke="transparent"
            />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend
          verticalAlign="bottom"
          height={36}
          iconType="circle"
          wrapperStyle={{ fontSize: 12, color: '#6B7280' }}
        />
      </RePieChart>
    </ResponsiveContainer>
  );
}

export default memo(PieChart);
