
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDeletion(id) {
  console.log(`Attempting to delete car: ${id}`);
  
  // Try to delete directly (likely to fail due to RLS if not logged in, but let's see)
  const { error } = await supabase
    .from('cars')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error("Deletion Error:", error);
  } else {
    console.log("Deletion successful (or no rows matched/RLS blocked silently)");
  }

  // Check if it's still there
  const { data } = await supabase.from('cars').select('id').eq('id', id).maybeSingle();
  if (data) {
    console.log("Car still exists in DB.");
  } else {
    console.log("Car NOT found in DB.");
  }
}

testDeletion('a96254da-0035-42ae-b162-fe7e08d78cdd');
