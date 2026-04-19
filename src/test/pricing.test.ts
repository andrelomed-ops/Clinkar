import { describe, it, expect } from 'vitest';
import { PricingService } from '../services/PricingService';

describe('PricingService', () => {
    it('should calculate market value for a 2023 Toyota', () => {
        const result = PricingService.calculateMarketValue({
            make: 'Toyota',
            model: 'Corolla',
            year: 2023,
            mileage: 10000,
            condition: 'excellent',
            transmission: 'automatic',
            fuel: 'gasoline',
        });

        expect(result.marketValue).toBeGreaterThan(150000);
        expect(result.range.min).toBeLessThan(result.marketValue);
        expect(result.range.max).toBeGreaterThan(result.marketValue);
    });

    it('should calculate lower value for older car', () => {
        const newCar = PricingService.calculateMarketValue({
            make: 'Honda',
            model: 'Civic',
            year: 2024,
            mileage: 0,
            condition: 'excellent',
            transmission: 'automatic',
            fuel: 'gasoline',
        });

        const oldCar = PricingService.calculateMarketValue({
            make: 'Honda',
            model: 'Civic',
            year: 2018,
            mileage: 80000,
            condition: 'fair',
            transmission: 'automatic',
            fuel: 'gasoline',
        });

        expect(newCar.marketValue).toBeGreaterThan(oldCar.marketValue);
    });

    it('should apply premium for electric vehicles', () => {
        const gasCar = PricingService.calculateMarketValue({
            make: 'Tesla',
            model: 'Model 3',
            year: 2023,
            mileage: 10000,
            condition: 'excellent',
            transmission: 'automatic',
            fuel: 'gasoline',
        });

        const electricCar = PricingService.calculateMarketValue({
            make: 'Tesla',
            model: 'Model 3',
            year: 2023,
            mileage: 10000,
            condition: 'excellent',
            transmission: 'automatic',
            fuel: 'electric',
        });

        expect(electricCar.marketValue).toBeGreaterThan(gasCar.marketValue);
    });

    it('should calculate seller commission correctly', () => {
        const commission500k = PricingService.calculateCommission(500000, 'seller');
        const commission100k = PricingService.calculateCommission(100000, 'seller');

        expect(commission500k).toBeGreaterThan(commission100k);
    });

    it('should calculate inspection price', () => {
        const inspectionPrice = PricingService.calculateServicePrice('inspection');
        expect(inspectionPrice).toBe(1500);
    });

    it('should calculate logistics price based on distance', () => {
        const shortDistance = PricingService.calculateServicePrice('logistics', 100);
        const longDistance = PricingService.calculateServicePrice('logistics', 500);

        expect(longDistance).toBeGreaterThan(shortDistance);
    });
});