'use client';

import { Bell, CheckCircle2, Info, AlertCircle } from 'lucide-react';
import WidgetContainer from '@/components/dashboard/WidgetContainer';
import SectionHeader from '@/components/dashboard/SectionHeader';
import EmptyState from '@/components/dashboard/EmptyState';

const PLACEHOLDERS = [
  {
    id: 1,
    title: 'Workspace ready',
    message: 'Dashboard widgets sync live from rental, payment, and fleet APIs.',
    type: 'info',
    time: 'Just now',
  },
  {
    id: 2,
    title: 'Operations connected',
    message: 'Pickups, returns, and penalties are available from the sidebar.',
    type: 'success',
    time: 'Today',
  },
  {
    id: 3,
    title: 'Reports & settings',
    message: 'Dedicated report suites and org settings arrive in a later phase.',
    type: 'warning',
    time: 'Today',
  },
];

const icons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertCircle,
};

const tones = {
  info: 'bg-blue-50 text-accent',
  success: 'bg-emerald-50 text-success',
  warning: 'bg-amber-50 text-warning',
};

export default function NotificationsPanel({ notifications }) {
  const items = notifications?.length ? notifications : PLACEHOLDERS;
  const isPlaceholder = !notifications?.length;

  return (
    <WidgetContainer delay={0.2}>
      <SectionHeader
        title="Notifications"
        description={
          isPlaceholder
            ? 'No backend notification feed yet — showing workspace tips'
            : 'Latest system alerts'
        }
      />

      {!items.length ? (
        <EmptyState
          title="All caught up"
          description="You have no notifications right now."
          icon={Bell}
        />
      ) : (
        <ul className="space-y-3" aria-label="Notifications">
          {items.map((item) => {
            const Icon = icons[item.type] || Bell;
            return (
              <li
                key={item.id}
                className="flex gap-3 rounded-2xl border border-border/80 bg-slate-50/60 p-3"
              >
                <span
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    tones[item.type] || tones.info
                  }`}
                >
                  <Icon size={16} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-primary">{item.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted">
                    {item.message}
                  </p>
                  {item.time ? (
                    <p className="mt-1.5 text-[11px] text-slate-400">{item.time}</p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </WidgetContainer>
  );
}
