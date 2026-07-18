'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import RoleGuard from '@/components/common/RoleGuard';
import { CUSTOMER_NAV } from '@/constants/navigation';
import { ROLES } from '@/constants/roles';
import notify from '@/lib/toast';

export default function CustomerLayout({ children }) {
  const pathname = usePathname();

  return (
    <RoleGuard allow={ROLES.CUSTOMER}>
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar variant="customer" />

        <div className="border-b border-border bg-white/70">
          <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 sm:px-6">
            {CUSTOMER_NAV.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.id}
                  href={item.enabled ? item.href : '#'}
                  onClick={(event) => {
                    if (!item.enabled) {
                      event.preventDefault();
                      notify.info(`${item.label} will be available in a later phase`);
                    }
                  }}
                  className={`
                    inline-flex shrink-0 items-center gap-2 rounded-2xl px-3.5 py-2 text-sm font-medium transition
                    ${
                      active && item.enabled
                        ? 'bg-accent text-white shadow-md shadow-accent/20'
                        : 'text-secondary hover:bg-slate-100'
                    }
                    ${!item.enabled ? 'opacity-55' : ''}
                  `}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1"
        >
          {children}
        </motion.main>

        <Footer />
      </div>
    </RoleGuard>
  );
}
