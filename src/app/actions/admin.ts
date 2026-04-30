
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ReferralPayoutService } from "@/services/ReferralPayoutService";
import { ServiceTicketService } from "@/services/ServiceTicketService";

export async function updateUserRole(
    targetUserId: string, 
    newRole: 'admin' | 'inspector' | 'seller' | 'buyer' | 'investor',
    tier: 'starter' | 'pro' | 'elite' | null = null,
    location: string | null = null,
    coordinates: any = null
) {
    const supabase = await createClient();

    // 1. Verify Requestor is Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: requestorProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    const userEmail = user.email?.toLowerCase();
    if (requestorProfile?.role !== 'admin' && userEmail !== 'starterkar@hotmail.com') {
        throw new Error("Forbidden: Only Admins can promote users.");
    }

    // 2. Perform Update
    const updateData: any = { role: newRole };
    
    if (newRole === 'investor') {
        updateData.investor_tier = tier || 'starter';
    } else {
        updateData.investor_tier = null;
    }

    // Save location/coordinates for mechanics (inspectors)
    if (newRole === 'inspector') {
        if (location) updateData.location = location;
        if (coordinates) updateData.coordinates = coordinates;
    }

    const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", targetUserId);

    if (error) throw new Error(error.message);

    // 3. Audit Log (Security)
    await supabase.from("audit_logs").insert({
        user_id: user.id,
        action: "USER_ROLE_UPDATE",
        details: {
            target_user_id: targetUserId,
            new_role: newRole,
            timestamp: new Date().toISOString()
        }
    });

    revalidatePath("/admin/users");
    return { success: true };
}

export async function searchUsersAction(query: string) {
    const supabase = await createClient();

    // 1. Verify Requestor is Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    const userEmail = user.email?.toLowerCase();
    if (profile?.role !== 'admin' && userEmail !== 'starterkar@hotmail.com') {
        throw new Error("Forbidden");
    }

    // 2. Search in profiles
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%,id.eq.${query}`)
        .limit(20);

    if (error) {
        console.error("Search Users Error:", error);
        return [];
    }
    return data || [];
}

export async function processReferralPayout(referralId: string, amount: number, description: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: requestorProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    const userEmail = user.email?.toLowerCase();
    if (requestorProfile?.role !== 'admin' && userEmail !== 'starterkar@hotmail.com') {
        throw new Error("Forbidden: Only Admins can process payouts.");
    }

    const result = await ReferralPayoutService.createPayout(
        supabase,
        referralId,
        amount,
        description
    );

    if (!result) {
        throw new Error("Failed to process payout");
    }

    revalidatePath("/admin");
    return { success: true, payoutId: result.payoutId, paymentUrl: result.paymentUrl };
}

export async function getPendingReferralPayouts() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    const userEmail = user.email?.toLowerCase();
    if (profile?.role !== 'admin' && userEmail !== 'starterkar@hotmail.com') {
        throw new Error("Forbidden");
    }

    try {
        return await ReferralPayoutService.getPendingPayouts(supabase);
    } catch (err) {
        console.error("[Admin] Referral fetch failed:", err);
        return []; // Suppress error to keep dashboard alive
    }
}

export async function getInspectorScheduleAction() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    const userEmail = user.email?.toLowerCase();
    if (profile?.role !== 'inspector' && profile?.role !== 'admin' && userEmail !== 'starterkar@hotmail.com') {
        throw new Error("Forbidden");
    }

    return await ServiceTicketService.getInspectorSchedule(supabase);
}

export async function getInvestorApplicationsAction() {
    const supabase = await createClient();

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        const userEmail = user.email?.toLowerCase();
        if (profile?.role !== 'admin' && userEmail !== 'starterkar@hotmail.com') {
            throw new Error("Forbidden");
        }

        const { data, error } = await supabase
            .from("investor_applications")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Database query error (Investors):", error);
            return [];
        }
        return data || [];
    } catch (err) {
        console.error("getInvestorApplicationsAction failed:", err);
        return [];
    }
}

export async function approveInvestorApplicationAction(applicationId: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    const userEmail = user.email?.toLowerCase();
    if (profile?.role !== 'admin' && userEmail !== 'starterkar@hotmail.com') {
        throw new Error("Forbidden");
    }

    // 1. Get Application Details
    const { data: app, error: appError } = await supabase
        .from("investor_applications")
        .select("*")
        .eq("id", applicationId)
        .single();

    if (appError || !app) throw new Error("Application not found");

    // 2. Update Role in Profiles
    const { error: roleError } = await supabase
        .from("profiles")
        .update({ 
            role: 'investor',
            investor_tier: app.tier_id
        })
        .eq("id", app.user_id);

    if (roleError) throw roleError;

    // 3. Update Application Status
    const { error: statusError } = await supabase
        .from("investor_applications")
        .update({ status: 'approved' })
        .eq("id", applicationId);

    if (statusError) throw statusError;

    revalidatePath("/admin");
    return { success: true };
}

export async function rejectInvestorApplicationAction(applicationId: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    const userEmail = user.email?.toLowerCase();
    if (profile?.role !== 'admin' && userEmail !== 'starterkar@hotmail.com') {
        throw new Error("Forbidden");
    }

    const { error } = await supabase
        .from("investor_applications")
        .update({ status: 'rejected' })
        .eq("id", applicationId);

    if (error) throw error;

    revalidatePath("/admin");
    return { success: true };
}

export async function matchDemandAction(demandId: string, carId: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    const userEmail = user.email?.toLowerCase();
    if (profile?.role !== 'admin' && userEmail !== 'starterkar@hotmail.com') {
        throw new Error("Forbidden");
    }

    // 1. Update Demand Registry
    const { error: demandError } = await supabase
        .from("demand_registry")
        .update({ 
            status: 'completed',
            metadata: { 
                matched_car_id: carId,
                matched_at: new Date().toISOString(),
                matched_by: user.id
            } 
        })
        .eq("id", demandId);

    if (demandError) throw demandError;

    // 2. Audit Log
    await supabase.from("audit_logs").insert({
        user_id: user.id,
        action: "DEMAND_MATCH",
        entity_id: demandId,
        details: { car_id: carId }
    });

    revalidatePath("/admin");
    return { success: true };
}

export async function getGlobalConcurrencyStatsAction() {
    const supabase = await createClient();
    const { LockService } = await import("@/services/LockService");
    return await LockService.getGlobalConcurrencyStats(supabase);
}


export async function getRecentUsersAction() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const userEmail = user.email?.toLowerCase();
    if (profile?.role !== 'admin' && userEmail !== 'starterkar@hotmail.com') throw new Error("Forbidden");

    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(20);

    if (error) return [];
    return data || [];
}
