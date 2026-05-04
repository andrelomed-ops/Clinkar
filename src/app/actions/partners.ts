
"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addPartnerAction(partnerData: {
    name: string;
    address: string;
    city: string;
    phone: string;
    is_active: boolean;
    specialties: string[];
}) {
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
        throw new Error("Forbidden: Only Admins can manage workshops.");
    }

    // 2. Use Admin Client to bypass RLS
    const adminSupabase = await createAdminClient();
    const { data, error } = await adminSupabase
        .from('partners')
        .insert(partnerData)
        .select()
        .single();

    if (error) throw new Error(error.message);

    revalidatePath("/admin/partners");
    return { success: true, data };
}

export async function togglePartnerStatusAction(id: string, currentStatus: boolean) {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const userEmail = user.email?.toLowerCase();
    if (profile?.role !== 'admin' && userEmail !== 'starterkar@hotmail.com') throw new Error("Forbidden");

    const adminSupabase = await createAdminClient();
    const { error } = await adminSupabase
        .from('partners')
        .update({ is_active: !currentStatus })
        .eq('id', id);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/partners");
    return { success: true };
}

export async function deletePartnerAction(id: string) {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const userEmail = user.email?.toLowerCase();
    if (profile?.role !== 'admin' && userEmail !== 'starterkar@hotmail.com') throw new Error("Forbidden");

    const adminSupabase = await createAdminClient();
    const { error } = await adminSupabase
        .from('partners')
        .delete()
        .eq('id', id);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/partners");
    return { success: true };
}
