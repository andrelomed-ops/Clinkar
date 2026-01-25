import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

export async function POST(request: Request) {
    const body = await request.text();
    const signature = (await headers()).get('stripe-signature') as string;

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    const supabase = await createClient();

    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as any;

        // 1. Update transaction and fetch data for notification
        const { data: transaction, error: updateError } = await supabase
            .from('transactions')
            .update({ status: 'IN_VAULT' })
            .eq('stripe_payment_intent_id', paymentIntent.id)
            .select('seller_id, car_id, car_price')
            .single();

        if (updateError) {
            console.error('Webhook DB update error:', updateError);
        } else if (transaction) {
            // 2. Create notification for Seller
            await supabase
                .from('notifications')
                .insert({
                    user_id: transaction.seller_id,
                    title: '💰 ¡Bóveda Fondeada!',
                    message: `El pago por tu auto de $${Number(transaction.car_price).toLocaleString()} ya está en la Bóveda Digital.`,
                    type: 'FINANCIAL',
                    link: '/dashboard'
                });
        }
    }

    return NextResponse.json({ received: true });
}
