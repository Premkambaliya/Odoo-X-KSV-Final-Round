'use client';

import { forwardRef } from 'react';

const Textarea = forwardRef(function Textarea(
  {
    label,
    error,
    hint,
    rows = 4,
    className = '',
    containerClassName = '',
    required,
    ...props
  },
  ref
) {
  return (
    <div className={`w-full space-y-1.5 ${containerClassName}`}>
      {label ? (
        <label className="block text-sm font-medium text-primary">
          {label}
          {required ? <span className="ml-0.5 text-danger">*</span> : null}
        </label>
      ) : null}

      <textarea
        ref={ref}
        rows={rows}
        className={`
          w-full rounded-2xl border bg-white px-4 py-3 text-sm text-primary
          outline-none transition-all duration-200 resize-y
          placeholder:text-slate-400
          focus:border-accent focus:ring-4 focus:ring-accent/10
          disabled:cursor-not-allowed disabled:bg-slate-50
          ${error ? 'border-danger focus:border-danger focus:ring-danger/10' : 'border-border'}
          ${className}
        `}
        {...props}
      />

      {error ? <p className="text-xs font-medium text-danger">{error}</p> : null}
      {!error && hint ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  );
});

export default Textarea;
