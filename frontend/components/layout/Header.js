'use client';

import { motion } from 'framer-motion';
import Breadcrumb from '@/components/layout/Breadcrumb';

export default function Header({
  title,
  description,
  breadcrumbs = [],
  actions,
  showSearch = false,
}) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mb-6 space-y-3 sm:mb-8 sm:space-y-4"
    >
      {breadcrumbs.length ? <Breadcrumb items={breadcrumbs} /> : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-1.5 max-w-2xl text-sm text-muted">{description}</p>
          ) : null}
        </div>

        {actions ? (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">{actions}</div>
        ) : null}
      </div>
    </motion.header>
  );
}
