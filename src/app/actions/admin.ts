
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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
