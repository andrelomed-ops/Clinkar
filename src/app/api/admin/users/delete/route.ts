import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { userId } = await req.json();
        
        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 1. Delete from Auth (this also deletes from public.profiles if there is a cascade or trigger, 
        // but typically we delete profiles manually or let the DB handle it)
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        
        if (authError) {
            console.error("Auth Delete Error:", authError);
            return NextResponse.json({ error: authError.message }, { status: 500 });
        }

        // 2. Ensure Profile is gone
        await supabaseAdmin.from('profiles').delete().eq('id', userId);

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
