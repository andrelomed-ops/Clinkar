import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';
import { BaseService } from './BaseService';

export interface ShippingQuote {
    distanceKm: number;
    cost: number;
    estimatedDays: number;
    provider: string;
}

export class LogisticsService extends BaseService {

    // MOCK: In production, this would call Google Maps API + Provider API
    static calculateShipping(origin: string, destination: string): ShippingQuote {
        // Simple mock logic:
        // Hash strings to get a consistent "random" distance for same inputs
        const combined = origin + destination;
        let hash = 0;
        for (let i = 0; i < combined.length; i++) {
            hash = combined.charCodeAt(i) + ((hash << 5) - hash);
        }

        const distanceKm = Math.abs(hash % 1500) + 50; // 50km to 1550km

        // Pricing Model: Base $1,500 + $3.5 per km
        let cost = 1500 + (distanceKm * 3.5);

        // Round to nearest 100
        cost = Math.ceil(cost / 100) * 100;

        return {
            distanceKm,
            cost,
            estimatedDays: Math.ceil(distanceKm / 400) + 1, // ~400km per day + buffer
            provider: 'Clinkar Logistics Network'
        };
    }

    static async createOrder(supabase: SupabaseClient<Database>, data: {
        transactionId: string;
        origin: string;
        destination: string;
        quote: ShippingQuote;
    }) {
        const { error } = await supabase
            .from('logistics_orders' as any)
            // @ts-ignore
            .insert({
                transaction_id: data.transactionId,
                origin_address: data.origin,
                destination_address: data.destination,
                distance_km: data.quote.distanceKm,
                cost: data.quote.cost,
                status: 'PENDING',
                estimated_delivery_date: new Date(Date.now() + (data.quote.estimatedDays * 86400000)).toISOString()
            });

        if (error) throw new Error(`Logistics Order Failed: ${error.message}`);

        return { success: true };
    }

    static async getOrder(supabase: SupabaseClient<Database>, transactionId: string) {
        const { data } = await supabase
            .from('logistics_orders' as any)
            .select('*')
            .eq('transaction_id', transactionId)
            .single();

        return data;
    }
}
