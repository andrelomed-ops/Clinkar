
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

async function testApi() {
    const transactionId = '0cc759eb-8663-494a-b85f-4c184225c76b';
    
    console.log("Using URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    console.log("Fetching transaction...");
    const { data: tx, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", transactionId)
        .single();

    if (error) {
        console.error("Error fetching transaction:", error);
        return;
    }

    console.log("Transaction found:", tx.id);
    
    console.log("Fetching car...");
    const { data: carData, error: carError } = await supabase
        .from("cars")
        .select("*")
        .eq("id", tx.car_id)
        .single();

    if (carError) {
        console.error("Error fetching car:", carError);
    } else {
        console.log("Car found:", carData.make, carData.model);
    }
}

testApi();
