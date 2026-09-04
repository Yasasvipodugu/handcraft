import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notification } from '../types';
import { db } from '../services/database';
import { useAuth } from './AuthContext';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  toasts: ToastMessage[];
  showToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const loadNotifications = () => {
    if (currentUser) {
      const all = db.getNotifications(currentUser.id, currentUser.role);
      setNotifications(all);
    } else {
      setNotifications([]);
    }
  };

  useEffect(() => {
    loadNotifications();
    const unsub = db.subscribe('notifications', () => {
      loadNotifications();
    });
    return unsub;
  }, [currentUser?.id, currentUser?.role]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = (id: string) => {
    db.markNotificationRead(id);
    loadNotifications();
  };

  const markAllRead = () => {
    if (currentUser) {
      db.markAllNotificationsRead(currentUser.id);
      loadNotifications();
    }
  };

  const showToast = React.useCallback(
    (
      title: string,
      message: string,
      type: 'success' | 'info' | 'warning' | 'error' = 'success'
    ) => {
      setToasts((prev) => {
        // Deduplicate: If an identical toast is already active, ignore duplicate
        const isDuplicate = prev.some((t) => t.title === title && t.message === message);
        if (isDuplicate) return prev;

        const id = `toast-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const newToast: ToastMessage = { id, title, message, type };

        setTimeout(() => {
          removeToast(id);
        }, 3200);

        // Limit to at most 2 simultaneous toasts to prevent screen crowding
        const trimmed = prev.slice(-1);
        return [...trimmed, newToast];
      });
    },
    []
  );

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markRead,
        markAllRead,
        toasts,
        showToast,
        removeToast
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
};
