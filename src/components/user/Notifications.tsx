import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertCircle, Clock, FileText, Trash2, Check, RefreshCw, Mail, Smartphone, Globe } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  claimId?: string;
  timestamp: string;
  read: boolean;
  metadata?: any;
}

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [preferences, setPreferences] = useState({
    emailEnabled: true,
    pushEnabled: true,
    smsEnabled: false
  });
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    fetchNotifications();

    // Set up real-time notifications via WebSocket
    const socket = (window as any).io && (window as any).io();
    if (socket) {
      socket.on('new_notification', (data: any) => {
        console.log('New notification received:', data);
        fetchNotifications(); // Refresh notifications
      });

      socket.on('notification_read', (data: any) => {
        console.log('Notification read update:', data);
        fetchNotifications(); // Refresh notifications
      });

      return () => {
        socket.disconnect();
      };
    }
  }, []);

  const getToken = (): string | null => {
    return localStorage.getItem('token');
  };

  const fetchNotifications = async () => {
    const token = getToken();
    if (!token) {
      setNotifications(getMockNotifications());
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setNotifications(data.notifications || []);
      } else {
        throw new Error(data.error || 'Failed to fetch notifications');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Fallback to mock data if API fails
      setNotifications(getMockNotifications());
    } finally {
      setLoading(false);
    }
  };

  const getMockNotifications = (): Notification[] => {
    return [
      {
        id: '1',
        type: 'success',
        title: 'Claim Approved',
        message: 'Your claim #CLM-2024-8543 has been approved. Payment will be processed within 24-48 hours.',
        claimId: 'CLM-2024-8543',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: false,
      },
      {
        id: '2',
        type: 'info',
        title: 'Document Uploaded',
        message: 'Your document for claim #CLM-2024-8721 has been successfully uploaded and is being reviewed.',
        claimId: 'CLM-2024-8721',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        read: false,
      },
      {
        id: '3',
        type: 'warning',
        title: 'Additional Information Required',
        message: 'Please provide additional documentation for claim #CLM-2024-8650 to continue processing.',
        claimId: 'CLM-2024-8650',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        read: true,
      },
    ];
  };

  const formatTime = (timestamp: string): string => {
    if (!timestamp) return 'Just now';

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;

    return date.toLocaleDateString();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-success" />;
      case 'warning':
        return <AlertCircle size={20} className="text-warning" />;
      case 'info':
        return <FileText size={20} className="text-primary" />;
      default:
        return <Bell size={20} className="text-muted-foreground" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-success/10 border-success/20';
      case 'warning':
        return 'bg-warning/10 border-warning/20';
      case 'info':
        return 'bg-primary/10 border-primary/20';
      default:
        return 'bg-muted/10 border-border';
    }
  };

  const markAsRead = async (id: string) => {
    const token = getToken();
    if (!token) {
      // Update local state if no token
      setNotifications(
        notifications.map((notif) =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/notifications/read', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notificationId: id })
      });

      if (response.ok) {
        // Update local state
        setNotifications(
          notifications.map((notif) =>
            notif.id === id ? { ...notif, read: true } : notif
          )
        );
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
      // Fallback to local update
      setNotifications(
        notifications.map((notif) =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
    }
  };

  const markAllAsRead = async () => {
    const token = getToken();
    if (!token) {
      // Update local state if no token
      setNotifications(
        notifications.map((notif) => ({ ...notif, read: true }))
      );
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/notifications/read-all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Update local state
        setNotifications(
          notifications.map((notif) => ({ ...notif, read: true }))
        );
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      // Fallback to local update
      setNotifications(
        notifications.map((notif) => ({ ...notif, read: true }))
      );
    }
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((notif) => notif.id !== id));
  };

  const filteredNotifications =
    filter === 'unread'
      ? notifications.filter((n) => !n.read)
      : notifications;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-foreground">Notifications</h1>
          {unreadCount > 0 && (
            <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm">
              {unreadCount} new
            </span>
          )}
        </div>
        <p className="text-muted-foreground">Stay updated on your claims and account activity</p>
      </div>

      {/* Actions Bar */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6 shadow-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Filter Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${filter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
                }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg transition-colors ${filter === 'unread'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
                }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Actions */}
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <Check size={18} />
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`bg-card border rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all ${!notification.read ? getBgColor(notification.type) : 'border-border'
              }`}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="shrink-0 mt-1">{getIcon(notification.type)}</div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className={`text-foreground ${!notification.read ? 'font-semibold' : ''}`}>
                    {notification.title}
                  </h3>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-2"></div>
                  )}
                </div>

                <p className="text-muted-foreground mb-3">{notification.message}</p>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock size={14} />
                      {formatTime(notification.timestamp)}
                    </div>
                    {notification.claimId && (
                      <button className="text-sm text-primary hover:underline">
                        View Claim {notification.claimId}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <Check size={18} className="text-muted-foreground" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                      title="Delete notification"
                    >
                      <Trash2 size={18} className="text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredNotifications.length === 0 && (
          <div className="bg-card border border-border rounded-xl p-12 text-center shadow-card">
            <div className="bg-muted/50 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Bell size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-foreground mb-2">No Notifications</h3>
            <p className="text-muted-foreground">
              {filter === 'unread'
                ? "You're all caught up! No unread notifications."
                : "You don't have any notifications yet."}
            </p>
          </div>
        )}
      </div>

      {/* Notification Settings */}
      <div className="bg-card border border-border rounded-xl p-6 mt-8 shadow-card">
        <h3 className="text-foreground mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground mb-1">Claim Status Updates</p>
              <p className="text-sm text-muted-foreground">Get notified when your claim status changes</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-muted peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground mb-1">Payment Notifications</p>
              <p className="text-sm text-muted-foreground">Get notified about payment processing</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-muted peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground mb-1">Document Requests</p>
              <p className="text-sm text-muted-foreground">Get notified when additional documents are needed</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-muted peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
