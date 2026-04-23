
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Checking all cars...");
  const { data, error } = await supabase
    .from('cars')
    .select('id, make, model, status');
  
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Total cars:", data?.length);
    console.log("Status distribution:", data?.reduce((acc, c) => {
        acc[c.status] = (acc[c.status] || 0) + 1;
        return acc;
    }, {}));
  }
}

test();
