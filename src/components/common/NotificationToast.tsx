'use client';

import React from 'react';
import { useMarketplace } from '@/context/MarketplaceContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { notifications, removeNotification } = useMarketplace();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {notifications.map((n) => {
        const isSuccess = n.type === 'success';
        const isError = n.type === 'error';

        return (
          <div
            key={n.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-lg border text-xs animate-in slide-in-from-bottom-2 fade-in duration-200 ${
              isSuccess
                ? 'bg-emerald-950/90 text-emerald-100 border-emerald-700/60 backdrop-blur'
                : isError
                ? 'bg-rose-950/90 text-rose-100 border-rose-700/60 backdrop-blur'
                : 'bg-slate-900/90 text-slate-100 border-slate-700/60 backdrop-blur'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {isError && <AlertCircle className="w-4 h-4 text-rose-400" />}
              {!isSuccess && !isError && <Info className="w-4 h-4 text-blue-400" />}
            </div>
            <div className="flex-1 leading-relaxed">{n.message}</div>
            <button
              onClick={() => removeNotification(n.id)}
              className="text-slate-400 hover:text-white shrink-0 ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
