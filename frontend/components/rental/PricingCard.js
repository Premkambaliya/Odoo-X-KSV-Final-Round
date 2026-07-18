'use client';

import { memo } from 'react';
import { formatCurrency } from '@/lib/format';

function PricingCard({
  title = 'Pricing Summary',
  subtotal = 0,
  tax = 0,
  discount = 0,
  deposit = 0,
  lateFee = 0,
  grandTotal = 0,
  className = '',
}) {
  const hasLateFee = Number(lateFee) > 0;

  return (
    <div className={`surface-card p-5 sm:p-6 ${className}`}>
      <h3 className="text-base font-semibold text-primary">{title}</h3>
      <dl className="mt-4 space-y-3 text-sm">
        <Row label="Vehicle subtotal" value={formatCurrency(subtotal)} />
        <Row label="Tax" value={formatCurrency(tax)} />
        <Row label="Discount" value={`− ${formatCurrency(discount)}`} />
        <Row
          label="Security deposit"
          value={formatCurrency(deposit)}
          hint="Included in grand total"
        />
        {hasLateFee ? (
          <Row label="Late / penalty fees" value={formatCurrency(lateFee)} />
        ) : null}
        <div className="border-t border-border pt-3">
          <Row label="Grand total" value={formatCurrency(grandTotal)} strong />
        </div>
      </dl>
    </div>
  );
}

function Row({ label, value, strong, muted, hint }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className={strong ? 'font-semibold text-primary' : 'text-muted'}>
        <span className="block">{label}</span>
        {hint ? <span className="mt-0.5 block text-[11px] font-normal text-muted">{hint}</span> : null}
      </dt>
      <dd
        className={`tabular-nums ${
          strong
            ? 'text-lg font-semibold text-primary'
            : muted
              ? 'text-secondary'
              : 'font-medium text-primary'
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

export default memo(PricingCard);
