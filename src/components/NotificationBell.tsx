import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationsService } from '../services/notifications';
import { Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Database } from '../types/database.types';
import { useTranslation } from 'react-i18next';

export const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const userId = user?.id;
  const [notifications, setNotifications] = useState<Database['public']['Tables']['notifications']['Row'][]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch initial notifications
  useEffect(() => {
    if (!userId) return;
    const fetch = async () => {
      const data = await notificationsService.getNotifications(userId);
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    };
    fetch();
    const unsubscribe = notificationsService.subscribeToNotifications(userId, (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((c) => c + 1);
    });
    return () => {
      unsubscribe();
    };
  }, [userId]);

  // Click outside to close dropdown
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleNotificationClick = async (notification: Database['public']['Tables']['notifications']['Row']) => {
    if (!notification.is_read) {
      await notificationsService.markAsRead(notification.id);
      setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n)));
      setUnreadCount((c) => Math.max(c - 1, 0));
    }
    setDropdownOpen(false);
    if (notification.job_id) {
      navigate(notification.type === 'new_job'
        ? '/service-provider/find-jobs'
        : '/job-provider/my-jobs');
    }
  };

  const badge = () => {
    if (unreadCount === 0) return null;
    if (unreadCount > 9) {
      return <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">9+</span>;
    }
    return <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">{unreadCount}</span>;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="relative p-2 rounded-xl text-slate-600 hover:text-primary-600 hover:bg-orange-50 transition-colors"
        onClick={() => setDropdownOpen((o) => !o)}
        aria-label={t('notifications')}
      >
        <Bell className="w-5 h-5" />
        {badge()}
      </button>
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-20">
          {notifications.length === 0 && (
            <div className="p-4 text-sm text-slate-500">{t('noNotifications')}</div>
          )}
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-3 cursor-pointer hover:bg-slate-50 flex justify-between items-start ${n.is_read ? '' : 'bg-orange-50'}`}
              onClick={() => handleNotificationClick(n)}
            >
              <div className="flex flex-col">
                <span className="font-medium text-slate-800">{n.title}</span>
                <span className="text-sm text-slate-600">{n.message}</span>
              </div>
              <span className="text-xs text-slate-400 whitespace-nowrap ml-2">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
