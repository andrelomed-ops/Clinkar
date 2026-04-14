import { BaseService } from './BaseService';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';
import { Logger } from '@/lib/logger';

const CONEKTA_API_URL = process.env.CONEKTA_API_URL || 'https://api.conekta.io';
const CONEKTA_API_KEY = process.env.CONEKTA_API_KEY;

interface ConektaCheckout {
    id: string;
    object: string;
    name: string;
    url: string;
    slug: string;
    status: 'Issued' | 'Pending' | 'Paid' | 'Expired';
    type: string;
    expires_at: number;
    allowed_payment_methods: string[];
    created_at: number;
    next_billing_date?: number;
}

export class ConektaService extends BaseService {
    static async createPaymentLink(
        amount: number,
        description: string,
        orderId: string
    ): Promise<{ url: string; checkoutId: string } | null> {
        if (!CONEKTA_API_KEY) {
            Logger.warn('[CONEKTA] API key not configured, skipping payment link creation');
            return null;
        }

        try {
            const expiresAt = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;

            const payload = {
                name: description.substring(0, 50),
                type: 'PaymentLink',
                recurrent: false,
                expires_at: expiresAt,
                allowed_payment_methods: ['cash', 'card', 'bank_transfer'],
                needs_shipping_contact: false,
                order_template: {
                    line_items: [
                        {
                            name: description,
                            unit_price: Math.round(amount * 100),
                            quantity: 1,
                            currency: 'MXN',
                        }
                    ],
                    currency: 'MXN',
                    customer_info: {
                        name: 'Referido StarterKar',
                        email: 'pagos@starterkar.com',
                        phone: '+5215555555555',
                    },
                },
                metadata: {
                    referral_id: orderId,
                    type: 'referral_payout',
                }
            };

            const response = await fetch(`${CONEKTA_API_URL}/checkouts`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/vnd.conekta-v2.2.0+json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${CONEKTA_API_KEY}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const error = await response.text();
                Logger.error('[CONEKTA] Error creating checkout:', error);
                throw new Error('Failed to create payment link');
            }

            const data = await response.json() as ConektaCheckout;

            Logger.info(`[CONEKTA] Created payment link ${data.id} for ${amount} MXN`);

            return {
                url: data.url,
                checkoutId: data.id,
            };
        } catch (error) {
            Logger.error('[CONEKTA] Exception:', error);
            return null;
        }
    }

    static async getCheckoutStatus(checkoutId: string): Promise<string | null> {
        if (!CONEKTA_API_KEY) {
            return null;
        }

        try {
            const response = await fetch(`${CONEKTA_API_URL}/checkouts/${checkoutId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/vnd.conekta-v2.2.0+json',
                    'Authorization': `Bearer ${CONEKTA_API_KEY}`,
                },
            });

            if (!response.ok) {
                return null;
            }

            const data = await response.json() as ConektaCheckout;
            return data.status;
        } catch (error) {
            Logger.error('[CONEKTA] Error getting checkout:', error);
            return null;
        }
    }

    static async getPaymentLinks(
        supabase: SupabaseClient<Database>,
        userId: string
    ): Promise<any[]> {
        const { data, error } = await supabase
            .from('user_perks' as any)
            .select('*')
            .eq('user_id', userId)
            .eq('perk_type', 'CONEKTA_PAYMENT_LINK')
            .order('created_at', { ascending: false });

        return data || [];
    }
}