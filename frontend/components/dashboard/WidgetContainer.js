'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';

function WidgetContainer({
  children,
  className = '',
  padded = true,
  delay = 0,
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`surface-card overflow-hidden ${padded ? 'p-5 sm:p-6' : ''} ${className}`}
    >
      {children}
    </motion.section>
  );
}

export default memo(WidgetContainer);
