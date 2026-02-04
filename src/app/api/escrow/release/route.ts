import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { VerificationService } from '@/services/VerificationService';

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

        // 2. Fees and Splits
        const sellerSuccessFee = Number(transaction.seller_success_fee || 2149.13);
        const amountToSeller = Number(transaction.car_price) - sellerSuccessFee;
        const clinkarCommissionTotal = Number(transaction.buyer_commission || 0) + sellerSuccessFee;

        // 3. Trigger Stripe Transfer Logic
        // console.log(`[Escrow] Releasing $${amountToSeller} to Seller, Platform keeping $${clinkarCommissionTotal}`);

        // 4. Use VerificationService to complete the handover
        const result = await VerificationService.confirmHandover(supabase, transactionId);

        if (!result.success) {
            return NextResponse.json({ error: result.error || 'Failed to confirm handover' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Funds released successfully' });
    } catch (error: any) {
        console.error('Release error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
