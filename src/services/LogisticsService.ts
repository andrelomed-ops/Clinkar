import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';
import { BaseService } from './BaseService';
import { ILogisticsProvider } from './logistics/LogisticsProvider';
import { DefaultLogisticsProvider } from './logistics/DefaultLogisticsProvider';
import { GoogleMapsLogisticsProvider } from './logistics/GoogleMapsLogisticsProvider';
import { Logger } from '@/lib/logger';

export interface ShippingQuote {
    distanceKm: number;
    cost: number;
    estimatedDays: number;
    provider: string;
}

export class LogisticsService extends BaseService {
    private static provider: ILogisticsProvider | null = null;

    private static getProvider(): ILogisticsProvider {
        if (!this.provider) {
            const apiKey = process.env.GOOGLE_MAPS_API_KEY;
            if (apiKey && apiKey !== 'gm-placeholder') {
                this.provider = new GoogleMapsLogisticsProvider(apiKey);
            } else {
                this.provider = new DefaultLogisticsProvider();
            }
        }
        return this.provider!;
    }

    static async calculateShipping(
        supabase: SupabaseClient<Database>,
        origin: string,
        destination: string
    ): Promise<ShippingQuote> {
        // [COST-ZERO OPTIMIZATION]
        // 1. Check for EXACT route match
        const { data: exactMatch } = await supabase
            .from('logistics_orders' as any)
            .select('distance_km, cost, provider')
            .eq('origin_address', origin)
            .eq('destination_address', destination)
            .limit(1)
            .maybeSingle() as { data: { distance_km: number, cost: number, provider: string } | null };

        if (exactMatch) {
            Logger.info(`[Logistics Cache] Exact match for: ${origin} -> ${destination}`);
            return {
                distanceKm: exactMatch.distance_km,
                cost: exactMatch.cost,
                estimatedDays: Math.ceil(exactMatch.distance_km / 400) + 1,
                provider: `${exactMatch.provider} (Exact Cache)`
            };
        }

        // 2. FUZZY MATCH: Try matching by "City, State" substring if the strings are long
        // Simple heuristic: extract the last two segments (usually City, State or CP, City)
        const originParts = origin.split(',').map(p => p.trim());
        const destParts = destination.split(',').map(p => p.trim());
        
        if (originParts.length >= 2 && destParts.length >= 2) {
            const originCity = originParts.slice(-2).join(', ');
            const destCity = destParts.slice(-2).join(', ');

            const { data: cityMatch } = await supabase
                .from('logistics_orders' as any)
                .select('distance_km, cost, provider')
                .ilike('origin_address', `%${originCity}%`)
                .ilike('destination_address', `%${destCity}%`)
                .limit(1)
                .maybeSingle() as { data: { distance_km: number, cost: number, provider: string } | null };

            if (cityMatch) {
                Logger.info(`[Logistics Cache] Fuzzy city match for: ${originCity} -> ${destCity}`);
                return {
                    distanceKm: cityMatch.distance_km,
                    cost: cityMatch.cost,
                    estimatedDays: Math.ceil(cityMatch.distance_km / 400) + 1,
                    provider: `${cityMatch.provider} (City Cache)`
                };
            }
        }

        return await this.getProvider().calculateQuote(origin, destination);
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
