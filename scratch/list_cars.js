
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Checking all cars...");
  const { data, error } = await supabase
    .from('cars')
    .select('*');
  
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Total cars in DB:", data?.length);
    data?.forEach(c => {
        console.log(`- ${c.make} ${c.model} (${c.id}) | Status: ${c.status}`);
    });
  }
}

test();
