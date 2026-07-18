'use client';

import ChartCard from '@/components/dashboard/ChartCard';
import EmptyState from '@/components/dashboard/EmptyState';
import SkeletonLoader from '@/components/common/SkeletonLoader';
import { BarChart } from '@/components/charts';

export default function PaymentAnalytics({ methods = [], loading }) {
  const hasData = methods.some((m) => m.value > 0);

  return (
    <ChartCard
      title="Payment Analytics"
      description="Distribution by payment method"
      delay={0.16}
    >
      {loading ? (
        <SkeletonLoader height="100%" rounded="xl" />
      ) : !hasData ? (
        <EmptyState
          title="No payment methods yet"
          description="Method mix appears once payments are captured."
        />
      ) : (
        <BarChart data={methods} />
      )}
    </ChartCard>
  );
}
