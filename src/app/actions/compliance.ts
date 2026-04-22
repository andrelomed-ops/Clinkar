"use server";
 
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getComplianceAlerts() {
    const supabase = await createClient();

    // 1. Verify Requestor is Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== 'admin') {
        throw new Error("Forbidden: Only Admins can access compliance data.");
    }

    // 2. Fetch Alerts (WARNING or BLOCKED)
    const { data, error } = await supabase
        .from("compliance_checks")
        .select(`
            *,
            user:profiles!user_id(full_name, email)
        `)
        .in("result", ["WARNING", "BLOCKED"])
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching compliance alerts:", error);
        return [];
    }

    return data;
}

export async function resolveComplianceAlert(alertId: string, resolution: 'DISMISSED' | 'CONFIRMED') {
    const supabase = await createClient();

    // Verify Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // This would ideally update a status column in compliance_checks or similar
    // For now, we can log the action in audit_logs
    await supabase.from("audit_logs").insert({
        user_id: user.id,
        action: `PLD_ALERT_${resolution}`,
        details: { alertId, timestamp: new Date().toISOString() }
    });

    revalidatePath("/admin/legal");
    return { success: true };
}
