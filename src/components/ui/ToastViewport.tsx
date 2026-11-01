'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';

export type ToastTone = 'success' | 'info' | 'warning' | 'error';

export type ToastItem = {
  id: string;
  type: ToastTone;
  message: string;
};

const TONE: Record<
  ToastTone,
  { wrap: string; icon: typeof CheckCircle2; label: string }
> = {
  success: {
    wrap: 'bg-zaam-green-600 text-white shadow-glow-green',
    icon: CheckCircle2,
    label: 'Success'
  },
  error: {
    wrap: 'bg-rose-600 text-white',
    icon: XCircle,
    label: 'Error'
  },
  warning: {
    wrap: 'bg-zaam-gold-500 text-zaam-dark-900 font-semibold',
    icon: AlertTriangle,
    label: 'Warning'
  },
  info: {
    wrap: 'bg-zaam-dark-800 text-white border border-neutral-700',
    icon: Info,
    label: 'Info'
  }
};

type Props = {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
};

export const ToastViewport: React.FC<Props> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4"
      aria-live="polite"
      aria-relevant="additions text"
    >
      {toasts.map((toast) => {
        const tone = TONE[toast.type];
        const Icon = tone.icon;
        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-2.5 p-3.5 rounded-xl shadow-soft-lg text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-200 ${tone.wrap}`}
          >
            <Icon className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
            <div className="flex-1 min-w-0">
              <span className="sr-only">{tone.label}: </span>
              <span className="leading-snug">{toast.message}</span>
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="shrink-0 p-1 rounded-md opacity-80 hover:opacity-100 hover:bg-black/10 transition-opacity"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
