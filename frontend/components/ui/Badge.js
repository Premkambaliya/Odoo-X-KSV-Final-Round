'use client';

const toneStyles = {
  default: 'bg-slate-100 text-secondary',
  accent: 'bg-blue-50 text-accent',
  success: 'bg-emerald-50 text-success',
  warning: 'bg-amber-50 text-warning',
  danger: 'bg-red-50 text-danger',
  admin: 'bg-indigo-50 text-indigo-700',
  customer: 'bg-teal-50 text-teal-700',
};

export default function Badge({ children, tone = 'default', className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${toneStyles[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
