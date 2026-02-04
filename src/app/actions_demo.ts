'use server';

import { ServiceTicketService } from "@/services/ServiceTicketService";
import { PaymentService } from "@/services/PaymentService";
import { InspectionService } from "@/services/InspectionService";
import { createClient } from "@/lib/supabase/server";

// Wrapper actions to be called from Client Components

export async function createTicketAction(carId: string, workshopId: string, workshopName: string, date: string) {
    try {
        const supabase = await createClient();
        return await ServiceTicketService.createTicket(supabase, carId, workshopId, workshopName, date);
    } catch (e: any) {
        console.error("Create Ticket Error:", e);
        return { error: e.message };
    }
}

export async function processPaymentAction(ticketId: string, amount: number) {
    try {
        const supabase = await createClient();
        const res = await PaymentService.chargeCard(supabase, ticketId, amount);
        return { success: true, ...res };
    } catch (e: any) {
        console.error("Payment Error:", e);
        return { error: e.message };
    }
}

export async function getTicketAction(carId: string) {
    try {
        const supabase = await createClient();
        return await ServiceTicketService.getTicketByCar(supabase, carId);
    } catch (e: any) {
        return null;
    }
}
