import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DocumentService } from '../DocumentService';

vi.mock('@/lib/logger', () => ({
    Logger: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
    },
}));

describe('DocumentService', () => {
    let mockSupabase: any;

    beforeEach(() => {
        mockSupabase = {
            auth: {
                getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }),
            },
            storage: {
                from: vi.fn().mockReturnValue({
                    upload: vi.fn().mockResolvedValue({ error: null, data: { path: 'doc-path' } }),
                    getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/doc.pdf' } }),
                }),
            },
            from: vi.fn().mockReturnValue({
                insert: vi.fn().mockResolvedValue({ data: [{ id: 'doc-1' }], error: null }),
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({ data: [], error: null }),
                }),
                delete: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({ error: null }),
                }),
            }),
        };
    });

    describe('uploadDocument', () => {
        it('should throw error when user is not authenticated', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
            
            const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });

            await expect(
                DocumentService.uploadDocument(mockSupabase, 'tx-123', mockFile, 'test')
            ).rejects.toThrow('Debes estar autenticado para subir documentos.');
        });

        it('should upload document successfully', async () => {
            const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });

            const result = await DocumentService.uploadDocument(mockSupabase, 'tx-123', mockFile, 'test');

            expect(result).toBeTruthy();
            expect(mockSupabase.storage.from).toHaveBeenCalledWith('transaction-docs');
        });

        it('should handle upload error', async () => {
            mockSupabase.storage.from = vi.fn().mockReturnValue({
                upload: vi.fn().mockResolvedValue({ error: new Error('Upload failed') }),
            });

            const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });

            await expect(
                DocumentService.uploadDocument(mockSupabase, 'tx-123', mockFile, 'test')
            ).rejects.toThrow('Upload failed');
        });
    });

    describe('getDocuments', () => {
        it('should return documents for a transaction', async () => {
            const mockDocs = [
                { id: 'doc-1', name: 'contract.pdf', file_url: 'https://example.com/1.pdf' },
            ];
            mockSupabase.from = vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({ data: mockDocs, error: null }),
                }),
            });

            const result = await DocumentService.getDocuments(mockSupabase, 'tx-123');

            expect(result).toEqual(mockDocs);
        });
    });

    describe('deleteDocument', () => {
        it('should delete document successfully', async () => {
            const result = await DocumentService.deleteDocument(mockSupabase, 'doc-123');

            expect(result).toBe(true);
        });
    });
});
