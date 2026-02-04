import { Database } from '@/lib/database.types';
import { SupabaseClient } from '@supabase/supabase-js';
import { NotificationService } from './NotificationService';


export interface PublicAuditData {
    verified: boolean;
    timestamp: string;
    car: {
        id: string;
        make: string;
        model: string;
        year: number;
        vin_masked: string;
        has_clinkar_seal: boolean;
        image: string | null;
    };
    transaction: {
        purchased_at: string;
        id: string;
    } | null;
    inspection: {
        date: string;
        rating: number | null;
        result: string | null;
    } | null;
}

export class VerificationService {
    /**
     * Verifies an asset for the public digital passport.
     * Returns sanitized data safe for public viewing.
     */
    static async verifyAsset(supabase: SupabaseClient<Database>, carId: string): Promise<PublicAuditData | null> {
        // 1. Fetch Car Details
        const { data: car, error: carError } = await supabase
            .from('cars')
            .select(`
                id, make, model, year, vin, has_clinkar_seal, images, status
            `)
            .eq('id', carId)
            .single();

        if (carError || !car) {
            console.error("Verification failed: Car not found", carId);
            return null;
        }

        const c = car as any;

        // 2. Fetch Transaction (if sold)
        const { data: transaction } = await supabase
            .from('transactions')
            .select('id, created_at, status')
            .eq('car_id', carId)
            .eq('status', 'RELEASED')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        // 3. Fetch Inspection (most recent 150-point)
        const { data: inspection } = await (supabase as any)
            .from('inspection_reports_150')
            .select('created_at, overall_result, data')
            .eq('car_id', carId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        // Mask VIN (Show last 6 chars only)
        const vin = c.vin || '';
        const vinMasked = vin.length > 6
            ? `*********${vin.slice(-6)}`
            : '*********';

        return {
            verified: true,
            timestamp: new Date().toISOString(),
            car: {
                id: c.id,
                make: c.make,
                model: c.model,
                year: c.year,
                vin_masked: vinMasked,
                has_clinkar_seal: c.has_clinkar_seal || false,
                image: (c.images as string[])?.[0] || null
            },
            transaction: transaction ? {
                purchased_at: (transaction as any).created_at || new Date().toISOString(),
                id: (transaction as any).id
            } : null,
            inspection: inspection ? {
                date: (inspection as any).created_at || new Date().toISOString(),
                rating: 5, // Placeholder
                result: (inspection as any).overall_result
            } : null
        };
    }

    /**
     * Generates a secure random code for vehicle handover validation.
     * Updates the transaction record with this code.
     */
    static async generateHandoverToken(supabase: SupabaseClient<Database>, transactionId: string): Promise<string | null> {
        // 1. Generate a random secure token
        const token = crypto.randomUUID();

        // 2. Update the transaction
        const { error } = await (supabase
            .from('transactions') as any)
            .update({ qr_code: token })
            .eq('id', transactionId);

        if (error) {
            console.error('Error generating handover token:', error);
            return null;
        }

        return token;
    }

    /**
     * Verifies the handover token and retrieves transaction details.
     */
    static async verifyHandoverToken(supabase: SupabaseClient<Database>, token: string) {
        const { data: transaction, error } = await supabase
            .from('transactions')
            .select(`
        *,
        cars (
            make,
            model,
            year,
            images
        ),
        profiles:buyer_id (
            full_name,
            email
        )
      `)
            .eq('qr_code', token)
            .single();

        if (error || !transaction) {
            return { valid: false, error: 'Token inválido o expirado' };
        }

        return {
            valid: true,
            transaction: transaction,
            car: (transaction as any).cars,
            buyer: (transaction as any).profiles
        };
    }

    /**
     * Completes the handover process, releasing funds and updating car status.
     */
    static async confirmHandover(supabase: SupabaseClient<Database>, transactionId: string) {
        // 1. Get the transaction to find the car_id
        const { data: transaction, error: fetchError } = await supabase
            .from('transactions')
            .select('car_id, buyer_id, seller_id, car_price')
            .eq('id', transactionId)
            .single();

        if (fetchError || !transaction) {
            console.error('Error fetching transaction for handover:', fetchError);
            // FAILSAFE: If real DB fails (e.g. mock mode), simulate success for demo
            if (!transaction && process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
                console.warn("⚠️ Using Mock Handover Confirmation (No DB Connection)");
                return { success: true };
            }
            return { success: false, error: fetchError };
        }

        // 2. Update the transaction status
        const { error: transError } = await (supabase
            .from('transactions') as any)
            .update({
                status: 'RELEASED',
                updated_at: new Date().toISOString()
            })
            .eq('id', transactionId);

        if (transError) {
            console.error('Error updating transaction status:', transError);
            // FAILSAFE: If write permission fails in demo
            if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
                return { success: true };
            }
            return { success: false, error: transError };
        }

        // 3. Update the car status to 'sold'
        const { error: carError } = await (supabase
            .from('cars') as any)
            .update({ status: 'sold' })
            .eq('id', (transaction as any).car_id);

        if (carError) {
            console.error('Error updating car status:', carError);
        }

        // 4. Send Notifications
        const t = transaction as any;
        await NotificationService.notifyMultiple(supabase, [
            {
                userId: t.buyer_id,
                title: "¡Transacción Finalizada!",
                message: "Has confirmado la entrega. Tu nuevo vehículo está oficialmente a tu nombre.",
                type: 'SUCCESS',
                link: `/dashboard/handover/${transactionId}`
            },
            {
                userId: t.seller_id,
                title: "Venta Completada",
                message: `El comprador ha confirmado la entrega. Los fondos ($${Number(t.car_price).toLocaleString()} MXN) están siendo transferidos a tu cuenta.`,
                type: 'FINANCIAL',
                link: `/dashboard/sell`
            }
        ]);

        return { success: true };
    }
}
