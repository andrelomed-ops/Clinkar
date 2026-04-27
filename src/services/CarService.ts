import { Database } from '@/lib/database.types';
import { SupabaseClient } from '@supabase/supabase-js';
import { BaseService } from './BaseService';
import { CarSchema } from './schemas';
import { Logger } from '@/lib/logger';
import { LockService } from './LockService';

export type Car = Database['public']['Tables']['cars']['Row'];

export class CarService {
    static async getCarById(supabase: SupabaseClient<Database>, id: string): Promise<any | null> {
        // Validate if ID is a valid UUID to prevent Supabase 22P02 error (invalid_text_representation)
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

        if (!isUUID) {
            Logger.info(`[CarService] ID '${id}' is not a UUID. Skipping DB fetch.`);
            return null; // Fallback to mock data in Page
        }

        const query = supabase
            .from('cars')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        const result = await BaseService.validateAndHandle(query, CarSchema);

        if (!result.success) {
            return null;
        }

        const d = result.data;

        // Fetch Lock and Waitlist concurrency status
        const lockStatus = await LockService.checkLock(supabase, id);
        const waitlistCount = await LockService.getWaitlistCount(supabase, id);

        // Map DB fields to UI expected format (Mock compatibility)
        return {
            ...d,
            distance: d.mileage || 0,
            fuel: d.fuel_type || 'Gasoline',
            transmission: d.transmission || 'Automatic',
            location: (d.market_data as any)?.location || 'CDMX',
            technical_specs: (d.market_data as any)?.technical_specs || {},
            // Parse JSONB fields or fallback
            sensory: d.sensory_data || {},
            priceEquation: (d.market_data as any)?.priceEquation || {},
            marketValue: (d.market_data as any)?.marketValue || d.price,
            digitalPassport: d.digital_passport_data || null,
            // Enhanced Concurrency Info
            isCurrentlyLocked: lockStatus.isLocked,
            lockedUntil: lockStatus.expiresAt,
            interestedPeople: waitlistCount + (lockStatus.isLocked ? 1 : 0) // The one buying + waitlist
        };
    }

    static async getAllCars(supabase: SupabaseClient<Database>): Promise<any[]> {
        const { data, error } = await supabase
            .from('cars')
            .select('*')
            .in('status', ['available', 'PUBLISHED', 'CERTIFIED', 'AVAILABLE', 'certified', 'published', 'RESERVED', 'ACTIVE', 'active']); 

        if (error) {
            Logger.error('Error fetching cars:', error);
            return [];
        }

        return (data || []).map(d => ({
            ...d,
            location: (d.market_data as any)?.location || 'CDMX',
            distance: d.mileage || 0,
            fuel: d.fuel_type || 'Gasoline',
            transmission: d.transmission || 'Automatic',
            marketValue: (d.market_data as any)?.marketValue || d.price
        }));
    }

    static async updateCarStatus(supabase: SupabaseClient<Database>, id: string, status: string): Promise<boolean> {
        const { error } = await (supabase.from('cars') as any)
            .update({ status: status })
            .eq('id', id);

        if (error) {
            Logger.error(`[CarService] Failed to update car ${id} status to ${status}:`, error);
            return false;
        }

        Logger.info(`[CarService] Car ${id} locked with status: ${status}`);
        return true;
    }

    static async createCar(supabase: SupabaseClient<Database>, carData: any): Promise<Car | null> {
        // Explicitly map nested data to top-level columns if they exist
        const fuel_type = carData.technical_specs?.performance?.fuelType || carData.fuel_type;
        const transmission = carData.technical_specs?.performance?.transmission || carData.transmission;
        const mileage = carData.mileage || carData.technical_specs?.performance?.mileage;

        // Construct market_data for JSONB storage (preserves full richness)
        const market_data = {
            ...(carData.market_data || {}),
            location: carData.location || 'CDMX',
            technical_specs: carData.technical_specs || {},
            category: carData.category || 'Car',
            minimum_price: carData.minimum_price || carData.price
        };

        // Strict extraction of only valid DB columns based on REAL DB DISCOVERY
        const dbReadyData: any = {
            make: carData.make,
            model: carData.model,
            year: carData.year,
            price: carData.price,
            seller_id: carData.seller_id,
            status: carData.status || 'published',
            description: carData.description,
            images: carData.images || [],
            vin: carData.vin,
            fuel_type: fuel_type,
            transmission: transmission,
            mileage: mileage,
            market_data: market_data,
            location: carData.location || 'CDMX',
            category: carData.category || 'Car',
            technical_specs: carData.technical_specs || {},
            has_clinkar_seal: carData.has_clinkar_seal || carData.has_starterkar_seal || false
        };

        const { data, error } = await supabase
            .from('cars')
            .insert(dbReadyData)
            .select()
            .single();

        if (error) {
            console.error('[CarService] Supabase Error Details:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            Logger.error('[CarService] Failed to create car:', error);
            return null;
        }

        return data;
    }

    static async updateCar(supabase: SupabaseClient<Database>, id: string, carData: any): Promise<boolean> {
        // Explicitly map nested data to top-level columns if they exist
        const fuel_type = carData.technical_specs?.performance?.fuelType || carData.fuel_type;
        const transmission = carData.technical_specs?.performance?.transmission || carData.transmission;
        const mileage = carData.mileage || carData.technical_specs?.performance?.mileage;

        const market_data = {
            ...(carData.market_data || {}),
            location: carData.location || 'CDMX',
            technical_specs: carData.technical_specs || {},
            category: carData.category || 'Car',
            minimum_price: carData.minimum_price || carData.price
        };

        const dbReadyData: any = {
            market_data
        };
        
        // Only include fields if they are provided
        if (carData.make) dbReadyData.make = carData.make;
        if (carData.model) dbReadyData.model = carData.model;
        if (carData.year) dbReadyData.year = carData.year;
        if (carData.price) dbReadyData.price = carData.price;
        if (carData.status) dbReadyData.status = carData.status;
        if (carData.description) dbReadyData.description = carData.description;
        if (carData.images) dbReadyData.images = carData.images;
        if (carData.vin) dbReadyData.vin = carData.vin;
        if (fuel_type) dbReadyData.fuel_type = fuel_type;
        if (transmission) dbReadyData.transmission = transmission;
        if (mileage) dbReadyData.mileage = mileage;
        if (carData.location) dbReadyData.location = carData.location;
        if (carData.category) dbReadyData.category = carData.category;
        if (carData.technical_specs) dbReadyData.technical_specs = carData.technical_specs;
        
        const clinkarSeal = carData.has_clinkar_seal !== undefined ? carData.has_clinkar_seal : carData.has_starterkar_seal;
        if (clinkarSeal !== undefined) dbReadyData.has_clinkar_seal = clinkarSeal;

        const { error } = await supabase
            .from('cars')
            .update(dbReadyData)
            .eq('id', id);

        if (error) {
            console.error('[CarService] Update Error Details:', error);
            Logger.error('[CarService] Failed to update car:', error);
            return false;
        }

        return true;
    }
}
