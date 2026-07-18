'use client';

export default function Footer({ compact = false }) {
  const year = new Date().getFullYear();

  return (
    <footer
      className={`border-t border-border bg-white/60 ${
        compact ? 'px-4 py-4' : 'px-4 py-5 sm:px-6 lg:px-8'
      }`}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
        <p className="text-sm font-medium text-secondary">
          Car Rental Management System
        </p>
        <p className="text-xs text-muted">
          © {year} CRMS. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
