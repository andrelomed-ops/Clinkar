
import { v4 as uuidv4 } from 'uuid';

// --- TYPES & INTERFACES ---

interface Vehicle {
    id: string;
    make: string;
    model: string;
    price: number;
    status: 'AVAILABLE' | 'RESERVED' | 'SOLD';
    legal_status: 'PENDING' | 'VERIFIED' | 'REJECTED';
    inspection_status: 'PENDING' | 'CERTIFIED' | 'REJECTED';
}

interface Transaction {
    id: string;
    vehicle_id: string;
    buyer_id: string;
    amount: number;
    status: 'CREATED' | 'FUNDS_HELD_IN_GATEWAY' | 'COMPLETED' | 'REFUNDED';
    gateway: 'STP' | 'STRIPE';
    gateway_txn_id?: string;
    ledger_split?: {
        recipient: string;
        amount: number;
        role: 'SELLER' | 'CLINKAR_FEE';
    }[];
    created_at: string;
}

// --- MOCK INFRASTRUCTURE ---

class MockDatabase {
    private vehicles: Map<string, Vehicle> = new Map();
    private transactions: Map<string, Transaction> = new Map();

    constructor() {
        // Seed data
        this.vehicles.set('car-123', {
            id: 'car-123',
            make: 'Mazda',
            model: 'CX-5',
            price: 200000,
            status: 'AVAILABLE',
            legal_status: 'PENDING',
            inspection_status: 'PENDING'
        });
    }

    getVehicle(id: string) { return this.vehicles.get(id); }
    updateVehicle(id: string, updates: Partial<Vehicle>) {
        const v = this.vehicles.get(id);
        if (v) Object.assign(v, updates);
    }

    createTransaction(txn: Transaction) {
        this.transactions.set(txn.id, txn);
        console.log(`[💾 DB] Transacción creada: ${txn.id} (${txn.status})`);
    }

    getTransaction(id: string) { return this.transactions.get(id); }
    updateTransaction(id: string, updates: Partial<Transaction>) {
        const t = this.transactions.get(id);
        if (t) {
            Object.assign(t, updates);
            console.log(`[💾 DB] Transacción actualizada: ${id} -> ${t.status}`);
        }
    }
}

class MockSTPService {
    async simulate_incoming_spei(amount: number, concept_ref: string) {
        console.log(`[🏦 STP] Recibiendo SPEI por $${amount} con concepto ${concept_ref}...`);
        await new Promise(r => setTimeout(r, 500));
        return {
            success: true,
            tracking_key: `SPEI-${uuidv4().substring(0, 8)}`,
            sender_bank: 'BBVA'
        };
    }

    async disperse_to_account(amount: number, clabe: string, concept: string) {
        console.log(`[🏦 STP_OUT] Dispersando $${amount} a CLABE ${clabe} (${concept})...`);
        await new Promise(r => setTimeout(r, 500));
        return { success: true, tracking_key: `OUT-${uuidv4().substring(0, 8)}` };
    }
}

class MockStripeService {
    async create_payment_intent(amount: number, currency: 'mxn' = 'mxn') {
        console.log(`[💳 STRIPE] Creando PaymentIntent por $${amount} (Capture: MANUAL)...`);
        await new Promise(r => setTimeout(r, 500));
        return {
            id: `pi_${uuidv4().substring(0, 12)}`,
            client_secret: `secret_${uuidv4()}`,
            amount: amount,
            capture_method: 'manual'
        };
    }

    async capture_funds(intent_id: string, amount_to_capture?: number) {
        const amountMsg = amount_to_capture ? `$${amount_to_capture}` : 'Total';
        console.log(`[💳 STRIPE] CAPTURANDO fondos de ${intent_id} (${amountMsg})...`);
        await new Promise(r => setTimeout(r, 500));
        return { status: 'succeeded', fee_deducted: true };
    }
}

// --- LOGICA DE NEGOCIO (CONTROLLERS) ---

const db = new MockDatabase();
const stp = new MockSTPService();
const stripe = new MockStripeService();

const CLINKAR_FEE_PERCENT = 0.05; // 5%

// A. Riel STP: Recepción y "Split Virtual"
async function process_incoming_spei_controller(mockData: { amount: number, concept_ref: string }) {
    console.log(`\n--- 🔄 INICIO: Recepción de Fondos (SPEI) ---`);

    // 1. Simular recepción del banco
    const speiResult = await stp.simulate_incoming_spei(mockData.amount, mockData.concept_ref);

    // 2. Buscar Orden Asociada (simulado por concept_ref)
    const transactionId = mockData.concept_ref; // En prod, parsear el concepto

    // 3. Crear registro de Transacción si es nuevo o actualizar
    // Para demo, asumimos que creamos la transacción aquí al detectar el pago completo
    const carId = 'car-123';
    const totalAmount = mockData.amount;

    // CALCULO DEL LEDGER VIRTUAL (Split)
    const clinkarFee = totalAmount * CLINKAR_FEE_PERCENT;
    const sellerRemnant = totalAmount - clinkarFee;

    console.log(`[🧮 LEDGER] Calculando Distribución:`);
    console.log(`   - Total Recibido: $${totalAmount}`);
    console.log(`   - Clinkar Fee (5%): $${clinkarFee} (Se queda en cuenta concentradora)`);
    console.log(`   - Vendedor: $${sellerRemnant} (Pendiente de dispersión)`);

    const newTxn: Transaction = {
        id: transactionId,
        vehicle_id: carId,
        buyer_id: 'buyer-001',
        amount: totalAmount,
        status: 'FUNDS_HELD_IN_GATEWAY', // IMPORTANTE: El dinero está "en la pasarela/banco", no liberado
        gateway: 'STP',
        gateway_txn_id: speiResult.tracking_key,
        ledger_split: [
            { recipient: 'CLINKAR_MAIN', amount: clinkarFee, role: 'CLINKAR_FEE' },
            { recipient: 'SELLER_ACCOUNT', amount: sellerRemnant, role: 'SELLER' }
        ],
        created_at: new Date().toISOString()
    };

    db.createTransaction(newTxn);
    db.updateVehicle(carId, { status: 'RESERVED' });

    console.log(`[✅ ESTADO] Fondos asegurados. Vehículo RESERVADO. Esperando validación final.`);
}

