
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltan variables de entorno");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFlow() {
  console.log("--- TEST MULTI-CATEGORY FLOW ---");

  // 1. Crear un Partner Especialista en Marine
  console.log("1. Creando Partner Marino...");
  const { data: partner, error: pError } = await supabase
    .from('partners')
    .insert({
      name: "Prueba Marina VIP",
      address: "Marina Vallarta Lote 1",
      city: "Puerto Vallarta",
      phone: "322 123 4567",
      is_active: true,
      specialties: ['Marine']
    })
    .select()
    .single();

  if (pError) {
    console.error("Error creando partner:", pError);
    return;
  }
  console.log("Partner creado:", partner.id);

  // 2. Crear un Auto (Yate) categoría Marine
  console.log("2. Creando Yate de prueba...");
  const { data: car, error: cError } = await supabase
    .from('cars')
    .insert({
      make: "Sunseeker",
      model: "Predator 50",
      year: 2022,
      price: 15000000,
      distance: 450, // Horas
      location: "Puerto Vallarta",
      status: 'published',
      category: 'Marine',
      technical_specs: {
        performance: {
          engine: "2x Volvo Penta IPS 600",
          horsepower: "870 hp",
          transmission: "Inboard",
          fuelType: "Diesel"
        },
        architecture: {
          bodyType: "Monohull",
          doors: "45 ft", // Eslora
          passengers: 12
        }
      }
    })
    .select()
    .single();

  if (cError) {
    console.error("Error creando activo:", cError);
    return;
  }
  console.log("Activo creado:", car.id);

  console.log("\n--- TEST COMPLETADO ---");
  console.log(`Verifica el activo en: http://localhost:3000/buy/${car.id}`);
  console.log("------------------------");
}

testFlow();
