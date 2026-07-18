'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import RoleGuard from '@/components/common/RoleGuard';
import { ROLES } from '@/constants/roles';

const COLLAPSE_KEY = 'crms_admin_sidebar_collapsed';

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(COLLAPSE_KEY);
      if (stored === 'true') setCollapsed(true);
    } catch {
      // ignore storage errors
    }
  }, []);

  function handleCollapseToggle() {
    setCollapsed((value) => {
      const next = !value;
      try {
        localStorage.setItem(COLLAPSE_KEY, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }

  return (
    <RoleGuard allow={ROLES.ADMIN}>
      <div className="min-h-screen bg-background">
        <Sidebar
          collapsed={collapsed}
          onCollapseToggle={handleCollapseToggle}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        <div
          className={`flex min-h-screen flex-col transition-[padding] duration-300 ease-out ${
            collapsed
              ? 'lg:pl-[var(--sidebar-collapsed)]'
              : 'lg:pl-[var(--sidebar-width)]'
          }`}
        >
          <Navbar
            variant="admin"
            onMenuClick={() => setMobileOpen(true)}
          />

          <main className="flex-1 min-w-0 overflow-x-hidden">{children}</main>

          <Footer />
        </div>
      </div>
    </RoleGuard>
  );
}
