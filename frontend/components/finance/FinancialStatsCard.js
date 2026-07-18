'use client';

import { memo } from 'react';
import StatCard from '@/components/dashboard/StatCard';

/** Thin alias so finance pages use a domain-named stats card. */
function FinancialStatsCard(props) {
  return <StatCard {...props} />;
}

export default memo(FinancialStatsCard);
