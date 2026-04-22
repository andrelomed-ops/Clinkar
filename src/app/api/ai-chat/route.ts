import { NextResponse } from 'next/server';

// This is a server-side route. API keys used here are NOT exposed to the client.
// To use a real LLM, add your API key to Vercel/Environment Variables and uncomment the SDK code.

export async function POST(req: Request) {
    try {
        const { messages, context } = await req.json();

        // 1. Protection: Check for rate limits or auth if needed
        // const auth = await supabase.auth.getUser(); ...

        // 2. Logic: Process with LLM
        // Example with OpenAI (Mocked for now)
        /*
        const response = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [
                { role: "system", content: "Eres el Asesor Experto de StarterKar..." },
                ...messages
            ]
        });
        return NextResponse.json({ response: response.choices[0].message.content });
        */

        // Professional Mock Response with logic
        const lastUserMessage = messages[messages.length - 1].content.toLowerCase();
        let reply = "Entiendo perfectamente tu búsqueda. ";

        if (lastUserMessage.includes("hija") || lastUserMessage.includes("estudiante")) {
            reply += "Para un estudiante, la prioridad en StarterKar es la seguridad estructural y la eficiencia de combustible. Te recomiendo modelos con altos puntajes en nuestras pruebas de 150 puntos, como el Mazda 2 o el Honda City. ¿Te gustaría ver el reporte técnico de alguna de estas unidades?";
        } else if (lastUserMessage.includes("familiar") || lastUserMessage.includes("hijos")) {
            reply += "Para la familia, nuestras SUVs certificadas pasan por un escaneo especial de sistemas de retención y espacio de cajuela. Un Kia Seltos o una Honda CR-V serian ideales. ¿Qué capacidad de pasajeros buscas exactamente?";
        } else {
            reply = "Como asesor de StarterKar, he filtrado nuestro inventario verificado para encontrar las opciones que mejor se adaptan a tu perfil. Todas nuestras unidades cuentan con el Sello de Bóveda Digital, garantizando que tu inversión está protegida legalmente. ¿Tienes algún presupuesto en mente para que pueda refinar la selección?";
        }

        return NextResponse.json({ 
            response: reply,
            source: 'StarterKar-Premium-Neural-v2' 
        });

    } catch (error) {
        console.error("AI Chat Error:", error);
        return NextResponse.json({ error: "Falla en la matriz neuronal" }, { status: 500 });
    }
}
