'use client';

import { motion } from 'framer-motion';

export default function ButtonLoader({ className = '' }) {
  return (
    <motion.span
      className={`inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
      aria-hidden
    />
  );
}
