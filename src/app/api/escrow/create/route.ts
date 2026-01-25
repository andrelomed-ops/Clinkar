import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { carId, carPrice, sellerId } = await request.json();

        if (!carId || !carPrice || !sellerId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Split logic constants
        const BUYER_COMMISSION = 3448.00;
        const totalBuyerPays = Number(carPrice) + BUYER_COMMISSION;

        // 1. Generate QR Release Secret
        const qrReleaseSecret = crypto.randomBytes(32).toString('hex');

        // 2. Create Stripe Payment Intent (MXN)
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(totalBuyerPays * 100), // convert to cents
            currency: 'mxn',
            metadata: {
                carId,
                buyerId: user.id,
                sellerId,
                type: 'clinkar_escrow'
            },
        });

        // 3. Create entry in the NEW transactions table
        const { data: transaction, error: dbError } = await supabase
            .from('transactions')
            .insert({
                car_id: carId,
                buyer_id: user.id,
                seller_id: sellerId,
                car_price: carPrice,
                buyer_commission: BUYER_COMMISSION,
                status: 'PENDING',
                qr_code: qrReleaseSecret,
                stripe_payment_intent_id: paymentIntent.id
            })
            .select()
            .single();

        if (dbError) {
            console.error('Database error:', dbError);
            return NextResponse.json({ error: 'Failed to create transaction record' }, { status: 500 });
        }

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            transactionId: transaction.id
        });

    } catch (error: any) {
        console.error('Stripe error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
