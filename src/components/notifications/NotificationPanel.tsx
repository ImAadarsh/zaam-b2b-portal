'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, Tag, Truck, CreditCard, Info, CheckCircle2, ChevronRight } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';

type NotificationPanelProps = {
  /** Called after navigating via an alert link or mark-all (e.g. close header dropdown). */
  onNavigate?: () => void;
  /** Compact styling for header popover. */
  compact?: boolean;
  className?: string;
  id?: string;
};

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  onNavigate,
  compact = false,
  className = '',
  id,
}) => {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'promo':
        return <Tag className="w-4 h-4 text-amber-600" aria-hidden />;
      case 'delivery':
        return <Truck className="w-4 h-4 text-zaam-green-600" aria-hidden />;
      case 'credit':
        return <CreditCard className="w-4 h-4 text-blue-600" aria-hidden />;
      default:
        return <Info className="w-4 h-4 text-neutral-600" aria-hidden />;
    }
  };

  return (
    <div
      id={id}
      className={`bg-white space-y-3 ${compact ? 'p-3.5' : 'rounded-2xl p-5 shadow-soft-sm border border-neutral-200/80 space-y-4'} ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2 min-w-0">
          <div className="p-2 bg-neutral-100 rounded-lg text-neutral-700 shrink-0">
            <Bell className="w-4 h-4" aria-hidden />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-neutral-900 truncate">Wholesale Alerts & Promos</h3>
            <p className="text-[11px] text-neutral-500">Live operational & price drop updates</p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => {
              markAllAsRead();
            }}
            className="text-xs text-zaam-green-600 hover:text-zaam-green-700 font-semibold flex items-center space-x-1 shrink-0"
          >
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      <div className={`space-y-2.5 ${compact ? 'max-h-[min(22rem,60vh)] overflow-y-auto overscroll-contain pr-0.5' : ''}`}>
        {notifications.length === 0 && (
          <div className="text-center space-y-2 bg-neutral-50 border border-dashed border-neutral-200 rounded-xl px-3 py-5">
            <p className="text-xs font-semibold text-neutral-700">You&apos;re all caught up</p>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Price drops, delivery updates, and trade promos will show here when available.
            </p>
            <Link
              href="/shop"
              onClick={onNavigate}
              className="inline-flex text-[11px] font-bold text-zaam-green-700 hover:text-zaam-green-800"
            >
              Browse deals in catalog →
            </Link>
          </div>
        )}
        {notifications.map((item) => (
          <div
            key={item.id}
            role="button"
            tabIndex={0}
            onClick={() => markAsRead(item.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                markAsRead(item.id);
              }
            }}
            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
              !item.read
                ? 'bg-zaam-green-50/40 border-zaam-green-200/80 hover:bg-zaam-green-50/70'
                : 'bg-neutral-50/50 border-neutral-200/60 hover:bg-neutral-100/50'
            }`}
          >
            <div className="p-2 rounded-lg bg-white shadow-xs flex-shrink-0 mt-0.5">{getIcon(item.type)}</div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-bold text-neutral-900 truncate">{item.title}</h4>
                <span className="text-[10px] text-neutral-400 font-medium flex-shrink-0">{item.date}</span>
              </div>
              <p className="text-xs text-neutral-600 mt-0.5 line-clamp-2">{item.message}</p>

              {item.actionUrl && (
                <Link
                  href={item.actionUrl}
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsRead(item.id);
                    onNavigate?.();
                  }}
                  className="inline-flex items-center space-x-1 text-[11px] font-semibold text-zaam-green-700 hover:text-zaam-green-800 mt-1.5"
                >
                  <span>View Offer</span>
                  <ChevronRight className="w-3 h-3" aria-hidden />
                </Link>
              )}
            </div>

            {!item.read && <div className="w-2 h-2 rounded-full bg-zaam-green-600 flex-shrink-0 mt-2" aria-hidden />}
          </div>
        ))}
      </div>
    </div>
  );
};
