
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdmin() {
    const email = 'StarterKar@hotmail.com';
    console.log(`Checking profile for ${email}...`);
    
    // We can't query by email easily with anon key if RLS is on, but we can try
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();
    
    if (error) {
        console.error("Error fetching profile:", error.message);
    } else {
        console.log("Profile found:", profile);
    }
}

checkAdmin();
