'use client';

import ChartCard from '@/components/dashboard/ChartCard';
import EmptyState from '@/components/dashboard/EmptyState';
import SkeletonLoader from '@/components/common/SkeletonLoader';
import { PieChart } from '@/components/charts';

export default function VehicleStatusChart({ vehicles, loading }) {
  const rented = vehicles?.rented || 0;
  const reserved = vehicles?.reserved || 0;

  // Backend currently maps BOOKED to both rented + reserved; avoid double-counting in the pie.
  const data = [
    { name: 'Available', value: vehicles?.available || 0, color: '#10B981' },
    { name: 'Rented', value: rented, color: '#2563EB' },
    { name: 'Maintenance', value: vehicles?.maintenance || 0, color: '#F59E0B' },
    {
      name: 'Reserved',
      value: reserved === rented ? 0 : reserved,
      color: '#6366F1',
    },
  ];

  const hasData = data.some((d) => d.value > 0);

  return (
    <ChartCard
      title="Vehicle Status"
      description="Fleet availability snapshot"
      delay={0.12}
    >
      {loading ? (
        <div className="flex h-full items-center justify-center">
          <SkeletonLoader height="12rem" width="12rem" rounded="full" />
        </div>
      ) : !hasData ? (
        <EmptyState
          title="No vehicle data"
          description="Add vehicles to see availability distribution."
        />
      ) : (
        <PieChart data={data} />
      )}
    </ChartCard>
  );
}
