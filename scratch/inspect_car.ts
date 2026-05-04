import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect(id: string) {
    const { data, error } = await supabase.from('cars').select('*').eq('id', id).single();
    if (error) console.error(error);
    else console.log(JSON.stringify(data, null, 2));
}

inspect(process.argv[2]);
