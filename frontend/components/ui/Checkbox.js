'use client';

import { forwardRef } from 'react';

const Checkbox = forwardRef(function Checkbox(
  { label, className = '', ...props },
  ref
) {
  return (
    <label className={`inline-flex cursor-pointer items-center gap-2.5 ${className}`}>
      <input
        ref={ref}
        type="checkbox"
        className="h-4 w-4 rounded border-border text-accent accent-accent focus:ring-accent/30"
        {...props}
      />
      {label ? <span className="text-sm text-secondary">{label}</span> : null}
    </label>
  );
});

export default Checkbox;
