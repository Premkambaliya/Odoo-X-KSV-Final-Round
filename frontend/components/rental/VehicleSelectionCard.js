'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import StatusBadge from '@/components/master/StatusBadge';
import { formatCurrency } from '@/lib/format';
import { previewVehiclePrice } from '@/lib/rental';

function VehicleSelectionCard({
  vehicle,
  selected = false,
  disabled = false,
  periodDays = 1,
  onToggle,
}) {
  const image = vehicle.images?.[0]?.imageUrl || vehicle.thumbnail || null;
  const linePrice = previewVehiclePrice(vehicle, periodDays);

  return (
    <motion.button
      type="button"
      whileHover={disabled ? undefined : { y: -3 }}
      disabled={disabled}
      onClick={() => onToggle?.(vehicle)}
      aria-pressed={selected}
      className={`
        surface-card w-full overflow-hidden text-left transition
        ${selected ? 'border-accent ring-4 ring-accent/15' : 'hover:border-slate-300'}
        ${disabled ? 'cursor-not-allowed opacity-55' : ''}
      `}
    >
      <div className="relative h-36 bg-slate-100">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted">
            No image
          </div>
        )}
        <div className="absolute top-2 left-2">
          <StatusBadge status={vehicle.availabilityStatus} />
        </div>
        {selected ? (
          <span className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-white">
            <Check size={14} />
          </span>
        ) : null}
      </div>
      <div className="space-y-1 p-4">
        <p className="font-semibold text-primary">
          {vehicle.brand} {vehicle.model}
        </p>
        <p className="text-xs text-muted">{vehicle.registrationNumber}</p>
        <p className="text-xs text-secondary">
          {vehicle.transmission} · {vehicle.fuelType} · {vehicle.seatCapacity} seats
        </p>
        <p className="pt-1 text-sm font-semibold tabular-nums text-accent">
          {formatCurrency(linePrice)}
          <span className="ml-1 text-xs font-medium text-muted">/ period</span>
        </p>
      </div>
    </motion.button>
  );
}

export default memo(VehicleSelectionCard);
