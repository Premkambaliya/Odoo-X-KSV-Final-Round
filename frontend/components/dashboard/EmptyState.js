'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';

function EmptyState({
  title = 'Nothing here yet',
  description = 'Data will appear once activity starts flowing through the system.',
  icon: Icon = Inbox,
  className = '',
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center px-6 py-12 text-center ${className}`}
      role="status"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-muted">
        <Icon size={24} strokeWidth={1.75} />
      </div>
      <h3 className="text-sm font-semibold text-primary">{title}</h3>
      <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-muted">{description}</p>
    </motion.div>
  );
}

export default memo(EmptyState);
