'use client';

import Badge from '@/components/ui/Badge';
import { ROLES } from '@/constants/roles';

export default function RoleBadge({ role, className = '' }) {
  if (!role) return null;

  const tone = role === ROLES.ADMIN ? 'admin' : 'customer';

  return (
    <Badge tone={tone} className={className}>
      {role}
    </Badge>
  );
}
