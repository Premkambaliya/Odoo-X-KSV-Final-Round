'use client';

import dynamic from 'next/dynamic';
import SkeletonLoader from '@/components/common/SkeletonLoader';

function ChartFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <SkeletonLoader height="85%" width="95%" rounded="xl" />
    </div>
  );
}

export const LineChart = dynamic(() => import('@/components/charts/LineChart'), {
  ssr: false,
  loading: () => <ChartFallback />,
});

export const BarChart = dynamic(() => import('@/components/charts/BarChart'), {
  ssr: false,
  loading: () => <ChartFallback />,
});

export const PieChart = dynamic(() => import('@/components/charts/PieChart'), {
  ssr: false,
  loading: () => <ChartFallback />,
});

export const AreaChart = dynamic(() => import('@/components/charts/AreaChart'), {
  ssr: false,
  loading: () => <ChartFallback />,
});
