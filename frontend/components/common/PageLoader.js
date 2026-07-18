'use client';

import { motion } from 'framer-motion';
import Loader from '@/components/common/Loader';

export default function PageLoader({ label = 'Loading…' }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-4"
    >
      <Loader size="lg" />
      <p className="text-sm font-medium text-muted">{label}</p>
    </motion.div>
  );
}
