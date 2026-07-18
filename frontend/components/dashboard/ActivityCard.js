'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';

function ActivityCard({
  title,
  description,
  time,
  icon: Icon,
  tone = 'accent',
  delay = 0,
}) {
  const tones = {
    accent: 'bg-blue-50 text-accent',
    success: 'bg-emerald-50 text-success',
    warning: 'bg-amber-50 text-warning',
    danger: 'bg-rose-50 text-danger',
  };

  return (
    <motion.li
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
      className="relative flex gap-3 pb-5 last:pb-0"
    >
      <div className="flex flex-col items-center">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}
        >
          {Icon ? <Icon size={16} aria-hidden /> : null}
        </span>
        <span className="mt-2 w-px flex-1 bg-border last:hidden" />
      </div>
      <div className="min-w-0 pt-1">
        <p className="text-sm font-medium text-primary">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted">{description}</p>
        {time ? <p className="mt-1.5 text-[11px] text-slate-400">{time}</p> : null}
      </div>
    </motion.li>
  );
}

export default memo(ActivityCard);
