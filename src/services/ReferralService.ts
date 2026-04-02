import { Database } from '@/lib/database.types';
import { SupabaseClient } from '@supabase/supabase-js';
import { BaseService } from './BaseService';
import { Logger } from '@/lib/logger';
import { PRICING_CONFIG } from '@/config/pricing';

export type Referral = any; // Fallback for missing types in DB schema

export class ReferralService extends BaseService {
    /**
     * Get or create a referral code for a user
     */
    static async getOrCreateReferralCode(supabase: SupabaseClient<Database>, userId: string): Promise<string> {
        const { data, error } = await supabase
            .from('referral_codes' as any)
            .select('code')
            .eq('user_id', userId)
            .maybeSingle();

        if (data?.code) return data.code;

        // Generate new code: STARTER-XXXX
        const newCode = `STARTER-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        
        const { error: insertError } = await supabase
            .from('referral_codes' as any)
            .insert({
                user_id: userId,
                code: newCode,
                default_reward_amount: PRICING_CONFIG.REFERRAL_REWARD_CASH
            } as any);

        if (insertError) {
            Logger.error('Error creating referral code:', insertError);
            throw new Error('No se pudo generar el código de referidos.');
        }

        return newCode;
    }

    /**
     * Assign a referral to a new user
     */
    static async assignReferral(supabase: SupabaseClient<Database>, userId: string, code: string): Promise<void> {
        // 1. Find the owner of the code
        const { data: codeOwner, error: codeError } = await supabase
            .from('referral_codes' as any)
            .select('user_id')
            .eq('code', code)
            .single();

        if (codeError || !codeOwner) {
            throw new Error('Código de referido inválido.');
        }

        if (codeOwner.user_id === userId) {
            throw new Error('No puedes referirte a ti mismo.');
        }

        // 2. Check if user already has a referral
        const { data: existing } = await supabase
            .from('referals' as any)
            .select('id')
            .eq('referred_id', userId)
            .maybeSingle();

        if (existing) return; // Already referred

        // 3. Create the referral link
        const { error: insertError } = await supabase
            .from('referrals' as any)
            .insert({
                referrer_id: codeOwner.user_id,
                referred_id: userId,
                status: 'PENDING',
                reward_type: 'CASH' // Defaulting to CASH for now as per schema
            } as any);

        if (insertError) {
            Logger.error('Error assigning referral:', insertError);
        }
    }

    /**
     * Mark an operation as closed and trigger rewards
     */
    static async markOperationAsClosed(supabase: SupabaseClient<Database>, transactionId: string): Promise<void> {
        // 1. Get transaction details
        const { data: tx } = await supabase
            .from('transactions')
            .select('buyer_id, seller_id, car_price')
            .eq('id', transactionId)
            .single();

        if (!tx) return;

        // 2. Check if buyer or seller were referred
        const { data: buyerReferral } = await supabase
            .from('referrals' as any)
            .select('*')
            .eq('referred_id', tx.buyer_id)
            .eq('status', 'PENDING')
            .maybeSingle();

        const { data: sellerReferral } = await supabase
            .from('referrals' as any)
            .select('*')
            .eq('referred_id', tx.seller_id)
            .eq('status', 'PENDING')
            .maybeSingle();

        // 3. Process rewards
        const processReward = async (referral: any) => {
            if (!referral) return;

            const rewardType = referral.reward_type || 'CASH';
            let description = "";
            let perkType = rewardType;

            switch (rewardType) {
                case 'CASH':
                    description = `Bono en efectivo por referir a un usuario activo.`;
                    break;
                case 'FREE_INSPECTION':
                    description = `Inspección de 150 puntos gratuita por referir a un usuario activo.`;
                    perkType = 'FREE_INSPECTION';
                    break;
                case 'FEE_DISCOUNT':
                    description = `50% de descuento en tu próxima comisión de venta por referir a un usuario activo.`;
                    perkType = 'FEE_DISCOUNT';
                    break;
            }

            // Update referral record
            await supabase
                .from('referrals' as any)
                .update({ 
                    status: 'COMPLETED', 
                    transaction_id: transactionId,
                    actual_reward: PRICING_CONFIG.REFERRAL_REWARD_CASH,
                    updated_at: new Date().toISOString()
                } as any)
                .eq('id', referral.id);

            // Grant Perk to Referrer
            await supabase
                .from('user_perks' as any)
                .insert({
                    user_id: referral.referrer_id,
                    perk_type: perkType,
                    status: 'AVAILABLE',
                    metadata: {
                        derived_from_referral: referral.id,
                        transaction_id: transactionId,
                        description
                    }
                } as any);

            Logger.info(`[REWARD] Granted ${rewardType} perk to user ${referral.referrer_id}`);
        };

        await processReward(buyerReferral);
        await processReward(sellerReferral);
    }
}
