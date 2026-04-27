
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateDemoCarStatus() {
  console.log("Setting Mazda 3 status to CERTIFIED...");
  
  const id = "6728d03b-faf6-4046-a8bb-5ef630ed1861";
  const { error } = await supabase
    .from('cars')
    .update({ 
        status: 'CERTIFIED',
        has_starterkar_seal: true 
    })
    .eq('id', id);
  
  if (error) {
    console.error("Error updating status:", error);
  } else {
    console.log("Status updated to CERTIFIED successfully!");
  }
}

updateDemoCarStatus();
