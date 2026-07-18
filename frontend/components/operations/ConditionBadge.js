'use client';

import { memo } from 'react';
import OperationsStatusBadge from '@/components/operations/OperationsStatusBadge';

function ConditionBadge({ condition }) {
  return <OperationsStatusBadge status={condition} kind="condition" />;
}

export default memo(ConditionBadge);
