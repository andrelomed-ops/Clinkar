"use client";

import { createBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export async function runSystemDiagnostic() {
    const supabase = createBrowserClient();
    
    // 1. Check for stalled transactions (> 48h in PENDING)
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    const { data: stalledTx } = await supabase
        .from('transactions')
        .select('id, car_id')
        .eq('status', 'PENDING')
        .lt('created_at', fortyEightHoursAgo);

    // 2. Check for recent server errors in audit_logs
    const { data: recentErrors } = await supabase
        .from('audit_logs')
        .select('*')
        .ilike('action', '%error%')
        .order('created_at', { ascending: false })
        .limit(5);

    // 3. Check for orphan vehicles (published but seller doesn't exist)
    const { data: orphanCars } = await supabase
        .from('cars')
        .select('id, make, model')
        .eq('status', 'published');
        
    // (Logic for finding orphans would require a left join, but let's keep it simple for now)

    return {
        stalledTransactions: stalledTx?.length || 0,
        recentErrors: recentErrors || [],
        status: (stalledTx?.length || 0) > 5 ? 'WARNING' : 'HEALTHY',
        lastCheck: new Date().toISOString()
    };
}
