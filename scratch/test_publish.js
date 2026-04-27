
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY; // Use service role to bypass RLS for testing

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCreateCar() {
    console.log("Testing car creation...");
    
    const carData = {
        make: "Test Brand",
        model: "Test Model",
        year: 2024,
        price: 500000,
        mileage: 100,
        location: "CDMX",
        description: "Test description",
        status: "published",
        category: "Car",
        fuel_type: "Gasoline",
        transmission: "Automatic",
        seller_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID for testing or use a real one
        images: []
    };

    // Clean up fields like I do in CarService.ts
    const { technical_specs, category, location, ...dbData } = carData;
    const market_data = {
        location: location || 'CDMX',
        technical_specs: technical_specs || {},
        category: category || 'Car'
    };

    const { data, error } = await supabase
        .from('cars')
        .insert({
            ...dbData,
            market_data
        })
        .select()
        .single();

    if (error) {
        console.error('Supabase Error:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
        });
    } else {
        console.log('Car created successfully:', data.id);
        // Delete it immediately
        await supabase.from('cars').delete().eq('id', data.id);
        console.log('Test car deleted.');
    }
}

testCreateCar();