// B. Riel Stripe: Auth Only
async function initiate_stripe_payment_controller(vehicleId: string) {
    console.log(`\n--- 💳 INICIO: Pre-autorización Stripe ---`);
    const car = db.getVehicle(vehicleId);
    if (!car) throw new Error("Car not found");

    const intent = await stripe.create_payment_intent(car.price);

    // Registrar intención
    const txnId = `txn_card_${Date.now()}`;
    const newTxn: Transaction = {
        id: txnId,
        vehicle_id: vehicleId,
        buyer_id: 'buyer-002',
        amount: car.price,
        status: 'CREATED',
        gateway: 'STRIPE',
        gateway_txn_id: intent.id,
        created_at: new Date().toISOString()
    };
    db.createTransaction(newTxn);
    console.log(`[✅ STRIPE] Intent creado ${intent.id}. Cliente debe confirmar en Frontend.`);

    return txnId; // Retornamos para usarlo luego
}

// C. EL BOTÓN ROJO (Liberación Condicional)
async function release_funds_to_seller(transactionId: string) {
    console.log(`\n--- 🚀 ACTION: Liberación de Fondos (El Botón Rojo) ---`);
    const txn = db.getTransaction(transactionId);
    if (!txn) { console.error("Txn not found"); return; }

    const car = db.getVehicle(txn.vehicle_id);
    if (!car) { console.error("Car not found"); return; }

    // 1. VALIDACIÓN DE ESTADOS
    console.log(`[👮 VALIDATOR] Auditando estados del vehículo ${car.id}...`);
    if (car.legal_status !== 'VERIFIED') {
        console.error(`[❌ BLOCK] Legal Status es ${car.legal_status}. Se requiere VERIFIED.`);
        return;
    }
    if (car.inspection_status !== 'CERTIFIED') {
        console.error(`[❌ BLOCK] Inspection Status es ${car.inspection_status}. Se requiere CERTIFIED.`);
        return;
    }
    console.log(`[✅ VALIDATOR] Todos los checks pasaron. Procediendo a liberar.`);

    // 2. EJECUCIÓN (Según Riel)
    if (txn.gateway === 'STP') {
        // Ejecutar dispersión real al vendedor
        const sellerShare = txn.ledger_split?.find(s => s.role === 'SELLER')?.amount || 0;
        if (sellerShare > 0) {
            await stp.disperse_to_account(sellerShare, "123456789012345678", `Venta Auto ${car.model}`);
            console.log(`[💸 PAYOUT] $${sellerShare} enviados al Vendedor.`);
        }
    } else if (txn.gateway === 'STRIPE') {
        // Ejecutar Capture
        await stripe.capture_funds(txn.gateway_txn_id!); // Application Fee se cobra automático en Stripe Connect
        console.log(`[💸 PAYOUT] Fondos capturados y movidos a cuenta Connected del vendedor.`);
    }

    // 3. ACTUALIZACIÓN FINAL
    db.updateTransaction(txn.id, { status: 'COMPLETED' });
    db.updateVehicle(car.id, { status: 'SOLD' });
    console.log(`[🎉 SUCCESS] Transacción Completada. Auto VENDIDO.`);
}


// --- EJECUCIÓN DEL FLUJO ---

async function runScenario() {
    console.log("=== SIMULACIÓN: ESCROW NO-CUSTODIAL (Pasarela Directa) ===");

    // ESCENARIO 1: Pago vía SPEI (Depósito Virtual)
    const speiTxnId = "ORD-SPEI-001";

    // Paso 1: Cliente deposita
    await process_incoming_spei_controller({ amount: 200000, concept_ref: speiTxnId });

    // Paso 2: Intento de liberar prematuro (Debe fallar)
    await release_funds_to_seller(speiTxnId);

    // Paso 3: Operaciones completan verificaciones
    console.log(`\n... (Verificando Documentos y Auto) ...`);
    await new Promise(r => setTimeout(r, 500));
    db.updateVehicle('car-123', { legal_status: 'VERIFIED', inspection_status: 'CERTIFIED' });
    console.log(`[📝 ADMIN] Estados actualizados manualmente a VERIFIED/CERTIFIED.`);

    // Paso 4: Liberación Exitosa
    await release_funds_to_seller(speiTxnId);
}

runScenario();
