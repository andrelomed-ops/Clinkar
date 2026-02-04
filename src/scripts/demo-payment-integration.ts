
import { payForInspection } from '../actions/payment-actions';

async function runDemo() {
    console.log("🎬 INICIANDO DEMOSTRACIÓN DE PAGO... \n");

    // Escenario 1: Pago vía SPEI
    console.log("▶️ ESCENARIO 1: Usuario paga inspección vía SPEI");
    const resultSPEI = await payForInspection('auto-demo-spei-123', 'spei');

    if (resultSPEI.success) {
        console.log(`✅ ÉXITO SPEI: Ticket ${resultSPEI.data?.ticketId} generado. Auto agendado.`);
    } else {
        console.error(`❌ ERROR: ${resultSPEI.error}`);
    }

    console.log("\n-------------------------------------------------\n");

    // Escenario 2: Pago vía Tarjeta
    console.log("▶️ ESCENARIO 2: Usuario paga con Tarjeta (Stripe)");
    const resultCard = await payForInspection('auto-demo-card-456', 'card');

    if (resultCard.success) {
        console.log(`✅ ÉXITO TARJETA: Ticket ${resultCard.data?.ticketId} generado. ID Transacción: ${resultCard.data?.transactionRef}`);
    } else {
        console.error(`❌ ERROR: ${resultCard.error}`);
    }

    console.log("\n🏁 FIN DE DEMOSTRACIÓN");
}

runDemo();
