'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, Tag, Truck, CreditCard, Info, CheckCircle2, ChevronRight } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';

export const NotificationList: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'promo':
        return <Tag className="w-4 h-4 text-amber-600" />;
      case 'delivery':
        return <Truck className="w-4 h-4 text-zaam-green-600" />;
      case 'credit':
        return <CreditCard className="w-4 h-4 text-blue-600" />;
      default:
        return <Info className="w-4 h-4 text-neutral-600" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-soft-sm border border-neutral-200/80 space-y-4" id="notifications">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-neutral-100 rounded-lg text-neutral-700">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900">Wholesale Alerts & Promos</h3>
            <p className="text-[11px] text-neutral-500">Live operational & price drop updates</p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs text-zaam-green-600 hover:text-zaam-green-700 font-semibold flex items-center space-x-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* List */}
      <div className="space-y-2.5">
        {notifications.map((item) => (
          <div
            key={item.id}
            onClick={() => markAsRead(item.id)}
            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
              !item.read
                ? 'bg-zaam-green-50/40 border-zaam-green-200/80 hover:bg-zaam-green-50/70'
                : 'bg-neutral-50/50 border-neutral-200/60 hover:bg-neutral-100/50'
            }`}
          >
            <div className="p-2 rounded-lg bg-white shadow-xs flex-shrink-0 mt-0.5">
              {getIcon(item.type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-neutral-900 truncate">{item.title}</h4>
                <span className="text-[10px] text-neutral-400 font-medium ml-2 flex-shrink-0">{item.date}</span>
              </div>
              <p className="text-xs text-neutral-600 mt-0.5 line-clamp-2">{item.message}</p>

              {item.actionUrl && (
                <Link
                  href={item.actionUrl}
                  className="inline-flex items-center space-x-1 text-[11px] font-semibold text-zaam-green-700 hover:text-zaam-green-800 mt-1.5"
                >
                  <span>View Offer</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              )}
            </div>

            {!item.read && (
              <div className="w-2 h-2 rounded-full bg-zaam-green-600 flex-shrink-0 mt-2" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
