
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) process.exit(1);

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('--- SEEDING PHASE 4 DATA (ATTEMPT 3) ---');

    // 1. Target REAL Car (Tesla)
    const CAR_ID = '00000000-0000-0000-0000-000000000002';
    console.log(`Targeting Car: ${CAR_ID}`);

    // 2. Create/Ensure Inspection
    const { data: existingInsp } = await supabase.from('inspections').select('id').eq('car_id', CAR_ID).maybeSingle();

    if (existingInsp) {
        console.log('Inspection already exists:', existingInsp.id);
    } else {
        console.log('Creating Inspection (Trying column "data")...');

        const { data: newInsp, error: inspError } = await supabase.from('inspections').insert({
            car_id: CAR_ID,
            inspector_id: 'demo-inspector-id',
            status: 'COMPLETED',
            // Trying 'data' instead of 'report_data'
            data: {
                overall_result: 'APROBADO',
                checklist: { engine: 'pass', transmission: 'pass' },
                photos: []
            }
        }).select().single();

        if (inspError) {
            console.error('Failed to create inspection:', inspError);
        } else {
            console.log('Inspection Created:', newInsp?.id);
        }
    }

    // 3. Create/Ensure Transaction
    const { data: existingTx } = await supabase.from('transactions').select('id, status').eq('car_id', CAR_ID).maybeSingle();

    if (existingTx) {
        console.log('Transaction exists:', existingTx.id, existingTx.status);
        if (existingTx.status !== 'DELIVERED') {
            const { error: upError } = await supabase.from('transactions').update({ status: 'DELIVERED' }).eq('id', existingTx.id);
            if (upError) console.error('Update Failed:', upError);
            else console.log('Updated to DELIVERED.');
        }
    } else {
        console.log('Creating Transaction (DELIVERED)...');

        const { data: profile } = await supabase.from('profiles').select('id').limit(1).maybeSingle();
        const userId = profile?.id || '00000000-0000-0000-0000-000000000000';

        const { data: newTx, error: txError } = await supabase.from('transactions').insert({
            car_id: CAR_ID,
            buyer_id: userId,
            seller_id: userId,
            car_price: 550000,
            status: 'DELIVERED'
        }).select().single();

        if (txError) {
            console.error('Failed to create transaction:', txError);
        } else {
            console.log('Transaction Created:', newTx.id);
        }
    }
}

main().catch(console.error);
