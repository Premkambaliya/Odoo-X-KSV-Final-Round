'use client';

import { motion } from 'framer-motion';

export default function PageContainer({
  children,
  className = '',
  padded = true,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`mx-auto w-full max-w-7xl ${padded ? 'px-4 py-6 sm:px-6 lg:px-8' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
}
