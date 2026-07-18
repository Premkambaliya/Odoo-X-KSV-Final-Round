'use client';

import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(function Select(
  {
    label,
    error,
    hint,
    options = [],
    placeholder = 'Select…',
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

      <div className="relative">
        <select
          ref={ref}
          className={`
            h-12 w-full appearance-none rounded-2xl border bg-white py-0 pr-10 pl-4 text-sm text-primary
            outline-none transition-all duration-200
            focus:border-accent focus:ring-4 focus:ring-accent/10
            disabled:cursor-not-allowed disabled:bg-slate-50
            ${error ? 'border-danger focus:border-danger focus:ring-danger/10' : 'border-border'}
            ${className}
          `}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-muted"
          aria-hidden
        />
      </div>

      {error ? <p className="text-xs font-medium text-danger">{error}</p> : null}
      {!error && hint ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  );
});

export default Select;
