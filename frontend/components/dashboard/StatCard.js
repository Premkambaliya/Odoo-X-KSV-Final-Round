'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import useAnimatedCounter from '@/hooks/useAnimatedCounter';
import { formatCurrency, formatNumber, toNumber } from '@/lib/format';
import SkeletonLoader from '@/components/common/SkeletonLoader';

const toneStyles = {
  accent: 'from-blue-500/15 to-blue-500/5 text-accent',
  success: 'from-emerald-500/15 to-emerald-500/5 text-success',
  warning: 'from-amber-500/15 to-amber-500/5 text-warning',
  danger: 'from-rose-500/15 to-rose-500/5 text-danger',
  secondary: 'from-slate-500/15 to-slate-500/5 text-secondary',
};

function StatCard({
  title,
  value = 0,
  description,
  icon: Icon,
  tone = 'accent',
  format = 'number',
  loading = false,
  delay = 0,
}) {
  const animated = useAnimatedCounter(toNumber(value), {
    enabled: !loading,
    duration: 1000,
  });

  const display =
    format === 'currency'
      ? formatCurrency(animated)
      : formatNumber(Math.round(animated));

  if (loading) {
    return (
      <div className="surface-card p-5">
        <div className="flex items-start justify-between gap-3">
          <SkeletonLoader height="2.5rem" width="2.5rem" rounded="xl" />
          <SkeletonLoader height="0.75rem" width="40%" />
        </div>
        <SkeletonLoader className="mt-5" height="1.75rem" width="55%" />
        <SkeletonLoader className="mt-3" height="0.75rem" width="75%" />
      </div>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="surface-card group relative overflow-hidden p-5"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white via-transparent to-slate-50/80 opacity-0 transition group-hover:opacity-100" />

      <div className="relative flex items-start justify-between gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${toneStyles[tone]}`}
        >
          {Icon ? <Icon size={20} strokeWidth={1.9} aria-hidden /> : null}
        </div>
      </div>

      <p className="relative mt-4 text-xs font-medium tracking-wide text-muted uppercase">
        {title}
      </p>
      <p
        className="relative mt-1 text-2xl font-semibold tracking-tight text-primary tabular-nums"
        aria-label={`${title}: ${display}`}
      >
        {display}
      </p>
      {description ? (
        <p className="relative mt-2 text-xs leading-relaxed text-muted">{description}</p>
      ) : null}
    </motion.article>
  );
}

export default memo(StatCard);
