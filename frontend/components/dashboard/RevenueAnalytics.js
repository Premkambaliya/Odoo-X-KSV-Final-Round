'use client';

import ChartCard from '@/components/dashboard/ChartCard';
import EmptyState from '@/components/dashboard/EmptyState';
import SkeletonLoader from '@/components/common/SkeletonLoader';
import { LineChart } from '@/components/charts';
import { formatCurrency, toNumber } from '@/lib/format';

export default function RevenueAnalytics({ periods, trend = [], loading }) {
  const chips = [
    { label: 'Daily', value: periods?.today },
    { label: 'Weekly', value: periods?.weekly },
    { label: 'Monthly', value: periods?.monthly },
    { label: 'Yearly', value: periods?.yearly },
  ];

  const hasTrend = trend.some((p) => toNumber(p.value) > 0);

  return (
    <ChartCard
      title="Revenue Analytics"
      description="Successful payment trends over the last 14 days"
      delay={0.14}
      height="h-auto"
      action={null}
    >
      <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {chips.map((chip) => (
          <div
            key={chip.label}
            className="rounded-2xl border border-border bg-slate-50/80 px-3 py-2.5"
          >
            <p className="text-[10px] font-semibold tracking-wide text-muted uppercase">
              {chip.label}
            </p>
            {loading ? (
              <SkeletonLoader className="mt-2" height="1.25rem" width="70%" />
            ) : (
              <p className="mt-1 text-sm font-semibold tabular-nums text-primary">
                {formatCurrency(chip.value, { compact: true })}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="h-[240px]">
        {loading ? (
          <SkeletonLoader height="100%" rounded="xl" />
        ) : !hasTrend ? (
          <EmptyState
            title="No revenue trend yet"
            description="Charts populate as successful payments are recorded."
          />
        ) : (
          <LineChart
            data={trend}
            formatter={(v) => formatCurrency(v, { compact: true })}
          />
        )}
      </div>
    </ChartCard>
  );
}
