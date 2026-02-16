import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VehicleCheckService } from '../VehicleCheckService';
import { SupabaseClient } from '@supabase/supabase-js';

describe('VehicleCheckService', () => {
    let mockSupabase: any;

    beforeEach(() => {
        mockSupabase = {
            from: vi.fn().mockReturnThis(),
            insert: vi.fn().mockResolvedValue({ error: null }),
        };
    });

    it('should return CLEAN for a safe VIN', async () => {
        const result = await VehicleCheckService.verifyTheftStatus(mockSupabase, 'SAFE-VIN-123');
        expect(result.status).toBe('CLEAN');
        expect(result.source).toBe('REPUVE');
    });

    it('should return STOLEN for a suspicious VIN with manual links', async () => {
        const result = await VehicleCheckService.verifyTheftStatus(mockSupabase, 'VIN-ROBADO-666');
        expect(result.status).toBe('STOLEN');
        expect(result.metadata.isDemo).toBe(true);
        expect(result.metadata.manualVerifyUrl).toContain('repuve.gob.mx');
    });

    it('should generate a certificate and log it in Supabase', async () => {
        const result = await VehicleCheckService.verifyTheftStatus(mockSupabase, 'SAFE-VIN-123');
        const success = await VehicleCheckService.generateCertificate(mockSupabase, 'tx-123', result);

        expect(success).toBe(true);
        expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs');
        expect(mockSupabase.insert).toHaveBeenCalled();
    });
});
