'use client';

import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    type = 'text',
    className = '',
    containerClassName = '',
    leftIcon: LeftIcon,
    required,
    ...props
  },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className={`w-full space-y-1.5 ${containerClassName}`}>
      {label ? (
        <label className="block text-sm font-medium text-primary">
          {label}
          {required ? <span className="ml-0.5 text-danger">*</span> : null}
        </label>
      ) : null}

      <div className="relative">
        {LeftIcon ? (
          <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted">
            <LeftIcon size={18} />
          </span>
        ) : null}

        <input
          ref={ref}
          type={inputType}
          required={required}
          className={`
            h-12 w-full rounded-2xl border bg-white px-4 text-sm text-primary
            outline-none transition-all duration-200
            placeholder:text-slate-400
            focus:border-accent focus:ring-4 focus:ring-accent/10
            disabled:cursor-not-allowed disabled:bg-slate-50
            ${LeftIcon ? 'pl-11' : ''}
            ${isPassword ? 'pr-11' : ''}
            ${error ? 'border-danger focus:border-danger focus:ring-danger/10' : 'border-border'}
            ${className}
          `}
          {...props}
        />

        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute top-1/2 right-3.5 -translate-y-1/2 rounded-lg p-1 text-muted transition hover:bg-slate-100 hover:text-primary"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        ) : null}
      </div>

      {error ? <p className="text-xs font-medium text-danger">{error}</p> : null}
      {!error && hint ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  );
});

export default Input;
