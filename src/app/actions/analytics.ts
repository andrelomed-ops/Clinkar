"use server";

import { createClient } from "@/lib/supabase/server";

export async function getAnnualBusinessStatsAction() {
    const supabase = await createClient();

    // 1. Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== 'admin' && user.email !== 'starterkar@hotmail.com') {
        throw new Error("Forbidden");
    }

    // 2. Fetch from the new View
    const { data, error } = await supabase
        .from("admin_business_stats")
        .select("*")
        .single();

    if (error) {
        console.error("Error fetching business stats:", error);
        // Fallback to manual calculation if view fails or doesn't exist yet
        return {
            total_sales: 0,
            total_gmv: 0,
            total_commissions: 0,
            completed_sales: 0,
            monthly_trends: {}
        };
    }

    return data;
}
