
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

    // Simulate AI processing time and result
    static async analyzeDocument(imageUrl: string, expectedType?: 'INE' | 'CIRCULATION_CARD' | 'INVOICE'): Promise<DocumentAnalysisResult> {
        console.log(`[AI Brain] Analyzing image: ${imageUrl}`);

        // Simulate network latency (Thinking...)
        await new Promise(resolve => setTimeout(resolve, 2500));

        // Return Mock Data based on expected type
        if (expectedType === 'CIRCULATION_CARD') {
            return {
                type: 'CIRCULATION_CARD',
                confidence: 0.98,
                data: {
                    vin: '5YJ3E1EBXKFP8XXXX', // Tesla VIN example
                    plate: 'ABC-123-CDMX',
                    owner: 'Juan Pérez',
                    model: 'Tesla Model 3',
                    year: '2022'
                },
                isValid: true,
                extractedData: {
                    vin: '5YJ3E1EBXKFP8XXXX',
                    plate: 'ABC-123-CDMX'
                }
            };
        }

        if (expectedType === 'INE') {
            return {
                type: 'INE',
                confidence: 0.99,
                data: {
                    name: 'JUAN PÉREZ LÓPEZ',
                    curp: 'PELJ800101HDFRXX01',
                    address: 'AV REFORMA 222, CDMX',
                    birth_year: '1980'
                },
                isValid: true,
                extractedData: {
                    name: 'JUAN PÉREZ LÓPEZ'
                }
            };
        }

        return {
            type: 'UNKNOWN',
            confidence: 0.2,
            data: {},
            isValid: false,
            issues: ['Documento no reconocido', 'Baja calidad de imagen']
        };
    }
}
