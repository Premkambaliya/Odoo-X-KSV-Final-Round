'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownLeft, ArrowUpRight, RefreshCw } from 'lucide-react';
import PaymentStatusBadge from '@/components/finance/PaymentStatusBadge';
import { formatCurrency, formatDateTime } from '@/lib/format';

const ICONS = {
  payment: ArrowDownLeft,
  refund: ArrowUpRight,
  deposit: RefreshCw,
};

function TransactionCard({
  title,
  amount,
  status,
  method,
  date,
  reference,
  type = 'payment',
  delay = 0,
}) {
  const Icon = ICONS[type] || ArrowDownLeft;
  const isRefund = type === 'refund';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="flex items-start gap-3 rounded-2xl border border-border/80 bg-white px-4 py-3"
    >
      <span
        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
          isRefund ? 'bg-amber-50 text-warning' : 'bg-emerald-50 text-success'
        }`}
      >
        <Icon size={16} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-primary">{title}</p>
          <p
            className={`text-sm font-semibold tabular-nums ${
              isRefund ? 'text-warning' : 'text-primary'
            }`}
          >
            {isRefund ? '−' : '+'}
            {formatCurrency(amount)}
          </p>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          {status ? <PaymentStatusBadge status={status} /> : null}
          {method ? <PaymentStatusBadge status={method} /> : null}
        </div>
        <p className="mt-1.5 text-xs text-muted">
          {formatDateTime(date)}
          {reference ? ` · Ref ${reference}` : ''}
        </p>
      </div>
    </motion.div>
  );
}

export default memo(TransactionCard);
