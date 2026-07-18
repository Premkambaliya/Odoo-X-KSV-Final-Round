'use client';

import { memo } from 'react';
import { parseFuelPercent } from '@/lib/operations';

function FuelIndicator({ fuelLevel, label = 'Fuel level', className = '' }) {
  const percent = parseFuelPercent(fuelLevel) ?? 0;
  const tone =
    percent >= 75
      ? 'bg-emerald-500'
      : percent >= 40
        ? 'bg-amber-500'
        : 'bg-rose-500';

  return (
    <div className={className} aria-label={`${label || 'Fuel'}: ${fuelLevel || '—'}`}>
      {label ? (
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-medium text-muted">{label}</span>
          <span className="font-semibold tabular-nums text-primary">
            {fuelLevel || '—'}
          </span>
        </div>
      ) : (
        <p className="mb-1 text-right text-[11px] font-semibold tabular-nums text-primary">
          {fuelLevel || '—'}
        </p>
      )}
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${tone}`}
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

export default memo(FuelIndicator);
