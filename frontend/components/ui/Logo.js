'use client';

import { motion } from 'framer-motion';
import { Car } from 'lucide-react';

export default function Logo({ size = 'md', showText = true, inverted = false }) {
  const sizes = {
    sm: { icon: 18, box: 'h-9 w-9', text: 'text-base' },
    md: { icon: 22, box: 'h-11 w-11', text: 'text-lg' },
    lg: { icon: 28, box: 'h-14 w-14', text: 'text-2xl' },
  };

  const s = sizes[size];

  return (
    <div className="flex items-center gap-3">
      <motion.div
        whileHover={{ scale: 1.04, rotate: -2 }}
        className={`${s.box} flex items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-[var(--color-accent-hover)] shadow-lg shadow-accent/25`}
      >
        <Car size={s.icon} className="text-white" strokeWidth={2.2} />
      </motion.div>
      {showText ? (
        <div className="leading-tight">
          <p
            className={`font-semibold tracking-tight ${s.text} ${
              inverted ? 'text-white' : 'text-primary'
            }`}
          >
            CRMS
          </p>
          <p
            className={`text-[11px] font-medium tracking-wide uppercase ${
              inverted ? 'text-white/60' : 'text-muted'
            }`}
          >
            Car Rental
          </p>
        </div>
      ) : null}
    </div>
  );
}
