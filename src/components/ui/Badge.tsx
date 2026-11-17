import React from 'react';

export type BadgeVariant =
  | 'confirmed'
  | 'active'
  | 'pending'
  | 'cancelled'
  | 'completed'
  | 'verified'
  | 'danger'
  | 'warning'
  | 'neutral'
  | 'emerald'
  | 'navy';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
  ...props
}) => {
  const variantStyles: Record<BadgeVariant, { bg: string; dotColor: string }> = {
    confirmed: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      dotColor: 'bg-emerald-500',
    },
    active: {
      bg: 'bg-blue-50 text-blue-700 border-blue-200/80',
      dotColor: 'bg-blue-500 animate-pulse',
    },
    pending: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
      dotColor: 'bg-amber-500',
    },
    cancelled: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200/80',
      dotColor: 'bg-rose-500',
    },
    completed: {
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      dotColor: 'bg-slate-400',
    },
    verified: {
      bg: 'bg-brand-emerald-subtle text-brand-emerald-dark border-brand-emerald/30',
      dotColor: 'bg-brand-emerald',
    },
    danger: {
      bg: 'bg-red-50 text-red-700 border-red-200',
      dotColor: 'bg-red-500',
    },
    warning: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      dotColor: 'bg-amber-500',
    },
    neutral: {
      bg: 'bg-brand-surface text-brand-text-muted border-brand-border',
      dotColor: 'bg-slate-400',
    },
    emerald: {
      bg: 'bg-brand-emerald-subtle text-brand-emerald-dark border-brand-emerald/20',
      dotColor: 'bg-brand-emerald',
    },
    navy: {
      bg: 'bg-brand-navy/10 text-brand-navy border-brand-navy/20',
      dotColor: 'bg-brand-navy',
    },
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  const current = variantStyles[variant] || variantStyles.neutral;

  return (
    <span
      className={`inline-flex items-center font-bold uppercase tracking-wider rounded-full border ${current.bg} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${current.dotColor} shrink-0`} />}
      <span>{children}</span>
    </span>
  );
};
