'use client';

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Circle,
  PackageCheck,
  PackageOpen,
  CreditCard,
  AlertTriangle,
  Ban,
} from 'lucide-react';
import { OPERATIONS_TIMELINE } from '@/lib/operations';
import { formatDateTime } from '@/lib/format';

function resolveSteps({
  order,
  pickup,
  returnRecord,
  penalties = [],
  hasPayment,
}) {
  const status = order?.status;
  const cancelled = status === 'CANCELLED';

  return OPERATIONS_TIMELINE.map((step) => {
    let done = false;
    let active = false;
    let date = null;
    let Icon = Circle;

    switch (step.key) {
      case 'CREATED':
        done = Boolean(order);
        date = order?.createdAt;
        Icon = CheckCircle2;
        active = status === 'PENDING';
        break;
      case 'CONFIRMED':
        done = ['CONFIRMED', 'ACTIVE', 'COMPLETED', 'LATE'].includes(status);
        date = done ? order?.updatedAt : null;
        Icon = CheckCircle2;
        active = status === 'CONFIRMED';
        break;
      case 'PAYMENT':
        done = Boolean(hasPayment) || ['PAID', 'PARTIAL'].includes(order?.paymentStatus);
        active = order?.paymentStatus === 'PENDING' && done === false;
        Icon = CreditCard;
        break;
      case 'PICKUP':
        done = Boolean(pickup) || ['ACTIVE', 'COMPLETED', 'LATE'].includes(status);
        date = pickup?.pickupTime;
        Icon = PackageCheck;
        active = status === 'CONFIRMED' && !pickup;
        break;
      case 'ACTIVE':
        done = ['ACTIVE', 'COMPLETED', 'LATE'].includes(status);
        active = status === 'ACTIVE';
        Icon = CheckCircle2;
        break;
      case 'RETURN':
        done = Boolean(returnRecord) || ['COMPLETED', 'LATE'].includes(status);
        date = returnRecord?.returnTime;
        Icon = PackageOpen;
        active = status === 'ACTIVE' && !returnRecord;
        break;
      case 'PENALTY':
        done = penalties.length > 0;
        active = penalties.some((p) => p.status === 'UNPAID');
        Icon = AlertTriangle;
        break;
      case 'COMPLETED':
        done = status === 'COMPLETED' || status === 'LATE';
        date = order?.actualReturnDate;
        Icon = CheckCircle2;
        active = false;
        break;
      case 'CANCELLED':
        done = cancelled;
        active = cancelled;
        Icon = Ban;
        break;
      default:
        break;
    }

    if (cancelled && step.key !== 'CANCELLED' && step.key !== 'CREATED') {
      // keep early steps if already done before cancel
    }

    return { ...step, done, active, date, Icon, hidden: step.key === 'CANCELLED' && !cancelled };
  }).filter((s) => !s.hidden);
}

function OperationsTimeline({
  order,
  pickup,
  returnRecord,
  penalties = [],
  hasPayment = false,
}) {
  const steps = useMemo(
    () => resolveSteps({ order, pickup, returnRecord, penalties, hasPayment }),
    [order, pickup, returnRecord, penalties, hasPayment]
  );

  return (
    <div className="surface-card p-5 sm:p-6">
      <h3 className="text-base font-semibold text-primary">Rental timeline</h3>
      <ol className="mt-5">
        {steps.map((step, index) => {
          const Icon = step.Icon;
          const highlighted = step.done || step.active;
          return (
            <motion.li
              key={step.key}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04 }}
              className="flex gap-3 pb-5 last:pb-0"
            >
              <div className="flex flex-col items-center">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    step.active
                      ? 'bg-accent text-white ring-4 ring-accent/20'
                      : step.done
                        ? 'bg-success text-white'
                        : 'bg-slate-100 text-muted'
                  }`}
                >
                  <Icon size={14} aria-hidden />
                </span>
                {index < steps.length - 1 ? (
                  <span
                    className={`mt-1 w-px flex-1 ${
                      step.done ? 'bg-success/40' : 'bg-border'
                    }`}
                  />
                ) : null}
              </div>
              <div className="min-w-0 pt-0.5">
                <p
                  className={`text-sm font-semibold ${
                    highlighted ? 'text-primary' : 'text-muted'
                  }`}
                >
                  {step.label}
                </p>
                <p className="mt-0.5 text-xs text-muted">{step.description}</p>
                {step.date ? (
                  <p className="mt-1 text-[11px] text-muted">
                    {formatDateTime(step.date)}
                  </p>
                ) : null}
              </div>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}

export default memo(OperationsTimeline);
