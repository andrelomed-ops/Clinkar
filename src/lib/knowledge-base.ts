import { Vehicle } from "../data/cars";

export interface Intent {
    id: string;
    keywords: string[];
    condition: (lower: string) => boolean;
    response: string;
    filter: (c: Vehicle) => boolean;
}

export const LIFESTYLE_CONTEXTS: Record<string, { intent: string; prompt: string; filters: (c: Vehicle) => boolean }> = {
    "dunas": {
        intent: "DUNES_SPECIALIST",
        prompt: "¡Entendido! 🏜️ Para cruzar dunas necesitas una combinación de torque masivo, tracción 4x4 real y, lo más importante, que el sistema de enfriamiento esté impecable para aguantar el calor del desierto.",
        filters: (c: Vehicle) => c.tags.includes('4x4') || c.model.includes('Wrangler') || c.model.includes('Raptor')
    },
    "hijos": {
        intent: "FAMILY_SAFETY",
        prompt: "👨‍👩‍👧‍👦 La seguridad de tu familia es prioridad. Busco vehículos con 5 estrellas LatinNCAP, anclajes ISOFIX avanzados y volumen de cajuela para todo lo que necesites.",
        filters: (c: Vehicle) => c.type === 'SUV' && c.passengers >= 5 && !c.tags.includes('Trabajo')
    },
    "universidad": {
        intent: "STUDENT_ECONOMY",
        prompt: "🎓 Para la universidad, lo más inteligente es un auto que 'no pida nada'. Priorizo bajo consumo, facilidad de estacionamiento y un historial de mantenimiento impecable.",
        filters: (c: Vehicle) => (c.type === 'Sedan' || c.type === 'Hatchback') && c.price < 400000
    },
    // 🛠️ SUPPORT CONTEXTS (StarterKar Business Logic)
    "boveda": {
        intent: "SUPPORT_VAULT",
        prompt: "🛡️ La Bóveda Digital es nuestro sistema de garantía. Tu dinero no se entrega al vendedor hasta que tú confirmas la recepción del auto mediante el código QR. Está respaldado por instituciones financieras reguladas.",
        filters: (c: Vehicle) => true
    },
    "seguro": {
        intent: "SUPPORT_VAULT",
        prompt: "🔐 La seguridad es nuestra prioridad. Todas las transacciones en StarterKar están protegidas por un sistema Escrow. Si el auto no coincide con el reporte técnico, te devolvemos tu dinero al 100%.",
        filters: (c: Vehicle) => true
    },
    "telefono": {
        intent: "SUPPORT_ANONYMITY",
        prompt: "🕵️ Por seguridad y para evitar fraudes fuera de la plataforma, mantenemos el anonimato de ambas partes hasta la entrega. StarterKar actúa como el único intermediario certificado para proteger tu información personal.",
        filters: (c: Vehicle) => true
    },
    "vendedor": {
        intent: "SUPPORT_ANONYMITY",
        prompt: "👤 Para garantizar una experiencia segura, StarterKar gestiona toda la comunicación. No compartimos datos de contacto directos para protegerte de posibles estafas o tratos fuera de protocolo.",
        filters: (c: Vehicle) => true
    },
    "envio": {
        intent: "SUPPORT_LOGISTICS",
        prompt: "🚚 Contamos con una red de logística certificada. Puedes cotizar el envío directamente en el dashboard de la transacción. El auto viaja asegurado y monitoreado hasta tu puerta.",
        filters: (c: Vehicle) => true
    },
    "logistica": {
        intent: "SUPPORT_LOGISTICS",
        prompt: "🛣️ Gestionamos traslados locales e interestatales. La plataforma calcula el costo basado en la distancia y el tipo de transporte (plataforma o madrina). Todo está integrado en tu proceso de compra.",
        filters: (c: Vehicle) => true
    }
};

