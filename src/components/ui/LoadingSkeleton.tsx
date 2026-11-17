import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200/80 rounded-xl ${className}`} />
);

export const VehicleCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-3xl border border-brand-border overflow-hidden shadow-card p-4 space-y-4">
    <Skeleton className="w-full h-48 rounded-2xl" />
    <div className="space-y-2 px-1">
      <Skeleton className="w-2/3 h-5" />
      <Skeleton className="w-1/3 h-3.5" />
    </div>
    <div className="flex gap-2 pt-2 px-1">
      <Skeleton className="w-16 h-6 rounded-full" />
      <Skeleton className="w-20 h-6 rounded-full" />
    </div>
    <div className="pt-4 border-t border-brand-border flex items-center justify-between px-1">
      <Skeleton className="w-24 h-6" />
      <Skeleton className="w-24 h-9 rounded-xl" />
    </div>
  </div>
);

export const StatCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-card space-y-4">
    <div className="flex items-start justify-between">
      <div className="space-y-2 w-2/3">
        <Skeleton className="w-1/2 h-3.5" />
        <Skeleton className="w-3/4 h-8" />
      </div>
      <Skeleton className="w-11 h-11 rounded-2xl" />
    </div>
    <Skeleton className="w-full h-4 pt-2" />
  </div>
);

export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 5 }) => (
  <tr className="border-b border-brand-border/60">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="py-4 px-4">
        <Skeleton className="h-4 w-full max-w-[120px]" />
      </td>
    ))}
  </tr>
);
