
import { ALL_CARS, Vehicle } from '../data/cars';
import { MOCK_SERVICE_TICKETS, MOCK_FEE_CONFIG, ServiceTicket } from '../data/serviceTickets';
import { v4 as uuidv4 } from 'uuid';

// --- MOCK INFRASTRUCTURE ---

class MockPaymentGateway {
    async charge_card(amount: number): Promise<{ success: boolean; txn_id: string }> {
        console.log(`[💳 PAGO] Procesando cargo a tarjeta por $${amount.toFixed(2)}...`);
        // Simular latencia
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true, txn_id: `ch_${uuidv4().substring(0, 8)}` };
    }

    async payout_to_partner(amount: number, account_id: string): Promise<{ success: boolean; txn_id: string }> {
        console.log(`[💸 DISPERSIÓN] Enviando $${amount.toFixed(2)} a Cuenta Aliada: ${account_id}...`);
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true, txn_id: `po_${uuidv4().substring(0, 8)}` };
    }
}

class MockDatabase {
    private cars: Vehicle[];
    private tickets: ServiceTicket[];
    private clinkarBalance: number = 0;

    constructor() {
        // Inicializar con copias para no mutar los imports originales permanentemente
        this.cars = JSON.parse(JSON.stringify(ALL_CARS));
        this.tickets = JSON.parse(JSON.stringify(MOCK_SERVICE_TICKETS));
    }

    getCar(id: string) {
        return this.cars.find(c => c.id === id);
    }

    updateCarStatus(id: string, status: Vehicle['status']) {
        const car = this.cars.find(c => c.id === id);
        if (car) {
            console.log(`[🔄 DB] Auto ${id} cambio de estado: ${car.status} -> ${status}`);
            car.status = status;
        }
    }

    createTicket(ticket: ServiceTicket) {
        console.log(`[📅 DB] Nuevo Ticket creado para auto ${ticket.carId} con Taller ${ticket.workshopId}`);
        this.tickets.push(ticket);
    }

    getTicketByCar(carId: string) {
        return this.tickets.find(t => t.carId === carId);
    }

    addRevenue(amount: number, reason: string) {
        this.clinkarBalance += amount;
        console.log(`[💰 CLINKAR] Ingreso registrado: +$${amount} (${reason}). Balance Total: $${this.clinkarBalance}`);
    }

    // Campo simulado extra para la demo legal
    getLegalStatus(carId: string): 'VALID' | 'INVALID' | 'PENDING' {
        // En un caso real esto vendría de una tabla 'documents' o 'legal_reviews'
        // Simulemos que todos los autos con 'legal_review' pasan si su ID termina en par, fallan si impar
        // Para asegurar éxito en la demo, retornamos VALID por defecto, salvo excepciones
        return 'VALID';
    }
}

// --- LOGICA DE NEGOCIO (CONTROLLERS) ---

const db = new MockDatabase();
const paymentGateway = new MockPaymentGateway();

// 1. Middleware de Validación Legal
async function check_legal_status(car_id: string): Promise<boolean> {
    console.log(`[⚖️ LEGAL] Verificando estatus legal para auto: ${car_id}...`);
    const status = db.getLegalStatus(car_id);
    if (status !== 'VALID') {
        console.error(`[❌ LEGAL] Rechazado. Estatus actual: ${status}`);
        return false;
    }
    console.log(`[✅ LEGAL] Documentación Aprobada.`);
    return true;
}

