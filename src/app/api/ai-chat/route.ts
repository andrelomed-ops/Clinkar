import { NextRequest, NextResponse } from 'next/server';
import { huggingFaceService } from '@/services/HuggingFaceService';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const { messages, context } = await request.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Messages required' }, { status: 400 });
        }

        const lastMessage = messages[messages.length - 1].content.toLowerCase();
        let dynamicContext = "";
        
        // Búsqueda heurística básica
        const searchKeywords = ['busco', 'quiero', 'tienen', 'comprar', 'sedan', 'suv', 'camioneta', 'auto', 'coche', 'buscando'];
        const isSearching = searchKeywords.some(kw => lastMessage.includes(kw));

        if (isSearching) {
            const supabase = await createClient();
            
            // Extracción simple de marca para mejorar la búsqueda
            const brands = ['toyota', 'honda', 'nissan', 'ford', 'chevrolet', 'vw', 'volkswagen', 'mazda', 'kia', 'hyundai', 'bmw', 'mercedes', 'audi', 'tesla'];
            const foundBrand = brands.find(b => lastMessage.includes(b));
            
            let query = supabase.from('cars').select('make, model, year, price').eq('status', 'published');
            if (foundBrand) {
                query = query.ilike('make', `%${foundBrand}%`);
            }
            
            const { data: cars, error } = await query.limit(3);
            
            if (cars && cars.length > 0) {
                dynamicContext = `El usuario busca autos. Tenemos estos coincidiendo en inventario ahora mismo:\n`;
                cars.forEach(c => {
                    dynamicContext += `- ${c.make} ${c.model} (${c.year}) a $${c.price} MXN\n`;
                });
                dynamicContext += `Ofrécelos de manera amigable incitándolo a iniciar su proceso 100% seguro en la Bóveda Digital.`;
            } else {
                // Generar registro de demanda
                const authRes = await supabase.auth.getUser();
                const userId = authRes.data?.user?.id;
                
                await supabase.from('demand_registry').insert({
                    user_id: userId || null, 
                    brand: foundBrand ? (foundBrand.charAt(0).toUpperCase() + foundBrand.slice(1)) : 'Cualquiera',
                    notes: `Petición capturada vía IA Chatbot: "${lastMessage.substring(0, 150)}"`,
                    status: 'pending'
                });

                dynamicContext = `El usuario busca un auto pero actualmente NO LO TENEMOS en nuestro inventario. Sin embargo, AVISASTE que ya agregaste su petición automáticamente a la lista pública de "Autos Solicitados" (Demand Registry) en StarterKar. Dile que pronto los vendedores que tengan ese vehículo verán su petición y la plataforma conectará ambos lados en la Bóveda de manera segura.`;
            }
        }

        const response = await huggingFaceService.chat(messages, dynamicContext);

        return NextResponse.json({ response });
    } catch (error) {
        console.error('[AI Chat API Error]:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'AI service unavailable' },
            { status: 500 }
        );
    }
}