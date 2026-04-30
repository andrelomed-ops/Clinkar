const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkConstraints() {
    const { data, error } = await supabase.rpc('get_table_constraints', { t_name: 'profiles' });
    if (error) {
        // If RPC doesn't exist, try a raw query via a temporary function if possible, 
        // or just check the roles by trying to insert/update.
        console.log("RPC failed, trying raw query...");
        const { data: rawData, error: rawError } = await supabase.from('profiles').select('*').limit(1);
        console.log("Raw profile data sample:", rawData);
        
        // Let's try to find the constraint via information_schema
        const { data: constraints, error: cError } = await supabase.rpc('execute_sql', { 
            sql_query: "SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'profiles'::regclass;" 
        });
        console.log("Constraints:", constraints || cError);
    } else {
        console.log("Constraints:", data);
    }
}

checkConstraints();
