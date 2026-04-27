const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const txId = 'd78539bc-e87e-4ce5-9543-374b84e765c6';
  const { data, error } = await supabase.from('transactions').select('*, cars(*)').eq('id', txId).single();
  fs.writeFileSync('tx_output.json', JSON.stringify({ data, error }, null, 2));
}

run().catch(console.error);
