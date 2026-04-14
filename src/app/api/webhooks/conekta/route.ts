import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        
        const eventType = body.type;
        const data = body.data?.object;

        Logger.info(`[CONEKTA_WEBHOOK] Received: ${eventType}`);

        if (eventType === 'charge.paid') {
            const checkoutId = data.checkout_id || data.payment_link?.id;
            const amount = data.amount / 100;

            if (checkoutId) {
                const supabase = await createClient();

                const { data: perk, error } = await supabase
                    .from('user_perks' as any)
                    .select('*, referral_id, checkout_id')
                    .eq('metadata->checkout_id', checkoutId)
                    .limit(1)
                    .single();

                if (perk) {
                    await supabase
                        .from('user_perks' as any)
                        .update({
                            status: 'COMPLETED',
                            metadata: {
                                ...perk.metadata,
                                paid_at: new Date().toISOString(),
                                conekta_charge_id: data.id,
                            }
                        })
                        .eq('id', perk.id);

                    if (perk.referral_id) {
                        await supabase
                            .from('referrals' as any)
                            .update({ status: 'PAID' })
                            .eq('id', perk.referral_id);
                    }

                    Logger.info(`[CONEKTA_WEBHOOK] Payment confirmed for checkout ${checkoutId}`);
                }
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        Logger.error('[CONEKTA_WEBHOOK] Error:', error);
        return NextResponse.json({ error: 'Webhook handler error' }, { status: 500 });
    }
}