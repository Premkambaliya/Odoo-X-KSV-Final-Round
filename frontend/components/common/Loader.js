'use client';

import { motion } from 'framer-motion';

export default function Loader({ size = 'md', className = '', label }) {
  const sizes = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-[3px]',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className={`inline-flex flex-col items-center gap-3 ${className}`}>
      <motion.div
        className={`${sizes[size]} rounded-full border-accent/20 border-t-accent`}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      />
      {label ? <p className="text-sm text-muted">{label}</p> : null}
    </div>
  );
}
