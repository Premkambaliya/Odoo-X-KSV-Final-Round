'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from '@/components/ui/Button';

function ErrorState({
  title = 'Unable to load data',
  description = 'Something went wrong while fetching this section. Please try again.',
  onRetry,
  className = '',
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center px-6 py-12 text-center ${className}`}
      role="alert"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-danger">
        <AlertTriangle size={24} strokeWidth={1.75} />
      </div>
      <h3 className="text-sm font-semibold text-primary">{title}</h3>
      <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-muted">{description}</p>
      {onRetry ? (
        <Button
          variant="outline"
          size="sm"
          className="mt-5"
          onClick={onRetry}
          aria-label="Retry loading"
        >
          <RefreshCw size={14} />
          Retry
        </Button>
      ) : null}
    </motion.div>
  );
}

export default memo(ErrorState);
