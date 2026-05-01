import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';
import { Logger } from '@/lib/logger';

export type Notification = Database['public']['Tables']['notifications']['Row'] & {
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'FINANCIAL' | string;
};

export class NotificationService {
    static async notify(supabase: SupabaseClient<Database>, data: {
        userId: string;
        title: string;
        message: string;
        type: 'INFO' | 'SUCCESS' | 'WARNING' | 'FINANCIAL' | string;
        link?: string;
    }) {
        const { error } = await (supabase.from('notifications') as any)
            .insert({
                user_id: data.userId,
                title: data.title,
                message: data.message,
                type: data.type,
                link: data.link || null,
                is_read: false
            });

        if (error) {
            Logger.error('Error creating notification:', error);
            return false;
        }
        return true;
    }

    static async notifyMultiple(supabase: SupabaseClient<Database>, notifications: Array<{
        userId: string;
        title: string;
        message: string;
        type: 'INFO' | 'SUCCESS' | 'WARNING' | 'FINANCIAL' | string;
        link?: string;
    }>) {
        const payload = notifications.map(n => ({
            user_id: n.userId,
            title: n.title,
            message: n.message,
            type: n.type,
            link: n.link || null,
            is_read: false
        }));

        const { error } = await (supabase.from('notifications') as any)
            .insert(payload);

        if (error) {
            Logger.error('Error creating multiple notifications:', error);
            return false;
        }
        return true;
    }

    static async getNotifications(supabase: SupabaseClient<Database>) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await (supabase.from('notifications') as any)
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            Logger.error('Error fetching notifications:', error);
            return [];
        }

        return data as Notification[];
    }

    static async markAsRead(supabase: SupabaseClient<Database>, notificationId: string) {
        const { error } = await (supabase.from('notifications') as any)
            .update({ is_read: true })
            .eq('id', notificationId);

        if (error) {
            Logger.error('Error marking notification as read:', error);
            return false;
        }

        return true;
    }

    static async markAllAsRead(supabase: SupabaseClient<Database>) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { error } = await (supabase.from('notifications') as any)
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false);

        if (error) {
            Logger.error('Error marking all notifications as read:', error);
            return false;
        }

        return true;
    }


    static subscribeToNotifications(
        supabase: SupabaseClient<Database>,
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

    static async notifyAdmin(supabase: SupabaseClient<Database>, data: {
        action: string;
        entityType: string;
        entityId?: string;
        metadata?: any;
    }) {
        // 1. Log to console for realtime server monitoring
        Logger.info(`[🚨 ADMIN ALERT] ${data.action} on ${data.entityType} ${data.entityId || ''}`, data.metadata);

        // 2. Try to get current user to attribute the action
        const { data: { user } } = await supabase.auth.getUser();

        // 3. Insert into audit logs for persistent platform trace
        try {
            await (supabase.from('audit_logs') as any).insert({
                actor_id: user?.id || '00000000-0000-0000-0000-000000000000',
                action: `ALERT: ${data.action}`,
                entity_type: data.entityType,
                entity_id: data.entityId || null,
                metadata: data.metadata || null
            });
        } catch (e) {
            Logger.error('Failed to save Admin Alert to audit logs:', e);
        }

        // 4. Send real UI notifications to all Admins
        try {
            await this.notifyAllAdmins(supabase, {
                title: `Nueva Alerta: ${data.action}`,
                message: `Se ha registrado una actividad en ${data.entityType}. ${data.metadata?.car ? `Unidad: ${data.metadata.car}` : ''}`,
                type: 'WARNING',
                link: data.entityType === 'TRANSACTION' ? `/admin` : undefined
            });
        } catch (e) {
            Logger.error('Failed to notify admins:', e);
        }
        
        return true;
    }

    static async notifyAllAdmins(supabase: SupabaseClient<Database>, data: {
        title: string;
        message: string;
        type: string;
        link?: string;
    }) {
        // Find all users with admin role
        const { data: admins } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'admin') as { data: { id: string }[] | null };

        if (!admins || admins.length === 0) return false;

        const notifications = admins.map(admin => ({
            userId: admin.id,
            title: data.title,
            message: data.message,
            type: data.type,
            link: data.link
        }));

        return await this.notifyMultiple(supabase, notifications);
    }
}
