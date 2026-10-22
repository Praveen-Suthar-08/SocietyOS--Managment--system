'use client';

import * as React from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
}

// Global helper to trigger toasts from anywhere in the codebase
export function showAppToast(message: string, type: ToastType = 'success', title?: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('societyos-toast', {
        detail: {
          id: `toast-${Date.now()}-${Math.random()}`,
          message,
          type,
          title: title || (type === 'success' ? 'Finished / Done' : type === 'error' ? 'Notice / Alert' : 'System Update'),
        },
      })
    );
  }
}

export function ToastContainer() {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  React.useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<ToastMessage>;
      if (customEvent.detail) {
        setToasts((prev) => [...prev, customEvent.detail]);
        // Auto remove after 4 seconds
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== customEvent.detail.id));
        }, 4000);
      }
    };

    window.addEventListener('societyos-toast', handleToast);
    return () => window.removeEventListener('societyos-toast', handleToast);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto rounded-xl border p-4 shadow-xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in flex items-start gap-3',
              isSuccess && 'bg-surface/95 border-brand/40 text-ink shadow-brand/10',
              isError && 'bg-surface/95 border-emergency/40 text-ink shadow-emergency/10',
              isWarning && 'bg-surface/95 border-amber-500/40 text-ink shadow-amber-500/10',
              toast.type === 'info' && 'bg-surface/95 border-blue-500/40 text-ink shadow-blue-500/10'
            )}
          >
            <div className="flex-shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-brand" />}
              {isError && <XCircle className="w-5 h-5 text-emergency" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-500" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                {toast.title}
              </p>
              <p className="text-sm font-semibold text-ink mt-0.5 leading-snug">
                {toast.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-ink-muted hover:text-ink p-1 rounded-md transition-colors"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
