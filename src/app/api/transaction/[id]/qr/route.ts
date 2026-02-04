
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { VerificationService } from '@/services/VerificationService';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Verify ownership (User must be the BUYER)
    const { data: transaction, error } = await supabase
        .from('transactions')
        .select('buyer_id, qr_code, status')
        .eq('id', id)
        .single();

    if (error || !transaction) {
        return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (transaction.buyer_id !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Return existing code or generate new one
    let token = transaction.qr_code;

    if (!token && transaction.status === 'IN_VAULT') {
        token = await VerificationService.generateHandoverToken(supabase, id);
    }

    if (!token) {
        return NextResponse.json({ error: 'QR Code not available (Transaction pending)' }, { status: 400 });
    }

    // Return the validation URL
    // NOTE: On localhost, this URL will only be scannable by the same device.
    // To scan with a mobile phone, this must be a LAN IP or a public URL (e.g. ngrok).
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const validationUrl = `${baseUrl}/verify/handover/${token}`;

    return NextResponse.json({
        token,
        url: validationUrl
    });
}
