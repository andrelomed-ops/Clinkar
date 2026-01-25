
import { v4 as uuidv4 } from 'uuid';

// --- TYPES & INTERFACES ---

type OrderStatus = 'CREATED' | 'AWAITING_EXTERNAL_FUNDING' | 'SECURED_BY_PARTNER' | 'COMPLETED';

interface Order {
    id: string;
    car_id: string;
    buyer_id: string;
    total_price: number;
    down_payment: number;
    financed_amount: number;
    status: OrderStatus;
    clinkar_fee: number;
    seller_remnant_down_payment: number;
    bank_funding_status: 'PENDING' | 'RECEIVED';
    funding_proof_url?: string;
}

// --- MOCK SERVICES ---

class MockDatabase {
    public orders: Map<string, Order> = new Map();

    // Simulating a Bank Partner
    public partners = [
        { id: 'bank_santander_mock', name: 'Santander Consumer', role: 'PARTNER_FINANCIAL' }
    ];

    createOrder(order: Order) {
        this.orders.set(order.id, order);
        console.log(`[💾 DB] Orden creada: ${order.id} | Status: ${order.status}`);
    }

    getOrder(id: string) { return this.orders.get(id); }

    updateOrder(id: string, updates: Partial<Order>) {
        const o = this.orders.get(id);
        if (o) Object.assign(o, updates);
        console.log(`[💾 DB] Orden actualizada: ${id} -> ${o?.status}`);
    }
}

class MockStripeService {
    async charge_down_payment(amount: number) {
        console.log(`[💳 STRIPE] Cobrando Enganche: $${amount.toLocaleString()}...`);
        await new Promise(r => setTimeout(r, 600));
        return { success: true, txn_id: `ch_${uuidv4().substring(0, 8)}` };
    }
}

// --- LOGICA DE NEGOCIO ---

const db = new MockDatabase();
const stripe = new MockStripeService();

// CONFIGURACIÓN DE COSTOS
const CLINKAR_BASE_FEE_PERCENT = 0.05; // 5%
const MIN_CLINKAR_FEE = 5000; // Mínimo $5,000
const LEGAL_CHECK_COST = 2500;
const INSPECTION_COST = 1500;

// 1. Calculadora de Enganche Inteligente
function calculate_minimum_down_payment(carPrice: number): {
    min_down_payment: number,
    clinkar_fee: number,
    cost_breakdown: any
} {
    console.log(`\n--- 🧮 CALCULADORA: Auto de $${carPrice.toLocaleString()} ---`);

    // A. Calcular nuestra comisión ideal
    let fee = carPrice * CLINKAR_BASE_FEE_PERCENT;
    if (fee < MIN_CLINKAR_FEE) fee = MIN_CLINKAR_FEE;

    // B. Costos operativos fijos (Legal + Inspección)
    const operationalCosts = LEGAL_CHECK_COST + INSPECTION_COST;

    // C. El enganche debe cubrir AL MENOS: Comisión + Costos
    //    Esto asegura que Clinkar nunca "pone dinero" para operar.
    const revenueRequirement = fee + operationalCosts;

    // D. Regla de Negocio del Banco (ej. Mínimo 10%)
    const bankRuleMin = carPrice * 0.10;

    // E. Determinar el REAL mínimo
    const finalMinDownPayment = Math.max(revenueRequirement, bankRuleMin);

    console.log(`   - Comisión Calculada: $${fee.toLocaleString()}`);
    console.log(`   - Costos Operativos: $${operationalCosts.toLocaleString()}`);
    console.log(`   - Requerimiento Clinkar (Revenue Insurance): $${revenueRequirement.toLocaleString()}`);
    console.log(`   - Requerimiento Banco (10%): $${bankRuleMin.toLocaleString()}`);
    console.log(`   => ENGANCHE MÍNIMO FINAL: $${finalMinDownPayment.toLocaleString()}`);

    return {
        min_down_payment: finalMinDownPayment,
        clinkar_fee: fee,
        cost_breakdown: { operationalCosts }
    };
}

