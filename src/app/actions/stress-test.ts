'use server';

import { createClient } from '@/lib/supabase/server';
import { LockService } from '@/services/LockService';
import { v4 as uuidv4 } from 'uuid';

export async function runConcurrencyTest(carId: string, concurrentRequests: number = 50) {
    const supabase = await createClient();
    
    // Create random user configs
    const attackVectors = Array.from({ length: concurrentRequests }).map(() => ({
        userId: uuidv4()
    }));

    // Start all requests at the EXACT same time
    const results = await Promise.all(
        attackVectors.map(async (v) => {
            try {
                // To force extreme concurrency, we don't await sequentially
                const res = await LockService.acquireLock(supabase, carId, v.userId, 15);
                return { success: res.success ? 1 : 0, error: res.error, userId: v.userId };
            } catch (e: any) {
                return { success: 0, error: e.message, userId: v.userId };
            }
        })
    );

    // After all attempts, clear the lock so we can run the test again
    // In a real environment, we'd wait, but for test repeatability we clean
    await LockService.releaseLock(supabase, carId);

    const totalSuccess = results.reduce((acc, r) => acc + r.success, 0);
    const totalFailures = concurrentRequests - totalSuccess;

    return { totalSuccess, totalFailures, details: results };
}
