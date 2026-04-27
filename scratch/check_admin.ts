import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Need service role to query by email if not logged in

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdmin() {
    const email = 'StarterKar@hotmail.com';
    
    // We can't query auth.users directly with service role in some setups, but we can query profiles if we have the ID.
    // Let's try to find the profile by email if there's an email column in profiles.
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .maybeSingle();

    if (error) {
        console.error('Error fetching profile:', error);
    } else if (profile) {
        console.log('Profile found:', profile);
    } else {
        console.log('No profile found for this email in the profiles table.');
    }
}

checkAdmin();
