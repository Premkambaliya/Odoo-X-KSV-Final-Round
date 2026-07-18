'use client';

import { memo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PackageCheck, Eye } from 'lucide-react';
import FuelIndicator from '@/components/operations/FuelIndicator';
import Button from '@/components/ui/Button';
import { APP_ROUTES } from '@/constants/routes';
import { customerName, formatDateTime, vehicleLabel } from '@/lib/format';

function PickupCard({ pickup, delay = 0 }) {
  if (!pickup) return null;
  const order = pickup.rentalOrder;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="surface-card flex flex-col gap-4 p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-success">
            <PackageCheck size={18} aria-hidden />
          </span>
          <div>
            <p className="font-semibold text-primary">
              {order?.bookingNumber || 'Pickup'}
            </p>
            <p className="text-xs text-muted">
              {formatDateTime(pickup.pickupTime)}
            </p>
          </div>
        </div>
      </div>

      <dl className="grid gap-2 text-sm">
        <div className="flex justify-between gap-2">
          <dt className="text-muted">Customer</dt>
          <dd className="font-medium text-primary">
            {customerName(order?.customer)}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-muted">Vehicle</dt>
          <dd className="text-right font-medium text-primary">
            {vehicleLabel(order?.rentalItems)}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-muted">Handled by</dt>
          <dd className="font-medium text-primary">{pickup.executiveName}</dd>
        </div>
      </dl>

      <FuelIndicator fuelLevel={pickup.fuelLevel} />

      <div className="border-t border-border pt-3">
        <Link href={APP_ROUTES.ADMIN.PICKUP_DETAIL(pickup.id)}>
          <Button variant="outline" size="sm">
            <Eye size={14} />
            View pickup
          </Button>
        </Link>
      </div>
    </motion.article>
  );
}

export default memo(PickupCard);
