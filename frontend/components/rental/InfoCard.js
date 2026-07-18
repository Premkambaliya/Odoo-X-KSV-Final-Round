'use client';

import { memo } from 'react';

function InfoCard({ title, children, className = '' }) {
  return (
    <div className={`surface-card p-5 sm:p-6 ${className}`}>
      {title ? (
        <h3 className="mb-4 text-base font-semibold text-primary">{title}</h3>
      ) : null}
      {children}
    </div>
  );
}

export function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/70 py-2.5 last:border-0">
      <dt className="text-xs font-medium tracking-wide text-muted uppercase">{label}</dt>
      <dd className="text-right text-sm font-medium text-primary">{value || '—'}</dd>
    </div>
  );
}

export default memo(InfoCard);
