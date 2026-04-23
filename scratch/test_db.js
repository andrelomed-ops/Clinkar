
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Testing cars query...");
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .in('status', ['available', 'PUBLISHED', 'CERTIFIED', 'AVAILABLE', 'certified']);
  
  if (error) {
    console.error("Error fetching cars:", error);
  } else {
    console.log("Cars found:", data?.length);
    console.log("Statuses present:", [...new Set(data?.map(c => c.status))]);
  }

  console.log("\nTesting transactions join query (simulating HandoverPage)...");
  const { data: tx, error: txError } = await supabase
    .from('transactions')
    .select('*, cars(*)')
    .limit(1);

  if (txError) {
    console.error("Error with join query:", txError);
  } else {
    console.log("Join query success!");
  }
}

test();
