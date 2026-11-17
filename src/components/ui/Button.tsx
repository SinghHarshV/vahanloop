'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'emerald';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-bold tracking-tight rounded-xl transition-all duration-200 select-none focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

    const variantStyles: Record<string, string> = {
      primary:
        'bg-brand-navy hover:bg-brand-navy-light text-white shadow-sm focus:ring-brand-navy hover:shadow-md',
      secondary:
        'bg-brand-surface hover:bg-slate-200/70 text-brand-navy border border-brand-border focus:ring-brand-border',
      outline:
        'bg-transparent hover:bg-brand-surface text-brand-navy border border-brand-border hover:border-brand-emerald focus:ring-brand-emerald',
      ghost:
        'bg-transparent hover:bg-brand-surface text-brand-text-muted hover:text-brand-navy focus:ring-slate-300',
      danger:
        'bg-brand-danger hover:bg-red-700 text-white shadow-sm focus:ring-brand-danger hover:shadow-md',
      emerald:
        'bg-brand-emerald hover:bg-brand-emerald-dark text-white shadow-sm focus:ring-brand-emerald hover:shadow-md',
    };

    const sizeStyles: Record<string, string> = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 rounded-lg',
      md: 'text-sm px-4 py-2.5 gap-2 rounded-xl',
      lg: 'text-base px-6 py-3.5 gap-2.5 rounded-2xl',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
