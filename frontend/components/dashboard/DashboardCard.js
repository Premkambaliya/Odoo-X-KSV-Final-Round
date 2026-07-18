'use client';

import { memo } from 'react';
import WidgetContainer from '@/components/dashboard/WidgetContainer';

function DashboardCard({ children, className = '', delay = 0, padded = true }) {
  return (
    <WidgetContainer className={className} delay={delay} padded={padded}>
      {children}
    </WidgetContainer>
  );
}

export default memo(DashboardCard);
