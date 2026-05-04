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
            marketValue: d.fair_price_suggested || (d.market_data as any)?.fair_price_suggested || (d.market_data as any)?.marketValue || d.price,
            digitalPassport: d.digital_passport_data || null,
            // Justicia & Certeza Fields (Direct Columns with JSONB fallback)
            provenance: (d as any).provenance || (d.market_data as any)?.provenance || 'original',
            reconditioning_budget: (d as any).reconditioning_budget || (d.market_data as any)?.reconditioning_budget || 0,
            reconditioning_notes: (d as any).reconditioning_notes || (d.market_data as any)?.reconditioning_notes || [],
            fair_price_suggested: (d as any).fair_price_suggested || (d.market_data as any)?.fair_price_suggested || d.price,
            legal_notes: (d as any).legal_notes || '',
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
            .in('status', [
                'available', 'PUBLISHED', 'CERTIFIED', 'AVAILABLE', 'certified', 'published', 
                'RESERVED', 'reserved', 'ACTIVE', 'active', 'pending_inspection',
                'PUBLICADO', 'RESERVADO', 'reservado', 'EN REVISIÓN', 'BORRADOR', 'ARCHIVADO'
            ]); 

        if (error) {
            Logger.error('Error fetching cars:', error);
            return [];
        }

        return (data as any[] || []).map(d => ({
            ...d,
            location: (d as any).market_data?.location || (d as any).location || 'México',
            distance: (d as any).mileage || 0,
            fuel: (d as any).fuel_type || 'Gasolina',
            transmission: (d as any).transmission || 'Automática',
            marketValue: (d as any).market_data?.marketValue || (d as any).price,
            images: Array.isArray((d as any).images) ? (d as any).images : [],
            condition: (d as any).condition || 'Seminuevo',
            category: (d as any).category || 'Car',
            has_starterkar_seal: d.has_clinkar_seal || (d.market_data as any)?.certified || false,
            flashSale: (d.market_data as any)?.flashSale || false,
            isBorder: (d.market_data as any)?.is_imported || (d.market_data as any)?.isBorder || false,
            is_new: (d.market_data as any)?.is_new || (d.market_data as any)?.isNew || false,
            is_investor_only: (d.market_data as any)?.is_investor_only || (d.market_data as any)?.investorOnly || false,
            is_imported: (d.market_data as any)?.is_imported || (d.market_data as any)?.isBorder || false,
            agency: (d.market_data as any)?.agency || '',
            bonus: (d.market_data as any)?.bonus || '',
            provenance: (d as any).provenance || (d.market_data as any)?.provenance || 'original',
            reconditioning_budget: (d as any).reconditioning_budget || (d.market_data as any)?.reconditioning_budget || 0,
            reconditioning_notes: (d as any).reconditioning_notes || (d.market_data as any)?.reconditioning_notes || [],
            fair_price_suggested: (d as any).fair_price_suggested || (d.market_data as any)?.fair_price_suggested || (d as any).price,
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
            minimum_price: carData.minimum_price || carData.price,
            is_new: carData.is_new || false,
            is_investor_only: carData.is_investor_only || false,
            is_imported: carData.is_imported || false,
            provenance: carData.provenance || 'original',
            reconditioning_budget: carData.reconditioning_budget || 0,
            reconditioning_notes: carData.reconditioning_notes || [],
            fair_price_suggested: carData.fair_price_suggested || carData.price
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
            has_clinkar_seal: carData.has_clinkar_seal || carData.has_starterkar_seal || false,
            // New Justicia & Certeza Columns
            provenance: carData.provenance || 'original',
            reconditioning_budget: carData.reconditioning_budget || 0,
            reconditioning_notes: carData.reconditioning_notes || [],
            fair_price_suggested: carData.fair_price_suggested || carData.price,
            legal_notes: carData.legal_notes || '',
            performance_score: carData.performance_score || 85,
            digital_passport_data: carData.digital_passport_data || {}
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
        const fuel_type = carData.technical_specs?.engine?.fuel_type || carData.fuel_type;
        const transmission = carData.technical_specs?.performance?.transmission || carData.transmission;
        const mileage = Number(carData.mileage) || 0;
        const price = Number(carData.price) || 0;

        const market_data = {
            ...(carData.market_data || {}),
            location: carData.location || 'CDMX',
            technical_specs: carData.technical_specs || {},
            category: carData.category || 'Car',
            minimum_price: Number(carData.minimum_price) || price,
            is_new: !!carData.is_new,
            is_investor_only: !!carData.is_investor_only,
            is_imported: !!carData.is_imported,
            provenance: carData.provenance || (carData.market_data as any)?.provenance || 'original',
            reconditioning_budget: carData.reconditioning_budget !== undefined ? Number(carData.reconditioning_budget) : (carData.market_data as any)?.reconditioning_budget || 0,
            reconditioning_notes: carData.reconditioning_notes || (carData.market_data as any)?.reconditioning_notes || [],
            fair_price_suggested: carData.fair_price_suggested !== undefined ? Number(carData.fair_price_suggested) : (carData.market_data as any)?.fair_price_suggested || price
        };

        const dbReadyData: any = {
            market_data
        };
        
        if (carData.make) dbReadyData.make = carData.make;
        if (carData.model) dbReadyData.model = carData.model;
        if (carData.year) dbReadyData.year = Number(carData.year);
        if (price >= 0) dbReadyData.price = price;
        if (carData.status) dbReadyData.status = carData.status;
        if (carData.description) dbReadyData.description = carData.description;
        if (carData.images) dbReadyData.images = carData.images;
        if (carData.vin) dbReadyData.vin = carData.vin;
        if (fuel_type) dbReadyData.fuel_type = fuel_type;
        if (transmission) dbReadyData.transmission = transmission;
        if (mileage >= 0) dbReadyData.mileage = mileage;
        if (carData.location) dbReadyData.location = carData.location;
        if (carData.category) dbReadyData.category = carData.category;
        
        const clinkarSeal = carData.has_clinkar_seal !== undefined ? carData.has_clinkar_seal : carData.has_starterkar_seal;
        if (clinkarSeal !== undefined) dbReadyData.has_clinkar_seal = !!clinkarSeal;

        // New Justicia & Certeza Columns (Direct Update)
        if (carData.provenance) dbReadyData.provenance = carData.provenance;
        if (carData.reconditioning_budget !== undefined) dbReadyData.reconditioning_budget = Number(carData.reconditioning_budget);
        if (carData.reconditioning_notes) dbReadyData.reconditioning_notes = carData.reconditioning_notes;
        if (carData.fair_price_suggested !== undefined) dbReadyData.fair_price_suggested = Number(carData.fair_price_suggested);
        if (carData.legal_notes) dbReadyData.legal_notes = carData.legal_notes;
        if (carData.performance_score !== undefined) dbReadyData.performance_score = Number(carData.performance_score);
        if (carData.digital_passport_data) dbReadyData.digital_passport_data = carData.digital_passport_data;

        const { error } = await (supabase.from('cars') as any)
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
