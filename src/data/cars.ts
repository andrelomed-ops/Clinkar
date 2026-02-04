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
    transmission: 'Automática' | 'Manual' | 'CVT' | 'N/A' | 'Hidrostática';
    fuel: 'Gasolina' | 'Eléctrico' | 'Híbrido' | 'Diesel' | 'AvGas' | 'JetA';
    condition: 'Nuevo' | 'Seminuevo';
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
    has_clinkar_seal?: boolean; // Real backend status for 150-point inspection

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
    priceEquation?: {
        marketValue: number;
        deductions: {
            label: string;
            amount: number;
            type: 'mechanical' | 'esthetic' | 'admin';
        }[];
        finalPrice: number;
    };
}

export const ALL_CARS: Vehicle[] = [
    // --- MOCK CAR FOR VERIFICATION ---
    {
        id: '00000000-0000-0000-0000-000000000002',
        make: 'Tesla',
        model: 'Model 3 Performance',
        year: 2022,
        price: 950000,
        location: 'CDMX',
        distance: 1200,
        images: ['https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=800&auto=format&fit=crop'],
        status: 'CERTIFIED',
        category: 'Car',
        type: 'Sedan',
        transmission: 'Automática',
        fuel: 'Eléctrico',
        condition: 'Seminuevo',
        tags: ['Verification', 'Mock', 'Test'],
        capabilities: ['Pista', 'Ciudad'],
        passengers: 5,
        digitalPassport: { // Pre-populate to pass initial checks if any
            blockchainHash: "0xMockHashForVerification",
            events: []
        }
    },
    // --- AÉREOS (Nueva Categoría) ---
    {
        id: 'air-1',
        make: 'Cessna',
        model: '172 Skyhawk',
        year: 2020,
        price: 8500000,
        location: 'Aeropuerto del Norte, MTY',
        distance: 0,
        images: ['https://images.unsplash.com/photo-1593938346024-7ee982d8224b?auto=format&fit=crop&q=80&w=1000'],
        status: 'CERTIFIED',
        category: 'Air',
        type: 'Plane',
        transmission: 'N/A',
        fuel: 'AvGas',
        condition: 'Seminuevo',
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
        images: ['https://images.unsplash.com/photo-1735967204871-a442c1401ae0?auto=format&fit=crop&q=80&w=1000'],
        status: 'CERTIFIED',
        category: 'Air',
        type: 'Helicopter',
        transmission: 'N/A',
        fuel: 'AvGas',
        condition: 'Seminuevo',
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
        images: ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=800&auto=format&fit=crop'],
        status: 'CERTIFIED',
        category: 'Marine',
        type: 'Yacht',
        transmission: 'Automática',
        fuel: 'Diesel',
        condition: 'Nuevo',
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
        images: ['https://images.unsplash.com/photo-1591025281419-578e85271775?auto=format&fit=crop&q=80&w=1000'],
        status: 'CERTIFIED',
        category: 'Marine',
        type: 'JetSki',
        transmission: 'Automática',
        fuel: 'Gasolina',
        condition: 'Nuevo',
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
        images: ['https://images.unsplash.com/photo-1715681025163-24ffe5ae32ea?auto=format&fit=crop&q=80&w=1000'],
        status: 'CERTIFIED',
        category: 'Industrial',
        type: 'Excavator',
        transmission: 'Hidrostática',
        fuel: 'Diesel',
        condition: 'Seminuevo',
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
        images: ['https://images.unsplash.com/photo-1594691592772-4427be1ea26c?auto=format&fit=crop&q=80&w=1000'],
        status: 'CERTIFIED',
        category: 'Industrial',
        type: 'Tractor',
        transmission: 'Manual',
        fuel: 'Diesel',
        condition: 'Seminuevo',
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
        fuel: 'Gasolina',
        condition: 'Nuevo',
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
        images: ['https://upload.wikimedia.org/wikipedia/commons/e/ea/Ducati_1199_Panigale_S.jpg'],
        status: 'CERTIFIED',
        category: 'Motorcycle',
        type: 'Sport',
        transmission: 'Manual',
        fuel: 'Gasolina',
        condition: 'Nuevo',
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
        images: ['https://upload.wikimedia.org/wikipedia/commons/e/ec/Harley-davidson-sportster-iron-883.jpg'],
        status: 'CERTIFIED',
        category: 'Motorcycle',
        type: 'Chopper',
        transmission: 'Manual',
        fuel: 'Gasolina',
        condition: 'Seminuevo',
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
        images: ['https://upload.wikimedia.org/wikipedia/commons/e/ea/Honda_CG_150_Titan_Mix_DSC02115.JPG'],
        status: 'CERTIFIED',
        category: 'Motorcycle',
        type: 'Enduro',
        transmission: 'Manual',
        fuel: 'Gasolina',
        condition: 'Seminuevo',
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
        images: ['https://upload.wikimedia.org/wikipedia/commons/e/e3/Kenworth_T680_Next_Gen_front_right.jpg'],
        status: 'CERTIFIED',
        category: 'Heavy',
        type: 'Tractor',
        transmission: 'Manual',
        fuel: 'Diesel',
        condition: 'Seminuevo',
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
        images: ['https://upload.wikimedia.org/wikipedia/commons/4/4b/2023_Mercedes-Benz_Sprinter_317_CDI_front_right.jpg'],
        status: 'CERTIFIED',
        category: 'Heavy',
        type: 'Van',
        transmission: 'Automática',
        fuel: 'Diesel',
        condition: 'Nuevo',
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
        images: ['https://upload.wikimedia.org/wikipedia/commons/f/f8/2023_Honda_CR-V_EX-L_AWD%2C_front_right%2C_11-13-2022.jpg'],
        status: 'CERTIFIED',
        category: 'Car',
        type: 'SUV',
        transmission: 'Automática',
        fuel: 'Gasolina',
        condition: 'Seminuevo',
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
        images: ['https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?q=80&w=800&auto=format&fit=crop'],
        status: 'CERTIFIED',
        category: 'Car',
        type: 'SUV',
        transmission: 'Automática',
        fuel: 'Híbrido',
        condition: 'Nuevo',
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
        images: ['https://upload.wikimedia.org/wikipedia/commons/e/e0/Mazda_CX-90_3.3_e-Skyactiv-G_AWD_HEV_Turbo_2024.jpg'],
        status: 'CERTIFIED',
        category: 'Car',
        type: 'SUV',
        transmission: 'Automática',
        fuel: 'Gasolina',
        condition: 'Nuevo',
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
        images: ['https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=800&auto=format&fit=crop'],
        status: 'CERTIFIED',
        category: 'Car',
        type: 'Sedan',
        transmission: 'Automática',
        fuel: 'Eléctrico',
        condition: 'Nuevo',
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
        },
        priceEquation: {
            marketValue: 950000,
            deductions: [
                { label: "Detalle en Facia Trasera", amount: 15000, type: "esthetic" },
                { label: "Ajuste de Suspensión", amount: 25000, type: "mechanical" },
                { label: "Descuento por Kilometraje", amount: 21000, type: "admin" }
            ],
            finalPrice: 889000
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
        transmission: 'Automática',
        fuel: 'Híbrido',
        condition: 'Seminuevo',
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
        images: ['https://upload.wikimedia.org/wikipedia/commons/4/4b/2023_Nissan_Versa_%28N18%29_DSC_2669.jpg'], // Placeholder
        status: 'CERTIFIED',
        category: 'Car',
        type: 'Sedan',
        transmission: 'CVT',
        fuel: 'Gasolina',
        condition: 'Nuevo',
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
        images: ['https://images.unsplash.com/photo-1510344464339-3d077b966b46?q=80&w=800&auto=format&fit=crop'],
        status: 'CERTIFIED',
        category: 'Car',
        type: 'Sedan',
        transmission: 'Automática',
        fuel: 'Gasolina',
        condition: 'Nuevo',
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
        images: ['https://images.unsplash.com/photo-1562911791-c7a97b7ad0ee?q=80&w=800&auto=format&fit=crop'],
        status: 'CERTIFIED',
        category: 'Car',
        type: 'Sedan',
        transmission: 'Automática',
        fuel: 'Gasolina',
        condition: 'Nuevo',
        tags: ['Premium', 'Diseño', 'Top Rated'],
        capabilities: ['Ciudad', 'Status'],
        passengers: 5
    },

    {
        id: 'sedan-mx-4',
        make: 'Volkswagen',
        model: 'Vento Starline',
        year: 2017,
        price: 185000,
        location: 'Puebla',
        distance: 55000,
        images: ['https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Volkswagen_Vento_1.6_Comfortline_2016.jpg/1200px-Volkswagen_Vento_1.6_Comfortline_2016.jpg'],
        status: 'CERTIFIED',
        category: 'Car',
        type: 'Sedan',
        transmission: 'Manual',
        fuel: 'Gasolina',
        condition: 'Seminuevo',
        tags: ['Económico', 'Familiar', 'Uber'],
        capabilities: ['Ciudad', 'Carretera'],
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
        images: ['https://upload.wikimedia.org/wikipedia/commons/e/ea/BYD_Dolphin_IAA_2023_1X7A0634.jpg'],
        status: 'CERTIFIED',
        category: 'Car',
        type: 'Hatchback',
        transmission: 'Automática',
        fuel: 'Eléctrico',
        condition: 'Nuevo',
        tags: ['Primer Auto', 'Ecológico', 'Tecnología'],
        capabilities: ['Ciudad', 'Estacionamiento'],
        passengers: 4
    },
    {
        id: 'hatch-3',
        make: 'Nissan',
        model: 'March Advance',
        year: 2018,
        price: 175000,
        location: 'Estado de México',
        distance: 45000,
        images: ['https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Nissan_March_1.6_Advance_2018.jpg/1200px-Nissan_March_1.6_Advance_2018.jpg'],
        status: 'CERTIFIED',
        category: 'Car',
        type: 'Hatchback',
        transmission: 'Manual',
        fuel: 'Gasolina',
        condition: 'Seminuevo',
        tags: ['Económico', 'Ciudad', 'Primer Auto', 'Ahorrador'],
        capabilities: ['Ciudad', 'Estacionamiento'],
        passengers: 5
    },
    {
        id: 'hatch-4',
        make: 'Chevrolet',
        model: 'Spark Premier',
        year: 2020,
        price: 215000,
        location: 'CDMX',
        distance: 32000,
        images: ['https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Chevrolet_Spark_GT_2019.jpg/1200px-Chevrolet_Spark_GT_2019.jpg'],
        status: 'CERTIFIED',
        category: 'Car',
        type: 'Hatchback',
        transmission: 'Manual',
        fuel: 'Gasolina',
        condition: 'Seminuevo',
        tags: ['Compacto', 'Tecnología', 'Primer Auto'],
        capabilities: ['Ciudad'],
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
        images: ['https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=800&auto=format&fit=crop'],
        status: 'CERTIFIED',
        category: 'Car',
        type: 'Hatchback',
        transmission: 'Automática',
        fuel: 'Gasolina',
        condition: 'Seminuevo',
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
        images: ['https://images.unsplash.com/photo-1617814076367-b757c24483ef?q=80&w=800&auto=format&fit=crop'],
        status: 'CERTIFIED',
        category: 'Car',
        type: 'Coupe',
        transmission: 'Automática',
        fuel: 'Gasolina',
        condition: 'Seminuevo',
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
        images: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop'],
        status: 'CERTIFIED',
        category: 'Car',
        type: 'Coupe',
        transmission: 'Automática',
        fuel: 'Gasolina',
        condition: 'Seminuevo',
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
        images: ['https://images.unsplash.com/photo-1552636525-4fc1423dfc32?q=80&w=800&auto=format&fit=crop'],
        status: 'CERTIFIED',
        category: 'Car',
        type: 'Coupe',
        transmission: 'Manual',
        fuel: 'Gasolina',
        condition: 'Seminuevo',
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
        images: ['https://images.unsplash.com/photo-1636904221147-160de43edcd9?q=80&w=800&auto=format&fit=crop'],
        status: 'CERTIFIED',
        category: 'Car',
        type: 'Pickup',
        transmission: 'Automática',
        fuel: 'Gasolina',
        condition: 'Seminuevo',
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
        images: ['https://images.unsplash.com/photo-1647416345759-3fe71f76906a?q=80&w=800&auto=format&fit=crop'],
        status: 'CERTIFIED',
        category: 'Car',
        type: 'Pickup',
        transmission: 'Automática',
        fuel: 'Eléctrico',
        condition: 'Nuevo',
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
        images: ['https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=800&auto=format&fit=crop'],
        status: 'CERTIFIED',
        category: 'Car',
        type: 'Pickup',
        transmission: 'Manual',
        fuel: 'Gasolina',
        condition: 'Seminuevo',
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
        images: ['https://images.unsplash.com/photo-1612544448332-b67ae1911975?q=80&w=800&auto=format&fit=crop'],
        status: 'CERTIFIED',
        category: 'Car',
        type: 'Wagon',
        transmission: 'CVT',
        fuel: 'Gasolina',
        condition: 'Nuevo',
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
        images: ['https://images.unsplash.com/photo-1564415436601-387063456801?q=80&w=800&auto=format&fit=crop'],
        status: 'CERTIFIED',
        category: 'Car',
        type: 'SUV',
        transmission: 'Automática',
        fuel: 'Híbrido',
        condition: 'Nuevo',
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
        images: ['https://upload.wikimedia.org/wikipedia/commons/c/c8/Audi_Q5_FY_facelift_IAA_2021_1X7A0266.jpg'],
        status: 'CERTIFIED',
        category: 'Car',
        type: 'SUV',
        transmission: 'Automática',
        fuel: 'Gasolina',
        condition: 'Seminuevo',
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
        images: ['https://upload.wikimedia.org/wikipedia/commons/5/5e/2021_Ford_F-150_Lariat_PowerBoost%2C_front_right%2C_11-14-2021.jpg'],
        status: 'CERTIFIED',
        category: 'Car',
        type: 'Pickup',
        transmission: 'Automática',
        fuel: 'Gasolina',
        condition: 'Seminuevo',
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
        images: ['https://upload.wikimedia.org/wikipedia/commons/4/4b/2023_Jeep_Grand_Cherokee_L_Altitude_4x4%2C_front_left%2C_09-09-2023.jpg'],
        status: 'CERTIFIED',
        category: 'Car',
        type: 'SUV',
        transmission: 'Automática',
        fuel: 'Gasolina',
        condition: 'Seminuevo',
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
        images: ['https://upload.wikimedia.org/wikipedia/commons/d/d4/2024_Land_Rover_Defender_110_front_right.jpg'],
        status: 'CERTIFIED',
        category: 'Car',
        type: 'SUV',
        transmission: 'Automática',
        fuel: 'Híbrido',
        condition: 'Nuevo',
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
        images: ['https://upload.wikimedia.org/wikipedia/commons/9/9b/Mercedes-Benz_Unimog_U_4023.jpg'],
        status: 'CERTIFIED',
        category: 'Heavy',
        type: 'Truck',
        transmission: 'Manual',
        fuel: 'Diesel',
        condition: 'Seminuevo',
        tags: ['Extremo', 'Militar', 'Apocalipsis'],
        capabilities: ['Cualquier Terreno', 'Selva Densa', 'Montaña Alta'],
        passengers: 3
    }
];
