'use client';

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  CircleDashed,
  RefreshCcw,
  XCircle,
  CreditCard,
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/format';

function buildEvents(payment, relatedPayments = []) {
  if (!payment) return [];

  const events = [
    {
      id: 'created',
      title: 'Payment created',
      description: `Recorded for ${formatCurrency(payment.amount)}`,
      date: payment.createdAt || payment.paidAt,
      tone: 'accent',
      Icon: CreditCard,
    },
  ];

  if (payment.paymentStatus === 'SUCCESS') {
    events.push({
      id: 'completed',
      title: 'Payment completed',
      description: 'Funds marked as successful',
      date: payment.paidAt || payment.updatedAt || payment.createdAt,
      tone: 'success',
      Icon: CheckCircle2,
    });
  }

  if (payment.paymentStatus === 'FAILED') {
    events.push({
      id: 'failed',
      title: 'Payment failed',
      description: 'Transaction did not complete',
      date: payment.updatedAt || payment.createdAt,
      tone: 'danger',
      Icon: XCircle,
    });
  }

  if (payment.paymentStatus === 'REFUNDED') {
    events.push({
      id: 'refund-issued',
      title: 'Refund issued',
      description: 'Payment status set to refunded',
      date: payment.updatedAt || payment.paidAt,
      tone: 'warning',
      Icon: RefreshCcw,
    });
    events.push({
      id: 'refund-completed',
      title: 'Refund completed',
      description: 'Balance recalculated on the rental order',
      date: payment.updatedAt || payment.paidAt,
      tone: 'success',
      Icon: CheckCircle2,
    });
  }

  if (payment.paymentStatus === 'PENDING') {
    events.push({
      id: 'pending',
      title: 'Awaiting confirmation',
      description: 'Payment is still pending',
      date: payment.updatedAt || payment.createdAt,
      tone: 'muted',
      Icon: CircleDashed,
    });
  }

  relatedPayments
    .filter((p) => p.id !== payment.id)
    .forEach((p) => {
      events.push({
        id: `related-${p.id}`,
        title:
          p.paymentStatus === 'REFUNDED'
            ? 'Related refund'
            : 'Related payment',
        description: `${formatCurrency(p.amount)} · ${p.paymentMethod}`,
        date: p.paidAt || p.createdAt,
        tone: p.paymentStatus === 'REFUNDED' ? 'warning' : 'accent',
        Icon: p.paymentStatus === 'REFUNDED' ? RefreshCcw : CreditCard,
      });
    });

  return events.sort(
    (a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime()
  );
}

const toneClass = {
  accent: 'bg-accent text-white',
  success: 'bg-success text-white',
  warning: 'bg-warning text-white',
  danger: 'bg-danger text-white',
  muted: 'bg-slate-200 text-muted',
};

function TransactionTimeline({ payment, relatedPayments = [] }) {
  const events = useMemo(
    () => buildEvents(payment, relatedPayments),
    [payment, relatedPayments]
  );

  return (
    <div className="surface-card p-5 sm:p-6">
      <h3 className="text-base font-semibold text-primary">
        Transaction timeline
      </h3>
      <ol className="mt-5 space-y-0">
        {events.map((event, index) => {
          const Icon = event.Icon;
          return (
            <motion.li
              key={event.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex gap-3 pb-5 last:pb-0"
            >
              <div className="flex flex-col items-center">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    toneClass[event.tone] || toneClass.muted
                  }`}
                >
                  <Icon size={14} aria-hidden />
                </span>
                {index < events.length - 1 ? (
                  <span className="mt-1 w-px flex-1 bg-border" />
                ) : null}
              </div>
              <div className="min-w-0 pt-0.5">
                <p className="text-sm font-semibold text-primary">
                  {event.title}
                </p>
                <p className="mt-0.5 text-xs text-muted">{event.description}</p>
                <p className="mt-1 text-[11px] text-muted">
                  {formatDateTime(event.date)}
                </p>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}

export default memo(TransactionTimeline);
