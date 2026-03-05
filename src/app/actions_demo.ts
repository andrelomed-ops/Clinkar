"use server";

export async function processPaymentAction(carId: string, amount: number): Promise<{ success: boolean; carId: string; amount: number; error: string | null }> {
    return { success: true, carId, amount, error: null };
}

export async function getTicketAction(ticketId: string): Promise<{ success: boolean; ticketId: string; error: string | null }> {
    return { success: true, ticketId, error: null };
}
