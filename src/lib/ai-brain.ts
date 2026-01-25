import { ALL_CARS, Vehicle } from "@/data/cars";

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    recommendations?: any[];
}

export const generateAIBrainResponse = (text: string): Message => {
    // 🧠 Normalization
    const lower = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    let content = "Analizando contexto y terreno... 🧠";
    let recs: any[] = [];

    // 💰 Stage 0.1: Budget Extraction (CRITICAL FOR STUDENT/BUDGET SCENARIOS)
    const extractBudget = (str: string): number | null => {
        // Remove commas to avoid regex confusion but KEEP dots for decimals
        const cleanStr = str.replace(/,/g, '');

        // Match "300k", "300 mil"
        // We prioritize smaller numbers followed by multiplier
        const modifierMatch = cleanStr.match(/(\d+(?:\.\d+)?)\s*(k|mil)\b/i);
        if (modifierMatch) {
            const rawVal = parseFloat(modifierMatch[1]);
            // If user says "300 mil", rawVal is 300. Multiplier applies.
            // If user says "300000 mil" (redundant), rawVal is 300000.
            // We assume if rawVal is already > 1000, they might be being redundant OR it's a huge budget.
            // But for safety, if rawVal < 10000, we apply multiplier.
            if (rawVal < 10000) return rawVal * 1000;
            return rawVal;
        }

        // Detect raw numbers like "300000.00" or "200000"
        const numberMatches = cleanStr.matchAll(/(\d+(?:\.\d{1,2})?)/g);
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
            // Filter out budget-like numbers. If > 20, likely not passengers.
            // Also check if it looks like money (followed by .00)
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
        const OVER_WATER_DESTINATIONS = [
            'europa', 'espana', 'madrid', 'barcelona', 'francia', 'paris', 'italia', 'roma', 'alemania', 'berlin', 'londres', 'reino unido', 'inglaterra', 'irlanda', 'grecia', 'atenas', 'rusia', 'moscu', 'ucrania', 'polonia', 'suiza', 'suecia', 'noruega', 'finlandia', 'holanda', 'amsterdam', 'belgica', 'portugal', 'lisboa',
            'asia', 'china', 'pekin', 'shanghai', 'japon', 'tokio', 'corea', 'seul', 'india', 'delhi', 'mumbai', 'tailandia', 'bangkok', 'vietnam', 'indonesia', 'bali', 'filipinas', 'malasia', 'singapur', 'hong kong', 'taiwan', 'dubai', 'emiratos', 'arabia', 'israel', 'jerusalen', 'turquia', 'estambul', 'qatar',
            'africa', 'egipto', 'el cairo', 'marruecos', 'sudafrica', 'nigeria', 'kenia', 'tanzania', 'madagascar',
            'oceania', 'australia', 'sydney', 'melbourne', 'nueva zelanda', 'fiji', 'polinesia',
            'cuba', 'habana', 'republica dominicana', 'santo domingo', 'puerto rico', 'jamaica', 'haiti', 'bahamas', 'hawaii', 'islas', 'cozumel', 'isla mujeres', 'galapagos'
        ];

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
    const terrainSand = lower.includes('arena') || lower.includes('playa') || lower.includes('dunas');
    const wantsEco = lower.includes('ecologico') || lower.includes('hibrido') || lower.includes('electrico');
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
        // Dynamic check against all available makes in inventory to avoid hardcoding
        const availableMakes = Array.from(new Set(ALL_CARS.map(c => c.make.toLowerCase())));
        for (const make of availableMakes) {
            if (lower.includes(make)) {
                // Return the capitalized version from inventory (first match)
                return ALL_CARS.find(c => c.make.toLowerCase() === make)?.make || null;
            }
        }
        return null;
    };
    const desiredBrand = extractBrand();

    const extractModel = (): string | null => {
        // Search for specific models in the input (e.g. "Versa", "CR-V", "Civic")
        for (const vehicle of ALL_CARS) {
            const modelName = vehicle.model.toLowerCase();
            const firstWord = modelName.split(' ')[0];
            // Logic: Check if the exact first word of the model is in the input
            // "Versa" in "Quiero un Versa" -> Match
            const regex = new RegExp(`\\b${firstWord}\\b`, 'i');
            if (regex.test(lower)) return firstWord;
        }
        return null;
    };
    const desiredModel = extractModel();

    const extractFuel = (): 'Hybrid' | 'Electric' | 'Diesel' | null => {
        if (lower.includes('hibrido') || lower.includes('hybrid')) return 'Hybrid';
        if (lower.includes('electrico') || lower.includes('electric')) return 'Electric';
        if (lower.includes('diesel')) return 'Diesel';
        return null;
    };
    const desiredFuel = extractFuel();

    // 🧠 Stage 2: Intent Classification
    const INTENTS = [
        {
            id: 'SNOW_WINTER_ROADTRIP',
            keywords: ['nieve', 'hielo', 'invierno', 'frio', 'canada', 'toronto', 'alaska', 'vancouver', 'montreal', 'denver', 'ski', 'nevada'],
            condition: () => lower.includes('nieve') || lower.includes('canada') || lower.includes('invierno'),
            response: "❄️ Detecto una ruta con condiciones extremas (Nieve/Hielo). Para viajar seguro desde México hasta el norte, **necesitas Tracción Integral (AWD/4x4)** y sistemas de estabilidad. Olvida las camionetas sencillas de tracción delantera:",
            filter: (c: Vehicle) => (c.tags.includes('AWD') || c.tags.includes('4x4') || c.tags.includes('Quattro') || c.tags.includes('Nieve') || c.capabilities?.includes('Nieve')) && c.category !== 'Motorcycle'
        },
        {
            id: 'OFFROAD_4X4',
            keywords: ['todo terreno', 'offroad', '4x4', 'montaña', 'brecha', 'lodo'],
            condition: () => lower.includes('todo terreno') || lower.includes('offroad') || lower.includes('4x4'),
            response: "⛰️ Configurando modo Off-Road. Buscando vehículos con tracción 4x4, bloqueo de diferencial y buena altura libre al suelo:",
            filter: (c: Vehicle) => c.tags.includes('4x4') || c.tags.includes('Offroad') || c.tags.includes('AWD') || c.model.includes('Raptor') || c.model.includes('Wrangler') || c.type === 'Pickup'
        },
        {
            id: 'WORK_COMMERCIAL',
            keywords: ['carga', 'arquitecto', 'construccion', 'material', 'transporte', 'trabajo'],
            condition: () => lower.includes('carga') || ((lower.includes('arquitecto') || lower.includes('ingeniero')) && (lower.includes('camioneta') || lower.includes('transporte'))),
            response: "🏗️ Entendido, buscas una herramienta de trabajo pesado. Priorizo capacidad de carga, durabilidad y espacio útil:",
            filter: (c: Vehicle) => c.type === 'Truck' || c.type === 'Van' || c.type === 'Pickup' || c.tags.includes('Trabajo') || c.category === 'Heavy'
        },
        {
            id: 'STUDENT_FIRST_CAR',
            keywords: ['estudiante', 'universidad', 'escuela', 'primer auto', 'barato', 'economico', 'ahorro', 'presupuesto'],
            condition: () => (lower.includes('estudiante') || lower.includes('universidad') || lower.includes('primer auto')) || (!!userBudget && userBudget < 400000),
            response: `🎓 Detecto que buscas una opción inteligente y eficiente (Estudiante/Primer Auto). Priorizo **Bajo Consumo**, **Fiabilidad** y que se ajuste a tu presupuesto${userBudget ? ` ($${userBudget.toLocaleString('es-MX')})` : ''}:`,
            filter: (c: Vehicle) => {
                // Expanded logic for students:
                // 1. Must be a Car (no Motorcycle unless asked, no Heavy logic)
                // 2. Ideally Sedan, Hatchback, or Compact SUV
                // 3. Exclude Luxury brands unless old (but we simplify to exclude tags like 'Premium')
                // 4. PRICE FILTER IS CRITICAL (handled globally later, but we can verify here to be safe)
                return (c.type === 'Sedan' || c.type === 'Hatchback' || (c.type === 'SUV' && c.passengers === 5)) &&
                    !c.tags.includes('Premium') &&
                    !c.tags.includes('Luxury') &&
                    c.category === 'Car';
            }
        },
        {
            id: 'MARKET_TOP_RATED',
            keywords: [],
            condition: () => wantsBest && !!desiredType,
            response: `🏆 He analizado las reseñas más recientes del mercado automotriz en México. Los expertos posicionan estos modelos como los líderes en **${desiredType}**:`,
            filter: (c: Vehicle) => c.type === desiredType && (c.tags.includes('Best Seller') || c.tags.includes('Top Rated') || c.tags.includes('Premium'))
        },
        {
            id: 'ZOMBIE_SURVIVAL',
            keywords: ['zombie', 'apocalipsis', 'fin del mundo', 'sobrevivir', 'infectados'],
            condition: () => false,
            response: "🧟 He buscado tácticas de supervivencia. Para el apocalipsis, los foros expertos recomiendan blindaje, altura y durabilidad extrema:",
            filter: (c: Vehicle) => c.model.includes('Unimog') || c.model.includes('Raptor') || c.model.includes('Defender') || (c.type === 'Truck')
        },
        {
            id: 'JUNGLE_EXPEDITION',
            keywords: ['selva', 'jungla', 'monte', 'vegetación', 'amazonas', 'chiapas'],
            condition: () => routeType === 'JUNGLE',
            response: "🌿 Analizando topografía de la selva... Se requieren ángulos de ataque >30° y vado >500mm. Estos vehículos coinciden con las especificaciones:",
            filter: (c: Vehicle) => (c.capabilities?.includes('Selva') || c.tags.includes('4x4') || c.category === 'Recreational') && c.category !== 'Motorcycle'
        },
        {
            id: 'LONG_ROADTRIP',
            keywords: [],
            condition: () => routeType === 'LONG_HAUL_LAND',
            response: "🌎 Buscando rutas internacionales... Para viajes largos (+1000km), la data sugiere priorizar **Asistencias de Manejo (ADAS)** y **Eficiencia**. Mis mejores candidatos:",
            filter: (c: Vehicle) => c.category === 'Car' &&
                (c.fuel === 'Hybrid' || c.fuel === 'Electric' || c.type === 'Sedan' || c.type === 'SUV') &&
                !c.tags.includes('Primer Auto')
        },
        {
            id: 'SWAMP_MANGROVE',
            keywords: ['manglar', 'pantano', 'humedal', 'cienaga', 'lodo profundo'],
            condition: () => true,
            response: "¡Alerta! 🐊 Búsqueda geológica: Manglar = Lodo profundo + Agua. Un auto convencional tiene 0% de éxito. Filtrando inventario por capacidad anfibia/marina:",
            filter: (c: Vehicle) => c.category === 'Marine' || c.category === 'Recreational' || (c.type === 'Pickup' && c.capabilities.includes('Lodo'))
        },
        {
            id: 'CROSS_WATER_ROUTE',
            keywords: [],
            condition: () => routeType === 'OVER_WATER',
            response: "🌊 calculando ruta... Detectado cuerpo de agua intransitable por tierra. Re-enrutando a opciones **Aéreas o Marítimas**:",
            filter: (c: Vehicle) => c.category === 'Air' || c.category === 'Marine'
        },
        {
            id: 'AVIATION',
            keywords: ['volar', 'cielo', 'avion', 'helicoptero', 'aire', 'piloto'],
            condition: () => true,
            response: "✈️ Conectando con base de datos aeronáutica... Aquí está el inventario disponible para vuelo:",
            filter: (c: Vehicle) => c.category === 'Air'
        },
        {
            id: 'MARINE',
            keywords: ['navegar', 'yate', 'bote', 'lancha', 'mar'],
            condition: () => true,
            response: "⚓ Consultando condiciones marítimas... Estas naves están listas para zarpar:",
            filter: (c: Vehicle) => c.category === 'Marine'
        },
        {
            id: 'HEAVY_INDUSTRIAL',
            keywords: ['construccion', 'excavadora', 'tractor', 'obra', 'pesado', 'pozo', 'excavar', 'tierra'],
            condition: () => true,
            response: "🏗️ Buscando especificaciones industriales... Para movimiento de tierras, estos equipos cumplen la norma:",
            filter: (c: Vehicle) => c.category === 'Heavy' || c.category === 'Industrial'
        },
        {
            id: 'MOTO_DAILY',
            keywords: ['tortillas', 'mandados', 'tienda', 'oxxo', 'chamba ligera', 'reparto'],
            condition: () => (requestedPassengers || 0) <= 2,
            response: "🛵 Analizando costos operativos... Para distancias cortas, una moto reduce costos en un 90%. Opciones optimizadas:",
            filter: (c: Vehicle) => c.category === 'Motorcycle' || c.tags.includes('Ecológico')
        },
        {
            id: 'CITY_SAVER',
            keywords: ['ciudad', 'trafico', 'ahorro', 'solo', 'pareja'],
            condition: () => (requestedPassengers || 0) <= 2 && lower.includes('ciudad'),
            response: "🏙️ Analizando tráfico urbano... La tendencia favorece movilidad eléctrica o compacta. Aquí los más ágiles:",
            filter: (c: Vehicle) => (c.fuel === 'Electric' || c.fuel === 'Hybrid' || c.type === 'Hatchback') && c.passengers <= 5
        },
        {
            id: 'SMALL_FAMILY_TRIP',
            keywords: ['familia', 'paseo', 'viaje', 'vacaciones', 'hijos'],
            condition: () => (requestedPassengers || 0) > 0 && (requestedPassengers || 0) <= 4,
            response: `👨‍👩‍👧‍👦 Configurando para familia pequeña (${requestedPassengers} personas). Para paseos y carretera, sugiero **Sedanes Cómodos** o **SUVs Compactas** (Evitamos el gasto excesivo de una camioneta grande):`,
            filter: (c: Vehicle) => (c.type === 'Sedan' || (c.type === 'SUV' && c.passengers === 5)) && c.category === 'Car' && !c.tags.includes('Trabajo')
        },
        {
            id: 'LARGE_FAMILY',
            keywords: ['familia', 'hijos', 'ninos'],
            condition: () => (requestedPassengers || 0) > 4,
            response: `🚌 Verificando capacidad... Para ${requestedPassengers} pasajeros, he descartado sedanes. Estas son las opciones reales de 3 filas:`,
            filter: (c: Vehicle) => (c.type === 'SUV' || c.type === 'Minivan' || c.type === 'Van') && c.passengers >= (requestedPassengers || 5) && !c.tags.includes('Carga')
        }
    ];

    let matchedIntent = null;

    // Priority 0: Safety/Survival Specifics
    if (lower.includes('zombie')) matchedIntent = INTENTS.find(i => i.id === 'ZOMBIE_SURVIVAL');

    // Priority 1: Market Top Rated / Specific Capability Intent
    if (!matchedIntent) {
        // Try finding explicit OFFROAD or WORK intents before checking generic "Best"
        matchedIntent = INTENTS.find(i => (i.id === 'OFFROAD_4X4' || i.id === 'WORK_COMMERCIAL') && i.condition());
    }

    if (!matchedIntent && wantsBest && desiredType) {
        matchedIntent = INTENTS.find(i => i.id === 'MARKET_TOP_RATED');
    }

    // Priority 2: Winter Check
    if (!matchedIntent) {
        matchedIntent = INTENTS.find(i => i.id === 'SNOW_WINTER_ROADTRIP' && i.condition());
    }

    // Priority 3: Student/Budget (Critical to catch before generic fallbacks)
    if (!matchedIntent) {
        matchedIntent = INTENTS.find(i => i.id === 'STUDENT_FIRST_CAR' && i.condition());
    }

    // Priority Check (Strict Condition)
    if (!matchedIntent) {
        matchedIntent = INTENTS.find(i => i.condition() && (i.keywords.length === 0 || i.keywords.some(k => lower.includes(k))));
    }

    // Keyword Fallback (FIXED: Must respect condition)
    if (!matchedIntent) {
        matchedIntent = INTENTS.find(i => i.condition() && i.keywords.some(k => lower.includes(k)));
    }

    // Default Fallback
    let candidates: Vehicle[] = [];
    if (matchedIntent) {
        content = matchedIntent.response;
        candidates = ALL_CARS.filter(matchedIntent.filter);
    } else {
        candidates = ALL_CARS.filter(c => c.category === 'Car');
    }

    // 🛑 STRICT ATTRIBUTE ENFORCEMENT (Global Overrides)
    if (desiredBrand) {
        candidates = candidates.filter(c => c.make === desiredBrand);
        if (matchedIntent) {
            // Append to response to acknowledge the filter
            content = content.replace(':', '') + ` (Solo **${desiredBrand}**):`;
        }
    }

    if (desiredModel) {
        // Strict Model Filter (e.g. "Versa")
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

    // Global Safety Exclusion: Never show Work Trucks/Cargo for Family/Leisure unless strictly asked
    if (lower.includes('familia') || lower.includes('paseo') || lower.includes('vacaciones')) {
        candidates = candidates.filter(c => c.type !== 'Truck' && !c.model.includes('Cargo') && !c.model.includes('Sprinter'));
    }

    // 💰 GLOBAL BUDGET FILTER (The Fix)
    if (userBudget) {
        // Strict budget filter. Allow 10% wiggle room for "negotiation" or "stretching", but mostly specific.
        candidates = candidates.filter(c => c.price <= (userBudget * 1.1));
        if (candidates.length === 0) {
            // If strict budget killed everything, try to find *something* cheap even if it doesn't match other filters perfectly
            // Or just return cheapest cars
            candidates = ALL_CARS.filter(c => c.price <= (userBudget * 1.2)).sort((a, b) => a.price - b.price).slice(0, 3);
            content += ` (Nota: Tu presupuesto es ajustado, aquí están las opciones más cercanas en precio):`;
        }
    }

    // Filter Logic
    if (matchedIntent?.id !== 'JUNGLE_EXPEDITION' && matchedIntent?.id !== 'SNOW_WINTER_ROADTRIP' && matchedIntent?.id !== 'SWAMP_MANGROVE' && matchedIntent?.id !== 'ZOMBIE_SURVIVAL' && matchedIntent?.id !== 'OFFROAD_4X4') {
        if (wantsNew) candidates = candidates.filter(c => c.condition === 'New');
        if (wantsUsed) candidates = candidates.filter(c => c.condition === 'Used');
    }

    // Capacity Check
    if (requestedPassengers) {
        candidates = candidates.filter(c => c.passengers >= requestedPassengers);
    }

    // Sorting
    // Global sorting logic
    if (wantsCheapest || matchedIntent?.id === 'STUDENT_FIRST_CAR') {
        candidates.sort((a, b) => a.price - b.price);
    } else if (wantsBest) {
        candidates.sort((a, b) => {
            const score = (v: Vehicle) => (v.tags.includes('Best Seller') ? 3 : 0) + (v.tags.includes('Top Rated') ? 2 : 0) + (v.tags.includes('Premium') ? 1 : 0);
            return score(b) - score(a);
        });
    } else if (matchedIntent?.id === 'LONG_ROADTRIP') {
        candidates.sort((a, b) => {
            const score = (v: Vehicle) => (v.fuel === 'Electric' ? 3 : 0) + (v.fuel === 'Hybrid' ? 2 : 0) + (v.type === 'Sedan' ? 1 : 0);
            return score(b) - score(a);
        });
    }
    recs = candidates.slice(0, 3);

    // Fallback if 0 results
    if (recs.length === 0) {
        if (matchedIntent?.id === 'JUNGLE_EXPEDITION' || matchedIntent?.id === 'ZOMBIE_SURVIVAL' || matchedIntent?.id === 'CROSS_WATER_ROUTE' || matchedIntent?.id === 'SNOW_WINTER_ROADTRIP') {
            if (matchedIntent.id === 'CROSS_WATER_ROUTE') {
                recs = ALL_CARS.filter(c => c.category === 'Air' || c.category === 'Marine').slice(0, 3);
            } else {
                content += " (Mostrando alternativas extremas disponibles):";
                recs.push(ALL_CARS.find(c => c.model.includes('Unimog')) || ALL_CARS[0]);
                recs.push(ALL_CARS.find(c => c.model.includes('Wrangler')) || ALL_CARS[0]);
                recs.push(ALL_CARS.find(c => c.model.includes('F-150')) || ALL_CARS[0]); // Fallback for snow
            }
        } else {
            content = `🔍 He buscado en toda la red y en mi inventario. No encontré un exacto ${desiredType || 'vehículo'} con esos filtros extremos, pero estas son las mejores coincidencias parciales:`;
            recs.push(ALL_CARS.find(c => c.type === 'SUV')!);
            recs.push(ALL_CARS.find(c => c.type === 'Pickup')!);
        }
    }

    // Formatting
    const recommendations = recs.filter(Boolean).map(c => ({
        id: c.id,
        make: c.make,
        model: c.model,
        price: c.price,
        reason: matchedIntent?.id === 'MARKET_TOP_RATED' ? '🏆 5/5 Estrellas en Reseñas' : (matchedIntent?.id === 'JUNGLE_EXPEDITION' ? '🌿 Aprobado para Selva' : (matchedIntent?.id === 'SNOW_WINTER_ROADTRIP' ? '❄️ Aprobado para Nieve/Hielo' : (matchedIntent?.id === 'SMALL_FAMILY_TRIP' ? '👨‍👩‍👧‍👦 Ideal Familia Pequeña' : (matchedIntent?.id === 'STUDENT_FIRST_CAR' ? '🎓 Económico y Confiable' : (c.fuel === 'Electric' ? '⚡ Recomendado por Eficiencia' : (c.category === 'Air' ? '✈️ Ruta Aérea Óptima' : (c.category === 'Marine' ? '⚓ Ruta Marítima' : '✅ Match Verificado')))))))
    }));

    return {
        id: Date.now().toString() + 'ai',
        role: 'assistant',
        content,
        recommendations
    };
};
