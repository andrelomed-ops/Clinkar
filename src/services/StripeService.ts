import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

export class StripeService {
    /**
     * Creates a Stripe Checkout Session for a car purchase.
     */
    static async createCheckoutSession(
        carId: string,
        carTitle: string,
        amount: number, // Amount in centavos (MXN)
        imageUrl?: string
    ): Promise<{ sessionId: string; url: string }> {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'mxn',
                        product_data: {
                            name: carTitle,
                            images: imageUrl ? [imageUrl] : [],
                            metadata: {
                                carId: carId,
                            },
                        },
                        unit_amount: Math.round(amount * 100), // Ensure it's an integer
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/${carId}?canceled=true`,
            metadata: {
                carId: carId,
                type: 'CAR_PURCHASE'
            },
        });

        if (!session.url || !session.id) {
            throw new Error('Failed to create Stripe Checkout Session');
        }

        return { sessionId: session.id, url: session.url };
    }

    /**
     * Constructs a Stripe event from the raw body and signature.
     */
    static constructEvent(body: string, sig: string, secret: string): Stripe.Event {
        return stripe.webhooks.constructEvent(body, sig, secret);
    }
}
