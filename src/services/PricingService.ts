import { BaseService } from './BaseService';
import { Logger } from '@/lib/logger';

export interface VehicleInfo {
    make: string;
    model: string;
    year: number;
    mileage: number;
    condition: 'excellent' | 'good' | 'fair' | 'poor';
    transmission: 'automatic' | 'manual';
    fuel: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
}

export interface PricingResult {
    marketValue: number;
    range: { min: number; max: number };
    confidence: number;
    factors: PricingFactor[];
}

export interface PricingFactor {
    name: string;
    impact: number;
    description: string;
}

const BASE_PRICES: Record<string, number> = {
    'Toyota': 250000,
    'Honda': 240000,
    'Nissan': 220000,
    'Volkswagen': 230000,
    'Ford': 220000,
    'Chevrolet': 210000,
    'Mazda': 200000,
    'Hyundai': 190000,
    'Kia': 180000,
    'BMW': 450000,
    'Mercedes-Benz': 500000,
    'Audi': 400000,
    'Lexus': 550000,
    'Porsche': 800000,
    'Tesla': 600000,
};

const DEPRECIATION_BY_YEAR = [
    { years: 0, factor: 1.0 },
    { years: 1, factor: 0.85 },
    { years: 2, factor: 0.75 },
    { years: 3, factor: 0.65 },
    { years: 4, factor: 0.58 },
    { years: 5, factor: 0.52 },
    { years: 6, factor: 0.47 },
    { years: 7, factor: 0.43 },
    { years: 8, factor: 0.40 },
    { years: 9, factor: 0.37 },
    { years: 10, factor: 0.35 },
    { years: 15, factor: 0.25 },
    { years: 20, factor: 0.15 },
];

const MILEAGE_PENALTY_PER_10K = 0.02;
const MAX_MILEAGE_PENALTY = 0.30;

const CONDITION_ADJUSTMENTS = {
    'excellent': 1.15,
    'good': 1.00,
    'fair': 0.85,
    'poor': 0.65,
};

const TRANSMISSION_ADJUSTMENTS = {
    'automatic': 1.05,
    'manual': 1.00,
};

const FUEL_ADJUSTMENTS = {
    'electric': 1.30,
    'hybrid': 1.10,
    'diesel': 0.95,
    'gasoline': 1.00,
};

export class PricingService extends BaseService {
    static calculateMarketValue(vehicle: VehicleInfo): PricingResult {
        const factors: PricingFactor[] = [];

        const basePrice = BASE_PRICES[vehicle.make] || 200000;
        factors.push({
            name: 'Marca base',
            impact: basePrice,
            description: `Precio base para ${vehicle.make}`,
        });

        const vehicleAge = new Date().getFullYear() - vehicle.year;
        let ageFactor = 1;
        for (const dep of DEPRECIATION_BY_YEAR) {
            if (vehicleAge <= dep.years) {
                ageFactor = dep.factor;
                break;
            }
        }

        const ageAdjustment = basePrice * (ageFactor - 1);
        factors.push({
            name: 'Depreciación por edad',
            impact: ageAdjustment,
            description: `Auto de ${vehicleAge} años: ${(ageFactor * 100).toFixed(0)}% del valor`,
        });

        const mileageFactor = Math.min(
            vehicle.mileage / 10000 * MILEAGE_PENALTY_PER_10K,
            MAX_MILEAGE_PENALTY
        );
        const mileageAdjustment = basePrice * -mileageFactor;
        factors.push({
            name: 'Kilometraje',
            impact: mileageAdjustment,
            description: `${vehicle.mileage.toLocaleString()} km: -${(mileageFactor * 100).toFixed(0)}%`,
        });

        const conditionFactor = CONDITION_ADJUSTMENTS[vehicle.condition];
        const conditionAdjustment = basePrice * (conditionFactor - 1);
        factors.push({
            name: 'Condición',
            impact: conditionAdjustment,
            description: `Condición ${vehicle.condition}: ${(conditionFactor * 100).toFixed(0)}%`,
        });

        const transmissionFactor = TRANSMISSION_ADJUSTMENTS[vehicle.transmission];
        const transmissionAdjustment = basePrice * (transmissionFactor - 1);
        factors.push({
            name: 'Transmisión',
            impact: transmissionAdjustment,
            description: `Transmisión ${vehicle.transmission}`,
        });

        const fuelFactor = FUEL_ADJUSTMENTS[vehicle.fuel];
        const fuelAdjustment = basePrice * (fuelFactor - 1);
        factors.push({
            name: 'Tipo combustible',
            impact: fuelAdjustment,
            description: `Combustible ${vehicle.fuel}`,
        });

        const marketValue = Math.round(
            basePrice * ageFactor * conditionFactor * transmissionFactor * fuelFactor * (1 - mileageFactor)
        );

        const confidence = Math.max(0.5, 1 - (vehicleAge * 0.03) - (vehicle.mileage / 100000));

        const range = {
            min: Math.round(marketValue * 0.90),
            max: Math.round(marketValue * 1.10),
        };

        Logger.info(`[PRICING] Calculated market value: $${marketValue} for ${vehicle.year} ${vehicle.make} ${vehicle.model}`);

        return {
            marketValue,
            range,
            confidence: Math.min(confidence, 0.95),
            factors,
        };
    }

    static calculateCommission(price: number, role: 'buyer' | 'seller' = 'seller'): number {
        const rates = {
            seller: {
                min: 0.035,
                max: 0.05,
            },
            buyer: {
                min: 0,
                max: 0.02,
            },
        };

        let rate = rates[role].min;
        
        if (price < 200000) rate = rates[role].max;
        else if (price < 500000) rate = rates[role].min + 0.005;
        else if (price < 1000000) rate = rates[role].min;
        else rate = rates[role].min - 0.005;

        return Math.round(price * rate);
    }

    static calculateServicePrice(
        serviceType: 'inspection' | 'logistics' | 'warranty',
        distance?: number,
        vehicleValue?: number
    ): number {
        switch (serviceType) {
            case 'inspection':
                return 1500;

            case 'logistics':
                if (!distance) return 3000;
                const baseRate = 8;
                const perKm = distance * baseRate;
                return Math.max(2000, Math.round(perKm));

            case 'warranty':
                if (!vehicleValue) return 1500;
                return Math.round(vehicleValue * 0.03);

            default:
                return 0;
        }
    }
}