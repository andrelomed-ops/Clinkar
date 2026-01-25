import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { transactionId, qrSecret } = await request.json();

        if (!transactionId || !qrSecret) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Fetch transaction and verify QR Secret
        const { data: transaction, error: fetchError } = await supabase
            .from('transactions')
            .select('*, cars(id)')
            .eq('id', transactionId)
            .single();

        if (fetchError || !transaction) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
        }

        if (transaction.qr_code !== qrSecret) {
            return NextResponse.json({ error: 'Invalid QR secret' }, { status: 403 });
        }

        if (transaction.status !== 'IN_VAULT') {
            return NextResponse.json({ error: 'Funds are not in the vault or already released' }, { status: 400 });
        }

        // 2. Split Logic Calculation
        const SELLER_SUCCESS_FEE = 2149.13;
        const amountToSeller = Number(transaction.car_price) - SELLER_SUCCESS_FEE;
        const clinkarCommissionTotal = Number(transaction.buyer_commission) + SELLER_SUCCESS_FEE;

        // 3. Trigger Stripe Transfer (Logic representation)
        // To Seller: amountToSeller
        // Remaining in platform: clinkarCommissionTotal

        // 4. Update transaction status
        const { error: updateError } = await supabase
            .from('transactions')
            .update({
                status: 'RELEASED',
                updated_at: new Date().toISOString()
            })
            .eq('id', transactionId);

        if (updateError) {
            return NextResponse.json({ error: 'Failed to update transaction status' }, { status: 500 });
        }

        // 5. Update car status
        await supabase
            .from('cars')
            .update({ status: 'sold' })
            .eq('id', transaction.car_id);

        return NextResponse.json({ success: true, message: 'Funds released successfully' });

    } catch (error: any) {
        console.error('Release error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
