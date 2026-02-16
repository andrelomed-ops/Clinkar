import { describe, it, expect, vi } from 'vitest';
import { PldService } from '../PldService';
import { SupabaseClient } from '@supabase/supabase-js';

describe('PldService', () => {
    const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        insert: vi.fn().mockResolvedValue({ error: null }),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
    } as unknown as SupabaseClient;

    it('should return CLEAN for a non-suspicious name', async () => {
        const result = await PldService.screenPerson(mockSupabase, 'user-123', 'Juan Pérez');
        expect(result.riskLevel).toBe('CLEAN');
        expect(result.matches).toHaveLength(0);
    });

    it('should return BLOCKED for names in OFAC list (e.g., Pablo Escobar)', async () => {
        const result = await PldService.screenPerson(mockSupabase, 'user-666', 'Pablo Escobar');
        expect(result.riskLevel).toBe('BLOCKED');
        expect(result.matches[0].list).toBe('OFAC');
    });

    it('should return WARNING for names in UIF list (e.g., Politico)', async () => {
        const result = await PldService.screenPerson(mockSupabase, 'user-777', 'Juan Politico');
        expect(result.riskLevel).toBe('WARNING');
        expect(result.matches[0].list).toBe('UIF');
    });
});
