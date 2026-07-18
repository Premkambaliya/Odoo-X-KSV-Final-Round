'use client';

import { memo } from 'react';
import { Shield } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import PaymentStatusBadge from '@/components/finance/PaymentStatusBadge';
import Button from '@/components/ui/Button';
import { APP_ROUTES } from '@/constants/routes';
import { remainingDeposit } from '@/lib/finance';
import { customerName, formatCurrency, formatDate } from '@/lib/format';

function DepositCard({ deposit, delay = 0 }) {
  if (!deposit) return null;
  const order = deposit.rentalOrder;
  const remaining = remainingDeposit(deposit);

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="surface-card flex flex-col gap-4 p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
            <Shield size={18} aria-hidden />
          </span>
          <div>
            <p className="font-semibold text-primary">
              {formatCurrency(deposit.amountCollected)}
            </p>
            <p className="text-xs text-muted">
              {order?.bookingNumber || 'Security deposit'}
            </p>
          </div>
        </div>
        <PaymentStatusBadge status={deposit.refundStatus} />
      </div>

      <dl className="grid gap-2 text-sm">
        <div className="flex justify-between gap-2">
          <dt className="text-muted">Customer</dt>
          <dd className="font-medium text-primary">
            {customerName(order?.customer)}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-muted">Remaining</dt>
          <dd className="font-medium tabular-nums text-primary">
            {formatCurrency(remaining)}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-muted">Refunded</dt>
          <dd className="tabular-nums">
            {formatCurrency(deposit.amountRefunded)}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-muted">Collected</dt>
          <dd className="text-muted">{formatDate(deposit.createdAt)}</dd>
        </div>
      </dl>

      <div className="border-t border-border pt-3">
        <Link href={APP_ROUTES.ADMIN.SECURITY_DEPOSIT_DETAIL(deposit.id)}>
          <Button variant="outline" size="sm">
            View details
          </Button>
        </Link>
      </div>
    </motion.article>
  );
}

export default memo(DepositCard);
