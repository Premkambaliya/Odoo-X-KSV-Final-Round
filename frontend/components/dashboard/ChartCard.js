'use client';

import { memo } from 'react';
import SectionHeader from '@/components/dashboard/SectionHeader';
import WidgetContainer from '@/components/dashboard/WidgetContainer';

function ChartCard({
  title,
  description,
  action,
  children,
  className = '',
  delay = 0,
  height = 'h-[280px]',
}) {
  return (
    <WidgetContainer className={className} delay={delay}>
      <SectionHeader title={title} description={description} action={action} />
      <div className={`w-full ${height}`}>{children}</div>
    </WidgetContainer>
  );
}

export default memo(ChartCard);
