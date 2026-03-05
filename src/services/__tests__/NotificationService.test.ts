import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationService } from '../NotificationService';

vi.mock('@/lib/logger', () => ({
    Logger: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
    },
}));

describe('NotificationService', () => {
    let mockSupabase: any;

    beforeEach(() => {
        mockSupabase = {
            from: vi.fn().mockReturnValue({
                insert: vi.fn().mockResolvedValue({ error: null }),
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({ data: [], error: null }),
                    order: vi.fn().mockResolvedValue({ data: [], error: null }),
                }),
                update: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({ error: null }),
                }),
            }),
            auth: {
                getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }),
            },
        };
    });

    describe('notify', () => {
        it('should create a notification successfully', async () => {
            const result = await NotificationService.notify(mockSupabase, {
                userId: 'user-123',
                title: 'Test Notification',
                message: 'This is a test',
                type: 'INFO',
            });

            expect(result).toBe(true);
            expect(mockSupabase.from).toHaveBeenCalledWith('notifications');
        });

        it('should handle error when creating notification fails', async () => {
            mockSupabase.from = vi.fn().mockReturnValue({
                insert: vi.fn().mockResolvedValue({ error: new Error('Insert failed') }),
            });

            const result = await NotificationService.notify(mockSupabase, {
                userId: 'user-123',
                title: 'Test Notification',
                message: 'This is a test',
                type: 'INFO',
            });

            expect(result).toBe(false);
        });
    });

    describe('notifyMultiple', () => {
        it('should create multiple notifications successfully', async () => {
            const notifications = [
                { userId: 'user-1', title: 'Test 1', message: 'Msg 1', type: 'INFO' as const },
                { userId: 'user-2', title: 'Test 2', message: 'Msg 2', type: 'SUCCESS' as const },
            ];

            const result = await NotificationService.notifyMultiple(mockSupabase, notifications);

            expect(result).toBe(true);
        });
    });

    describe('getNotifications', () => {
        it('should return empty array when no user is logged in', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

            const result = await NotificationService.getNotifications(mockSupabase);

            expect(result).toEqual([]);
        });

        it('should return notifications for logged in user', async () => {
            const mockNotifications = [
                { id: '1', title: 'Notif 1', message: 'Msg 1', is_read: false },
                { id: '2', title: 'Notif 2', message: 'Msg 2', is_read: true },
            ];
            
            mockSupabase.from = vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({ data: mockNotifications, error: null }),
                    order: vi.fn().mockResolvedValue({ data: mockNotifications, error: null }),
                }),
            });

            const result = await NotificationService.getNotifications(mockSupabase);

            expect(result).toEqual(mockNotifications);
        });
    });

    describe('markAsRead', () => {
        it('should mark notification as read', async () => {
            const result = await NotificationService.markAsRead(mockSupabase, 'notif-123');

            expect(result).toBe(true);
        });
    });
});
