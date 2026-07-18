'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import notify from '@/lib/toast';

function QuickActionCard({
  title,
  description,
  href,
  icon: Icon,
  enabled = false,
  tone = 'accent',
  delay = 0,
}) {
  const tones = {
    accent: 'from-accent to-[#1d4ed8]',
    success: 'from-emerald-500 to-emerald-600',
    warning: 'from-amber-500 to-amber-600',
    secondary: 'from-secondary to-primary',
  };

  function handleClick(event) {
    if (!enabled) {
      event.preventDefault();
      notify.info(`${title} will be available in a later phase`);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      whileHover={{ y: -3 }}
    >
      <Link
        href={enabled ? href : '#'}
        onClick={handleClick}
        className="surface-card group flex h-full items-start gap-4 p-4 transition hover:border-slate-300 hover:shadow-[var(--shadow-elevated)]"
        aria-label={title}
      >
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg ${tones[tone]}`}
        >
          <Icon size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="text-sm font-semibold text-primary">{title}</span>
            <ArrowUpRight
              size={14}
              className="text-muted opacity-0 transition group-hover:opacity-100"
            />
          </span>
          <span className="mt-1 block text-xs leading-relaxed text-muted">
            {description}
          </span>
          {!enabled ? (
            <span className="mt-2 inline-flex rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-muted uppercase">
              Soon
            </span>
          ) : null}
        </span>
      </Link>
    </motion.div>
  );
}

export default memo(QuickActionCard);
