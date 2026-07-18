'use client';

import { memo } from 'react';
import { Gauge } from 'lucide-react';

function OdometerCard({ reading, label = 'Odometer', compareReading, className = '' }) {
  const delta =
    compareReading != null && reading != null
      ? Number(reading) - Number(compareReading)
      : null;

  return (
    <div className={`surface-card p-5 ${className}`}>
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <Gauge size={18} aria-hidden />
        </span>
        <div>
          <p className="text-xs font-medium tracking-wide text-muted uppercase">
            {label}
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-primary">
            {reading != null ? Number(reading).toLocaleString('en-IN') : '—'}
            <span className="ml-1 text-sm font-medium text-muted">km</span>
          </p>
          {delta != null ? (
            <p className="mt-1 text-xs text-muted">
              Distance driven:{' '}
              <span className="font-semibold text-primary">
                {delta.toLocaleString('en-IN')} km
              </span>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default memo(OdometerCard);
