import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';
import { BaseService } from './BaseService';
import { Logger } from '@/lib/logger';

export class ReferralPayoutService extends BaseService {
    static async createConnectAccount(
        supabase: SupabaseClient<Database>,
        userId: string,
        email: string
    ): Promise<{ accountId: string; onboardingUrl: string } | null> {
        try {
            const account = await stripe.accounts.create({
                type: 'express',
                email: email,
                capabilities: {
                    transfers: { requested: true },
                },
                metadata: {
                    userId: userId,
                    type: 'referral_payout',
                },
            });

            const accountLink = await stripe.accountLinks.create({
                account: account.id,
                refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/referrals?reauth=true`,
                return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/referrals?success=true`,
                type: 'account_onboarding',
            });

            await supabase.from('user_perks' as any).insert({
                user_id: userId,
                perk_type: 'STRIPE_CONNECT_ACCOUNT',
                status: 'PENDING_SETUP',
                metadata: {
                    stripe_account_id: account.id,
                    created_at: new Date().toISOString(),
                },
            });

            Logger.info(`[STRIPE_CONNECT] Created account ${account.id} for user ${userId}`);

            return {
                accountId: account.id,
                onboardingUrl: accountLink.url,
            };
        } catch (error) {
            Logger.error('[STRIPE_CONNECT] Error creating account:', error);
            return null;
        }
    }

    static async getConnectAccountStatus(
        supabase: SupabaseClient<Database>,
        userId: string
    ): Promise<{ chargesEnabled: boolean; payoutsEnabled: boolean; detailsSubmitted: boolean } | null> {
        try {
            const { data: perk } = await supabase
                .from('user_perks' as any)
                .select('metadata')
                .eq('user_id', userId)
                .eq('perk_type', 'STRIPE_CONNECT_ACCOUNT')
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (!perk?.metadata?.stripe_account_id) {
                return null;
            }

            const account = await stripe.accounts.retrieve(perk.metadata.stripe_account_id);

            return {
                chargesEnabled: account.charges_enabled,
                payoutsEnabled: account.payouts_enabled,
                detailsSubmitted: account.details_submitted,
            };
        } catch (error) {
            Logger.error('[STRIPE_CONNECT] Error retrieving account status:', error);
            return null;
        }
    }

    static async createPayout(
        supabase: SupabaseClient<Database>,
        referralId: string,
        amount: number,
        description: string
    ): Promise<{ payoutId: string; transferId: string } | null> {
        try {
            const { data: referral, error: refError } = await supabase
                .from('referrals' as any)
                .select('id, referrer_id, transaction_id, actual_reward, status')
                .eq('id', referralId)
                .single();

            if (refError || !referral) {
                Logger.error('[PAYOUT] Referral not found:', referralId);
                return null;
            }

            if (referral.status !== 'OPERATION_CLOSED') {
                throw new Error('Referral must be OPERATION_CLOSED before payout');
            }

            const { data: perk, error: perkError } = await supabase
                .from('user_perks' as any)
                .select('metadata')
                .eq('user_id', referral.referrer_id)
                .eq('perk_type', 'STRIPE_CONNECT_ACCOUNT')
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (!perk?.metadata?.stripe_account_id) {
                throw new Error('Referrer no ha configurado transferencia con Stripe');
            }

            const accountId = perk.metadata.stripe_account_id;

            const amountInCentavos = Math.round(amount * 100);

            const transfer = await stripe.transfers.create({
                amount: amountInCentavos,
                currency: 'mxn',
                destination: accountId,
                metadata: {
                    referral_id: referralId,
                    transaction_id: referral.transaction_id || '',
                    description: description,
                },
                description: description,
            });

            await supabase
                .from('referrals' as any)
                .update({
                    status: 'PAID',
                    updated_at: new Date().toISOString(),
                })
                .eq('id', referralId);

            await supabase.from('user_perks' as any).insert({
                user_id: referral.referrer_id,
                perk_type: 'REFERRAL_PAYOUT',
                status: 'AVAILABLE',
                metadata: {
                    referral_id: referralId,
                    payout_id: transfer.id,
                    amount: amount,
                    transaction_id: referral.transaction_id,
                    description: description,
                    paid_at: new Date().toISOString(),
                },
            });

            Logger.info(`[PAYOUT] Created payout ${transfer.id} for ${amount} MXN to ${accountId}`);

            return {
                payoutId: transfer.id,
                transferId: transfer.id,
            };
        } catch (error: any) {
            Logger.error('[PAYOUT] Error creating payout:', error);
            throw new Error(error.message || 'Error al procesar el pago');
        }
    }

    static async getPayoutsByReferrer(
        supabase: SupabaseClient<Database>,
        userId: string
    ): Promise<any[]> {
        const { data: payouts, error } = await supabase
            .from('user_perks' as any)
            .select('*')
            .eq('user_id', userId)
            .eq('perk_type', 'REFERRAL_PAYOUT')
            .order('created_at', { ascending: false });

        return payouts || [];
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

        const enrichedReferrals = await Promise.all(
            referrals.map(async (ref: any) => {
                const { data: perk } = await supabase
                    .from('user_perks' as any)
                    .select('metadata')
                    .eq('user_id', ref.referrer_id)
                    .eq('perk_type', 'STRIPE_CONNECT_ACCOUNT')
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                return {
                    ...ref,
                    has_stripe_account: !!perk?.metadata?.stripe_account_id,
                    stripe_account_id: perk?.metadata?.stripe_account_id || null,
                };
            })
        );

        return enrichedReferrals;
    }
}