'use client';

import { memo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import StatusBadge from '@/components/dashboard/StatusBadge';
import { APP_ROUTES } from '@/constants/routes';
import { customerName, formatCurrency, formatDate } from '@/lib/format';

function RentalCard({ order }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="surface-card p-5 transition hover:border-slate-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-primary">
            {order.bookingNumber || order.id?.slice(0, 8)}
          </p>
          <p className="mt-1 text-xs text-muted">{customerName(order.customer)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-secondary">
        <div>
          <p className="text-muted">Pickup</p>
          <p className="mt-0.5 font-medium text-primary">{formatDate(order.pickupDate)}</p>
        </div>
        <div>
          <p className="text-muted">Return</p>
          <p className="mt-0.5 font-medium text-primary">
            {formatDate(order.expectedReturnDate)}
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm font-semibold tabular-nums text-primary">
          {formatCurrency(order.grandTotal)}
        </p>
        <Link
          href={APP_ROUTES.ADMIN.RENTAL_ORDER_DETAIL(order.id)}
          className="text-xs font-semibold text-accent"
        >
          View details →
        </Link>
      </div>
    </motion.div>
  );
}

export default memo(RentalCard);
