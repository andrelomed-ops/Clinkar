
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
    console.log("Fetching all table names...");
    // We can't directly list tables with anon/service key easily without RPC, 
    // but we can try to query common names to see what's there.
    const commonTables = ['inspections', 'inspection_appointments', 'car_inspections', 'inspection_reports', 'demand_registry', 'transactions', 'cars'];
    
    for (const table of commonTables) {
        const { error } = await supabase.from(table).select('*').limit(1);
        if (!error) {
            console.log(`Table exists: ${table}`);
        } else if (error.code !== '42P01') { // 42P01 is "relation does not exist"
            console.log(`Table exists (but error): ${table} - ${error.message}`);
        }
    }
}

listTables();
