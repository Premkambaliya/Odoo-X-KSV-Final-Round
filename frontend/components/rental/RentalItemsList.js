'use client';

import { memo } from 'react';
import { itemLineTotal } from '@/lib/rental';
import { formatCurrency } from '@/lib/format';
import EmptyState from '@/components/dashboard/EmptyState';

function RentalItemsList({ items = [], onRemove, canRemove = false }) {
  if (!items.length) {
    return (
      <EmptyState
        title="No vehicles attached"
        description="Add vehicles to this rental while the order is still pending."
      />
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const vehicle = item.vehicle;
        const image = vehicle?.images?.[0]?.imageUrl || vehicle?.thumbnail;
        return (
          <li
            key={item.id}
            className="flex flex-col gap-3 rounded-2xl border border-border p-3 sm:flex-row sm:items-center"
          >
            <div className="h-20 w-full overflow-hidden rounded-xl bg-slate-100 sm:w-28">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[10px] text-muted">
                  No img
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-primary">
                {vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Vehicle'}
              </p>
              <p className="text-xs text-muted">{vehicle?.registrationNumber}</p>
              <p className="mt-1 text-xs text-secondary">
                Qty {item.quantity || 1} · Unit {formatCurrency(item.unitPrice)}
              </p>
            </div>
            <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
              <p className="font-semibold tabular-nums text-primary">
                {formatCurrency(itemLineTotal(item))}
              </p>
              {canRemove ? (
                <button
                  type="button"
                  onClick={() => onRemove?.(item)}
                  className="text-xs font-semibold text-danger hover:underline"
                >
                  Remove
                </button>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default memo(RentalItemsList);
