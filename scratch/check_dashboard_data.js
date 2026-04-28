const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUserData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        console.log("No user logged in");
        return;
    }
    console.log("User ID:", user.id);

    const { data: txs } = await supabase.from('transactions').select('*').or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);
    console.log("Transactions:", JSON.stringify(txs, null, 2));

    const { data: cars } = await supabase.from('cars').select('*').eq('seller_id', user.id);
    console.log("Owned Cars:", JSON.stringify(cars, null, 2));
}

checkUserData();
