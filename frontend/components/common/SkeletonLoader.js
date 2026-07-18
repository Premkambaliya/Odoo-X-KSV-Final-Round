'use client';

import { motion } from 'framer-motion';

export default function SkeletonLoader({
  className = '',
  width = '100%',
  height = '1rem',
  rounded = 'xl',
}) {
  const radius = {
    sm: 'rounded-md',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
    full: 'rounded-full',
  };

  return (
    <motion.div
      className={`bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 ${radius[rounded]} ${className}`}
      style={{ width, height, backgroundSize: '200% 100%' }}
      animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
    />
  );
}
