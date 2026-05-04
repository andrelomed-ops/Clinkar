const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://hbkemolnicxokmquyuox.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhia2Vtb2xuaWN4b2ttcXV5dW94Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDkzMjEwOSwiZXhwIjoyMDkwNTA4MTA5fQ.aZz8iPDAzT_2rpW2iYATYC7K13roLnEZZrqzVFNevCY";
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect(id) {
    const { data, error } = await supabase.from('cars').select('*').eq('id', id).single();
    if (error) console.error(error);
    else console.log(JSON.stringify(data, null, 2));
}

inspect(process.argv[2]);
