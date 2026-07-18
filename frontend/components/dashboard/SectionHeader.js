'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';

function SectionHeader({
  title,
  description,
  action,
  className = '',
}) {
  return (
    <div className={`mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between ${className}`}>
      <div>
        <motion.h2
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-base font-semibold tracking-tight text-primary sm:text-lg"
        >
          {title}
        </motion.h2>
        {description ? (
          <p className="mt-1 text-xs text-muted sm:text-sm">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export default memo(SectionHeader);
