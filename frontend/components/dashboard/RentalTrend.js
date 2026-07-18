'use client';

import ChartCard from '@/components/dashboard/ChartCard';
import EmptyState from '@/components/dashboard/EmptyState';
import SkeletonLoader from '@/components/common/SkeletonLoader';
import { AreaChart } from '@/components/charts';
import { toNumber } from '@/lib/format';

export default function RentalTrend({ trend = [], loading }) {
  const hasData = trend.some((p) => toNumber(p.value) > 0);

  return (
    <ChartCard
      title="Rental Trend"
      description="Bookings created over the last 14 days"
      delay={0.18}
    >
      {loading ? (
        <SkeletonLoader height="100%" rounded="xl" />
      ) : !hasData ? (
        <EmptyState
          title="No rental trend yet"
          description="The area chart fills in as rental orders are created."
        />
      ) : (
        <AreaChart data={trend} color="#10B981" />
      )}
    </ChartCard>
  );
}
