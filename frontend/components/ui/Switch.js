'use client';

import { forwardRef } from 'react';

const Switch = forwardRef(function Switch(
  { label, checked, onChange, className = '', disabled = false, ...props },
  ref
) {
  return (
    <label
      className={`inline-flex cursor-pointer items-center gap-3 ${disabled ? 'opacity-60' : ''} ${className}`}
    >
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`
          relative h-6 w-11 rounded-full transition-colors
          ${checked ? 'bg-accent' : 'bg-slate-300'}
        `}
        {...props}
      >
        <span
          className={`
            absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
      {label ? <span className="text-sm font-medium text-secondary">{label}</span> : null}
    </label>
  );
});

export default Switch;
