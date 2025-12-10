import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Notification, Alert } from '@/types/monitoring';

interface NotificationContextType {
  notifications: Notification[];
  alerts: Alert[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissNotification: (id: string) => void;
  dismissAlert: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Initial mock notifications
const initialNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'alert',
    title: 'SSL Certificate Expiring',
    message: 'SSL certificate for techstore.io expires in 14 days',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    read: false,
    category: 'security',
    actionUrl: '/sites',
    actionLabel: 'Renew Now',
  },
  {
    id: 'notif-2',
    type: 'success',
    title: 'Backup Completed',
    message: 'Daily backup for all sites completed successfully',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: false,
    category: 'system',
  },
  {
    id: 'notif-3',
    type: 'warning',
    title: 'High Traffic Alert',
    message: 'blogplatform.co experiencing 3x normal traffic',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    read: true,
    category: 'site',
  },
  {
    id: 'notif-4',
    type: 'info',
    title: 'New Integration Available',
    message: 'Cloudflare integration is now available',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: true,
    category: 'integration',
  },
];

const initialAlerts: Alert[] = [
  {
    id: 'alert-1',
    type: 'ssl_expiring',
    severity: 'warning',
    title: 'SSL Expiring Soon',
    message: 'techstore.io SSL certificate expires in 14 days',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    read: false,
    siteId: 'site-1',
    actionUrl: '/sites',
    actionLabel: 'Renew Certificate',
  },
  {
    id: 'alert-2',
    type: 'high_latency',
    severity: 'warning',
    title: 'Slow Response Time',
    message: 'blogplatform.co average response time: 2.3s',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    read: false,
    siteId: 'site-3',
  },
];

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);

  const unreadCount = notifications.filter(n => !n.read).length + alerts.filter(a => !a.read).length;

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const addAlert = useCallback((alert: Omit<Alert, 'id' | 'timestamp' | 'read'>) => {
    const newAlert: Alert = {
      ...alert,
      id: `alert-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setAlerts(prev => [newAlert, ...prev]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const dismissAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setAlerts([]);
  }, []);

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const random = Math.random();
      if (random < 0.1) {
        addNotification({
          type: 'info',
          title: 'Health Check Passed',
          message: 'All sites are responding normally',
          category: 'system',
        });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [addNotification]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        alerts,
        unreadCount,
        addNotification,
        addAlert,
        markAsRead,
        markAllAsRead,
        dismissNotification,
        dismissAlert,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
