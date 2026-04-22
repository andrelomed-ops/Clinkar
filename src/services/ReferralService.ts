/* eslint-disable @typescript-eslint/no-explicit-any */
import { Database } from '@/lib/database.types';
import { SupabaseClient } from '@supabase/supabase-js';
import { BaseService } from './BaseService';
import { Logger } from '@/lib/logger';
import { PRICING_CONFIG } from '@/config/pricing';

export class ReferralService extends BaseService {
    static async getOrCreateReferralCode(supabase: SupabaseClient<Database>, userId: string): Promise<string> {
        const { data } = await (supabase as any)
            .from('referral_links')
            .select('code')
            .eq('user_id', userId)
            .maybeSingle();

        if (data?.code) return data.code;

        const newCode = `STARTER-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        
        await (supabase as any).from('referral_links').insert({
            user_id: userId,
            code: newCode,
            reward_amount: PRICING_CONFIG.REFERRAL_REWARD_CASH
        });

        return newCode;
    }

    static async assignReferral(supabase: SupabaseClient<Database>, userId: string, code: string): Promise<void> {
        const { data: codeOwner } = await (supabase as any)
            .from('referral_links')
            .select('user_id')
            .eq('code', code)
            .single();

        if (!codeOwner) throw new Error('Código de referido inválido.');
        if (codeOwner.user_id === userId) throw new Error('No puedes referirte a ti mismo.');

        const { data: existing } = await (supabase as any)
            .from('referrals')
            .select('id')
            .eq('referred_user_id', userId)
            .maybeSingle();

        if (existing) return;

        await (supabase as any).from('referrals').insert({
            referrer_id: codeOwner.user_id,
            referred_user_id: userId,
            status: 'PENDING_OPERATION',
            reward_type: 'CASH'
        });
    }

    static async markOperationAsClosed(supabase: SupabaseClient<Database>, transactionId: string): Promise<void> {
        const { data: tx } = await (supabase as any)
            .from('transactions')
            .select('buyer_id, seller_id, car_price')
            .eq('id', transactionId)
            .single();

        if (!tx) return;

        const { data: buyerReferral } = await (supabase as any)
            .from('referrals')
            .select('*')
            .eq('referred_user_id', tx.buyer_id)
            .eq('status', 'PENDING_OPERATION')
            .maybeSingle();

        const { data: sellerReferral } = await (supabase as any)
            .from('referrals')
            .select('*')
            .eq('referred_user_id', tx.seller_id)
            .eq('status', 'PENDING_OPERATION')
            .maybeSingle();

        const processReward = async (referral: any) => {
            if (!referral) return;
            const rewardType = referral.reward_type || 'CASH';

            await (supabase as any).from('referrals').update({ 
                status: 'OPERATION_CLOSED', 
                transaction_id: transactionId,
                actual_reward: PRICING_CONFIG.REFERRAL_REWARD_CASH,
                updated_at: new Date().toISOString()
            }).eq('id', referral.id);

            await (supabase as any).from('user_perks').insert({
                user_id: referral.referrer_id,
                perk_type: rewardType,
                status: 'AVAILABLE',
                metadata: {
                    derived_from_referral: referral.id,
                    transaction_id: transactionId,
                    description: `Bono por referir usuario activo`
                }
            });

            Logger.info(`[REWARD] Granted ${rewardType} to user ${referral.referrer_id}`);
        };

        await processReward(buyerReferral);
        await processReward(sellerReferral);
    }
}