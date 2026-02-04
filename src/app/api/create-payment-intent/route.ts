
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-01-27.acacia' as any })
    : null;

export async function POST(request: Request) {
    try {
        const { amount, carId } = await request.json();

        // SIMULATION MODE (If no Stripe key is present)
        if (!stripe) {
            console.log("⚠️ Simulation Mode: No Stripe Key found.");
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            return NextResponse.json({
                clientSecret: "pi_mock_" + Math.random().toString(36).substring(7),
                isMock: true
            });
        }

        // REAL MODE
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe expects cents
            currency: 'mxn',
            metadata: { carId },
            automatic_payment_methods: { enabled: true },
        });

        return NextResponse.json({ clientSecret: paymentIntent.client_secret });

    } catch (error) {
        console.error('Payment Intent Error:', error);
        return NextResponse.json(
            { error: 'Error creating payment intent' },
            { status: 500 }
        );
    }
}
