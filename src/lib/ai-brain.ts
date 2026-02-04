import { ALL_CARS, Vehicle } from "../data/cars";
import { LIFESTYLE_CONTEXTS, createIntents, Intent } from "./knowledge-base";
import { SupabaseClient } from "@supabase/supabase-js";

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    recommendations?: any[];
}

export const generateAIBrainResponse = async (text: string, inventory: Vehicle[] = ALL_CARS, supabase?: SupabaseClient): Promise<Message> => {
    // 🧠 Normalization
    const lower = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Dynamic fetching if Supabase is provided
    let dynamicInventory: Vehicle[] = [];
    if (supabase) {
        try {
            // RAG-Lite & Dynamic Query Construction
            let query = supabase.from('cars').select('*').eq('status', 'available');

            // 1. Budget Extraction (Re-used for DB Query)
            const cleanStr = lower.replace(/,/g, '').replace(/\$/g, '');
            const kMatch = cleanStr.match(/(\d+(?:\.\d+)?)\s*k\b/i);
            const milMatch = cleanStr.match(/(\d+(?:\.\d+)?)\s*mil\b/i);
            const directMatch = Array.from(cleanStr.matchAll(/(\d{5,8})/g)); // 5 to 8 digits (10,000 to 99,999,999)

            let dbBudget = null;
            if (kMatch) dbBudget = parseFloat(kMatch[1]) * 1000;
            else if (milMatch) dbBudget = parseFloat(milMatch[1]) * 1000;
            else if (directMatch.length > 0) dbBudget = parseFloat(directMatch[0][0]);

            if (dbBudget) {
                // Buffer of +10% for DB search
                query = query.lte('price', dbBudget * 1.1);
            }

            // 2. Year Extraction
            const yearMatch = lower.match(/\b(20\d{2})\b/);
            if (yearMatch) {
                const year = parseInt(yearMatch[1]);
                // If user says "2020", they usually mean around that year or newer
                if (lower.includes('desde') || lower.includes('mayor') || lower.includes('nuevo')) {
                    query = query.gte('year', year);
                } else {
                    // Exact match intent, but let's give a range -1/+2 years
                    query = query.gte('year', year - 1).lte('year', year + 2);
                }
            }

            // 3. Keyword Extraction (Brand, Type)
            const brands = ['mazda', 'toyota', 'honda', 'ford', 'chevrolet', 'nissan', 'kia', 'bmw', 'mercedes', 'audi', 'tesla', 'volkswagen', 'volvo', 'subaru'];
            const types = ['suv', 'sedan', 'truck', 'pickup', 'coupe', 'hatchback', 'minivan'];

            const foundBrand = brands.find(b => lower.includes(b));
            const foundType = types.find(t => lower.includes(t));

            if (foundBrand) {
                query = query.ilike('make', `%${foundBrand}%`);
            }
            if (foundType) {
                // Map colloquial to DB types if necessary, or just ilike
                query = query.ilike('body_type', `%${foundType}%`);
            }

            // Limit results
            const { data, error } = await query.limit(5);

            if (!error && data) {
                // Map DB schema to Vehicle interface
                dynamicInventory = data.map((car: any) => ({
                    id: car.id,
                    make: car.make,
                    model: car.model,
                    year: car.year,
                    price: car.price,
                    mileage: car.mileage,
                    fuel: car.fuel_type || 'Gasolina',
                    transmission: car.transmission,
                    type: car.body_type || 'Sedan',
                    images: car.images || [],
                    tags: ['Verified', 'Dynamic'],
                    category: 'Car',
                    condition: 'Seminuevo',
                    passengers: car.passengers || 5,
                    location: car.location || 'Sucursal Central',
                    distance: car.mileage || 0,
                    status: 'CERTIFIED',
                    capabilities: []
                }));
            }
        } catch (err) {
            console.error("AI Brain: Failed to fetch dynamic inventory", err);
        }
    }

    // Merge Inventory: Dynamic takes precedence or appends? 
    // Let's append dynamic to static for now, or use dynamic if available
    const combinedInventory = [...dynamicInventory, ...inventory];

    // If inventory is empty, fallback to ALL_CARS from static data
    const dataSource = combinedInventory.length > 0 ? combinedInventory : ALL_CARS;

    let content = "Analizando contexto y terreno... 🧠";
    let recs: any[] = [];
    let candidates: Vehicle[] = [];
    let matchedIntent: Intent | null = null;

    // 💰 Stage 0.1: Budget Extraction (Locally for filtering static list too)
    const extractBudget = (str: string): number | null => {
        const cleanStr = str.replace(/,/g, '').replace(/\$/g, '');
        const modifierMatch = cleanStr.match(/(\d+(?:\.\d+)?)\s*(k|mil)\b/i);
        if (modifierMatch) {
            const rawVal = parseFloat(modifierMatch[1]);
            if (rawVal < 10000) return rawVal * 1000;
            return rawVal;
        }
        const numberMatches = Array.from(cleanStr.matchAll(/(\d+(?:\.\d{1,2})?)/g));
        for (const match of numberMatches) {
            const val = parseFloat(match[0]);
            if (val > 10000 && val < 50000000) return val;
        }
        return null;
    };
    const userBudget = extractBudget(lower);

    // 🧠 Stage 0: Context Extraction
    const extractPassengerCount = (str: string): number | null => {
        const digitMatch = str.match(/(\d+)/);
        if (digitMatch) {
            const val = parseInt(digitMatch[0]);
            if (val < 20 && !str.includes(val + '.00') && !str.toLowerCase().includes('k') && !str.toLowerCase().includes('mil')) return val;
        }
        const words: Record<string, number> = { 'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5, 'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10 };
        for (const [word, val] of Object.entries(words)) {
            if (str.includes(word)) return val;
        }
        return null;
    };
    const requestedPassengers = extractPassengerCount(lower);

    // 🌍 Stage 0.5: Geographic & Route Logic
    const routeType = ((): 'OVER_WATER' | 'LONG_HAUL_LAND' | 'CITY' | 'JUNGLE' | null => {
        const OVER_WATER_DESTINATIONS = ['europa', 'espana', 'madrid', 'barcelona', 'francia', 'paris', 'italia', 'roma', 'alemania', 'berlin', 'londres', 'reino unido', 'inglaterra', 'irlanda', 'grecia', 'atenas', 'rusia', 'moscu', 'ucrania', 'polonia', 'suiza', 'suecia', 'noruega', 'finlandia', 'holanda', 'amsterdam', 'belgica', 'portugal', 'lisboa', 'asia', 'china', 'japon', 'corea', 'india', 'tailandia', 'vietnam', 'indonesia', 'bali', 'filipinas', 'malasia', 'singapur', 'hong kong', 'taiwan', 'dubai', 'emiratos', 'arabia', 'israel', 'jerusalen', 'turquia', 'qatar', 'africa', 'egipto', 'marruecos', 'sudafrica', 'oceania', 'australia', 'nueva zelanda', 'cuba', 'habana', 'republica dominicana', 'puerto rico', 'jamaica', 'haiti', 'bahamas', 'hawaii', 'islas', 'cozumel', 'isla mujeres', 'galapagos'];
        if (OVER_WATER_DESTINATIONS.some(d => lower.includes(d))) return 'OVER_WATER';
        const jungleContext = ['selva', 'jungla', 'amazonas', 'chiapas', 'lacandona', 'bosque denso', 'camino de tierra', 'sin camino', 'peten'];
        if (jungleContext.some(d => lower.includes(d))) return 'JUNGLE';
        const longHaul = ['panama', 'usa', 'estados unidos', 'guatemala', 'belice', 'honduras', 'salvador', 'costa rica', 'nicaragua', 'frontera', 'viaje largo', 'carretera', 'kilometros', 'viajar', 'roadtrip', 'canada', 'alaska', 'tijuana', 'merida', 'cdmx', 'monterrey', 'veracruz'];
        if (longHaul.some(d => lower.includes(d))) return 'LONG_HAUL_LAND';
        return null;
    })();

    // 🔍 Stage 1: Analyze Constraints
    const wantsNew = lower.includes('nuevo') || lower.includes('agencia') || lower.includes('0km');
    const wantsUsed = lower.includes('usado') || lower.includes('seminuevo') || lower.includes('segunda mano');
    const wantsBest = lower.includes('mejor') || lower.includes('top') || lower.includes('valorado') || lower.includes('popular') || lower.includes('comercial');
    const wantsCheapest = lower.includes('barato') || lower.includes('economico') || lower.includes('menor precio');

    // 🏎️ Strict Body Type Extraction
    const detectBodyType = () => {
        if (lower.includes('sedan')) return 'Sedan';
        if (lower.includes('suv') || lower.includes('camioneta')) return 'SUV';
        if (lower.includes('pickup') || lower.includes('troca')) return 'Pickup';
        if (lower.includes('hatchback')) return 'Hatchback';
        if (lower.includes('coupe') || lower.includes('deportivo')) return 'Coupe';
        if (lower.includes('moto')) return 'Motorcycle';
        return null;
    };
    const desiredType = detectBodyType();

    // 🏷️ Brand & Fuel Extraction
    const extractBrand = (): string | null => {
        const availableMakes = Array.from(new Set(dataSource.map(c => c.make.toLowerCase())));
        for (const make of availableMakes) {
            if (lower.includes(make)) {
                return dataSource.find(c => c.make.toLowerCase() === make)?.make || null;
            }
        }
        return null;
    };
    const desiredBrand = extractBrand();

    const extractModel = (): string | null => {
        for (const vehicle of dataSource) {
            const modelName = vehicle.model.toLowerCase();
            const firstWord = modelName.split(' ')[0];
            const regex = new RegExp(`\\b${firstWord}\\b`, 'i');
            if (regex.test(lower)) return firstWord;
        }
        return null;
    };
    const desiredModel = extractModel();

    const extractFuel = (): 'Híbrido' | 'Eléctrico' | 'Diesel' | null => {
        if (lower.includes('hibrido') || lower.includes('hybrid')) return 'Híbrido';
        if (lower.includes('electrico') || lower.includes('electric')) return 'Eléctrico';
        if (lower.includes('diesel')) return 'Diesel';
        return null;
    };
    const desiredFuel = extractFuel();

    const INTENTS = createIntents(lower, userBudget, requestedPassengers, routeType, wantsBest, desiredType);

    // Priority -1: SEMANTIC REASONER MATCH
    let semanticMatch = null;
    for (const [key, ctx] of Object.entries(LIFESTYLE_CONTEXTS)) {
        if (lower.includes(key)) {
            semanticMatch = ctx;
            break;
        }
    }

    if (semanticMatch) {
        content = semanticMatch.prompt;
        candidates = dataSource.filter(semanticMatch.filters);
        matchedIntent = { id: semanticMatch.intent } as any;
    } else {
        if (lower.includes('zombie')) matchedIntent = INTENTS.find(i => i.id === 'ZOMBIE_SURVIVAL') || null;
    }

    // Priority 1: Market Top Rated / Specific Capability Intent
    if (!matchedIntent) {
        matchedIntent = INTENTS.find(i => (i.id === 'OFFROAD_4X4' || i.id === 'WORK_COMMERCIAL') && i.condition(lower)) || null;
    }

    if (!matchedIntent && wantsBest && desiredType) {
        matchedIntent = INTENTS.find(i => i.id === 'MARKET_TOP_RATED') || null;
    }

    // Priority 2: Winter Check
    if (!matchedIntent) {
        matchedIntent = INTENTS.find(i => i.id === 'SNOW_WINTER_ROADTRIP' && i.condition(lower)) || null;
    }

    // Priority 3: Student/Budget
    if (!matchedIntent) {
        matchedIntent = INTENTS.find(i => i.id === 'STUDENT_FIRST_CAR' && i.condition(lower)) || null;
    }

    // Priority Check (Strict Condition)
    if (!matchedIntent) {
        matchedIntent = INTENTS.find(i => i.condition(lower) && (i.keywords.length === 0 || i.keywords.some(k => lower.includes(k)))) || null;
    }

    // Keyword Fallback
    if (!matchedIntent) {
        matchedIntent = INTENTS.find(i => i.condition(lower) && i.keywords.some(k => lower.includes(k))) || null;
    }

    // Default Fallback
    if (matchedIntent) {
        content = matchedIntent.response;
        candidates = dataSource.filter(matchedIntent.filter);
    } else {
        candidates = dataSource.filter(c => c.category === 'Car');
    }

    // 🛑 STRICT ATTRIBUTE ENFORCEMENT (Global Overrides)
    if (desiredBrand) {
        candidates = candidates.filter(c => c.make === desiredBrand);
        if (matchedIntent) {
            content = content.replace(':', '') + ` (Solo **${desiredBrand}**):`;
        }
    }

    if (desiredModel) {
        candidates = candidates.filter(c => c.model.toLowerCase().includes(desiredModel.toLowerCase()));
        if (matchedIntent) {
            content = content.replace(':', '') + ` (Modelo **${desiredModel}**):`;
        }
    }

    if (desiredFuel) {
        candidates = candidates.filter(c => c.fuel === desiredFuel);
        if (matchedIntent) {
            content = content.replace(':', '') + ` (Solo **${desiredFuel}**):`;
        }
    }

    // 🛑 STRICT TYPE ENFORCEMENT
    if (desiredType) {
        if (desiredType === 'Motorcycle') {
            candidates = candidates.filter(c => c.category === 'Motorcycle');
        } else {
            const isSpecial = matchedIntent?.id === 'ZOMBIE_SURVIVAL' || matchedIntent?.id === 'SWAMP_MANGROVE' || matchedIntent?.id === 'CROSS_WATER_ROUTE' || matchedIntent?.id === 'JUNGLE_EXPEDITION' || matchedIntent?.id === 'SNOW_WINTER_ROADTRIP' || matchedIntent?.id === 'OFFROAD_4X4' || matchedIntent?.id === 'WORK_COMMERCIAL';
            if (!isSpecial) {
                candidates = candidates.filter(c => c.type === desiredType);
            }
        }
    }

    // Global Safety Exclusion
    if (lower.includes('familia') || lower.includes('paseo') || lower.includes('vacaciones')) {
        candidates = candidates.filter(c => c.type !== 'Truck' && !c.model.includes('Cargo') && !c.model.includes('Sprinter'));
    }

    // 💰 GLOBAL BUDGET FILTER
    if (userBudget) {
        candidates = candidates.filter(c => c.price <= (userBudget * 1.1));
        if (candidates.length === 0) {
            candidates = dataSource.filter(c => c.price <= (userBudget * 1.2)).sort((a, b) => a.price - b.price).slice(0, 3);
            content += ` (Nota: Tu presupuesto es ajustado, aquí están las opciones más cercanas en precio):`;
        }
    } else if (wantsCheapest && !userBudget) {
        const IMPLICIT_CHEAP_BUDGET = 300000;
        candidates = candidates.filter(c => c.price <= IMPLICIT_CHEAP_BUDGET);
        content += ` (Buscando opciones económicas por debajo de $${IMPLICIT_CHEAP_BUDGET.toLocaleString()} MXN):`;
    }

    // Filter Logic
    if (matchedIntent?.id !== 'JUNGLE_EXPEDITION' && matchedIntent?.id !== 'SNOW_WINTER_ROADTRIP' && matchedIntent?.id !== 'SWAMP_MANGROVE' && matchedIntent?.id !== 'ZOMBIE_SURVIVAL' && matchedIntent?.id !== 'OFFROAD_4X4') {
        if (wantsNew) candidates = candidates.filter(c => c.condition === 'Nuevo');
        if (wantsUsed) candidates = candidates.filter(c => c.condition === 'Seminuevo');
    }

    // Capacity Check
    if (requestedPassengers) {
        candidates = candidates.filter(c => c.passengers >= requestedPassengers);
    }

    // Sorting
    if (wantsCheapest || matchedIntent?.id === 'STUDENT_FIRST_CAR') {
        candidates.sort((a, b) => a.price - b.price);
    } else if (wantsBest) {
        candidates.sort((a, b) => {
            const score = (v: Vehicle) => (v.tags.includes('Best Seller') ? 3 : 0) + (v.tags.includes('Top Rated') ? 2 : 0) + (v.tags.includes('Premium') ? 1 : 0);
            return score(b) - score(a);
        });
    } else if (matchedIntent?.id === 'LONG_ROADTRIP') {
        candidates.sort((a, b) => {
            const score = (v: Vehicle) => (v.fuel === 'Eléctrico' ? 3 : 0) + (v.fuel === 'Híbrido' ? 2 : 0) + (v.type === 'Sedan' ? 1 : 0);
            return score(b) - score(a);
        });
    }
    recs = candidates.slice(0, 3);

    // Fallback if 0 results
    if (recs.length === 0) {
        if (matchedIntent?.id === 'JUNGLE_EXPEDITION' || matchedIntent?.id === 'ZOMBIE_SURVIVAL' || matchedIntent?.id === 'CROSS_WATER_ROUTE' || matchedIntent?.id === 'SNOW_WINTER_ROADTRIP') {
            if (matchedIntent.id === 'CROSS_WATER_ROUTE') {
                recs = dataSource.filter(c => c.category === 'Air' || c.category === 'Marine').slice(0, 3);
            } else {
                content += " (Mostrando alternativas extremas disponibles):";
                recs.push(dataSource.find(c => c.model.includes('Unimog')) || dataSource[0]);
                recs.push(dataSource.find(c => c.model.includes('Wrangler')) || dataSource[0]);
                recs.push(dataSource.find(c => c.model.includes('F-150')) || dataSource[0]);
            }
        } else {
            content = `🔍 He buscado en toda la red y en mi inventario. No encontré un exacto ${desiredType || 'vehículo'} con esos filtros extremos, pero estas son las mejores coincidencias parciales:`;
            // Safe fallback logic
            const safeRec1 = dataSource.find(c => c.type === (desiredType || 'SUV')) || dataSource[0];
            const safeRec2 = dataSource.find(c => c.type !== safeRec1?.type) || dataSource[1] || dataSource[0];
            recs.push(safeRec1);
            recs.push(safeRec2);
        }
    }

    // Formatting
    const recommendations = recs.filter(Boolean).map(c => ({
        id: c.id,
        make: c.make,
        model: c.model,
        price: c.price,
        reason: matchedIntent?.id === 'MARKET_TOP_RATED' ? '🏆 5/5 Estrellas en Reseñas' : (matchedIntent?.id === 'JUNGLE_EXPEDITION' ? '🌿 Aprobado para Selva' : (matchedIntent?.id === 'SNOW_WINTER_ROADTRIP' ? '❄️ Aprobado para Nieve/Hielo' : (matchedIntent?.id === 'SMALL_FAMILY_TRIP' ? '👨‍👩‍👧‍👦 Ideal Familia Pequeña' : (matchedIntent?.id === 'STUDENT_FIRST_CAR' ? '🎓 Económico y Confiable' : (c.fuel === 'Eléctrico' ? '⚡ Recomendado por Eficiencia' : (c.category === 'Air' ? '✈️ Ruta Aérea Óptima' : (c.category === 'Marine' ? '⚓ Ruta Marítima' : '✅ Match Verificado')))))))
    }));

    return {
        id: Date.now().toString() + 'ai',
        role: 'assistant',
        content,
        recommendations
    };
};

export const validateImageQuality = async (imageUrl: string, category: string): Promise<{
    score: number;
    feedback: string;
    passed: boolean;
    severity: 'OK' | 'WARNING' | 'ERROR';
}> => {
    // Simulate AI Vision analysis
    await new Promise(resolve => setTimeout(resolve, 800));

    const rand = Math.random();

    // Hard error: Too dark or totally unreadable (rare)
    if (rand > 0.95) {
        return {
            score: 20,
            feedback: "❌ Error crítico: La imagen es demasiado oscura o ilegible.",
            passed: false,
            severity: 'ERROR'
        };
    }

    // Warning: Suboptimal but usable
    if (rand > 0.75) {
        return {
            score: 55,
            feedback: "⚠️ Aviso: Imagen algo movida o con encuadre mejorable.",
            passed: true, // Mark as passed but with warning
            severity: 'WARNING'
        };
    }

    return {
        score: 95,
        feedback: "✅ Calidad excelente. Encuadre perfecto.",
        passed: true,
        severity: 'OK'
    };
};
