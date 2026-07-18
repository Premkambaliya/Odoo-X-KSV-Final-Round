'use client';

import { memo } from 'react';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import { CalendarDays, Sparkles } from 'lucide-react';
import { getDisplayName } from '@/lib/auth';
import { getGreeting } from '@/lib/format';

function WelcomeSection({ user, todayOps }) {
  const name = getDisplayName(user);
  const greeting = getGreeting();
  const today = dayjs().format('dddd, D MMMM YYYY');

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="relative overflow-hidden rounded-[1.25rem] border border-border bg-gradient-to-br from-[#0B1220] via-[#111827] to-[#1F2937] p-6 text-white shadow-[var(--shadow-elevated)] sm:p-8"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(ellipse 60% 80% at 90% 10%, rgba(37,99,235,0.45), transparent 55%)',
        }}
      />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium tracking-wide text-blue-200 uppercase">
            <Sparkles size={12} />
            Operations overview
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
            {greeting}, {name.split(' ')[0]}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300">
            Here is a live snapshot of fleet health, rentals, and revenue across
            your Car Rental Management System.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 text-xs text-slate-400">
            <CalendarDays size={14} />
            {today}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:min-w-[280px]">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
            <p className="text-[11px] tracking-wide text-slate-400 uppercase">
              Today pickups
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {todayOps?.todayPickups ?? 0}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
            <p className="text-[11px] tracking-wide text-slate-400 uppercase">
              Today returns
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {todayOps?.todayReturns ?? 0}
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default memo(WelcomeSection);
