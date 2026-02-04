'use server';

import { v4 as uuidv4 } from 'uuid';

// --- SHARED TYPES (Should ideally be in a shared types file) ---
interface ServiceTicket {
    id: string;
    carId: string;
    workshopId: string;
    workshopName: string;
    scheduledDate: string;
    status: 'PAID_PENDING_VISIT' | 'COMPLETED';
    payoutStatus: 'PENDING' | 'PAID';
    payoutAmount: number;
}

// --- MOCK CONSTANTS (From simulation) ---
const MOCK_FEE_CONFIG = {
    upfrontInspectionPrice: 900.00,
    mechanicPayoutAmount: 750.00,
    platformMargin: 150.00
};

// --- HELPER MOCKS ---
// In a real app, these would be calls to your DB (Supabase) and Payment Provider (Stripe/STP)

async function mockChargeCard(amount: number): Promise<{ success: boolean; txn_id: string }> {
    console.log(`[SERVER ACTION] Procesando cargo a tarjeta por $${amount.toFixed(2)}...`);
    await new Promise(resolve => setTimeout(resolve, 800)); // Latency
    // Simulate slight chance of failure if needed, but keeping it reliable for demo
    return { success: true, txn_id: `ch_${uuidv4().substring(0, 8)}` };
}

async function mockDBUpdateCarStatus(carId: string, status: string) {
    console.log(`[SERVER ACTION] DB Update: Car ${carId} -> ${status}`);
    // Real DB call would go here
}

async function mockDBCreateTicket(ticket: ServiceTicket) {
    console.log(`[SERVER ACTION] DB Create Ticket: ${ticket.id}`);
    // Real DB call would go here
}

// --- MAIN ACTION ---

export async function payForInspection(carId: string, paymentMethod: 'card' | 'spei') {
    console.log(`\n--- INICIANDO PROCESO DE PAGO DE INSPECCIÓN (Action) ---`);
    console.log(`Auto: ${carId}, Pasarela: ${paymentMethod}`);

    try {
        // Paso 1: Validación Legal Mock
        // (Asumimos que ya pasó si llegó a este paso en la UI, o re-validamos)
        const isLegalValid = true;
        if (!isLegalValid) {
            return { success: false, error: "Documentación Legal no verificada o pendiente." };
        }

        // Paso 2: Cobro
        let charge;
        if (paymentMethod === 'card') {
            charge = await mockChargeCard(MOCK_FEE_CONFIG.upfrontInspectionPrice);
        } else {
            // Para SPEI, simulamos que el hook de "Pago Recibido" se disparó internamente
            console.log(`[SERVER ACTION] Simulando confirmación de webhook SPEI...`);
            await new Promise(resolve => setTimeout(resolve, 500));
            charge = { success: true, txn_id: `spei_${uuidv4().substring(0, 8)}` };
        }

        if (charge.success) {
            // Paso 3: Crear Ticket
            const newTicket: ServiceTicket = {
                id: `TKT-${uuidv4().substring(0, 6)}`,
                carId: carId,
                workshopId: "PARTNER-MX-001", // Taller asignado
                workshopName: "Taller Aliado Demo (Certificado)",
                scheduledDate: new Date(Date.now() + 86400000 * 3).toISOString(), // +3 días
                status: 'PAID_PENDING_VISIT',
                payoutStatus: 'PENDING',
                payoutAmount: MOCK_FEE_CONFIG.mechanicPayoutAmount
            };

            await mockDBCreateTicket(newTicket);
            await mockDBUpdateCarStatus(carId, 'INSPECTION_SCHEDULED');

            return {
                success: true,
                data: {
                    ticketId: newTicket.id,
                    transactionRef: charge.txn_id,
                    status: 'INSPECTION_SCHEDULED'
                }
            };
        } else {
            return { success: false, error: "El pago fue rechazado." };
        }

    } catch (error) {
        console.error("Payment Action Error:", error);
        return { success: false, error: "Error interno del servidor." };
    }
}
