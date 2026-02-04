import { NextResponse } from 'next/server';
import { StripeService } from '@/services/StripeService';
import { TransactionService } from '@/services/TransactionService';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
    const supabase = await createClient();
    const body = await req.text();
    const sig = req.headers.get('stripe-signature') as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        return NextResponse.json({ error: 'Missing Webhook Secret' }, { status: 500 });
    }

    let event;

    try {
        event = StripeService.constructEvent(body, sig, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed.`, err.message);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Handle the event
    try {
        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object;
                // Fulfill the purchase...
                console.log(`Checkout Session was completed! Session ID: ${session.id}`);
                if (session.id) {
                    await TransactionService.updateTransactionStatusBySessionId(supabase, session.id, 'IN_VAULT');
                }
                break;

            case 'payment_intent.succeeded':
                // NOTE: checkout.session.completed is usually sufficient for Checkout flows, 
                // but this is requested as a failsafe or for other flows.
                const paymentIntent = event.data.object;
                console.log(`PaymentIntent was successful! ID: ${paymentIntent.id}`);
                // Logic to link PI to Transaction might differ if we only stored Session ID.
                // Usually Checkout Session has the PI ID. 
                // We will stick to Session ID for now as it's the primary key we stored.
                break;

            case 'payment_intent.payment_failed':
                const paymentIntentFailed = event.data.object;
                console.log(`PaymentIntent failed. ID: ${paymentIntentFailed.id}`);
                //  await TransactionService.updateTransactionStatusBySessionId(..., 'FAILED');
                // Need to potentially map PI to Session if possible, or just log.
                break;

            default:
                console.log(`Unhandled event type ${event.type}`);
        }
    } catch (err: any) {
        console.error(`Error handling event: ${err.message}`);
        return NextResponse.json({ error: 'Error handling event' }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}

export const dynamic = 'force-dynamic'; // Ensure it's not cached
