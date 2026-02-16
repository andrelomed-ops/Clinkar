import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LogisticsService } from '../LogisticsService';

describe('LogisticsService', () => {

    it('should calculate shipping quote correctly (Mock Fallback)', async () => {
        const origin = 'Ciudad de México';
        const destination = 'Monterrey';
        const mockSupabase = { from: vi.fn().mockReturnThis(), select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis(), maybeSingle: vi.fn().mockResolvedValue({ data: null }) };

        const quote = await LogisticsService.calculateShipping(mockSupabase as any, origin, destination);

        expect(quote.distanceKm).toBeGreaterThan(0);
        expect(quote.cost).toBeGreaterThan(1500); // Base price
        expect(quote.provider).toContain('Clinkar Logistics Network');
    });

    it('should use FUZZY city cache if an exact address is not found', async () => {
        const origin = 'Street 123, Polanco, CDMX';
        const destination = 'Ave 456, Mitras, Monterrey';

        // Mocking a previous order from the same city/state
        const mockSupabase = {
            from: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            ilike: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn()
                // First call (exact match) returns null
                .mockResolvedValueOnce({ data: null })
                // Second call (fuzzy match) returns data
                .mockResolvedValueOnce({ data: { distance_km: 900, cost: 4500, provider: 'TestProvider' } })
        };

        const quote = await LogisticsService.calculateShipping(mockSupabase as any, origin, destination);

        expect(quote.provider).toContain('City Cache');
        expect(quote.distanceKm).toBe(900);
        expect(mockSupabase.ilike).toHaveBeenCalledWith('origin_address', '%Polanco, CDMX%');
    });
});
