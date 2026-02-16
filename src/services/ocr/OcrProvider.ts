import { DocumentAnalysisResult } from '../DocumentAnalysisService';

export interface IOcrProvider {
    analyzeDocument(imageUrl: string, expectedType: 'INE' | 'CIRCULATION_CARD' | 'INVOICE'): Promise<DocumentAnalysisResult>;
}
