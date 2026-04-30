import { NextRequest, NextResponse } from "next/server";
import { ConektaService } from "@/services/ConektaService";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
    try {
        const { carId, amount, description } = await req.json();
        const supabase = await createClient();
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email, phone')
            .eq('id', user.id)
            .single();

        // Create the payment link using the existing service
        const checkout = await ConektaService.createPaymentLink(
            amount,
            description || `Pago Vehículo - StarterKar`,
            carId, // Using carId as the reference
            profile?.email || user.email,
            profile?.full_name || 'Comprador StarterKar',
            profile?.phone || undefined
        );

        if (!checkout) {
            // If API key is missing or failed, return a mock URL for testing
            if (process.env.NODE_ENV === 'development') {
                console.log("[CONEKTA MOCK] API Key missing, generating mock checkout...");
                return NextResponse.json({ 
                    url: `https://pay.conekta.com/checkout/mock-${carId}`,
                    checkoutId: `mock-${Date.now()}`
                });
            }
            return NextResponse.json({ error: "No se pudo generar el link de pago" }, { status: 500 });
        }

        return NextResponse.json(checkout);
    } catch (error: any) {
        console.error("[CONEKTA_API] Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
