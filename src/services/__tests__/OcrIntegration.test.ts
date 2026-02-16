import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DocumentAnalysisService } from '../DocumentAnalysisService';
import { OpenAiOcrProvider } from '../ocr/OpenAiOcrProvider';

// Mocking fetch for OpenAiOcrProvider
global.fetch = vi.fn();

describe('DocumentAnalysisService OCR Integration', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        // Reset process.env for each test
        delete process.env.OPENAI_API_KEY;
        // Accessing private static provider to reset it
        (DocumentAnalysisService as any).provider = null;
    });

    it('should use Demo Mode when NO API Key is provided', async () => {
        const result = await DocumentAnalysisService.analyzeDocument('test-url', 'INE');
        expect(result.data.name).toBe('USUARIO PRUEBA INE');
        expect(result.issues).toContain('Modo de demostración activo');
    });

    it('should use OpenAiOcrProvider when API Key IS provided', async () => {
        process.env.OPENAI_API_KEY = 'sk-valid-key';

        const mockResponse = {
            choices: [{
                message: {
                    content: JSON.stringify({
                        confidence: 0.95,
                        data: { name: 'REAL USER NAME' },
                        isValid: true,
                        issues: []
                    })
                }
            }]
        };

        (global.fetch as any).mockResolvedValue({
            json: vi.fn().mockResolvedValue(mockResponse)
        });

        const result = await DocumentAnalysisService.analyzeDocument('test-url', 'INE');
        expect(result.data.name).toBe('REAL USER NAME');
        expect(global.fetch).toHaveBeenCalled();
    });

    it('should respect forceDemo flag EVEN IF API Key is provided', async () => {
        process.env.OPENAI_API_KEY = 'sk-valid-key';

        const result = await DocumentAnalysisService.analyzeDocument('test-url', 'CIRCULATION_CARD', { forceDemo: true });

        expect(result.issues).toContain('Modo de demostración activo');
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should return different demo data based on image URL length', async () => {
        const result1 = await DocumentAnalysisService.analyzeDocument('even', 'CIRCULATION_CARD'); // length 4
        const result2 = await DocumentAnalysisService.analyzeDocument('odd-!', 'CIRCULATION_CARD'); // length 5

        expect(result1.data.vin).not.toBe(result2.data.vin);
    });
});
