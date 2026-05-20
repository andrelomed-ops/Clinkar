import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransactionService } from '../TransactionService';
import { PldService } from '../PldService';

vi.mock('../PldService', () => ({
    PldService: {
        screenPerson: vi.fn(),
    },
}));

vi.mock('../LockService', () => ({
    LockService: {
        acquireLock: vi.fn().mockResolvedValue({ success: true }),
    },
}));

describe('TransactionService', () => {
    let mockSupabase: any;

    beforeEach(() => {
        vi.clearAllMocks();

        const thenFn = vi.fn((onFulfilled: any) =>
            Promise.resolve({ data: null, error: null, count: 0 }).then(onFulfilled)
        );

        mockSupabase = {
            from: vi.fn(() => ({
                select: vi.fn().mockReturnThis(),
                insert: vi.fn().mockReturnThis(),
                update: vi.fn().mockReturnThis(),
                delete: vi.fn().mockReturnThis(),
                upsert: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                neq: vi.fn().mockReturnThis(),
                in: vi.fn().mockReturnThis(),
                lt: vi.fn().mockReturnThis(),
                gt: vi.fn().mockReturnThis(),
                lte: vi.fn().mockReturnThis(),
                gte: vi.fn().mockReturnThis(),
                order: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: null, error: null }),
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
                then: thenFn,
            })),
            auth: {
                getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null }),
            },
        };
    });

    it('should calculate global stats correctly', async () => {
        const mockTransactions = [
            { car_price: 100000, status: 'P2P_VALIDATED' },
            { car_price: 50000, status: 'PENDING' }
        ];

        const queryBuilder = {
            select: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            neq: vi.fn().mockReturnThis(),
            in: vi.fn().mockReturnThis(),
            then: vi.fn()
                .mockImplementationOnce((onFulfilled: any) =>
                    Promise.resolve({ data: mockTransactions, error: null }).then(onFulfilled)
                )
                .mockImplementationOnce((onFulfilled: any) =>
                    Promise.resolve({ count: 2, error: null }).then(onFulfilled)
                )
                .mockImplementationOnce((onFulfilled: any) =>
                    Promise.resolve({ count: 2, error: null }).then(onFulfilled)
                ),
        };

        const localSupabase = {
            from: vi.fn(() => queryBuilder),
            auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null }) },
        };

        const stats = await TransactionService.getGlobalStats(localSupabase);
        expect(stats.gmv).toBe(150000);
        expect(stats.vaultValue).toBe(100000);
    });

    it('should throw Error if AML threshold exceeded and user is unverified', async () => {
        (PldService.screenPerson as any).mockResolvedValue({
            riskLevel: 'CLEAN',
            matches: []
        });

        await expect(TransactionService.createTransaction(mockSupabase, {
            carId: 'car-123',
            buyerId: 'buyer-456',
            sellerId: 'seller-789',
            amount: 400000,
            stripeSessionId: 'sess_123',
            metadata: { skipLock: true }
        })).rejects.toThrow();
    });

    it('should transition to IN_VAULT correctly', async () => {
        const sessionId = 'test_session';

        mockSupabase.from.mockReturnValue({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({
                data: { id: 'tx-1', buyer_id: 'b1', seller_id: 's1', car_price: 100000 },
                error: null
            }),
            update: vi.fn().mockReturnThis(),
            then: vi.fn((onFulfilled: any) =>
                Promise.resolve({ data: null, error: null }).then(onFulfilled)
            ),
        });

        await TransactionService.updateTransactionStatusBySessionId(mockSupabase, sessionId, 'IN_VAULT');
    });
});
