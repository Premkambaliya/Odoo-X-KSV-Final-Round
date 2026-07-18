'use client';

import { memo } from 'react';
import { formatCurrency } from '@/lib/format';

function PricingCard({
  title = 'Pricing Summary',
  subtotal = 0,
  tax = 0,
  discount = 0,
  deposit = 0,
  grandTotal = 0,
  className = '',
}) {
  return (
    <div className={`surface-card p-5 sm:p-6 ${className}`}>
      <h3 className="text-base font-semibold text-primary">{title}</h3>
      <dl className="mt-4 space-y-3 text-sm">
        <Row label="Vehicle subtotal" value={formatCurrency(subtotal)} />
        <Row label="Tax" value={formatCurrency(tax)} />
        <Row label="Discount" value={`− ${formatCurrency(discount)}`} />
        <Row label="Security deposit (est.)" value={formatCurrency(deposit)} muted />
        <div className="border-t border-border pt-3">
          <Row label="Grand total" value={formatCurrency(grandTotal)} strong />
        </div>
      </dl>
    </div>
  );
}

function Row({ label, value, strong, muted }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className={`text-muted ${strong ? 'font-semibold text-primary' : ''}`}>{label}</dt>
      <dd
        className={`tabular-nums ${
          strong ? 'text-lg font-semibold text-primary' : muted ? 'text-secondary' : 'font-medium text-primary'
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

export default memo(PricingCard);
