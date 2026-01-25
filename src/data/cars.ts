export interface Vehicle {
    id: string;
    make: string;
    model: string;
    year: number;
    price: number;
    location: string;
    distance: number;
    images: string[];
    // New State Machine for Partner Model
    status: 'DRAFT' | 'LEGAL_REVIEW' | 'INSPECTION_SCHEDULED' | 'CERTIFIED' | 'RESERVED' | 'SOLD' | 'ARCHIVED';
    category: 'Car' | 'Motorcycle' | 'Heavy' | 'Marine' | 'Air' | 'Industrial' | 'Recreational';
    type: 'SUV' | 'Sedan' | 'Hatchback' | 'Coupe' | 'Pickup' | 'Minivan' | 'Sport' | 'Chopper' | 'Scooter' | 'Enduro' | 'Truck' | 'Tractor' | 'Van' | 'Yacht' | 'Boat' | 'JetSki' | 'Plane' | 'Helicopter' | 'Excavator' | 'Forklift' | 'RV' | 'ATV' | 'Wagon';
    transmission: 'Automatic' | 'Manual' | 'CVT' | 'N/A' | 'Hydrostatic';
    fuel: 'Gasoline' | 'Electric' | 'Hybrid' | 'Diesel' | 'AvGas' | 'JetA';
    condition: 'New' | 'Used';
    tags: string[];
    capabilities: string[];
    // Commercial Logic
    marketValue?: number; // Estimated market value for "Savings" calculation
    flashSale?: boolean; // If true, triggers the Fire Badge logic
    passengers: number;
    vin?: string;

    // Internal Financial Fields
    inspection_fee_paid?: boolean;
    success_fee_pending_amount?: number;
    financing_required?: boolean;

    sensory?: {
        engineSound: {
            url?: string;
            healthScore: number; // 0-100
            spectrogramData: number[]; // Simple array for visualization
            analysis: string;
        };
        cabinAtmosphere: {
            smellType: 'New Car' | 'Neutral' | 'Leather' | 'Citrus' | 'Tobacco Free';
            particulateCount: number; // PPM
            humidity: number; // %
            history: string;
        };
    };
    digitalPassport?: {
        blockchainHash: string;
        events: { date: string; type: string; verifiedBy: string; icon?: string }[];
    };
}

