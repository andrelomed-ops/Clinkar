
import { v4 as uuidv4 } from 'uuid';

// --- TYPES ---

export type MechanicalStatus =
    | 'PENDING_DIAGNOSIS'
    | 'DIAGNOSING'
    | 'QUOTATION_PENDING_APPROVAL'
    | 'PARTS_ORDERED'
    | 'PARTS_RECEIVED'
    | 'IN_REPAIR'
    | 'QUALITY_CONTROL'
    | 'READY_FOR_DELIVERY';

interface MechanicalTicket {
    id: string;
    vehicle_id: string;
    status: MechanicalStatus;
    checkpoints: {
        status: MechanicalStatus;
        timestamp: string;
        note?: string;
    }[];
    current_estimated_completion?: string;
}

// --- MOCK DATABASE ---

class MockMechanicalDB {
    private tickets: Map<string, MechanicalTicket> = new Map();

    createTicket(vehicleId: string): MechanicalTicket {
        const ticket: MechanicalTicket = {
            id: `mech-${uuidv4().substring(0, 8)}`,
            vehicle_id: vehicleId,
            status: 'PENDING_DIAGNOSIS',
            checkpoints: [{
                status: 'PENDING_DIAGNOSIS',
                timestamp: new Date().toISOString(),
                note: 'Vehículo ingresado a taller partner.'
            }]
        };
        this.tickets.set(ticket.id, ticket);
        console.log(`[🔧 TALLER] Nuevo ticket creado para auto ${vehicleId}: ${ticket.status}`);
        return ticket;
    }

    updateStatus(ticketId: string, newStatus: MechanicalStatus, note?: string) {
        const ticket = this.tickets.get(ticketId);
        if (!ticket) throw new Error("Ticket not found");

        ticket.status = newStatus;
        ticket.checkpoints.push({
            status: newStatus,
            timestamp: new Date().toISOString(),
            note: note
        });

        console.log(`[🔧 UPDATE] Ticket ${ticketId} -> ${newStatus} (${note || 'Sin nota'})`);
        return ticket;
    }
}

// --- CONTROLLER (The "Manual Admin Switch") ---

const db = new MockMechanicalDB();

async function simulate_mechanic_flow(vehicleId: string) {
    console.log(`\n=== 🛠️ SIMULACIÓN: FLUJO DE TALLER TRANSPARENTE ===`);
    console.log(`Auto: ${vehicleId}`);

    // 1. Ingreso
    const ticket = db.createTicket(vehicleId);

    // 2. Diagnóstico (Simulamos tiempo real o acción manual del mecánico)
    await manual_admin_action(ticket.id, 'DIAGNOSING', 'Técnico asignado: Juan Pérez. Iniciando escaneo.');

    // 3. Cotización lista (Aquí entra el usuario a aprobar - saltamos ese paso para la demo)
    await manual_admin_action(ticket.id, 'QUOTATION_PENDING_APPROVAL', 'Fuga de aceite detectada. Requiere junta tapa punterías.');

    // 4. Aprobado -> Piezas
    console.log(`\n... (Usuario aprueba reparación) ...\n`);
    await manual_admin_action(ticket.id, 'PARTS_ORDERED', 'Refacciones solicitadas a agencia Mazda.');

    // 5. Piezas llegan
    await manual_admin_action(ticket.id, 'PARTS_RECEIVED', 'Junta recibida. Iniciando desmontaje.');

    // 6. Reparación
    await manual_admin_action(ticket.id, 'IN_REPAIR', 'Motor en reparación.');

    // 7. QC
    await manual_admin_action(ticket.id, 'QUALITY_CONTROL', 'Prueba de manejo en curso.');

    // 8. Listo
    await manual_admin_action(ticket.id, 'READY_FOR_DELIVERY', 'Vehículo certificado y lavado. Listo para entrega.');
}

async function manual_admin_action(ticketId: string, status: MechanicalStatus, note: string) {
    // Simulating the "Admin Click" latency
    await new Promise(r => setTimeout(r, 800));
    db.updateStatus(ticketId, status, note);
}

// --- EJECUCIÓN ---
simulate_mechanic_flow('car-mx-CX5-2021');
