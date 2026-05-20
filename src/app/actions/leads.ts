"use client";

import { createBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export async function createPuenteLead(data: {
    carId: string;
    carName: string;
    agency: string;
    hasUsedCar: boolean;
    customerName?: string;
    customerPhone?: string;
    referrerId?: string;
}) {
    const supabase = createBrowserClient();
    
    const { data: { user } } = await supabase.auth.getUser();

    // Use seller_leads table to store the intent
    const { data: lead, error } = await supabase
        .from('seller_leads')
        .insert({
            user_id: user?.id || null,
            current_brand: "Pending", // Will be filled during valuation call
            current_model: "Pending",
            current_year: 0,
            looking_for: data.carName,
            status: 'new',
            contact_preference: 'whatsapp',
            // Store metadata in a JSONB field if it exists, or just use looking_for
            // For now, let's assume we can at least store the intent.
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating lead:", error);
        throw error;
    }

    // If there's a referrer, we could log it in a separate table or notifications
    if (data.referrerId) {
        await supabase.from('notifications').insert({
            user_id: data.referrerId,
            title: "Nuevo Lead de Referido",
            message: `Un amigo ha generado un Certificado VIP para un ${data.carName}.`,
            type: 'SUCCESS'
        });
    }

    return { success: true, leadId: lead.id };
}
