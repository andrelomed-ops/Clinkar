import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TransactionService } from '@/services/TransactionService';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const body = await request.json();
        const { carId } = body;

        if (!carId) {
            return NextResponse.json({ error: 'Missing carId' }, { status: 400 });
        }

        // 1. Fetch Car Details
        const { data: car, error: carError } = await supabase
            .from('cars')
            .select('id, seller_id, price')
            .eq('id', carId)
            .single();

        if (carError || !car) {
            return NextResponse.json({ error: 'Car not found' }, { status: 404 });
        }

        // 2. Create Transaction (Mocking a SPEI session ID)
        const speiSessionId = `spei_${Date.now()}`;
        const transaction = await TransactionService.createTransaction(supabase, {
            carId,
            buyerId: user.id,
            sellerId: car.seller_id,
            amount: car.price,
            stripeSessionId: speiSessionId
        });

        if (!transaction) {
            throw new Error("Failed to create transaction");
        }

        // 3. Simulate Receipt of Funds
        const success = await TransactionService.simulateSPEIDeposit(supabase, transaction.id);

        if (!success) {
            throw new Error("Failed to simulate deposit");
        }

        return NextResponse.json({ success: true, transactionId: transaction.id });
    } catch (error: any) {
        console.error('SPEI simulation error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
