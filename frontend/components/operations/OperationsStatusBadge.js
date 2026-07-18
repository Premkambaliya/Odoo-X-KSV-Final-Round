'use client';

import { memo } from 'react';
import Badge from '@/components/ui/Badge';

const CONDITION = {
  EXCELLENT: { label: 'Excellent', tone: 'success' },
  GOOD: { label: 'Good', tone: 'accent' },
  SCRATCH: { label: 'Scratch', tone: 'warning' },
  DENT: { label: 'Dent', tone: 'warning' },
  BROKEN_PART: { label: 'Broken Part', tone: 'danger' },
};

const PENALTY = {
  UNPAID: { label: 'Unpaid', tone: 'warning' },
  PAID: { label: 'Paid', tone: 'success' },
  LATE_RETURN: { label: 'Late Return', tone: 'warning' },
  DAMAGE: { label: 'Damage', tone: 'danger' },
  CLEANING: { label: 'Cleaning', tone: 'accent' },
  TRAFFIC_FINE: { label: 'Traffic Fine', tone: 'admin' },
  OTHER: { label: 'Other', tone: 'default' },
};

const RENTAL = {
  PENDING: { label: 'Pending', tone: 'warning' },
  CONFIRMED: { label: 'Confirmed', tone: 'accent' },
  ACTIVE: { label: 'Active', tone: 'success' },
  COMPLETED: { label: 'Completed', tone: 'default' },
  CANCELLED: { label: 'Cancelled', tone: 'danger' },
  LATE: { label: 'Late', tone: 'danger' },
};

const VEHICLE = {
  AVAILABLE: { label: 'Available', tone: 'success' },
  BOOKED: { label: 'Rented / Reserved', tone: 'accent' },
  UNDER_MAINTENANCE: { label: 'Maintenance', tone: 'warning' },
  OUT_OF_SERVICE: { label: 'Out of Service', tone: 'danger' },
};

const MAPS = { condition: CONDITION, penalty: PENALTY, rental: RENTAL, vehicle: VEHICLE };

function OperationsStatusBadge({ status, kind = 'rental', label }) {
  if (!status && !label) return <Badge>—</Badge>;
  const map = MAPS[kind] || RENTAL;
  const meta = map[status] || { label: label || status, tone: 'default' };
  return <Badge tone={meta.tone}>{label || meta.label}</Badge>;
}

export default memo(OperationsStatusBadge);
