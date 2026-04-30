import { NextResponse } from 'next/server';

// This is a server-side route. API keys used here are NOT exposed to the client.
// To use a real LLM, add your API key to Vercel/Environment Variables and uncomment the SDK code.


export async function POST(req: Request) {
    try {
        const { messages, context } = await req.json();

        const inventory = context || [];

        const lastUserMessage = messages[messages.length - 1].content.toLowerCase();
        const normalizedQuery = lastUserMessage.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        // 🧠 0. Extracción de Parámetros (Solo si existen en el query)
        const extractAmount = (str: string) => {
            const match = str.match(/(\d+)/);
            if (match) {
                const val = parseInt(match[0]);
                if (val > 1000) return val < 10000 ? val * 1000 : val;
            }
            return null;
        };
        const mentionedBudget = extractAmount(normalizedQuery);

        // 🔍 1. Filter Logic (Adaptativo)
        const matches = inventory.filter((car: any) => {
            const searchStr = `${car.make} ${car.model} ${car.type} ${car.category} ${JSON.stringify(car.technical_specs || {})}`.toLowerCase();
            
            // Si el usuario mencionó presupuesto, filtramos estrictamente por precio
            if (mentionedBudget && car.price > (mentionedBudget * 1.1)) {
                return false;
            }

            // Filtro por intención (Correr, Familiar, etc)
            if (normalizedQuery.includes("rapido") || normalizedQuery.includes("correr") || normalizedQuery.includes("deportivo")) {
                if (car.type === 'Coupe' || car.type === 'Deportivo' || car.make === 'BMW' || car.make === 'Porsche' || car.make === 'Audi') return true;
            }
            if (normalizedQuery.includes("familiar") || normalizedQuery.includes("hijos") || normalizedQuery.includes("suv")) {
                if (car.type === 'SUV' || car.passengers >= 5) return true;
            }

            // Búsqueda por características técnicas
            const features = ["quemacocos", "piel", "pantalla", "camara", "hibrido", "electrico"];
            for (const feature of features) {
                if (normalizedQuery.includes(feature) && searchStr.includes(feature)) return true;
            }

            // Búsqueda por marca/modelo
            if (normalizedQuery.includes(car.make.toLowerCase()) || normalizedQuery.includes(car.model.toLowerCase())) return true;

            // Si es una pregunta genérica y el auto es destacado, lo incluimos
            if (normalizedQuery.length < 15 && car.tags?.includes('Best Seller')) return true;

            return false;
        }).slice(0, 4);

        let reply = "";
        let recommendations = [];

        if (matches.length > 0) {
            reply = mentionedBudget 
                ? `He filtrado nuestras opciones verfificadas bajo tu presupuesto de **$${mentionedBudget.toLocaleString()}**. Aquí tienes las mejores unidades disponibles:`
                : `¡Claro! He analizado nuestro inventario y estas unidades encajan perfectamente con lo que buscas. Haz clic en el icono para ver todos los detalles:`;
            
            recommendations = matches.map((car: any) => ({
                id: car.id,
                make: car.make,
                model: car.model,
                year: car.year,
                price: car.price,
                image: car.images?.[0]
            }));
        } else {
            reply = `🔍 No encontré un auto en inventario que coincida exactamente con esa búsqueda. \n\n¡Pero no te preocupes! Podemos encontrarlo por ti en nuestra red nacional. \n\n👉 [Realizar Petición de Vehículo](/demand-request)`;
        }

        return NextResponse.json({ 
            response: reply,
            recommendations,
            source: 'StarterKar-Inventory-Neural-v3' 
        });

    } catch (error) {
        console.error("AI Chat Error:", error);
        return NextResponse.json({ error: "Falla en la matriz neuronal" }, { status: 500 });
    }
}