export const ALL_CARS: Vehicle[] = [
    // --- AÉREOS (Nueva Categoría) ---
    {
        id: 'air-1',
        make: 'Cessna',
        model: '172 Skyhawk',
        year: 2020,
        price: 8500000,
        location: 'Aeropuerto del Norte, MTY',
        distance: 0,
        images: ['https://images.unsplash.com/photo-1559627687-041b6ae37229?auto=format&fit=crop&q=80&w=800'],
        status: 'CERTIFIED',
        category: 'Air',
        type: 'Plane',
        transmission: 'N/A',
        fuel: 'AvGas',
        condition: 'Used',
        tags: ['Aviación', 'Privado', 'Escuela'],
        capabilities: ['Vuelo', 'Distancia', 'Cielo'],
        passengers: 4,
        sensory: {
            engineSound: {
                healthScore: 98,
                spectrogramData: [30, 45, 60, 75, 90, 85, 70, 60, 50, 40, 30, 20],
                analysis: "Firma acústica Lycoming O-360 estable. Compresión rítmica perfecta. Sin armónicos de desgaste en válvulas."
            },
            cabinAtmosphere: {
                smellType: 'Leather',
                particulateCount: 12,
                humidity: 45,
                history: "Cabina presurizada desinfectada con ozono tras cada vuelo."
            }
        },
        digitalPassport: {
            blockchainHash: "0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
            events: [
                { date: "2024-01-10", type: "Mantenimiento Mayor (100h)", verifiedBy: "AeroTécnica MTY" },
                { date: "2023-08-15", type: "Certificación de Aeronavegabilidad", verifiedBy: "DGAC Inspector" },
                { date: "2020-03-20", type: "Registro de Propiedad (Genesis Block)", verifiedBy: "Clinkar Aviation" }
            ]
        }
    },
    {
        id: 'air-2',
        make: 'Robinson',
        model: 'R44 Raven II',
        year: 2022,
        price: 12000000,
        location: 'Hangar Toluca',
        distance: 0,
        images: ['https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80&w=800'],
        status: 'CERTIFIED',
        category: 'Air',
        type: 'Helicopter',
        transmission: 'N/A',
        fuel: 'AvGas',
        condition: 'Used',
        tags: ['Ejecutivo', 'Versátil', 'Transporte Rápido'],
        capabilities: ['Vuelo Vertical', 'Ciudad', 'Exclusivo'],
        passengers: 4
    },

    // --- MARÍTIMOS (Nueva Categoría) ---
    {
        id: 'sea-1',
        make: 'Sea Ray',
        model: 'Sundancer 320',
        year: 2023,
        price: 4500000,
        location: 'Cancún, Quintana Roo',
        distance: 0,
        images: ['https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&q=80&w=800'],
        status: 'CERTIFIED',
        category: 'Marine',
        type: 'Yacht',
        transmission: 'Automatic',
        fuel: 'Diesel',
        condition: 'New',
        tags: ['Lujo', 'Mar', 'Vacaciones'],
        capabilities: ['Navegación', 'Fiesta', 'Mar Abierto'],
        passengers: 10
    },
    {
        id: 'sea-2',
        make: 'Yamaha',
        model: 'WaveRunner FX',
        year: 2024,
        price: 350000,
        location: 'Acapulco, Guerrero',
        distance: 0,
        images: ['https://images.unsplash.com/photo-1605218427339-da9ec7d9a3b2?auto=format&fit=crop&q=80&w=800'],
        status: 'CERTIFIED',
        category: 'Marine',
        type: 'JetSki',
        transmission: 'Automatic',
        fuel: 'Gasoline',
        condition: 'New',
        tags: ['Diversión', 'Playa', 'Velocidad'],
        capabilities: ['Agua', 'Deporte', 'Playa'],
        passengers: 2
    },

    // --- INDUSTRIAL / AGRÍCOLA (Nueva Categoría) ---
    {
        id: 'ind-1',
        make: 'Caterpillar',
        model: '320 GC',
        year: 2021,
        price: 3200000,
        location: 'Querétaro',
        distance: 50,
        images: ['https://images.unsplash.com/photo-1582299378494-47b22a2ae96a?auto=format&fit=crop&q=80&w=800'],
        status: 'CERTIFIED',
        category: 'Industrial',
        type: 'Excavator',
        transmission: 'Hydrostatic',
        fuel: 'Diesel',
        condition: 'Used',
        tags: ['Construcción', 'Pesado', 'Obra'],
        capabilities: ['Tierra', 'Excavación', 'Obra Civil'],
        passengers: 1
    },
    {
        id: 'ind-2',
        make: 'John Deere',
        model: '6120M',
        year: 2022,
        price: 1800000,
        location: 'Sinaloa',
        distance: 20,
        images: ['https://images.unsplash.com/photo-1592393399092-2ae5f9923831?auto=format&fit=crop&q=80&w=800'],
        status: 'CERTIFIED',
        category: 'Industrial',
        type: 'Tractor',
        transmission: 'Manual',
        fuel: 'Diesel',
        condition: 'Used',
        tags: ['Agricultura', 'Campo', 'Potencia'],
        capabilities: ['Campo', 'Arado', 'Cultivo'],
        passengers: 1
    },

    // --- RECREACIONAL / JUGUETES ---
    {
        id: 'rec-1',
        make: 'Can-Am',
        model: 'Maverick X3',
        year: 2024,
        price: 750000,
        location: 'Valle de Bravo',
        distance: 0,
        images: ['https://images.unsplash.com/photo-1586799042433-228723223073?auto=format&fit=crop&q=80&w=800'],
        status: 'CERTIFIED',
        category: 'Recreational',
        type: 'ATV',
        transmission: 'CVT',
        fuel: 'Gasoline',
        condition: 'New',
        tags: ['Off-road', 'Dunas', 'Extremo'],
        capabilities: ['Dunas', 'Lodo', 'Montaña'],
        passengers: 2
    },

    // --- MOTOS ---
    {
        id: 'moto-1',
        make: 'Ducati',
        model: 'Panigale V4',
        year: 2024,
        price: 680000,
        location: 'CDMX',
        distance: 2,
        images: ['https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=800'],
        status: 'CERTIFIED',
        category: 'Motorcycle',
        type: 'Sport',
        transmission: 'Manual',
        fuel: 'Gasoline',
        condition: 'New',
        tags: ['Velocidad', 'Premium', 'Pista'],
        capabilities: ['Pista', 'Carretera'],
        passengers: 1
    },
    {
        id: 'moto-2',
        make: 'Harley-Davidson',
        model: 'Iron 883',
        year: 2022,
        price: 250000,
        location: 'Guadalajara',
        distance: 15,
        images: ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800'],
        status: 'CERTIFIED',
        category: 'Motorcycle',
        type: 'Chopper',
        transmission: 'Manual',
        fuel: 'Gasoline',
        condition: 'Used',
        tags: ['Estilo', 'Carretera', 'Clásico'],
        capabilities: ['Carretera', 'Ciudad'],
        passengers: 2
    },
    {
        id: 'moto-3',
        make: 'Honda',
        model: 'Cargo 150',
        year: 2023,
        price: 35000,
        marketValue: 44000, // FLASH SALE
        flashSale: true,
        location: 'Estado de México',
        distance: 5,
        images: ['https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&q=80&w=800'],
        status: 'CERTIFIED',
        category: 'Motorcycle',
        type: 'Enduro',
        transmission: 'Manual',
        fuel: 'Gasoline',
        condition: 'Used',
        tags: ['Trabajo', 'Reparto', 'Económico'],
        capabilities: ['Ciudad', 'Tráfico', 'Carga Ligera'],
        passengers: 1
    },

    // --- PESADOS ---
    {
        id: 'heavy-1',
        make: 'Kenworth',
        model: 'T680',
        year: 2020,
        price: 2400000,
        location: 'Monterrey',
        distance: 100,
        images: ['https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800'],
        status: 'CERTIFIED',
        category: 'Heavy',
        type: 'Tractor',
        transmission: 'Manual',
        fuel: 'Diesel',
        condition: 'Used',
        tags: ['Carga Pesada', 'Larga Distancia', 'Logística'],
        capabilities: ['Carretera', 'Carga Pesada', 'Remolque'],
        passengers: 2
    },
    {
        id: 'heavy-2',
        make: 'Mercedes-Benz',
        model: 'Sprinter Cargo',
        year: 2024,
        price: 980000,
        location: 'Puebla',
        distance: 0,
        images: ['https://images.unsplash.com/photo-1566008885218-90abf9200ddb?auto=format&fit=crop&q=80&w=800'],
        status: 'CERTIFIED',
        category: 'Heavy',
        type: 'Van',
        transmission: 'Automatic',
        fuel: 'Diesel',
        condition: 'New',
        tags: ['Reparto', 'Logística', 'Volumen'],
        capabilities: ['Ciudad', 'Carga', 'Negocio'],
        passengers: 3
    },

    // --- SUVS ---
    {
        id: 'suv-1',
        make: 'Honda',
        model: 'CR-V Touring',
        year: 2021,
        price: 580000,
        marketValue: 640000, // FLASH SALE
        flashSale: true,
        location: 'CDMX',
        distance: 5.2,
        images: ['https://images.unsplash.com/photo-1598556851355-d1402324dc25?auto=format&fit=crop&q=80&w=800'],
        status: 'CERTIFIED',
        category: 'Car',
        type: 'SUV',
        transmission: 'Automatic',
        fuel: 'Gasoline',
        condition: 'Used',
        tags: ['Familiar', 'Seguro', 'Espacioso'],
        capabilities: ['Carretera', 'Ciudad'],
        passengers: 5
    },
    {
        id: 'suv-2',
        make: 'Kia',
        model: 'Sorento 7 Pasajeros',
        year: 2025,
        price: 950000,
        location: 'Agencia Kia Monterrey',
        distance: 2,
        images: ['https://images.unsplash.com/photo-1570375681023-7fa554909062?auto=format&fit=crop&q=80&w=800'],
        status: 'CERTIFIED',
        category: 'Car',
        type: 'SUV',
        transmission: 'Automatic',
        fuel: 'Hybrid',
        condition: 'New',
        tags: ['Familiar', 'Tecnología', 'Eco-Friendly'],
        capabilities: ['Ciudad', 'Carretera'],
        passengers: 7
    },
    {
        id: 'suv-3',
        make: 'Mazda',
        model: 'CX-90',
        year: 2024,
        price: 1100000,
        location: 'Jalisco',
        distance: 0,
        images: ['https://images.unsplash.com/photo-1574941916327-1429188e99b0?auto=format&fit=crop&q=80&w=800'],
        status: 'CERTIFIED',
        category: 'Car',
        type: 'SUV',
        transmission: 'Automatic',
        fuel: 'Gasoline',
        condition: 'New',
        tags: ['Premium', 'Aventura', 'Familiar'],
        capabilities: ['Tierra', 'Arena', 'Carretera'],
        passengers: 8
    },

    // --- SEDANS ---
    {
        id: 'sedan-1',
        make: 'Tesla',
        model: 'Model 3 Highland',
        year: 2024,
        price: 889000,
        location: 'Tesla Store CDMX',
        distance: 5,
        images: ['https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=800'],
        status: 'CERTIFIED',
        category: 'Car',
        type: 'Sedan',
        transmission: 'Automatic',
        fuel: 'Electric',
        condition: 'New',
        tags: ['Tecnología', 'Ecológico', 'Futurista', 'Top Rated'],
        capabilities: ['Ciudad', 'Pista', 'Autopiloto'],
        passengers: 5,
        sensory: {
            engineSound: {
                healthScore: 100,
                spectrogramData: [10, 10, 10, 10, 10, 15, 10, 10, 10, 10, 10, 10],
                analysis: "Silencio absoluto característico. Zumbido de inversor dentro de rango nominal (18kHz). Sin vibración mecánica."
            },
            cabinAtmosphere: {
                smellType: 'New Car',
                particulateCount: 2,
                humidity: 40,
                history: "Filtro HEPA Bio-Defense Mode activo desde fábrica. Cero contaminantes."
            }
        },
        digitalPassport: {
            blockchainHash: "0x3a2b1c4d5e6f7890123456789abcdef0123456789abcdef0123456789abcdef",
            events: [
                { date: "2024-02-01", type: "Entrega de Agencia", verifiedBy: "Tesla México" },
                { date: "2024-01-28", type: "Importación Definitiva", verifiedBy: "Aduana MX" }
            ]
        }
    },
    {
        id: 'sedan-2',
        make: 'Toyota',
        model: 'Camry Hybrid',
        year: 2021,
        price: 550000,
        location: 'Querétaro',
        distance: 200,
        images: ['https://images.unsplash.com/photo-1629897058866-da64f1d4f9b8?auto=format&fit=crop&q=80&w=800'],
        status: 'CERTIFIED',
        category: 'Car',
        type: 'Sedan',
        transmission: 'Automatic',
        fuel: 'Hybrid',
        condition: 'Used',
        tags: ['Ahorrador', 'Cómodo', 'Uber Black'],
        capabilities: ['Ciudad', 'Carretera'],
        passengers: 5
    },
    {
        id: 'sedan-mx-1',
        make: 'Nissan',
        model: 'Versa Exclusive',
        year: 2024,
        price: 420000,
        location: 'CDMX Satélite',
        distance: 0,
        images: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800'], // Placeholder
        status: 'CERTIFIED',
        category: 'Car',
        type: 'Sedan',
        transmission: 'CVT',
        fuel: 'Gasoline',
        condition: 'New',
        tags: ['Best Seller', 'Seguro', 'Económico', 'Familiar'],
        capabilities: ['Ciudad', 'Uber'],
        passengers: 5
    },
    {
        id: 'sedan-mx-2',
        make: 'Volkswagen',
        model: 'Jetta Sportline',
        year: 2024,
        price: 550000,
        location: 'Puebla',
        distance: 0,
        images: ['https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800'],
        status: 'CERTIFIED',
        category: 'Car',
        type: 'Sedan',
        transmission: 'Automatic',
        fuel: 'Gasoline',
        condition: 'New',
        tags: ['Clásico', 'Potente', 'Top Rated'],
        capabilities: ['Carretera', 'Ciudad'],
        passengers: 5
    },
    {
        id: 'sedan-mx-3',
        make: 'Mazda',
        model: 'Mazda 3 Sedán Carbon',
        year: 2024,
        price: 580000,
        location: 'Guadalajara',
        distance: 0,
        images: ['https://images.unsplash.com/photo-1574941916327-1429188e99b0?auto=format&fit=crop&q=80&w=800'],
        status: 'CERTIFIED',
        category: 'Car',
        type: 'Sedan',
        transmission: 'Automatic',
        fuel: 'Gasoline',
        condition: 'New',
        tags: ['Premium', 'Diseño', 'Top Rated'],
        capabilities: ['Ciudad', 'Status'],
        passengers: 5
    },

    // --- HATCHBACKS ---
    {
        id: 'hatch-1',
        make: 'BYD',
        model: 'Dolphin Mini',
        year: 2025,
        price: 358000,
        location: 'CDMX',
        distance: 0,
        images: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800'],
        status: 'CERTIFIED',
        category: 'Car',
        type: 'Hatchback',
        transmission: 'Automatic',
        fuel: 'Electric',
        condition: 'New',
        tags: ['Primer Auto', 'Ecológico', 'Tecnología'],
        capabilities: ['Ciudad', 'Estacionamiento'],
        passengers: 4
    },
    {
        id: 'hatch-2',
        make: 'Volkswagen',
        model: 'Golf GTI',
        year: 2019,
        price: 450000,
        location: 'Puebla',
        distance: 120,
        images: ['https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&q=80&w=800'],
        status: 'CERTIFIED',
        category: 'Car',
        type: 'Hatchback',
        transmission: 'Automatic',
        fuel: 'Gasoline',
        condition: 'Used',
        tags: ['Deportivo', 'Divertido', 'Clásico'],
        capabilities: ['Pista', 'Ciudad'],
        passengers: 5
    },

    // --- DEPORTIVOS ---
    {
        id: 'sport-1',
        make: 'BMW',
        model: 'M4 Competition',
        year: 2023,
        price: 1850000,
        marketValue: 2200000, // FLASH SALE
        flashSale: true,
        location: 'Nuevo León',
        distance: 900,
        images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800'],
        status: 'CERTIFIED',
        category: 'Car',
        type: 'Coupe',
        transmission: 'Automatic',
        fuel: 'Gasoline',
        condition: 'Used',
        tags: ['Deportivo', 'Lujo', 'Potencia'],
        capabilities: ['Pista', 'Velocidad'],
        passengers: 4
    },
    {
        id: 'sport-2',
        make: 'Porsche',
        model: '911 Carrera',
        year: 2021,
        price: 2450000,
        location: 'Jalisco',
        distance: 535,
        images: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800'],
        status: 'CERTIFIED',
        category: 'Car',
        type: 'Coupe',
        transmission: 'Automatic',
        fuel: 'Gasoline',
        condition: 'Used',
        tags: ['Exótico', 'Colección', 'Leyenda'],
        capabilities: ['Pista', 'Velocidad'],
        passengers: 2
    },
    {
        id: 'sport-3',
        make: 'Mazda',
        model: 'MX-5',
        year: 2020,
        price: 450000,
        location: 'Querétaro',
        distance: 210,
        images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800'],
        status: 'CERTIFIED',
        category: 'Car',
        type: 'Coupe',
        transmission: 'Manual',
        fuel: 'Gasoline',
        condition: 'Used',
        tags: ['Divertido', 'Descapotable', 'Fin de semana'],
        capabilities: ['Carretera', 'Pista'],
        passengers: 2
    },

    // --- PICKUPS (Aventura / Trabajo) ---
    {
        id: 'pickup-1',
        make: 'Ford',
        model: 'Lobo Raptor',
        year: 2020,
        price: 1300000,
        location: 'Estado de México',
        distance: 45,
        images: ['https://images.unsplash.com/photo-1605893478810-0863c340d829?auto=format&fit=crop&q=80&w=800'],
        status: 'CERTIFIED',
        category: 'Car',
        type: 'Pickup',
        transmission: 'Automatic',
        fuel: 'Gasoline',
        condition: 'Used',
        tags: ['Off-road', 'Aventura', 'Imponente'],
        capabilities: ['Arena', 'Lodo', 'Nieve', 'Montaña'],
        passengers: 5,
        sensory: {
            engineSound: {
                healthScore: 92,
                spectrogramData: [80, 95, 100, 90, 85, 80, 75, 70, 65, 60, 55, 50],
                analysis: "Rugido V6 EcoBoost potente. Turbos silban correctamente al acelerar. Ligera resonancia en escape aftermarket (Borla)."
            },
            cabinAtmosphere: {
                smellType: 'Tobacco Free',
                particulateCount: 25,
                humidity: 35,
                history: "Limpieza profunda de vestiduras tras evento off-road. Sin olor a humedad."
            }
        },
        digitalPassport: {
            blockchainHash: "0x89abcdef0123456789abcdef0123456789abcdef0123456789abcdef012345",
            events: [
                { date: "2023-11-05", type: "Servicio Suspensión FOX", verifiedBy: "Ford Performance" },
                { date: "2022-06-12", type: "Cambio de Propietario", verifiedBy: "Clinkar Secure Title" }
            ]
        }
    },
    {
        id: 'pickup-2',
        make: 'Rivian',
        model: 'R1T',
        year: 2023,
        price: 1600000,
        location: 'Importación Directa',
        distance: 0,
        images: ['https://images.unsplash.com/photo-1678864758509-3286c43317df?auto=format&fit=crop&q=80&w=800'],
        status: 'CERTIFIED',
        category: 'Car',
        type: 'Pickup',
        transmission: 'Automatic',
        fuel: 'Electric',
        condition: 'New',
        tags: ['Ecológico', 'Futuro', '4x4'],
        capabilities: ['Arena', 'Agua', 'Nieve', 'Camping'],
        passengers: 5
    },
    {
        id: 'pickup-3',
        make: 'Toyota',
        model: 'Hilux Diesel 4x4',
        year: 2022,
        price: 650000,
        location: 'Veracruz',
        distance: 50,
        images: ['https://images.unsplash.com/photo-1524316972828-b80c10816999?auto=format&fit=crop&q=80&w=800'],
        status: 'CERTIFIED',
        category: 'Car',
        type: 'Pickup',
        transmission: 'Manual',
        fuel: 'Gasoline',
        condition: 'Used',
        tags: ['Trabajo', 'Indestructible'],
        capabilities: ['Lodo', 'Montaña', 'Carga'],
        passengers: 5
    },

    // --- EXPERTOS EN SELVA / JUNGLE (Nueva Categoría Implícita) ---
    {
        id: 'winter-1',
        make: 'Subaru',
        model: 'Outback Touring XT',
        year: 2024,
        price: 850000,
        location: 'CDMX Sur',
        distance: 10,
        images: ['https://images.unsplash.com/photo-1626202237834-c7df8b1f5d22?auto=format&fit=crop&q=80&w=800'],
        status: 'CERTIFIED',
        category: 'Car',
        type: 'Wagon',
        transmission: 'CVT',
        fuel: 'Gasoline',
        condition: 'New',
        tags: ['AWD', 'Nieve', 'Seguridad', 'Familiar'],
        capabilities: ['Nieve', 'Lluvia', 'Off-road Ligero'],
        passengers: 5
    },
    {
        id: 'winter-2',
        make: 'Volvo',
        model: 'XC90 Recharge',
        year: 2024,
        price: 1650000,
        location: 'Monterrey',
        distance: 0,
        images: ['https://images.unsplash.com/photo-1620882198078-430932822a96?auto=format&fit=crop&q=80&w=800'],
        status: 'CERTIFIED',
        category: 'Car',
        type: 'SUV',
        transmission: 'Automatic',
        fuel: 'Hybrid',
        condition: 'New',
        tags: ['Seguridad', 'Premium', 'AWD', 'Nieve'],
        capabilities: ['Nieve', 'Ciudad', 'Autopista'],
        passengers: 7
    },
    {
        id: 'winter-3',
        make: 'Audi',
        model: 'Q5 S-Line Quattro',
        year: 2023,
        price: 1100000,
        location: 'Puebla',
        distance: 15000,
        images: ['https://images.unsplash.com/photo-1606152421811-aa9116392b2a?auto=format&fit=crop&q=80&w=800'],
        status: 'CERTIFIED',
        category: 'Car',
        type: 'SUV',
        transmission: 'Automatic',
        fuel: 'Gasoline',
        condition: 'Used',
        tags: ['Quattro', 'Deportivo', 'AWD'],
        capabilities: ['Pista', 'Lluvia', 'Nieve'],
        passengers: 5
    },
    {
        id: 'winter-4',
        make: 'Ford',
        model: 'F-150 Lariat 4x4',
        year: 2022,
        price: 1250000,
        location: 'Chihuahua',
        distance: 40000,
        images: ['https://images.unsplash.com/photo-1589133405391-e403487f7bd8?auto=format&fit=crop&q=80&w=800'],
        status: 'CERTIFIED',
        category: 'Car',
        type: 'Pickup',
        transmission: 'Automatic',
        fuel: 'Gasoline',
        condition: 'Used',
        tags: ['4x4', 'Trabajo', 'Remolque', 'Nieve'],
        capabilities: ['Nieve Profunda', 'Carga', 'Montaña'],
        passengers: 5
    },
    {
        id: 'winter-5',
        make: 'Jeep',
        model: 'Grand Cherokee L',
        year: 2023,
        price: 1450000,
        location: 'Guadalajara',
        distance: 5000,
        images: ['https://images.unsplash.com/photo-1541348263662-e068662d82af?auto=format&fit=crop&q=80&w=800'],
        status: 'CERTIFIED',
        category: 'Car',
        type: 'SUV',
        transmission: 'Automatic',
        fuel: 'Gasoline',
        condition: 'Used',
        tags: ['4x4', 'Lujo', 'Familiar', 'Nieve'],
        capabilities: ['Nieve', 'Rocas', 'Confort'],
        passengers: 7
    },
    {
        id: 'offroad-2',
        make: 'Land Rover',
        model: 'Defender 110',
        year: 2024,
        price: 1900000,
        location: 'CDMX Polanco',
        distance: 0,
        images: ['https://images.unsplash.com/photo-1519245659620-e859806a8d3b?auto=format&fit=crop&q=80&w=800'],
        status: 'CERTIFIED',
        category: 'Car',
        type: 'SUV',
        transmission: 'Automatic',
        fuel: 'Hybrid',
        condition: 'New',
        tags: ['Lujo', 'Expedición', 'Safari'],
        capabilities: ['Selva', 'Desierto', 'Nieve', 'Río'],
        passengers: 5
    },
    {
        id: 'expedition-1',
        make: 'Mercedes-Benz',
        model: 'Unimog U4000',
        year: 2019,
        price: 3500000,
        location: 'Importación Especial',
        distance: 500,
        images: ['https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&q=80&w=800'],
        status: 'CERTIFIED',
        category: 'Heavy',
        type: 'Truck',
        transmission: 'Manual',
        fuel: 'Diesel',
        condition: 'Used',
        tags: ['Extremo', 'Militar', 'Apocalipsis'],
        capabilities: ['Cualquier Terreno', 'Selva Densa', 'Montaña Alta'],
        passengers: 3
    }
];
