
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ReferralPayoutService } from "@/services/ReferralPayoutService";

export async function updateUserRole(targetUserId: string, newRole: 'admin' | 'inspector' | 'seller' | 'buyer') {
    const supabase = await createClient();

    // 1. Verify Requestor is Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: requestorProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (requestorProfile?.role !== 'admin') {
        throw new Error("Forbidden: Only Admins can promote users.");
    }

    // 2. Perform Update
    const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
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

export async function processReferralPayout(referralId: string, amount: number, description: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: requestorProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (requestorProfile?.role !== 'admin') {
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

    if (profile?.role !== 'admin') {
        throw new Error("Forbidden");
    }

    return await ReferralPayoutService.getPendingPayouts(supabase);
}
