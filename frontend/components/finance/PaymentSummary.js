'use client';

import { memo } from 'react';
import { formatCurrency } from '@/lib/format';

function PaymentSummary({
  orderTotal,
  amountPaid,
  balance,
  paymentStatus,
  className = '',
}) {
  const rows = [
    { label: 'Amount due', value: orderTotal },
    { label: 'Amount paid', value: amountPaid },
    { label: 'Remaining balance', value: balance, emphasize: true },
  ];

  return (
    <div className={`surface-card overflow-hidden ${className}`}>
      <div className="border-b border-border bg-gradient-to-r from-slate-50 to-white px-5 py-4">
        <p className="text-xs font-medium tracking-wide text-muted uppercase">
          Payment summary
        </p>
        {paymentStatus ? (
          <p className="mt-1 text-sm font-semibold text-primary">
            Order status: {paymentStatus}
          </p>
        ) : null}
      </div>
      <dl className="divide-y divide-border/70 px-5">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-3 py-3.5"
          >
            <dt
              className={`text-sm ${
                row.emphasize ? 'font-semibold text-primary' : 'text-muted'
              }`}
            >
              {row.label}
            </dt>
            <dd
              className={`tabular-nums ${
                row.emphasize
                  ? 'text-lg font-semibold text-accent'
                  : 'text-sm font-medium text-primary'
              }`}
            >
              {formatCurrency(row.value)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default memo(PaymentSummary);
