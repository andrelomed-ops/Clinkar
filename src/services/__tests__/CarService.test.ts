import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CarService } from '../CarService';
import { SupabaseClient } from '@supabase/supabase-js';

vi.mock('@/lib/logger', () => ({
    Logger: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
    },
}));

describe('CarService', () => {
    let mockSupabase: any;

    beforeEach(() => {
        mockSupabase = {
            from: vi.fn().mockReturnValue({
                select: vi.fn().mockResolvedValue({ data: null, error: null }),
                insert: vi.fn().mockResolvedValue({ data: [{ id: 'car-1' }], error: null }),
                update: vi.fn().mockResolvedValue({ error: null }),
                eq: vi.fn().mockResolvedValue({ data: null, error: null }),
                single: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
        };
    });

    describe('getCarById', () => {
        it('should return null for invalid UUID', async () => {
            const result = await CarService.getCarById(mockSupabase, 'invalid-id');
            expect(result).toBeNull();
        });

        it('should return car for valid UUID', async () => {
            const mockCar = { id: '123e4567-e89b-12d3-a456-426614174000', make: 'Toyota', model: 'Corolla', year: 2023 };
            mockSupabase.from = vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({ data: [mockCar], error: null }),
                    single: vi.fn().mockResolvedValue({ data: mockCar, error: null }),
                }),
            });

            const result = await CarService.getCarById(mockSupabase, '123e4567-e89b-12d3-a456-426614174000');
            expect(result).toEqual(mockCar);
        });

        it('should handle database errors', async () => {
            mockSupabase.from = vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({ data: null, error: new Error('DB Error') }),
                    single: vi.fn().mockResolvedValue({ data: null, error: new Error('DB Error') }),
                }),
            });

            const result = await CarService.getCarById(mockSupabase, '123e4567-e89b-12d3-a456-426614174000');
            expect(result).toBeNull();
        });
    });

    describe('getCars', () => {
        it('should return list of cars', async () => {
            const mockCars = [
                { id: '1', make: 'Toyota', model: 'Corolla' },
                { id: '2', make: 'Honda', model: 'Civic' },
            ];
            mockSupabase.from = vi.fn().mockReturnValue({
                select: vi.fn().mockResolvedValue({ data: mockCars, error: null }),
            });

            const result = await CarService.getCars(mockSupabase);
            expect(result.data).toEqual(mockCars);
        });

        it('should handle errors when fetching cars', async () => {
            mockSupabase.from = vi.fn().mockReturnValue({
                select: vi.fn().mockResolvedValue({ data: null, error: new Error('Fetch Error') }),
            });

            const result = await CarService.getCars(mockSupabase);
            expect(result.error).toBeTruthy();
        });
    });

    describe('updateCarStatus', () => {
        it('should update car status successfully', async () => {
            const result = await CarService.updateCarStatus(mockSupabase, '123e4567-e89b-12d3-a456-426614174000', 'SOLD');
            expect(result).toBe(true);
        });

        it('should handle update errors', async () => {
            mockSupabase.from = vi.fn().mockReturnValue({
                update: vi.fn().mockResolvedValue({ error: new Error('Update Failed') }),
            });

            const result = await CarService.updateCarStatus(mockSupabase, '123e4567-e89b-12d3-a456-426614174000', 'SOLD');
            expect(result).toBe(false);
        });
    });
});
