const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    const { data: cars, error: carError } = await supabase.from('cars').select('id, make, model').limit(5);
    console.log('Cars in DB:', cars);
    
    const { data: profiles, error: profileError } = await supabase.from('profiles').select('id, email, full_name, role').limit(5);
    console.log('Profiles in DB:', profiles);
}

checkData();
