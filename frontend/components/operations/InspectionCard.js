'use client';

import { memo } from 'react';
import FuelIndicator from '@/components/operations/FuelIndicator';
import OdometerCard from '@/components/operations/OdometerCard';
import ConditionBadge from '@/components/operations/ConditionBadge';
import ImageGallery from '@/components/operations/ImageGallery';

function InspectionCard({
  title = 'Vehicle inspection',
  fuelLevel,
  odometerReading,
  condition,
  notes,
  images,
  compareOdometer,
  className = '',
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="surface-card p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-primary">{title}</h3>
          {condition ? <ConditionBadge condition={condition} /> : null}
        </div>
        <FuelIndicator fuelLevel={fuelLevel} className="mb-5" />
        {notes ? (
          <div className="rounded-2xl border border-border bg-slate-50/80 px-4 py-3">
            <p className="text-xs font-medium tracking-wide text-muted uppercase">
              Inspection notes
            </p>
            <p className="mt-1 text-sm text-primary whitespace-pre-wrap">{notes}</p>
          </div>
        ) : null}
      </div>
      <OdometerCard
        reading={odometerReading}
        compareReading={compareOdometer}
        label="Odometer reading"
      />
      <ImageGallery images={images} />
    </div>
  );
}

export default memo(InspectionCard);
