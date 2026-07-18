'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronsLeft, ChevronsRight, X } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { ADMIN_NAV } from '@/constants/navigation';
import notify from '@/lib/toast';

const SIDEBAR_EXPANDED = 280;
const SIDEBAR_COLLAPSED = 88;

function NavItem({ item, collapsed, pathname, onNavigate }) {
  const Icon = item.icon;
  const isActive =
    item.href === pathname ||
    (item.href !== '/admin' && pathname.startsWith(item.href));

  function handleClick(event) {
    if (!item.enabled) {
      event.preventDefault();
      notify.info(`${item.label} will be available in a later phase`);
      return;
    }
    onNavigate?.();
  }

  return (
    <Link
      href={item.enabled ? item.href : '#'}
      onClick={handleClick}
      aria-current={isActive && item.enabled ? 'page' : undefined}
      aria-disabled={!item.enabled}
      className={`
        group relative flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium
        transition-colors duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50
        ${
          isActive && item.enabled
            ? 'bg-accent text-white shadow-lg shadow-accent/25'
            : 'text-slate-300 hover:bg-white/5 hover:text-white'
        }
        ${!item.enabled ? 'cursor-not-allowed opacity-50' : ''}
        ${collapsed ? 'justify-center px-2' : ''}
      `}
      title={collapsed ? item.label : undefined}
    >
      <Icon size={20} strokeWidth={1.9} className="shrink-0" aria-hidden />
      {!collapsed ? (
        <>
          <span className="min-w-0 flex-1 truncate whitespace-nowrap">
            {item.label}
          </span>
          {!item.enabled ? (
            <span className="shrink-0 rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] tracking-wide text-slate-400 uppercase">
              Soon
            </span>
          ) : null}
        </>
      ) : null}
    </Link>
  );
}

function SidebarShell({
  collapsed,
  onCollapseToggle,
  onMobileClose,
  showCollapse,
  showClose,
  pathname,
}) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div
        className={`flex h-[var(--navbar-height)] shrink-0 items-center border-b border-white/10 ${
          collapsed ? 'justify-center px-2' : 'justify-between gap-2 px-4'
        }`}
      >
        <div className={`min-w-0 ${collapsed ? '' : 'flex-1'}`}>
          <Logo inverted size="sm" showText={!collapsed} />
        </div>
        {showCollapse ? (
          <button
            type="button"
            onClick={onCollapseToggle}
            className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 lg:inline-flex"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
          </button>
        ) : null}
        {showClose ? (
          <button
            type="button"
            onClick={onMobileClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        ) : null}
      </div>

      <nav
        className="sidebar-scrollbar min-h-0 flex-1 space-y-1 overflow-x-hidden overflow-y-auto overscroll-contain px-3 py-4"
        aria-label="Admin navigation"
      >
        <p
          className={`mb-2 px-3 text-[10px] font-semibold tracking-[0.18em] text-slate-500 uppercase ${
            collapsed ? 'text-center' : ''
          }`}
        >
          {collapsed ? '•••' : 'Main Menu'}
        </p>
        {ADMIN_NAV.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            collapsed={collapsed}
            pathname={pathname}
            onNavigate={onMobileClose}
          />
        ))}
      </nav>

      <div className="shrink-0 border-t border-white/10 p-3">
        {!collapsed ? (
          <div className="rounded-2xl bg-white/5 px-3 py-3">
            <p className="text-xs font-medium text-white">Enterprise Console</p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
              Fleet, rentals, finance, and operations in one workspace.
            </p>
          </div>
        ) : (
          <div
            className="mx-auto h-2 w-2 rounded-full bg-accent"
            aria-hidden
          />
        )}
      </div>
    </div>
  );
}

export default function Sidebar({
  collapsed,
  onCollapseToggle,
  mobileOpen,
  onMobileClose,
}) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKey(event) {
      if (event.key === 'Escape') onMobileClose?.();
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKey);
    };
  }, [mobileOpen, onMobileClose]);

  return (
    <>
      <motion.aside
        animate={{ width: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED }}
        initial={false}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-y-0 left-0 z-50 hidden overflow-hidden border-r border-white/10 bg-[var(--sidebar-bg)] lg:block"
        style={{ width: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED }}
        aria-label="Admin sidebar"
      >
        <SidebarShell
          collapsed={collapsed}
          onCollapseToggle={onCollapseToggle}
          onMobileClose={onMobileClose}
          showCollapse
          showClose={false}
          pathname={pathname}
        />
      </motion.aside>

      <AnimatePresence>
        {mounted && mobileOpen ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-primary/40 backdrop-blur-sm lg:hidden"
              onClick={onMobileClose}
              aria-hidden
            />
            <motion.aside
              initial={{ x: -SIDEBAR_EXPANDED }}
              animate={{ x: 0 }}
              exit={{ x: -SIDEBAR_EXPANDED }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 z-50 w-[var(--sidebar-width)] overflow-hidden bg-[var(--sidebar-bg)] lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Admin navigation menu"
            >
              <SidebarShell
                collapsed={false}
                onCollapseToggle={onCollapseToggle}
                onMobileClose={onMobileClose}
                showCollapse={false}
                showClose
                pathname={pathname}
              />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
