import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
    console.log('Starting schema fix...');
    
    // We try to add the column via RPC if available
    const { data, error } = await supabase.rpc('execute_sql', { 
        sql_query: `
            ALTER TABLE transactions ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
            ALTER TABLE transactions ADD COLUMN IF NOT EXISTS gestoria_cost NUMERIC DEFAULT 0;
            ALTER TABLE transactions ADD COLUMN IF NOT EXISTS insurance_cost NUMERIC DEFAULT 0;
            ALTER TABLE transactions ADD COLUMN IF NOT EXISTS logistics_cost NUMERIC DEFAULT 0;
            ALTER TABLE transactions ADD COLUMN IF NOT EXISTS warranty_cost NUMERIC DEFAULT 0;
            ALTER TABLE transactions ADD COLUMN IF NOT EXISTS buyer_commission NUMERIC DEFAULT 0;
            ALTER TABLE transactions ADD COLUMN IF NOT EXISTS seller_success_fee NUMERIC DEFAULT 0;
        `
    });

    if (error) {
        console.error('RPC Error:', error);
        console.log('Trying fallback: checking columns via select...');
        const { data: row } = await supabase.from('transactions').select('*').limit(1);
        console.log('Available Columns:', row && row.length > 0 ? Object.keys(row[0]) : 'Empty table');
    } else {
        console.log('SQL Executed Successfully:', data);
    }
}

run();
