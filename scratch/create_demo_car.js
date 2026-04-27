
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createDemoCar() {
  console.log("Creating Mazda 3 2025 Demo Car...");
  
  const demoData = {
    make: "Mazda",
    model: "3 Sedan Carbon Edition",
    year: 2025,
    price: 550000,
    mileage: 10,
    transmission: "Automatic",
    fuel_type: "Gasoline",
    location: "Ciudad de México",
    description: "La cima de la ingeniería japonesa. Edición Carbon con detalles exclusivos, motor turbo y tracción AWD. Unidad nueva de agencia.",
    status: "published",
    images: [
      "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1617469767053-d3b503a0b982?auto=format&fit=crop&q=80&w=1200"
    ],
    market_data: {
      technical_specs: {
        performance: {
          engine: "2.5L SKYACTIV-G Turbo",
          horsepower: "227 hp @ 5,000 rpm",
          fuelType: "Gasolina",
          transmission: "Automática 6 Vel",
          driveTrain: "i-ACTIV AWD",
          cylinders: "4 en línea"
        },
        architecture: {
          bodyType: "Sedán",
          doors: "4",
          passengers: "5",
          dimensions: "4,662 mm L / 1,795 mm W",
          tankCapacity: "51 Litros",
          rims: "Aleación 18\" Negro"
        },
        features: {
          ac: true,
          leatherSeats: true,
          sunroof: true,
          touchScreen: true,
          carPlay: true,
          androidAuto: true,
          bluetooth: true,
          startStopButton: true
        },
        security: {
          airbags: "7 (Frontales, laterales, cortina y rodilla)",
          abs: true,
          discBrakes: "Discos ventilados delanteros / Sólidos traseros",
          reverseCamera: true,
          parkingSensors: true
        }
      }
    }
  };

  const { data, error } = await supabase
    .from('cars')
    .insert([demoData])
    .select();
  
  if (error) {
    console.error("Error creating car:", error);
  } else {
    console.log("Demo car created successfully! ID:", data[0].id);
    console.log("View it at: http://localhost:3000/buy/" + data[0].id);
  }
}

createDemoCar();
