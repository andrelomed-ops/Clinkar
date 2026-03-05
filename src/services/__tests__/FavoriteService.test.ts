import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FavoriteService } from '../FavoriteService';
import { SupabaseClient } from '@supabase/supabase-js';

vi.mock('@/lib/logger', () => ({
    Logger: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
    },
}));

const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
});

describe('FavoriteService', () => {
    let mockSupabase: any;

    beforeEach(() => {
        vi.clearAllMocks();
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(['car-1', 'car-2']));
        
        mockSupabase = {
            auth: {
                getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
            },
            from: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({ data: [], error: null }),
                }),
                insert: vi.fn().mockResolvedValue({ error: null }),
                delete: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({ error: null }),
                }),
            }),
        };
    });

    describe('getFavorites', () => {
        it('should return local favorites when no user is logged in', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
            
            const result = await FavoriteService.getFavorites(mockSupabase);
            
            expect(result).toEqual(['car-1', 'car-2']);
        });

        it('should merge local and DB favorites when user is logged in', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ 
                data: { user: { id: 'user-123' } } 
            });
            mockSupabase.from = vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({ 
                        data: [{ car_id: 'car-3' }], 
                        error: null 
                    }),
                }),
                insert: vi.fn().mockResolvedValue({ error: null }),
            });
            
            const result = await FavoriteService.getFavorites(mockSupabase);
            
            expect(result).toContain('car-3');
        });
    });

    describe('toggleFavorite', () => {
        it('should add car to favorites when not present', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
            
            const result = await FavoriteService.toggleFavorite(mockSupabase, 'car-new');
            
            expect(mockLocalStorage.setItem).toHaveBeenCalled();
        });
    });

    describe('getLocalFavorites', () => {
        it('should return empty array when no favorites in localStorage', async () => {
            mockLocalStorage.getItem.mockReturnValue(null);
            
            const result = (FavoriteService as any).getLocalFavorites();
            
            expect(result).toEqual([]);
        });
    });
});
