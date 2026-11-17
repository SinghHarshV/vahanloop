import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

export interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  badge?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  trend,
  badge,
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-3xl p-6 border border-brand-border shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-text-muted truncate">
            {label}
          </p>
          <h4 className="text-2xl sm:text-3xl font-display font-extrabold text-brand-navy mt-1 tracking-tight truncate">
            {value}
          </h4>
        </div>
        {Icon && (
          <div className="w-11 h-11 rounded-2xl bg-brand-surface text-brand-navy flex items-center justify-center shrink-0 border border-brand-border/60">
            <Icon className="w-5 h-5 text-brand-navy" />
          </div>
        )}
      </div>

      {(subtext || trend || badge) && (
        <div className="mt-4 pt-3 border-t border-brand-border/60 flex items-center justify-between gap-2 text-xs">
          {trend ? (
            <div
              className={`flex items-center gap-1 font-semibold ${
                trend.isPositive ? 'text-brand-emerald-dark' : 'text-rose-600'
              }`}
            >
              {trend.isPositive ? (
                <TrendingUp className="w-3.5 h-3.5 text-brand-emerald" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
              )}
              <span>{trend.value}</span>
            </div>
          ) : (
            <span className="text-brand-text-muted">{subtext}</span>
          )}

          {badge && (
            <span className="px-2 py-0.5 rounded-full bg-brand-emerald-subtle text-brand-emerald-dark font-bold text-[10px] uppercase tracking-wider border border-brand-emerald/20">
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
