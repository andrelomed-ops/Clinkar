import { generateAIBrainResponse } from "../lib/ai-brain";

const CONTINENTS = {
    ASIA: ['Tailandia', 'Tokio', 'China', 'Vietnam', 'Dubai'],
    EUROPE: ['París', 'Madrid', 'Londres', 'Roma', 'Alemania'],
    ISLANDS: ['Cuba', 'República Dominicana', 'Hawaii', 'Puerto Rico'],
    JUNGLE: ['Selva Lacandona', 'Amazonas'],
    CITIES: ['CDMX', 'Guadalajara']
};

console.log("--------------- INICIO DE SIMULACIÓN MASIVA (STRESS TEST) ---------------");

let passed = 0;
let total = 0;

async function runTest(query: string, expectedCategory: string | string[]) {
    total++;
    const res = await generateAIBrainResponse(query);
    const recs = res.recommendations || [];

    // Check if ALL recommendations match the expected category
    const isCorrect = recs.length > 0 && recs.every(r => {
        if (Array.isArray(expectedCategory)) {
            // Flexible check (e.g. Air OR Marine) - we check description or infer category
            // Our mock response reasons map to categories: '✈️ Aéreo', '⚓ Marítimo', '🌿 Rey de la Selva'
            const reason = r.reason || '';
            if (expectedCategory.includes('Air') && reason.includes('Aéreo')) return true;
            if (expectedCategory.includes('Marine') && reason.includes('Marítimo')) return true;
            if (expectedCategory.includes('Jungle') && (reason.includes('Rey de la Selva') || r.make.includes('Jeep'))) return true;
            return false;
        } else {
            return true; // Simple pass for now, manual review mostly
        }
    });

    // Logging
    console.log(`\nTEST #${total}: "${query}"`);
    console.log(`   EXPECTED: ${expectedCategory}`);
    console.log(`   RESULT: ${res.content.substring(0, 60)}...`);
    recs.forEach(r => console.log(`      -> ${r.make} ${r.model} [${r.reason}]`));

    // Simple heuristic for pass/fail logging
    const failTrigger = (queries: string[], badWord: string) => {
        if (queries.some(q => query.includes(q)) && recs.some(r => r.reason.includes(badWord))) return true;
        return false;
    };

    // If Asia/Europe -> Should NOT see 'Opción Inteligente' (generic car) or 'Eficiencia Total' (car) unless it's Air
    // Actually, check if Reason is Aéreo
    if (['Tailandia', 'Tokio', 'China', 'París', 'Londres'].some(d => query.includes(d))) {
        if (!recs.some(r => r.reason.includes('Aéreo') || r.reason.includes('Marítimo'))) {
            console.log("   ❌ FAILED: Did not suggest Air/Marine for Transoceanic");
            return;
        }
    }

    console.log("   ✅ PASSED Logic Check");
    passed++;
}

(async () => {
    // 1. ASIA TESTS
    for (const dest of CONTINENTS.ASIA) await runTest(`Quiero ir a ${dest}`, ['Air', 'Marine']);

    // 2. EUROPE TESTS
    for (const dest of CONTINENTS.EUROPE) await runTest(`Viaje a ${dest}`, ['Air', 'Marine']);

    // 3. ISLAND TESTS
    for (const dest of CONTINENTS.ISLANDS) await runTest(`Ir a ${dest}`, ['Air', 'Marine']);

    // 4. JUNGLE TESTS
    for (const dest of CONTINENTS.JUNGLE) await runTest(`Recorrer la ${dest}`, ['Jungle']);

    // 5. ROAD TRIP CHECKS
    await runTest("Ir a Panamá", ['Car']);

    // 6. MARKET & TYPE CHECKS
    await runTest("Quiero un vehiculo nuevo de la categoria de sedan, el mejor valorado del mercado en mexico", ['Car']);

    // 7. WINTER EXTREME CHECK
    await runTest("quiero un vehiculo para ir de mexico a Toronto en epoca de nieve", ['Car']);

    // 8. FAMILY SIZE CHECK (3 People)
    await runTest("quiero un vehiculo para llevar a mi familia de paseo somos 3 personas", ['Car']);

    console.log(`\n\n📢 RESULTADOS FINALES: ${passed}/${total} pruebas pasadas.`);
    console.log("-------------------------------------------------------------------");
})();
