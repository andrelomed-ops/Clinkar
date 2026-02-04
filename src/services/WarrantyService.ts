import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';
import { BaseService } from './BaseService';

export type WarrantyType = 'STANDARD' | 'EXTENDED';

export interface PolicyQuote {
    type: WarrantyType;
    cost: number;
    durationMonths: number;
    description: string;
}

export class WarrantyService extends BaseService {

    static getQuotes(carPrice: number, carId: string): PolicyQuote[] {
        // Mock pricing based on car value
        const standardCost = 2500; // 90 days
        const extendedCost = carPrice * 0.02; // 2% of car value for 12 months

        return [
            {
                type: 'STANDARD',
                cost: standardCost,
                durationMonths: 3,
                description: 'Cobertura Mecánica Básica con Clinkar (90 días).'
            },
            {
                type: 'EXTENDED',
                cost: extendedCost < 5000 ? 5000 : extendedCost, // Min 5000
                durationMonths: 12,
                description: 'Protección Total Extendida (12 meses).'
            }
        ];
    }

    static async issuePolicy(supabase: SupabaseClient<Database>, data: {
        carId: string;
        transactionId: string;
        type: WarrantyType;
        cost: number;
    }) {
        const durationMonths = data.type === 'STANDARD' ? 3 : 12;
        const now = new Date();
        const endDate = new Date(now);
        endDate.setMonth(now.getMonth() + durationMonths);

        const { data: policy, error } = await supabase
            .from('warranty_policies' as any)
            // @ts-ignore
            .insert({
                car_id: data.carId,
                transaction_id: data.transactionId,
                type: data.type,
                status: 'ACTIVE',
                start_date: now.toISOString(),
                end_date: endDate.toISOString(),
                coverage_cap_amount: data.cost * 10, // Mock cap
                coverage_details: { plan: data.type, provider: 'Clinkar Warranty' }
            })
            .select()
            .single();

        if (error) throw new Error(`Warranty Issue Failed: ${error.message}`);

        return policy;
    }

    // New: Logic for "Fix & Certify"
    static async upgradeToCertified(supabase: SupabaseClient<Database>, carId: string, repairCost: number) {
        // 1. Mark car as having seal (Software update, assuming physical repair happened)
        const { error } = await supabase.from('cars')
            // @ts-ignore
            .update({ has_clinkar_seal: true } as any)
            .eq('id', carId);

        if (error) throw new Error(`Failed to re-certify car: ${error.message}`);

        // 2. Return success
        return { success: true, verified: true };
    }
}
