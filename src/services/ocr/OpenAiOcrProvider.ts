import { DocumentAnalysisResult, AnalysedData } from '../DocumentAnalysisService';
import { IOcrProvider } from './OcrProvider';

export class OpenAiOcrProvider implements IOcrProvider {
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async analyzeDocument(imageUrl: string, expectedType: 'INE' | 'CIRCULATION_CARD' | 'INVOICE'): Promise<DocumentAnalysisResult> {
        console.log(`[OpenAI OCR] Analizando ${expectedType} vía Vision API...`);

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [
                        {
                            role: "system",
                            content: "Eres un experto en análisis de documentos legales mexicanos (INE, Tarjeta de Circulación, Facturas de autos). Extrae la información en formato JSON puro sin markdown."
                        },
                        {
                            role: "user",
                            content: [
                                { type: "text", text: `Analiza esta imagen de un/a ${expectedType}. Extrae: nombre completo, CURP/RFC, dirección, VIN (si aplica), placas (si aplica), modelo y año (si aplica). Formato: { "data": { ... }, "isValid": boolean, "confidence": number, "issues": string[] }` },
                                { type: "image_url", image_url: { url: imageUrl } }
                            ]
                        }
                    ],
                    response_format: { type: "json_object" }
                })
            });

            const result = await response.json();
            const content = JSON.parse(result.choices[0].message.content);

            return {
                type: expectedType,
                confidence: content.confidence || 0.9,
                data: content.data as AnalysedData,
                isValid: content.isValid,
                issues: content.issues,
                extractedData: content.data
            };

        } catch (error) {
            console.error("[OpenAI OCR Error]", error);
            throw new Error("Falló el análisis de documentos por IA.");
        }
    }
}
