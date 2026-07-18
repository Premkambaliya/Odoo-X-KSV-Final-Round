'use client';

import Link from 'next/link';
import { Fragment } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { APP_ROUTES } from '@/constants/routes';

/**
 * @param {{ items: Array<{ label: string, href?: string }>, homeHref?: string }} props
 */
export default function Breadcrumb({
  items = [],
  homeHref = APP_ROUTES.ADMIN.DASHBOARD,
}) {
  if (!items.length) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm">
      <Link
        href={homeHref}
        className="rounded-lg p-1 text-muted transition hover:bg-slate-100 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        aria-label="Admin home"
      >
        <Home size={14} />
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <Fragment key={`${item.label}-${index}`}>
            <ChevronRight size={14} className="shrink-0 text-slate-300" aria-hidden />
            {isLast || !item.href ? (
              <span className="font-medium text-primary" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-muted transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                {item.label}
              </Link>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
