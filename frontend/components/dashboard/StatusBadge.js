'use client';

import Badge from '@/components/ui/Badge';

const STATUS_META = {
  PENDING: { label: 'Pending', tone: 'warning' },
  CONFIRMED: { label: 'Confirmed', tone: 'accent' },
  ACTIVE: { label: 'Active', tone: 'success' },
  COMPLETED: { label: 'Completed', tone: 'default' },
  CANCELLED: { label: 'Cancelled', tone: 'danger' },
  LATE: { label: 'Late', tone: 'danger' },
  SUCCESS: { label: 'Paid', tone: 'success' },
  FAILED: { label: 'Failed', tone: 'danger' },
  REFUNDED: { label: 'Refunded', tone: 'warning' },
  PAID: { label: 'Paid', tone: 'success' },
  PARTIAL: { label: 'Partial', tone: 'warning' },
  UNPAID: { label: 'Unpaid', tone: 'warning' },
  DRAFT: { label: 'Draft', tone: 'default' },
  SENT: { label: 'Sent', tone: 'accent' },
  ACCEPTED: { label: 'Accepted', tone: 'success' },
  REJECTED: { label: 'Rejected', tone: 'danger' },
  EXPIRED: { label: 'Expired', tone: 'warning' },
};

export default function StatusBadge({ status, label }) {
  if (!status && !label) return <Badge>—</Badge>;
  const meta = STATUS_META[status] || {
    label: label || status || '—',
    tone: 'default',
  };
  return <Badge tone={meta.tone}>{label || meta.label}</Badge>;
}
