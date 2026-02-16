import { IOcrProvider } from './ocr/OcrProvider';
import { OpenAiOcrProvider } from './ocr/OpenAiOcrProvider';

export interface AnalysedData {
    vin?: string;
    plate?: string;
    owner?: string;
    type?: string;
    name?: string;
    curp?: string;
    address?: string;
    birth_year?: string;
    model?: string;
    year?: string;
}

export interface DocumentAnalysisResult {
    type: 'INE' | 'CIRCULATION_CARD' | 'INVOICE' | 'UNKNOWN';
    confidence: number;
    data: AnalysedData;
    isValid: boolean;
    issues?: string[];
    extractedData?: AnalysedData; // Alias for data for some components
}

export class DocumentAnalysisService {
    private static provider: IOcrProvider | null = null;

    private static getProvider(): IOcrProvider | null {
        if (this.provider) return this.provider;

        const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
        if (apiKey && apiKey !== 'sk-placeholder') {
            this.provider = new OpenAiOcrProvider(apiKey);
            return this.provider;
        }
        return null;
    }

    // Process image using real provider or static mock
    static async analyzeDocument(
        imageUrl: string,
        expectedType?: 'INE' | 'CIRCULATION_CARD' | 'INVOICE',
        options: { useAi?: boolean, forceDemo?: boolean } = { useAi: true, forceDemo: false }
    ): Promise<DocumentAnalysisResult> {
        const realProvider = this.getProvider();

        // [COST-ZERO OPTIMIZATION]
        // Use real AI only if requested AND provider is available AND not forced to demo
        if (realProvider && expectedType && options.useAi && !options.forceDemo) {
            return await realProvider.analyzeDocument(imageUrl, expectedType);
        }

        // FALLBACK: Demo / Mock Logic (Costo 0)
        console.log(`[AI Brain - DEMO MODE] Analyzing image: ${imageUrl}`);

        // Simple heuristic to differentiate demo data based on URL
        const isAlternate = imageUrl.length % 2 === 0;

        await new Promise(resolve => setTimeout(resolve, 1500));

        if (expectedType === 'CIRCULATION_CARD') {
            return {
                type: 'CIRCULATION_CARD',
                confidence: 0.98,
                data: {
                    vin: isAlternate ? 'VIN-123456' : 'VIN-987654',
                    plate: isAlternate ? 'PLACA-MX' : 'PLATE-USA',
                    owner: isAlternate ? 'USUARIO PRUEBA' : 'CLIENTE EJEMPLO',
                    model: isAlternate ? 'AUTO PRUEBA' : 'VEHICULO EJEMPLO',
                    year: '2024'
                },
                isValid: true,
                extractedData: {
                    vin: isAlternate ? 'VIN-123456' : 'VIN-987654',
                    plate: isAlternate ? 'PLACA-MX' : 'PLATE-USA'
                },
                issues: ['Modo de demostración activo']
            };
        }

        if (expectedType === 'INE') {
            return {
                type: 'INE',
                confidence: 0.99,
                data: {
                    name: 'USUARIO PRUEBA INE',
                    curp: 'CURP-001',
                    address: 'DIRECCION EJEMPLO 123'
                },
                isValid: true,
                extractedData: { name: 'USUARIO PRUEBA INE' },
                issues: ['Modo de demostración activo']
            };
        }

        return {
            type: 'UNKNOWN',
            confidence: 0.2,
            data: {},
            isValid: false,
            issues: ['Por favor, contacte a soporte para activar el análisis automático.', 'Modo de verificación manual activo']
        };
    }
}