// 2. Controlador de Pago de Cita
async function appointment_payment_controller(carId: string, workshopId: string) {
    console.log(`\n--- INICIANDO PROCESO DE CITA: Auto ${carId} ---`);

    // Paso 1: Validación Legal
    if (!await check_legal_status(carId)) {
        throw new Error("403 Forbidden: Legal Check Failed");
    }

    // Paso 2: Leer Configuración
    const price = MOCK_FEE_CONFIG.upfrontInspectionPrice; // $900

    // Paso 3: Cobro
    const charge = await paymentGateway.charge_card(price);

    if (charge.success) {
        console.log(`[✅ PAGO] Cargo exitoso. Ref: ${charge.txn_id}`);

        // Paso 4: Crear Ticket en DB
        const newTicket: ServiceTicket = {
            id: `TKT-${uuidv4().substring(0, 6)}`,
            carId: carId,
            workshopId: workshopId,
            workshopName: "Taller Aliado Demo",
            scheduledDate: new Date(Date.now() + 86400000 * 3).toISOString(), // +3 días
            status: 'PAID_PENDING_VISIT',
            payoutStatus: 'PENDING',
            payoutAmount: MOCK_FEE_CONFIG.mechanicPayoutAmount
        };
        db.createTicket(newTicket);

        // Paso 5: Actualizar Auto
        db.updateCarStatus(carId, 'INSPECTION_SCHEDULED');

        return { success: true, ticket: newTicket };
    } else {
        throw new Error("Payment Failed");
    }
}

// 3. Trigger de Pago al Mecánico y Evaluación
async function submit_inspection_report_controller(ticketId: string, reportData: any) {
    console.log(`\n--- RECIBIENDO REPORTE DE INSPECCIÓN: Ticket ${ticketId} ---`);

    // Simular guardado del reporte
    console.log(`[📝 REPORTE] Guardando datos de 150 puntos... Score: ${reportData.score}`);

    // Regla de Oro: DISPERSIÓN AUTOMÁTICA
    const payoutAmount = MOCK_FEE_CONFIG.mechanicPayoutAmount; // $750
    const mechanicId = "PARTNER-MX-999"; // ID del taller del ticket

    const payout = await paymentGateway.payout_to_partner(payoutAmount, mechanicId);

    if (payout.success) {
        console.log(`[✅ DISPERSIÓN] Pago enviado al mecánico. Ref: ${payout.txn_id}`);

        // CALCULO DEL REMANENTE
        // Ingreso por cita ($900) - Egreso Mecánico ($750) = $150
        // Como el cobro $900 ya entró a nuestra cuenta (Stripe), ahora sale $750.
        // Contablemente registramos el margen.
        const margin = MOCK_FEE_CONFIG.upfrontInspectionPrice - payoutAmount;
        db.addRevenue(margin, "Margen Operativo por Cita");

    } else {
        console.error("[❌ DISPERSIÓN_FAIL] Error crítico: No se pudo pagar al mecánico.");
        // Aquí entraría lógica de reintentos o alerta a admins
    }

    // Evaluación
    const ticket = db.getTicketByCar(reportData.carId); // Simplificado para la demo
    if (!ticket) return;

    if (reportData.score > 80) {
        db.updateCarStatus(reportData.carId, 'CERTIFIED');
        console.log(`[🌟 RESULTADO] Auto APROBADO. Publicado en Marketplace.`);
    } else {
        // db.updateCarStatus(reportData.carId, 'REJECTED'); // Asumiendo estado REJECTED o volver a DRAFT
        console.log(`[❄️ RESULTADO] Auto RECHAZADO. Requiere reparaciones.`);
    }
}

// --- EJECUCIÓN DE LA SIMULACIÓN ---

async function runSimulation() {
    try {
        // Setup: Crear un auto en estado LEGAL_REVIEW para la prueba
        const carId = 'demo-car-001';
        // Hack: inyectamos el auto si no existe o forzamos estado
        // Para usar los datos reales importados, usemos uno existente y cambiemos su estado en memoria
        const demoCarId = 'sedan-1';
        db.updateCarStatus(demoCarId, 'LEGAL_REVIEW');

        // 1. Agendar Cita y Pagar
        const result = await appointment_payment_controller(demoCarId, 'PARTNER-MX-001');

        // Simular paso del tiempo... el mecánico hace la inspección
        console.log("... (Tiempo pasa: Mecánico inspecciona el auto) ...");
        await new Promise(resolve => setTimeout(resolve, 800));

        // 2. Mecánico sube reporte
        const mockReport = {
            carId: demoCarId,
            score: 92, // Pasa la prueba
            details: { engine: 'ok', tires: 'ok' }
        };

        if (result?.ticket) {
            await submit_inspection_report_controller(result.ticket.id, mockReport);
        }

    } catch (error) {
        console.error("Simulation Failed:", error);
    }
}

// Ejecutar
runSimulation();
