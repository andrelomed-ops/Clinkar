import { Logger } from '@/lib/logger';

const HF_API_KEY = process.env.HF_API_KEY;
const HF_MODEL = process.env.HF_MODEL || 'microsoft/Phi-3-mini-128k-instruct';

export interface HuggingFaceRequest {
    inputs: string;
    parameters?: {
        max_new_tokens?: number;
        temperature?: number;
        return_full_text?: boolean;
    };
}

export class HuggingFaceService {
    static async generate(prompt: string): Promise<string> {
        if (!HF_API_KEY) {
            throw new Error('HF_API_KEY no configurada');
        }

        try {
            const response = await fetch(
                `https://api-inference.huggingface.co/models/${HF_MODEL}`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${HF_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        inputs: prompt,
                        parameters: {
                            max_new_tokens: 512,
                            temperature: 0.7,
                            return_full_text: false
                        }
                    })
                }
            );

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`HuggingFace error: ${response.status} - ${error}`);
            }

            const data = await response.json();
            
            if (Array.isArray(data) && data[0]?.generated_text) {
                return data[0].generated_text;
            }
            
            return JSON.stringify(data);
        } catch (error) {
            Logger.error('[HuggingFaceService]', error instanceof Error ? error : undefined);
            throw error;
        }
    }

    static async chat(messages: { role: string; content: string }[], dynamicContext?: string): Promise<string> {
        const systemPrompt = `Eres StarterKar (el asistente de IA de StarterKar). Experto en compraventa segura de autos en México.
Reglas de Negocio de StarterKar (NUEVA ESTRATEGIA):
1. Comisión de Venta: Cobramos una "Comisión de Éxito" del 3.5% al vendedor únicamente si se concreta el negocio. Es la más competitiva del mercado (otros cobran entre 5% y 15%).
2. Beneficio de Comprador: ¡Tu PRIMERA COMPRA es GRATIS! StarterKar no cobra comisión de plataforma en tu primera adquisición de vehículo. 
3. Seguridad: Todo pago se retiene en nuestra "Bóveda Digital" (Escrow) hasta que el comprador recibe el auto y la documentación (Handover).
4. Sistema de Referidos PRO: Si refieres a alguien y tu referido compra, tu próxima venta tiene un 50% de descuento en comisión o puedes obtener una Inspección de 150 puntos GRATIS.
5. Inspección: Contamos con mecánica certificada de 150 puntos a domicilio para máxima tranquilidad.
6. Demand Registry: Si no tenemos el auto que buscas, lo registramos automáticamente para que los vendedores te contacten.
Se amable, profesional, conciso y responde de forma natural.

${dynamicContext ? `CONTEXTO ESPECÍFICO:\n${dynamicContext}\n` : ''}`;
        
        // Forma un prompt que los modelos Instruct como Llama-3 o Phi-3 entienden bien
        const conversationHistory = messages.map(m => `${m.role === 'user' ? 'Human' : 'Assistant'}: ${m.content}`).join('\n');
        const prompt = `${systemPrompt}\n\nHistorial:\n${conversationHistory}\n\nAssistant:`;
        
        return this.generate(prompt);
    }
}

export const huggingFaceService = HuggingFaceService;