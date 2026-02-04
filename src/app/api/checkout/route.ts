import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { StripeService } from '@/services/StripeService';
import { TransactionService } from '@/services/TransactionService';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // NOTE: In a real protected app, we would enforce this. 
        // For specific test flows where auth might be bypassed or mocked, strictly handled here.
        if (!user) {
            // Allow for dev mode testing if needed, but normally 401. 
            // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { carId, carTitle, amount, imageUrl } = body;

        if (!carId || !amount) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Fetch Car Details (Seller, Price, etc.)
        const { data: car, error: carError } = await supabase
            .from('cars')
            .select('id, seller_id, price, make, model, year')
            .eq('id', carId)
            .single();

        if (carError || !car) {
            return NextResponse.json({ error: 'Car not found' }, { status: 404 });
        }

        // Validate amount (simple check to ensure frontend isn't tampering too much)
        // If frontend passes amount, check if it matches car price approx or if we should just use car.price
        // Let's use car.price from DB as the source of truth for the transaction record, 
        // but maybe the checkout session allows dynamic deposits? 
        // For now, let's assume full price or trust the logic. 
        // We will use car.price for the DB record if available, or fallback to passed amount.
        const finalAmount = car.price || amount;

        // 2. Create Checkout Session
        const { sessionId, url } = await StripeService.createCheckoutSession(
            carId,
            carTitle || `${car.make} ${car.model} ${car.year}`,
            finalAmount,
            imageUrl
        );

        // 3. Create Transaction in Supabase
        // Use user.id if logged in, otherwise fail if auth is required
        if (!user) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }
        const buyerId = user.id;

        await TransactionService.createTransaction(supabase, {
            carId,
            buyerId,
            sellerId: car.seller_id, // Pass the seller_id fetched from the car
            amount: finalAmount,
            stripeSessionId: sessionId
        });

        return NextResponse.json({ url });
    } catch (error: any) {
        console.error('Checkout error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
