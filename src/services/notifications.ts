import { supabase } from './supabase';
import type { Database } from '../types/database.types';

export const notificationsService = {
  /** Fetch recent notifications for a user, newest first */
  async getNotifications(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Failed to fetch notifications:', error);
      return [] as Database['public']['Tables']['notifications']['Row'][];
    }
    return data as Database['public']['Tables']['notifications']['Row'][];
  },

  /** Mark a notification as read */
  async markAsRead(id: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    if (error) {
      console.error('Failed to mark notification as read:', error);
      return false;
    }
    return true;
  },

  /** Subscribe to realtime INSERT events for a user's notifications */
  subscribeToNotifications(
    userId: string,
    onNewNotification: (payload: any) => void,
  ) {
    const channel = supabase
      .channel(`public:notifications_user_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          onNewNotification(payload.new);
        },
      )
      .subscribe();
    // Return unsubscribe function
    return () => {
      supabase.removeChannel(channel);
    };
  },
};
