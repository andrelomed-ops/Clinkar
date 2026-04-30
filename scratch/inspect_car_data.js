
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSampleCar() {
    const { data, error } = await supabase.from('cars').select('id, digital_passport_data').limit(5);
    if (data) {
        console.log("Sample Passport Data:", JSON.stringify(data, null, 2));
    }
}

inspectSampleCar();
