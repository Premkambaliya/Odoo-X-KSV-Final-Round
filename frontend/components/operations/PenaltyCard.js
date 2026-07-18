'use client';

import { memo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertTriangle, Eye } from 'lucide-react';
import OperationsStatusBadge from '@/components/operations/OperationsStatusBadge';
import Button from '@/components/ui/Button';
import { APP_ROUTES } from '@/constants/routes';
import { customerName, formatCurrency } from '@/lib/format';

function PenaltyCard({ penalty, delay = 0 }) {
  if (!penalty) return null;
  const order = penalty.rentalOrder;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="surface-card flex flex-col gap-4 p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-warning">
            <AlertTriangle size={18} aria-hidden />
          </span>
          <div>
            <p className="font-semibold tabular-nums text-primary">
              {formatCurrency(penalty.amount)}
            </p>
            <p className="text-xs text-muted">
              {order?.bookingNumber || 'Penalty'}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <OperationsStatusBadge status={penalty.type} kind="penalty" />
          <OperationsStatusBadge status={penalty.status} kind="penalty" />
        </div>
      </div>

      <p className="line-clamp-2 text-sm text-muted">{penalty.reason}</p>
      <p className="text-xs text-muted">{customerName(order?.customer)}</p>

      <div className="border-t border-border pt-3">
        <Link href={APP_ROUTES.ADMIN.PENALTY_DETAIL(penalty.id)}>
          <Button variant="outline" size="sm">
            <Eye size={14} />
            View penalty
          </Button>
        </Link>
      </div>
    </motion.article>
  );
}

export default memo(PenaltyCard);
