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

    static async getAllCars(supabase: SupabaseClient<Database>): Promise<Car[]> {
        const { data, error } = await supabase
            .from('cars')
            .select('*')
            .eq('status', 'PUBLISHED'); // Only show published cars

        if (error) {
            Logger.error('Error fetching cars:', error);
            return [];
        }

        return data || [];
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

    static async createCar(supabase: SupabaseClient<Database>, carData: Partial<Car>): Promise<Car | null> {
        const { data, error } = await supabase
            .from('cars')
            .insert(carData as any)
            .select()
            .single();

        if (error) {
            Logger.error('[CarService] Failed to create car:', error);
            return null;
        }

        return data;
    }
}
