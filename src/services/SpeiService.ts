import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

/**
 * Servicio de Dispersión SPEI (Simulación STP)
 * Genera cuentas CLABE virtuales y simula la dispersión de fondos.
 */
export class SpeiService {

    // Prefijo de STP (Sistema de Transferencias y Pagos) = 646
    private static STP_PREFIX = '646';
    private static CLINKAR_PLAZA = '180'; // Plaza Ciudad de México

    /**
     * Genera una CLABE única determinística para una transacción.
     * En producción, esto se solicita a la API de STP.
     */
    static generateVirtualClabe(transactionId: string): string {
        // Algoritmo mock para generar una CLABE válida de 18 dígitos
        // 646 (Banco) + 180 (Plaza) + 11 dígitos random + 1 dígito verificador

        // Usamos parte del ID para que sea "determinística" en este demo
        const uniquePart = transactionId.replace(/\D/g, '').substring(0, 11).padEnd(11, '0');
        const rawClabe = `${this.STP_PREFIX}${this.CLINKAR_PLAZA}${uniquePart}`;
        const checkDigit = this.calculateCheckDigit(rawClabe);

        return `${rawClabe}${checkDigit}`;
    }

    /**
     * Simula la recepción de un SPEI y la dispersión inmediata.
     */
    static async simulateIncomingSpei(
        supabase: SupabaseClient<Database>,
        transactionId: string,
        amount: number
    ) {
        console.log(`[STP-WEBHOOK] Recibido depósito SPEI de $${amount} para Tx: ${transactionId}`);

        // 1. Validar Monto
        // En producción, si depositan de menos, se queda en saldo pendiente.

        // 2. Dispersión Automática (Split)
        const clinkarFee = amount * 0.04;
        const sellerPayout = amount - clinkarFee;

        console.log(`[STP-DISPERSION] Ejecutando Split:`);
        console.log(` -> $${sellerPayout.toLocaleString()} al Vendedor (Cuenta Enlazada)`);
        console.log(` -> $${clinkarFee.toLocaleString()} a Clinkar Revenue`);

        // 3. Registrar en BD (Audit Trail)
        await supabase.from('audit_logs' as any).insert({
            action: 'SPEI_RECEIVED_SPLIT',
            entity_type: 'TRANSACTION',
            entity_id: transactionId,
            metadata: {
                total_received: amount,
                clinkar_fee: clinkarFee,
                seller_payout: sellerPayout,
                stp_tracking_key: `TR-${Date.now()}`
            },
            ip_address: 'STP-WEBHOOK'
        } as any);

        return true;
    }

    private static calculateCheckDigit(clabeBase: string): number {
        // Algoritmo simplificado para demo (dígito random)
        return Math.floor(Math.random() * 10);
    }
}
