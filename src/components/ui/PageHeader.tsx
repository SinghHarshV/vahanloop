import React from 'react';

export interface PageHeaderProps {
  badge?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  badge,
  title,
  subtitle,
  actions,
  children,
  className = '',
}) => {
  return (
    <div className={`mb-8 sm:mb-10 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          {badge && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-brand-emerald-subtle text-brand-emerald-dark border border-brand-emerald/20 mb-2">
              <span>{badge}</span>
            </div>
          )}
          <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-brand-navy tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm sm:text-base text-brand-text-muted mt-1.5 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-3 shrink-0">{actions}</div>}
      </div>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
};
