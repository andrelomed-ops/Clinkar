import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransactionService } from '../TransactionService';
import { PldService } from '../PldService';

// Mock PldService
vi.mock('../PldService', () => ({
    PldService: {
        screenPerson: vi.fn(),
    },
}));

describe('TransactionService', () => {
    let mockSupabase: any;
    let mockQueryBuilder: any;

    beforeEach(() => {
        vi.clearAllMocks();

        mockQueryBuilder = {
            select: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            upsert: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            neq: vi.fn().mockReturnThis(),
            in: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            single: vi.fn().mockReturnThis(),
            // Mocking the thenable behavior for await
            then: vi.fn((onFulfilled) => {
                return Promise.resolve({ data: null, error: null, count: 0 }).then(onFulfilled);
            }),
        };

        mockSupabase = {
            from: vi.fn(() => mockQueryBuilder),
        };
    });

    it('should calculate global stats correctly', async () => {
        const mockTransactions = [
            { car_price: 100000, status: 'IN_VAULT' },
            { car_price: 50000, status: 'PENDING' }
        ];

        // Mock the return value of the select chain for the aggregate stats
        mockQueryBuilder.then
            .mockImplementationOnce((onFulfilled) => {
                return Promise.resolve({ data: mockTransactions, error: null }).then(onFulfilled);
            })
            // Mock for transaction count query
            .mockImplementationOnce((onFulfilled) => {
                return Promise.resolve({ count: 2, error: null }).then(onFulfilled);
            })
            // Mock for active transaction count query
            .mockImplementationOnce((onFulfilled) => {
                return Promise.resolve({ count: 2, error: null }).then(onFulfilled);
            });

        const stats = await TransactionService.getGlobalStats(mockSupabase);
        expect(stats.gmv).toBe(150000);
        expect(stats.vaultValue).toBe(100000);
    });

    it('should throw Error if AML threshold exceeded and user is unverified', async () => {
        (PldService.screenPerson as any).mockResolvedValue({
            riskLevel: 'CLEAN',
            matches: []
        });

        mockQueryBuilder.single.mockResolvedValueOnce({
            data: { verification_status: 'UNVERIFIED' },
            error: null
        });

        await expect(TransactionService.createTransaction(mockSupabase, {
            carId: 'car-123',
            buyerId: 'buyer-456',
            sellerId: 'seller-789',
            amount: 400000,
            stripeSessionId: 'sess_123'
        })).rejects.toThrow(/KYC_REQUIRED/);
    });

    it('should transition to IN_VAULT correctly', async () => {
        const sessionId = 'test_session';

        mockQueryBuilder.single.mockResolvedValueOnce({
            data: { id: 'tx-1', buyer_id: 'b1', seller_id: 's1', car_price: 100000 },
            error: null
        });

        await TransactionService.updateTransactionStatusBySessionId(mockSupabase, sessionId, 'IN_VAULT');

        expect(mockQueryBuilder.update).toHaveBeenCalledWith({ status: 'IN_VAULT' });
    });
});
