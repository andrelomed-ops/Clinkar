import { generateAIBrainResponse } from "../lib/ai-brain";

const TEST_CASES = [
    "Quiero ir a la selva",
    "Necesito cruzar un manglar",
    "Viaje a Panamá somos 3",
    "Familia de 7 personas",
    "Quiero volar",
    "Necesito excavar un pozo",
    "Vacaciones en Europa",
    "Quiero ir a República Dominicana",
    "Busco algo para el apocalipsis zombie", // Strange case
    "Solo somos 2 personas para ciudad",
    "Quiero un auto para ir a las tortillas"
];

console.log("--------------- INICIO DE SIMULACIÓN IA ---------------");

// Need to wrap in async IIFE or loop
(async () => {
    for (const query of TEST_CASES) {
        console.log(`\n🗣️ USUARIO: "${query}"`);
        const response = await generateAIBrainResponse(query);
        console.log(`🤖 IA: ${response.content}`);
        response.recommendations?.forEach(r => {
            console.log(`   - 🚗 ${r.make} ${r.model} (${r.reason})`);
        });
    }
})();

console.log("\n--------------- FIN DE SIMULACIÓN ---------------");
