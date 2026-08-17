'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { NotificationItem } from '@/types';
import { zaamApi, getB2bAccessToken } from '@/lib/api';

interface Toast {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  refreshNotifications: () => Promise<void>;
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  toasts: Toast[];
  removeToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const refreshNotifications = useCallback(async () => {
    if (!getB2bAccessToken()) {
      setNotifications([]);
      return;
    }
    try {
      const rows = await zaamApi.getNotifications();
      setNotifications(rows);
    } catch {
      // Keep prior list; surface via toast only when user-initiated
    }
  }, []);

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await zaamApi.markNotificationRead(id);
    } catch {
      /* ignore */
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await zaamApi.markAllNotificationsRead();
    } catch {
      /* ignore */
    }
  };

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setToasts((prev) => {
      // Deduplicate identical toasts already visible (avoids "Route not found" spam)
      if (prev.some((t) => t.message === message && t.type === type)) {
        return prev;
      }
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setTimeout(() => removeToast(id), 4000);
      return [...prev, { id, type, message }];
    });
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        refreshNotifications,
        showToast,
        toasts,
        removeToast
      }}
    >
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl shadow-soft-lg text-sm font-medium transition-all duration-300 ${
              toast.type === 'success'
                ? 'bg-zaam-green-600 text-white shadow-glow-green'
                : toast.type === 'error'
                  ? 'bg-rose-600 text-white'
                  : toast.type === 'warning'
                    ? 'bg-zaam-gold-500 text-zaam-dark-900 font-semibold'
                    : 'bg-zaam-dark-800 text-white border border-neutral-700'
            }`}
          >
            <span>{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="ml-3 text-white/80 hover:text-white p-1">
              ✕
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
