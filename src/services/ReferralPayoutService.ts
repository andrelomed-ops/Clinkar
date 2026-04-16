import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';
import { BaseService } from './BaseService';
import { Logger } from '@/lib/logger';
import { ConektaService } from './ConektaService';

export class ReferralPayoutService extends BaseService {
    static async createPayout(
        supabase: SupabaseClient<Database>,
        referralId: string,
        amount: number,
        description: string
    ): Promise<{ payoutId: string; paymentUrl: string } | null> {
        try {
            const { data, error: refError } = await supabase
                .from('referrals' as any)
                .select('id, referrer_id, transaction_id, actual_reward, status')
                .eq('id', referralId)
                .single();

            if (refError || !data) {
                Logger.error('[PAYOUT] Referral not found:', referralId);
                return null;
            }

            const referral = data as { id: string; referrer_id: string; transaction_id: string | null; actual_reward: number; status: string };

            if (referral.status !== 'OPERATION_CLOSED') {
                throw new Error('Referral must be OPERATION_CLOSED before payout');
            }

            const { data: referrerData } = await supabase
                .from('profiles')
                .select('email, full_name, phone')
                .eq('id', referral.referrer_id)
                .single();

            const referrerProfile = referrerData as { email?: string; full_name?: string; phone?: string } | null;

            const conektaLink = await ConektaService.createPaymentLink(
                amount,
                `Pago de referido: ${description}`,
                referralId,
                referrerProfile?.email,
                referrerProfile?.full_name,
                referrerProfile?.phone
            );

            if (!conektaLink) {
                throw new Error('No se pudo crear el link de pago');
            }

            await (supabase.from('referrals' as any) as any)
                .update({
                    status: 'PAID',
                    updated_at: new Date().toISOString(),
                })
                .eq('id', referralId);

            await (supabase.from('user_perks' as any) as any).insert({
                user_id: referral.referrer_id,
                perk_type: 'CONEKTA_PAYMENT_LINK',
                status: 'AVAILABLE',
                metadata: {
                    referral_id: referralId,
                    checkout_id: conektaLink.checkoutId,
                    payment_url: conektaLink.url,
                    amount: amount,
                    transaction_id: referral.transaction_id,
                    description: description,
                    paid_at: new Date().toISOString(),
                },
            });

            Logger.info(`[CONEKTA] Created payment link for referral ${referralId}: ${conektaLink.url}`);

            return {
                payoutId: conektaLink.checkoutId,
                paymentUrl: conektaLink.url,
            };
        } catch (error: any) {
            Logger.error('[PAYOUT] Error creating payout:', error);
            throw new Error(error.message || 'Error al procesar el pago');
        }
    }

    static async getPendingPayouts(
        supabase: SupabaseClient<Database>
    ): Promise<any[]> {
        const { data: referrals, error } = await supabase
            .from('referrals' as any)
            .select('*, referred_profile:profiles!referrals_referred_user_id_fkey(email, full_name), referrer_profile:profiles!referrals_referrer_id_fkey(email, full_name)')
            .eq('status', 'OPERATION_CLOSED')
            .order('updated_at', { ascending: false });

        if (error || !referrals) return [];

        return referrals;
    }
}