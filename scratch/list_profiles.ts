
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://hbkemolnicxokmquyuox.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhia2Vtb2xuaWN4b2ttcXV5dW94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MzIxMDksImV4cCI6MjA5MDUwODEwOX0.EygbjW3n6tcUpRXdzJ9fBw8-OHIOrx3fu5I77VIT-zc";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function listProfiles() {
    console.log("Listing some profiles...");
    const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .limit(20);

    if (error) {
        console.error("Error fetching profiles:", error);
    } else {
        console.log("Profiles in DB:", data);
    }
}

listProfiles();
