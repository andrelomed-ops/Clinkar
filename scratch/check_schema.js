
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkSchema() {
  const tables = ['cars', 'profiles', 'transactions', 'inspection_appointments', 'demand_registry'];
  
  for (const table of tables) {
    console.log(`\n--- TABLE: ${table} ---`);
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);
    
    if (error) {
      console.error(`Error reading table ${table}:`, error.message);
      if (error.code === '42703') {
          console.log("!!! Undefined Column Error detected in this table query !!!");
      }
    } else if (data && data.length >= 0) {
      const columns = data.length > 0 ? Object.keys(data[0]) : "No data to infer columns";
      console.log("Columns:", columns);
    }
  }
}

checkSchema();