// 2. Controlador: Pago de Enganche
async function pay_down_payment_controller(
    carId: string,
    carPrice: number,
    buyerId: string,
    offeredDownPayment: number
) {
    console.log(`\n--- 💸 PROCESO: Pago de Enganche ---`);

    // Validar monto
    const calc = calculate_minimum_down_payment(carPrice);
    if (offeredDownPayment < calc.min_down_payment) {
        throw new Error(`El enganche ofrecido ($${offeredDownPayment}) es menor al mínimo requerido ($${calc.min_down_payment}).`);
    }

    // Cobrar
    const charge = await stripe.charge_down_payment(offeredDownPayment);
    if (!charge.success) throw new Error("Pago fallido");

    console.log(`[✅ PAGO] Enganche cobrado exitosamente. Ref: ${charge.txn_id}`);

    // Split Virtual: ¿Cuánto es para Clinkar y cuánto sobra del enganche para el vendedor?
    // NOTA: El vendedor NO recibe nada todavía. Todo se guarda.
    const sellerRemnant = offeredDownPayment - calc.clinkar_fee - calc.cost_breakdown.operationalCosts;

    // Crear Orden
    const orderId = `ORD-${uuidv4().substring(0, 6)}`;
    const newOrder: Order = {
        id: orderId,
        car_id: carId,
        buyer_id: buyerId,
        total_price: carPrice,
        down_payment: offeredDownPayment,
        financed_amount: carPrice - offeredDownPayment,
        status: 'AWAITING_EXTERNAL_FUNDING', // Esperando al banco
        clinkar_fee: calc.clinkar_fee,
        seller_remnant_down_payment: sellerRemnant,
        bank_funding_status: 'PENDING'
    };

    db.createOrder(newOrder);

    // Generar "Certificado" Mock
    const certificateUrl = `https://clinkar.com/cert/down-payment/${orderId}.pdf`;
    console.log(`[📄 DOC] Certificado de Enganche generado: ${certificateUrl}`);
    console.log(`[⏳ STATUS] Orden en espera de fondeo bancario (Financed Amount: $${newOrder.financed_amount.toLocaleString()})`);

    return { success: true, orderId: orderId, certificateUrl };
}

// 3. Webhook: Simulación de Transferencia Bancaria
async function simulate_bank_transfer_webhook(payload: { order_id: string, amount_disbursed: number, proof_file: string }) {
    console.log(`\n--- 🏦 WEBHOOK: Notificación del Banco ---`);
    console.log(`[📩 EVENT] Recibido fondo de financiera para Orden ${payload.order_id}`);

    const order = db.getOrder(payload.order_id);
    if (!order) { console.error("Orden no encontrada"); return; }

    // Validación de Monto (El banco debe mandar lo correcto)
    // En la vida real, a veces cobran fee por transferencia, asumamos exacto por ahora
    if (payload.amount_disbursed < order.financed_amount) {
        console.warn(`[⚠️ ALERTA] El banco dispersó menos de lo esperado. ($${payload.amount_disbursed} vs $${order.financed_amount})`);
        // Lógica de disputa...
    }

    // Actualizar Estado
    db.updateOrder(order.id, {
        status: 'SECURED_BY_PARTNER',
        bank_funding_status: 'RECEIVED',
        funding_proof_url: payload.proof_file
    });

    console.log(`[✅ FONDEO] Crédito liquidado por el banco. Procediendo a liberar enganche...`);

    // 4. Liberación Automática del Enganche (Parte Vendedor)
    // Como el banco ya pagó (asumimos pago directo al vendedor o a cuenta puente),
    // nosotros liberamos el "Remanente del Enganche" que teníamos retenido.
    await release_partial_funds_to_seller(order);
}

async function release_partial_funds_to_seller(order: Order) {
    console.log(`[🚀 DISPERSIÓN] Liberando Remanente de Enganche al Vendedor...`);

    const amountToRelease = order.seller_remnant_down_payment;
    if (amountToRelease <= 0) {
        console.log(`[ℹ️ INFO] No hay remanente de enganche para liberar (Todo cubrió costos/fees).`);
        return;
    }

    // Simular llamada a STP/Stripe Payout
    console.log(`[💸 PAYOUT] Transfiriendo $${amountToRelease.toLocaleString()} al Vendedor...`);
    await new Promise(r => setTimeout(r, 500));

    db.updateOrder(order.id, { status: 'COMPLETED' });
    console.log(`[🎉 COMPLETE] Ciclo Cerrado. Vendedor recibió Enganche (por nosotros) + Crédito (por banco).`);
}


// --- EJECUCIÓN (Ejemplo) ---

async function runFinancingScenario() {
    try {
        const carPrice = 350000; // Auto de $350k

        // 1. Cliente paga enganche (Ej. $50,000)
        // El sistema calculará si es suficiente.
        const result = await pay_down_payment_controller('car-mx-99', carPrice, 'buyer-john', 50000);

        // 2. Tiempo pasa... el banco procesa la solicitud con el certificado
        console.log("\n... (3 días después: Banco aprueba y dispersa) ...\n");
        await new Promise(r => setTimeout(r, 1000));

        // 3. Banco notifica que ya pagó los $300k restantes
        await simulate_bank_transfer_webhook({
            order_id: result.orderId,
            amount_disbursed: 300000,
            proof_file: 'spei_receipt_santander.pdf'
        });

    } catch (e) {
        console.error("Error en simulación:", e);
    }
}

runFinancingScenario();
