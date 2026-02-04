import { generateAIBrainResponse } from "../lib/ai-brain";
import { Vehicle } from "../data/cars";

const MOCK_INVENTORY: Vehicle[] = [
    {
        id: "cyber-001",
        make: "Tesla",
        model: "Cybertruck",
        year: 2024,
        price: 1500000,
        type: "Pickup",
        fuel: "Eléctrico",
        transmission: "Automática",
        distance: 0,
        location: "Cyber City",
        status: "CERTIFIED",
        capabilities: ["Off-road", "Zombie Defense"],



        tags: ["Zombie-Proof", "Premium", "Top Rated"],
        images: [],
        category: "Car",
        condition: "Nuevo",
        passengers: 6
    }
];

console.log("--------------- TEST: IA CON INVENTARIO DINÁMICO ---------------");

const query = "Necesito algo para sobrevivir al apocalipsis zombie";
console.log(`\n🗣️ USUARIO: "${query}"`);

(async () => {
    const response = await generateAIBrainResponse(query, MOCK_INVENTORY);
    console.log(`🤖 IA: ${response.content}`);
    response.recommendations?.forEach(r => {
        console.log(`   - 🚗 ${r.make} ${r.model} (${r.reason})`);
    });

    if (response.recommendations?.some(r => r.model === "Cybertruck")) {
        console.log("\n✅ ÉXITO: La IA reconoció el vehículo dinámico.");
    } else {
        console.log("\n❌ ERROR: La IA no recomendó el vehículo dinámico.");
    }

    console.log("\n--------------- FIN DE TEST ---------------");
})();
