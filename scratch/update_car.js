
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function update() {
  const { data: car } = await supabase.from('cars').select('id').limit(1).single();
  if (!car) return console.log("No cars found");

  console.log(`Updating car ${car.id} to AVAILABLE...`);
  const { error } = await supabase.from('cars').update({ status: 'AVAILABLE' }).eq('id', car.id);
  
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Success!");
  }
}

update();
