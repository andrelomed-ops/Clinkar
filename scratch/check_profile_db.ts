
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://hbkemolnicxokmquyuox.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhia2Vtb2xuaWN4b2ttcXV5dW94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MzIxMDksImV4cCI6MjA5MDUwODEwOX0.EygbjW3n6tcUpRXdzJ9fBw8-OHIOrx3fu5I77VIT-zc";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkProfile() {
    console.log("Checking profile for StarterKar@hotmail.com...");
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', 'StarterKar@hotmail.com')
        .maybeSingle();

    if (error) {
        console.error("Error fetching profile:", error);
    } else if (data) {
        console.log("Profile found:", data);
    } else {
        console.log("Profile not found for this email.");
        
        // Try searching all profiles to see if there's any similar email
        const { data: allProfiles, error: allErr } = await supabase
            .from('profiles')
            .select('email, role')
            .limit(10);
        
        if (allErr) {
            console.error("Error fetching all profiles:", allErr);
        } else {
            console.log("Some profiles in DB:", allProfiles);
        }
    }
}

checkProfile();
