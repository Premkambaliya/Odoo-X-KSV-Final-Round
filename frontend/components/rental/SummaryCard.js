'use client';

import { memo } from 'react';
import { formatCurrency, formatDate } from '@/lib/format';

function SummaryCard({
  customer,
  period,
  pickupDate,
  returnDate,
  pickupLocation,
  returnLocation,
  vehicles = [],
  remarks,
}) {
  return (
    <div className="surface-card space-y-4 p-5 sm:p-6">
      <h3 className="text-base font-semibold text-primary">Booking Summary</h3>
      <div className="grid gap-3 text-sm sm:grid-cols-2">
        <Field label="Customer" value={customer} />
        <Field label="Rental period" value={period} />
        <Field label="Pickup" value={formatDate(pickupDate)} />
        <Field label="Return" value={formatDate(returnDate)} />
        <Field label="Pickup location" value={pickupLocation || '—'} />
        <Field label="Return location" value={returnLocation || '—'} />
      </div>
      <div>
        <p className="text-xs font-medium tracking-wide text-muted uppercase">Vehicles</p>
        <ul className="mt-2 space-y-1.5">
          {vehicles.map((v) => (
            <li key={v.id} className="text-sm text-secondary">
              {v.brand} {v.model} · {formatCurrency(v.basePrice)} / day base
            </li>
          ))}
        </ul>
      </div>
      {remarks ? (
        <div>
          <p className="text-xs font-medium tracking-wide text-muted uppercase">Notes</p>
          <p className="mt-1 text-sm text-secondary">{remarks}</p>
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-0.5 font-medium text-primary">{value || '—'}</p>
    </div>
  );
}

export default memo(SummaryCard);
