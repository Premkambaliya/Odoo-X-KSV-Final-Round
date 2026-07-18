'use client';

import Badge from '@/components/ui/Badge';
import { VEHICLE_AVAILABILITY } from '@/constants/masterData';

const map = {
  [VEHICLE_AVAILABILITY.AVAILABLE]: { label: 'Available', tone: 'success' },
  [VEHICLE_AVAILABILITY.BOOKED]: { label: 'Rented', tone: 'accent' },
  [VEHICLE_AVAILABILITY.UNDER_MAINTENANCE]: { label: 'Maintenance', tone: 'warning' },
  [VEHICLE_AVAILABILITY.OUT_OF_SERVICE]: { label: 'Out of Service', tone: 'danger' },
  RESERVED: { label: 'Reserved', tone: 'admin' },
  ACTIVE: { label: 'Active', tone: 'success' },
  INACTIVE: { label: 'Inactive', tone: 'default' },
};

export default function StatusBadge({ status, active }) {
  if (typeof active === 'boolean') {
    const meta = active ? map.ACTIVE : map.INACTIVE;
    return <Badge tone={meta.tone}>{meta.label}</Badge>;
  }

  const meta = map[status] || { label: status || '—', tone: 'default' };
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}
