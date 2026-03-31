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

    static async chat(messages: { role: string; content: string }[]): Promise<string> {
        const systemPrompt = `Eres un asistente helpful llamado StarterKar para una plataforma de compraventa de autos en México. Sé friendly, conciso y útil.`;
        
        const prompt = `${systemPrompt}\n\nHistorial:\n${messages.map(m => `${m.role}: ${m.content}`).join('\n')}\n\nAssistant:`;
        
        return this.generate(prompt);
    }
}

export const huggingFaceService = HuggingFaceService;