import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { userId } = await req.json();
        
        if (!userId) {
            return NextResponse.json({ error: "ID de usuario requerido" }, { status: 400 });
        }

        const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

        if (!serviceRole || !supabaseUrl) {
            console.error("CRITICAL: Missing Supabase Admin Keys");
            return NextResponse.json({ error: "Error de configuración: Llave administrativa no encontrada" }, { status: 500 });
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRole, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // 1. Cleanup Dependencies first (Manual Cascade)
        // This is necessary if DB constraints are strict
        await supabaseAdmin.from('car_favorites').delete().eq('user_id', userId);
        await supabaseAdmin.from('audit_logs').delete().eq('user_id', userId);
        await supabaseAdmin.from('investor_applications').delete().eq('user_id', userId);
        await supabaseAdmin.from('notifications').delete().eq('user_id', userId);

        // 2. Delete from Profiles (Public)
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .delete()
            .eq('id', userId);

        if (profileError) {
            console.error("Profile Delete Error:", profileError);
            // We continue even if profile delete fails, maybe it's already gone
        }

        // 3. Delete from Auth (Internal)
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        
        if (authError) {
            console.error("Auth Delete Error:", authError);
            // If it's "User not found", it's fine
            if (authError.status !== 404) {
                return NextResponse.json({ error: `Error en Auth: ${authError.message}` }, { status: 500 });
            }
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("Internal User Delete Crash:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
