'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

function RentalStepper({ steps = [], current = 0 }) {
  return (
    <ol className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      {steps.map((step, index) => {
        const active = index === current;
        const done = index < current;

        return (
          <li key={step.id || step.label} className="flex flex-1 items-start gap-3">
            <motion.span
              animate={{ scale: active ? 1.05 : 1 }}
              className={`
                flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold
                ${
                  done
                    ? 'bg-accent text-white'
                    : active
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : 'bg-slate-100 text-muted'
                }
              `}
            >
              {done ? <Check size={16} /> : index + 1}
            </motion.span>
            <div className="min-w-0 pt-1">
              <p
                className={`text-sm font-semibold ${
                  active || done ? 'text-primary' : 'text-muted'
                }`}
              >
                {step.label}
              </p>
              {step.description ? (
                <p className="mt-0.5 hidden text-xs text-muted sm:block">
                  {step.description}
                </p>
              ) : null}
            </div>
            {index < steps.length - 1 ? (
              <div className="mx-2 mt-4 hidden h-px flex-1 bg-border sm:block" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

export default memo(RentalStepper);
