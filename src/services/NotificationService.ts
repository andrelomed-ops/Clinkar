import { SupabaseClient } from '@supabase/supabase-js';

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'FINANCIAL';
    link?: string;
    is_read: boolean;
    created_at: string;
}

export class NotificationService {
    static async notify(supabase: SupabaseClient, data: {
        userId: string;
        title: string;
        message: string;
        type: Notification['type'];
        link?: string;
    }) {
        const { error } = await supabase
            .from('notifications')
            .insert({
                user_id: data.userId,
                title: data.title,
                message: data.message,
                type: data.type,
                link: data.link,
                is_read: false
            });

        if (error) {
            console.error('Error creating notification:', error);
            return false;
        }
        return true;
    }

    static async notifyMultiple(supabase: SupabaseClient, notifications: Array<{
        userId: string;
        title: string;
        message: string;
        type: Notification['type'];
        link?: string;
    }>) {
        const payload = notifications.map(n => ({
            user_id: n.userId,
            title: n.title,
            message: n.message,
            type: n.type,
            link: n.link,
            is_read: false
        }));

        const { error } = await supabase
            .from('notifications')
            .insert(payload);

        if (error) {
            console.error('Error creating multiple notifications:', error);
            return false;
        }
        return true;
    }
    static async getNotifications(supabase: SupabaseClient) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }

        return data as Notification[];
    }

    static async markAsRead(supabase: SupabaseClient, notificationId: string) {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId);

        if (error) {
            console.error('Error marking notification as read:', error);
            return false;
        }

        return true;
    }

    static async markAllAsRead(supabase: SupabaseClient) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false);

        if (error) {
            console.error('Error marking all notifications as read:', error);
            return false;
        }

        return true;
    }

    static subscribeToNotifications(
        supabase: SupabaseClient,
        userId: string,
        onNotification: (notification: Notification) => void
    ) {
        return supabase
            .channel(`notifications:${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`
                },
                (payload) => {
                    onNotification(payload.new as Notification);
                }
            )
            .subscribe();
    }
}