export const createIntents = (lower: string, userBudget: number | null, requestedPassengers: number | null, routeType: string | null, wantsBest: boolean, desiredType: string | null): Intent[] => [
    {
        id: 'SNOW_WINTER_ROADTRIP',
        keywords: ['nieve', 'hielo', 'invierno', 'frio', 'canada', 'toronto', 'alaska', 'vancouver', 'montreal', 'denver', 'ski', 'nevada'],
        condition: (l) => l.includes('nieve') || l.includes('canada') || l.includes('invierno'),
        response: "❄️ Detecto una ruta con condiciones extremas (Nieve/Hielo). Para viajar seguro desde México hasta el norte, **necesitas Tracción Integral (AWD/4x4)** y sistemas de estabilidad. Olvida las camionetas sencillas de tracción delantera:",
        filter: (c: Vehicle) => (c.tags.includes('AWD') || c.tags.includes('4x4') || c.tags.includes('Quattro') || c.tags.includes('Nieve') || c.capabilities?.includes('Nieve')) && c.category !== 'Motorcycle'
    },
    {
        id: 'OFFROAD_4X4',
        keywords: ['todo terreno', 'offroad', '4x4', 'montaña', 'brecha', 'lodo'],
        condition: (l) => l.includes('todo terreno') || l.includes('offroad') || l.includes('4x4'),
        response: "⛰️ Configurando modo Off-Road. Buscando vehículos con tracción 4x4, bloqueo de diferencial y buena altura libre al suelo:",
        filter: (c: Vehicle) => c.tags.includes('4x4') || c.tags.includes('Offroad') || c.tags.includes('AWD') || c.model.includes('Raptor') || c.model.includes('Wrangler') || c.type === 'Pickup'
    },
    {
        id: 'WORK_COMMERCIAL',
        keywords: ['carga', 'arquitecto', 'construccion', 'material', 'transporte', 'trabajo'],
        condition: (l) => l.includes('carga') || ((l.includes('arquitecto') || l.includes('ingeniero')) && (l.includes('camioneta') || l.includes('transporte'))),
        response: "🏗️ Entendido, buscas una herramienta de trabajo pesado. Priorizo capacidad de carga, durabilidad y espacio útil:",
        filter: (c: Vehicle) => c.type === 'Truck' || c.type === 'Van' || c.type === 'Pickup' || c.tags.includes('Trabajo') || c.category === 'Heavy'
    },
    {
        id: 'STUDENT_FIRST_CAR',
        keywords: ['estudiante', 'universidad', 'escuela', 'primer auto', 'barato', 'economico', 'ahorro', 'presupuesto'],
        condition: (l) => (l.includes('estudiante') || l.includes('universidad') || l.includes('primer auto')) || (!!userBudget && userBudget < 400000),
        response: `🎓 Detecto que buscas una opción inteligente y eficiente (Estudiante/Primer Auto). Priorizo **Bajo Consumo**, **Fiabilidad** y que se ajuste a tu presupuesto${userBudget ? ` ($${userBudget.toLocaleString('es-MX')})` : ''}:`,
        filter: (c: Vehicle) => (c.type === 'Sedan' || c.type === 'Hatchback' || (c.type === 'SUV' && c.passengers === 5)) && !c.tags.includes('Premium') && !c.tags.includes('Luxury') && c.category === 'Car'
    },
    {
        id: 'MARKET_TOP_RATED',
        keywords: [],
        condition: (l) => wantsBest && !!desiredType,
        response: `🏆 He analizado las reseñas más recientes del mercado automotriz en México. Los expertos posicionan estos modelos como los líderes en **${desiredType}**:`,
        filter: (c: Vehicle) => c.type === desiredType && (c.tags.includes('Best Seller') || c.tags.includes('Top Rated') || c.tags.includes('Premium'))
    },
    {
        id: 'ZOMBIE_SURVIVAL',
        keywords: ['zombie', 'apocalipsis', 'fin del mundo', 'sobrevivir', 'infectados'],
        condition: (l) => l.includes('zombie'),
        response: "🧟 He buscado tácticas de supervivencia. Para el apocalipsis, los foros expertos recomiendan blindaje, altura y durabilidad extrema:",
        filter: (c: Vehicle) => c.model.includes('Unimog') || c.model.includes('Raptor') || c.model.includes('Defender') || (c.type === 'Truck')
    },
    {
        id: 'JUNGLE_EXPEDITION',
        keywords: ['selva', 'jungla', 'monte', 'vegetación', 'amazonas', 'chiapas'],
        condition: (l) => routeType === 'JUNGLE',
        response: "🌿 Analizando topografía de la selva... Se requieren ángulos de ataque >30° y vado >500mm. Estos vehículos coinciden con las especificaciones:",
        filter: (c: Vehicle) => (c.capabilities?.includes('Selva') || c.tags.includes('4x4') || c.category === 'Recreational') && c.category !== 'Motorcycle'
    },
    {
        id: 'LONG_ROADTRIP',
        keywords: [],
        condition: (l) => routeType === 'LONG_HAUL_LAND',
        response: "🌎 Buscando rutas internacionales... Para viajes largos (+1000km), la data sugiere priorizar **Asistencias de Manejo (ADAS)** y **Eficiencia**. Mis mejores candidatos:",
        filter: (c: Vehicle) => c.category === 'Car' && (c.fuel === 'Híbrido' || c.fuel === 'Eléctrico' || c.type === 'Sedan' || c.type === 'SUV') && !c.tags.includes('Primer Auto')
    },
    {
        id: 'SWAMP_MANGROVE',
        keywords: ['manglar', 'pantano', 'humedal', 'cienaga', 'lodo profundo'],
        condition: (l) => l.includes('manglar') || l.includes('pantano'),
        response: "¡Alerta! 🐊 Búsqueda geológica: Manglar = Lodo profundo + Agua. Un auto convencional tiene 0% de éxito. Filtrando inventario por capacidad anfibia/marina:",
        filter: (c: Vehicle) => c.category === 'Marine' || c.category === 'Recreational' || (c.type === 'Pickup' && c.capabilities.includes('Lodo'))
    },
    {
        id: 'CROSS_WATER_ROUTE',
        keywords: [],
        condition: (l) => routeType === 'OVER_WATER',
        response: "🌊 calculando ruta... Detectado cuerpo de agua intransitable por tierra. Re-enrutando a opciones **Aéreas o Marítimas**:",
        filter: (c: Vehicle) => c.category === 'Air' || c.category === 'Marine'
    },
    {
        id: 'AVIATION',
        keywords: ['volar', 'cielo', 'avion', 'helicoptero', 'aire', 'piloto'],
        condition: (l) => l.includes('vuelo') || l.includes('avion') || l.includes('volar'),
        response: "✈️ Conectando con base de datos aeronáutica... Aquí está el inventario disponible para vuelo:",
        filter: (c: Vehicle) => c.category === 'Air'
    },
    {
        id: 'MARINE',
        keywords: ['navegar', 'yate', 'bote', 'lancha', 'mar'],
        condition: (l) => l.includes('embarcacion') || l.includes('mar') || l.includes('navegar'),
        response: "⚓ Consultando condiciones marítimas... Estas naves están listas para zarpar:",
        filter: (c: Vehicle) => c.category === 'Marine'
    },
    {
        id: 'HEAVY_INDUSTRIAL',
        keywords: ['construccion', 'excavadora', 'tractor', 'obra', 'pesado', 'pozo', 'excavar', 'tierra'],
        condition: (l) => l.includes('pesado') || l.includes('construccion'),
        response: "🏗️ Buscando especificaciones industriales... Para movimiento de tierras, estos equipos cumplen la norma:",
        filter: (c: Vehicle) => c.category === 'Heavy' || c.category === 'Industrial'
    },
    {
        id: 'MOTO_DAILY',
        keywords: ['tortillas', 'mandados', 'tienda', 'oxxo', 'chamba ligera', 'reparto'],
        condition: (l) => (requestedPassengers || 0) <= 2 && (l.includes('moto') || l.includes('reparto')),
        response: "🛵 Analizando costos operativos... Para distancias cortas, una moto reduce costos en un 90%. Opciones optimizadas:",
        filter: (c: Vehicle) => c.category === 'Motorcycle' || c.tags.includes('Ecológico')
    },
    {
        id: 'CITY_SAVER',
        keywords: ['ciudad', 'trafico', 'ahorro', 'solo', 'pareja'],
        condition: (l) => (requestedPassengers || 0) <= 2 && l.includes('ciudad'),
        response: "🏙️ Analizando tráfico urbano... La tendencia favorece movilidad eléctrica o compacta. Aquí los más ágiles:",
        filter: (c: Vehicle) => (c.fuel === 'Eléctrico' || c.fuel === 'Híbrido' || c.type === 'Hatchback') && c.passengers <= 5
    },
    {
        id: 'SMALL_FAMILY_TRIP',
        keywords: ['familia', 'paseo', 'viaje', 'vacaciones', 'hijos'],
        condition: (l) => (requestedPassengers || 0) > 0 && (requestedPassengers || 0) <= 4,
        response: `👨‍👩‍👧‍👦 Configurando para familia pequeña (${requestedPassengers} personas). Para paseos y carretera, sugiero **Sedanes Cómodos** o **SUVs Compactas** (Evitamos el gasto excesivo de una camioneta grande):`,
        filter: (c: Vehicle) => (c.type === 'Sedan' || (c.type === 'SUV' && c.passengers === 5)) && c.category === 'Car' && !c.tags.includes('Trabajo')
    },
    {
        id: 'BUSINESS_FEES',
        keywords: ['comision', 'cuanto cobran', 'costo servicio', 'tarifa', 'fee', 'precio starterkar'],
        condition: (l) => l.includes('comision') || l.includes('cuanto cobran') || l.includes('cuanto cuesta el servicio'),
        response: "💰 **Modelo de Transparencia Total**: StarterKar cobra una tarifa plana del **5%** sobre el valor final de la transacción. Este monto solo se cobra cuando tú, como comprador, liberas los fondos desde la Bóveda Digital. No hay costos ocultos.",
        filter: (c: Vehicle) => true
    },
    {
        id: 'BUSINESS_LEGAL',
        keywords: ['es legal', 'fraude', 'seguro', 'contrato', 'profeco'],
        condition: (l) => l.includes('legal') || l.includes('fraude') || l.includes('seguro') || l.includes('contrato'),
        response: "⚖️ **Seguridad Jurídica**: Todas las operaciones en StarterKar están respaldadas por el Código de Comercio (Arts. 89-114). El escaneo del QR al momento de la entrega constituye una **Firma Electrónica Simple** con plena validez legal. Además, los fondos están custodiados por una institución financiera regulada (STP) hasta el cierre del trato.",
        filter: (c: Vehicle) => true
    },
    {
        id: 'BUSINESS_INSPECTION',
        keywords: ['mecanico', 'inspeccion', 'revisan', 'quien revisa', 'taller'],
        condition: (l) => l.includes('mecanico') || l.includes('inspeccion') || l.includes('revisa'),
        response: "🔧 **Certificación Independiente**: No somos juez y parte. Utilizamos una red de talleres certificados independientes que realizan una inspección de **250+ puntos**. Si el reporte no coincide con la realidad al momento de la entrega, tu dinero está protegido por nuestra Garantía de Bóveda.",
        filter: (c: Vehicle) => true
    },
    {
        id: 'BUSINESS_CANCELLATION',
        keywords: ['cancelar', 'arrepentir', 'devolucion', 'reembolso'],
        condition: (l) => l.includes('cancelar') || l.includes('reembolso') || l.includes('no quiero'),
        response: "garantía **Money-Back**: Si al momento de la entrega el auto no te convence o encuentras discrepancias con el reporte, puedes cancelar la operación desde tu dashboard. Los fondos en la Bóveda se liberan de vuelta a tu cuenta, sin penalizaciones por discrepancia técnica.",
        filter: (c: Vehicle) => true
    },
    {
        id: 'LARGE_FAMILY',
        keywords: ['familia', 'hijos', 'ninos'],
        condition: (l) => (requestedPassengers || 0) > 4,
        response: `🚌 Verificando capacidad... Para ${requestedPassengers} pasajeros, he descartado sedanes. Estas son las opciones reales de 3 filas:`,
        filter: (c: Vehicle) => (c.type === 'SUV' || c.type === 'Minivan' || c.type === 'Van') && c.passengers >= (requestedPassengers || 5) && !c.tags.includes('Carga')
    }
];
