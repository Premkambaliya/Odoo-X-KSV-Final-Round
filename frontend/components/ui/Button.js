'use client';

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import ButtonLoader from '@/components/common/ButtonLoader';

const variants = {
  primary:
    'bg-accent text-white hover:bg-[var(--color-accent-hover)] shadow-lg shadow-accent/20 border-transparent',
  secondary:
    'bg-secondary text-white hover:bg-primary border-transparent',
  outline:
    'bg-white text-primary border-border hover:bg-slate-50 hover:border-slate-300',
  ghost: 'bg-transparent text-primary border-transparent hover:bg-slate-100',
  danger: 'bg-danger text-white hover:bg-red-600 border-transparent',
};

const sizes = {
  sm: 'h-9 px-3 text-sm rounded-xl',
  md: 'h-11 px-5 text-sm rounded-2xl',
  lg: 'h-12 px-6 text-base rounded-2xl',
};

const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    className = '',
    type = 'button',
    fullWidth = false,
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      ref={ref}
      type={type}
      whileHover={isDisabled ? undefined : { scale: 1.015, y: -1 }}
      whileTap={isDisabled ? undefined : { scale: 0.98 }}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center gap-2 border font-medium
        transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60
        ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}
      `}
      {...props}
    >
      {loading ? <ButtonLoader /> : null}
      {children}
    </motion.button>
  );
});

export default Button;
