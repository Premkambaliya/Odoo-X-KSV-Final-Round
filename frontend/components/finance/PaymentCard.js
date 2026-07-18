'use client';

import { memo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CreditCard, Eye, Receipt } from 'lucide-react';
import PaymentStatusBadge from '@/components/finance/PaymentStatusBadge';
import Button from '@/components/ui/Button';
import { APP_ROUTES } from '@/constants/routes';
import { customerName, formatCurrency, formatDateTime } from '@/lib/format';

function PaymentCard({ payment, delay = 0 }) {
  if (!payment) return null;
  const order = payment.rentalOrder;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="surface-card flex flex-col gap-4 p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/10 text-accent">
            <CreditCard size={18} aria-hidden />
          </span>
          <div>
            <p className="font-semibold text-primary">
              {formatCurrency(payment.amount)}
            </p>
            <p className="text-xs text-muted">
              {order?.bookingNumber || 'Rental payment'}
            </p>
          </div>
        </div>
        <PaymentStatusBadge status={payment.paymentStatus} />
      </div>

      <dl className="grid gap-2 text-sm">
        <div className="flex justify-between gap-2">
          <dt className="text-muted">Customer</dt>
          <dd className="font-medium text-primary">
            {customerName(order?.customer)}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-muted">Method</dt>
          <dd>
            <PaymentStatusBadge status={payment.paymentMethod} />
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-muted">Paid at</dt>
          <dd className="tabular-nums text-primary">
            {formatDateTime(payment.paidAt || payment.createdAt)}
          </dd>
        </div>
      </dl>

      <div className="flex flex-wrap gap-2 border-t border-border pt-3">
        <Link href={APP_ROUTES.ADMIN.PAYMENT_DETAIL(payment.id)}>
          <Button variant="outline" size="sm">
            <Eye size={14} />
            View
          </Button>
        </Link>
        <Link href={APP_ROUTES.ADMIN.PAYMENT_RECEIPT(payment.id)}>
          <Button variant="ghost" size="sm">
            <Receipt size={14} />
            Receipt
          </Button>
        </Link>
      </div>
    </motion.article>
  );
}

export default memo(PaymentCard);
