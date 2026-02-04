import { Database } from '@/lib/database.types';
import { SupabaseClient } from '@supabase/supabase-js';
import { BaseService } from './BaseService';
import { CarSchema } from './schemas';

export type Car = Database['public']['Tables']['cars']['Row'];

export class CarService {
    static async getCarById(supabase: SupabaseClient<Database>, id: string): Promise<any | null> {
        // Validate if ID is a valid UUID to prevent Supabase 22P02 error (invalid_text_representation)
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

        if (!isUUID) {
            console.log(`[CarService] ID '${id}' is not a UUID. Skipping DB fetch.`);
            return null; // Fallback to mock data in Page
        }

        const query = supabase
            .from('cars')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        const result = await BaseService.validateAndHandle(query as any, CarSchema);

        if (!result.success) {
            return null;
        }

        const d = result.data as any;
        // Map DB fields to UI expected format (Mock compatibility)
        return {
            ...d,
            distance: d.mileage || 0,
            fuel: d.fuel_type || 'Gasoline',
            transmission: d.transmission || 'Automatic',
            // Parse JSONB fields or fallback
            sensory: d.sensory_data || {},
            priceEquation: d.market_data?.priceEquation || {},
            marketValue: d.market_data?.marketValue || d.price,
            digitalPassport: d.digital_passport_data || null
        };
    }

    static async getAllCars(supabase: SupabaseClient<Database>): Promise<Car[]> {
        const { data, error } = await supabase
            .from('cars')
            .select('*')
            .eq('status', 'PUBLISHED'); // Only show published cars

        if (error) {
            console.error('Error fetching cars:', error);
            return [];
        }

        return data as any[];
    }

    static async updateCarStatus(supabase: SupabaseClient<Database>, id: string, status: string): Promise<boolean> {
        const { error } = await supabase
            .from('cars')
            // @ts-ignore
            .update({ status: status })
            .eq('id', id);

        if (error) {
            console.error(`[CarService] Failed to update car ${id} status to ${status}:`, error);
            return false;
        }

        console.log(`[CarService] Car ${id} locked with status: ${status}`);
        return true;
    }
}
