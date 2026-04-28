import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: any }
) {
    try {
        const type = (await params).type;
        const id = req.nextUrl.searchParams.get("id");
        
        return NextResponse.json({ 
            debug: "API is alive",
            type,
            id,
            env_check: !!process.env.NEXT_PUBLIC_SUPABASE_URL
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
