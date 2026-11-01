'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { NotificationItem } from '@/types';
import { zaamApi, getB2bAccessToken } from '@/lib/api';
import { ToastItem, ToastTone, ToastViewport } from '@/components/ui/ToastViewport';

type Toast = ToastItem;

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  refreshNotifications: () => Promise<void>;
  showToast: (message: string, type?: ToastTone) => void;
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

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastTone = 'success') => {
      setToasts((prev) => {
        // Deduplicate identical toasts already visible (avoids spam)
        if (prev.some((t) => t.message === message && t.type === type)) {
          return prev;
        }
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const duration = type === 'error' ? 6000 : 4000;
        window.setTimeout(() => removeToast(id), duration);
        return [...prev, { id, type, message }];
      });
    },
    [removeToast]
  );

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
      <ToastViewport toasts={toasts} onDismiss={removeToast} />
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
