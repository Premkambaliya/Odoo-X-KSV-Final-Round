'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { RENTAL_STATUS, RENTAL_TIMELINE_STEPS } from '@/lib/rental';

const ORDER = ['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED'];

function statusIndex(status) {
  if (status === RENTAL_STATUS.CANCELLED) return -1;
  if (status === RENTAL_STATUS.LATE) return ORDER.indexOf('ACTIVE');
  return ORDER.indexOf(status);
}

function RentalTimeline({ status }) {
  const current = statusIndex(status);
  const cancelled = status === RENTAL_STATUS.CANCELLED;

  return (
    <div className="surface-card p-5 sm:p-6">
      <h3 className="text-base font-semibold text-primary">Lifecycle Timeline</h3>
      {cancelled ? (
        <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-danger">
          This rental was cancelled.
        </p>
      ) : null}
      <ol className="mt-5 space-y-0">
        {RENTAL_TIMELINE_STEPS.map((step, index) => {
          const done = current > index;
          const active = current === index;

          return (
            <motion.li
              key={step.key}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex gap-3 pb-5 last:pb-0"
            >
              <div className="flex flex-col items-center">
                <span
                  className={`
                    flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold
                    ${
                      done || active
                        ? 'bg-accent text-white'
                        : 'bg-slate-100 text-muted'
                    }
                  `}
                >
                  {index + 1}
                </span>
                {index < RENTAL_TIMELINE_STEPS.length - 1 ? (
                  <span className="mt-1 w-px flex-1 bg-border" />
                ) : null}
              </div>
              <div className="pt-1">
                <p
                  className={`text-sm font-semibold ${
                    done || active ? 'text-primary' : 'text-muted'
                  }`}
                >
                  {step.label}
                </p>
                <p className="mt-0.5 text-xs text-muted">{step.description}</p>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}

export default memo(RentalTimeline);
