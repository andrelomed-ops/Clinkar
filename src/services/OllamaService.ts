import { Logger } from '@/lib/logger';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

export interface OllamaRequest {
    model: string;
    prompt: string;
    stream?: boolean;
}

export interface OllamaResponse {
    model: string;
    created_at: string;
    response: string;
    done: boolean;
}

export class OllamaService {
    static async generate(prompt: string, model: string = 'llama3.2'): Promise<string> {
        try {
            const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model,
                    prompt,
                    stream: false
                })
            });

            if (!response.ok) {
                throw new Error(`Ollama error: ${response.status}`);
            }

            const data: OllamaResponse = await response.json();
            return data.response;
        } catch (error) {
            Logger.error('[OllamaService]', error instanceof Error ? error : undefined);
            throw error;
        }
    }

    static async chat(messages: { role: string; content: string }[], model: string = 'llama3.2'): Promise<string> {
        const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n');
        return this.generate(prompt, model);
    }

    static async isAvailable(): Promise<boolean> {
        try {
            const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, { method: 'GET' });
            return response.ok;
        } catch {
            return false;
        }
    }

    static async listModels(): Promise<string[]> {
        try {
            const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
            const data = await response.json();
            return data.models?.map((m: { name: string }) => m.name) || [];
        } catch {
            return [];
        }
    }
}

export const ollamaService = OllamaService;