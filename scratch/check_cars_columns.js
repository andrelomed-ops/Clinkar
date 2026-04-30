
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCarsTable() {
    console.log("Checking cars table columns...");
    const { data, error } = await supabase.from('cars').select('*').limit(1);
    if (error) {
        console.error("Error fetching cars:", error);
        return;
    }
    if (data && data.length > 0) {
        console.log("Car columns:", Object.keys(data[0]));
    } else {
        console.log("No cars found, but table exists.");
        // Try to get column names via a trick if possible or just proceed with common ones
    }
}

checkCarsTable();
