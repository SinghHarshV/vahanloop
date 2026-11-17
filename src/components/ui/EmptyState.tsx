import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-3xl p-10 sm:p-14 text-center border border-dashed border-brand-border flex flex-col items-center justify-center max-w-xl mx-auto my-6 ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-brand-surface text-brand-text-muted flex items-center justify-center mb-5 border border-brand-border/60">
        <Icon className="w-8 h-8 text-brand-navy/60" />
      </div>

      <h3 className="font-display font-bold text-lg sm:text-xl text-brand-navy tracking-tight">
        {title}
      </h3>

      <p className="text-sm text-brand-text-muted mt-2 max-w-md leading-relaxed">
        {description}
      </p>

      {(actionLabel && (onAction || actionHref)) && (
        <div className="mt-6">
          {actionHref ? (
            <a
              href={actionHref}
              className="inline-flex items-center justify-center font-bold text-sm px-5 py-2.5 rounded-xl bg-brand-navy hover:bg-brand-emerald text-white shadow-sm transition-all duration-200"
            >
              {actionLabel}
            </a>
          ) : (
            <Button variant="primary" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
