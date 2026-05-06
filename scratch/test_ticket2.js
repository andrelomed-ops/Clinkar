require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testInsert() {
    const { data: carData } = await supabase.from('cars').select('id').limit(1).single();
    if (!carData) return console.log('no car');

    const { error: ticketError } = await supabase.from('service_tickets').insert({
        car_id: carData.id,
        type: '150_point_inspection',
        status: 'SCHEDULED',
        scheduled_at: new Date().toISOString(),
        partner_id: null
    });

    console.log("Error inserting ticket:", ticketError);
}

testInsert();
