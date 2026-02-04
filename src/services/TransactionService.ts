import { Database } from '@/lib/database.types';
import { NotificationService } from './NotificationService';
import { SupabaseClient } from '@supabase/supabase-js';
import { BaseService } from './BaseService';
import { TransactionSchema } from './schemas';
import { PldService } from './PldService';
import { VehicleCheckService } from './VehicleCheckService';
import { SpeiService } from './SpeiService';

export type Transaction = Database['public']['Tables']['transactions']['Row'];

export class TransactionService extends BaseService {
    static async createTransaction(supabase: SupabaseClient<Database>, data: {
        carId: string;
        buyerId: string;
        sellerId: string;
        amount: number;
        stripeSessionId: string;
        // Optional Services
        logisticsQuote?: { cost: number; distance: number; origin: string; dest: string };
        warrantyQuote?: { cost: number; type: 'STANDARD' | 'EXTENDED' };
    }): Promise<Transaction | null> {
        console.log(`[GATEKEEPER] Iniciando creación de transacción para ${data.sellerId} (Monto: $${data.amount})`);

        // 1. PLD / AML Screening (PRE-TRANSACTION)
        // ... (Existing PLD logic) ...
        // Se ejecuta el screening antes de tocar el ledger de transacciones.
        // Simulamos obtener el nombre del vendedor (en producción vendría de la sesión o perfil)
        const sellerName = "Seller Name Placeholder"; // In a real flow, fetch profile first.

        const pldResult = await PldService.screenPerson(supabase, data.sellerId, sellerName, undefined, 'TRANSACTION');

        if (pldResult.riskLevel === 'BLOCKED') {
            const auditPayload = {
                action: 'BLOCK_TRANSACTION',
                reason: 'PLD_RISK_DETECTED',
                details: pldResult.matches
            };
            // Log de Intento Fallido
            await supabase.from('audit_logs' as any).insert({
                actor_id: data.sellerId,
                action: 'ATTEMPT_BLOCKED',
                entity_type: 'TRANSACTION',
                metadata: auditPayload,
                ip_address: '127.0.0.1' // Should be passed from request
            } as any);
            throw new Error("OPERACIÓN BLOQUEADA: Su perfil presenta restricciones de cumplimiento normativo (PLD). Contacte a soporte código #ERR-AML-99.");
        }

        // 2. AML Thresholds
        const UMBRAL_IDENTIFICACION = 360000;
        const UMBRAL_AVISO = 720000;

        if (data.amount > UMBRAL_IDENTIFICACION) {
            console.log(`[AML-ALERT] Operación supera umbral de identificación ($${UMBRAL_IDENTIFICACION}). Verificando estatus KYC...`);

            // Check KYC Status in DB
            const { data: profile } = await supabase
                .from('risk_profiles' as any)
                .select('verification_status')
                .eq('user_id', data.sellerId)
                .single();

            const status = (profile as any)?.verification_status || 'UNVERIFIED';

            if (status !== 'VERIFIED') {
                // SOFT BLOCK: Require Identity Verification
                throw new Error("KYC_REQUIRED: Para operar montos mayores a $360,000 MXN, necesitamos verificar tu identidad. Visita tu Centro de Seguridad.");
            }
        }

        if (data.amount > UMBRAL_AVISO) {
            console.warn(`[AML-CRITICAL] Operación supera umbral de AVISO ($${UMBRAL_AVISO}). Se requiere reporte a UIF.`);
        }

        // 3. Create Transaction (Including Services)
        const totalAmount = data.amount + (data.logisticsQuote?.cost || 0) + (data.warrantyQuote?.cost || 0);

        const { data: transaction, error } = await supabase
            .from('transactions')
            .insert({
                car_id: data.carId,
                buyer_id: data.buyerId,
                seller_id: data.sellerId,
                car_price: data.amount, // Base car price

                // Add-ons
                logistics_cost: data.logisticsQuote?.cost || 0,
                warranty_cost: data.warrantyQuote?.cost || 0,

                stripe_session_id: data.stripeSessionId,
                status: 'PENDING',
                pld_status: pldResult.riskLevel === 'CLEAN' ? 'APPROVED' : 'PENDING',
                risk_metadata: pldResult
            } as any)
            .select()
            .single();

        const typedTransaction = transaction as any;

        if (error) {
            console.error('Error creating transaction:', error);
            throw new Error(error.message);
        }

        // 3.1 Create Side Orders (Async)
        if (data.logisticsQuote) {
            // We would import LogisticsService here to avoid circular dep issues if possible
            // or just insert raw for now since we are in TransactionService
            // @ts-ignore
            await supabase.from('logistics_orders' as any).insert({
                transaction_id: typedTransaction.id,
                origin_address: data.logisticsQuote.origin,
                destination_address: data.logisticsQuote.dest,
                distance_km: data.logisticsQuote.distance,
                cost: data.logisticsQuote.cost,
                status: 'PENDING'
            });
        }

        if (data.warrantyQuote) {
            const durationMonths = data.warrantyQuote.type === 'STANDARD' ? 3 : 12;
            const now = new Date();
            const endDate = new Date(now);
            endDate.setMonth(now.getMonth() + durationMonths);

            // @ts-ignore
            await supabase.from('warranty_policies' as any).insert({
                car_id: data.carId,
                transaction_id: typedTransaction.id,
                type: data.warrantyQuote.type,
                status: 'PENDING', // Active upon payment
                start_date: now.toISOString(),
                end_date: endDate.toISOString(),
                coverage_cap_amount: data.warrantyQuote.cost * 10
            });
        }

        // 4. Audit Log
        await supabase.from('audit_logs' as any).insert({
            actor_id: data.sellerId,
            action: 'CREATE_TRANSACTION',
            entity_type: 'TRANSACTION',
            entity_id: typedTransaction.id,
            metadata: {
                amount: totalAmount,
                base_price: data.amount,
                logistics: data.logisticsQuote?.cost,
                warranty: data.warrantyQuote?.cost
            },
            ip_address: '127.0.0.1'
        } as any);

        await NotificationService.notify(supabase, {
            userId: data.sellerId,
            title: "Nueva Oferta Recibida",
            message: `Un comprador está interesado en tu vehículo por $${data.amount.toLocaleString()} (más servicios).`,
            type: 'INFO',
            link: `/dashboard/transactions/${typedTransaction?.id}`
        });

        return typedTransaction;
    }

    static async updateTransactionStatusBySessionId(
        supabase: SupabaseClient<Database>,
        sessionId: string,
        status: 'PENDING' | 'IN_VAULT' | 'RELEASED' | 'CANCELLED'
    ): Promise<void> {
        const { data: transaction } = await supabase
            .from('transactions')
            .select('id, buyer_id, seller_id, car_price')
            .eq('stripe_session_id', sessionId)
            .single();

        const { error } = await (supabase
            .from('transactions') as any)
            .update({ status } as Database['public']['Tables']['transactions']['Update'])
            .eq('stripe_session_id', sessionId);

        if (error) {
            console.error(`Error updating transaction for session ${sessionId}:`, error);
            throw new Error(error.message);
        }

        if (transaction && status === 'IN_VAULT') {
            const t = transaction as any;
            await NotificationService.notifyMultiple(supabase, [
                {
                    userId: t.buyer_id,
                    title: "Pago Exitoso",
                    message: "Tus fondos están protegidos en nuestra Bóveda (Escrow).",
                    type: 'FINANCIAL',
                    link: `/dashboard/transactions/${t.id}`
                },
                {
                    userId: t.seller_id,
                    title: "Fondos en Bóveda",
                    message: `El comprador ha pagado $${Number(t.car_price).toLocaleString()}. Los fondos están asegurados por Clinkar.`,
                    type: 'FINANCIAL',
                    link: `/dashboard/transactions/${t.id}`
                }
            ]);
        }
    }

    static async getTransactionBySessionId(supabase: SupabaseClient<Database>, sessionId: string): Promise<Transaction | null> {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('stripe_session_id', sessionId)
            .single();

        if (error) {
            console.error(`Error getting transaction for session ${sessionId}:`, error);
            return null;
        }
        return data as any;
    }

    static async getTransactionById(supabase: SupabaseClient<Database>, id: string): Promise<Transaction | null> {
        const query = supabase
            .from('transactions')
            .select(`
                *,
                cars (*)
            `)
            .eq('id', id)
            .single();

        const result = await this.validateAndHandle(query as any, TransactionSchema);

        if (!result.success) {
            console.error(`[Fail-Safe] Error getting transaction ${id}:`, result.error);
            return null;
        }

        return result.data as any;
    }

    static async getGlobalStats(supabase: SupabaseClient<Database>) {
        const { data: txs } = await supabase
            .from('transactions')
            .select(`
                car_price, 
                buyer_commission, 
                seller_success_fee, 
                insurance_cost, 
                logistics_cost, 
                warranty_cost, 
                gestoria_cost,
                status
            `)
            .neq('status', 'CANCELLED');

        let gmv = 0;
        let vaultValue = 0;
        let totalServices = 0;
        let totalCommissions = 0;

        txs?.forEach((tx: any) => {
            gmv += Number(tx.car_price || 0);
            if (tx.status === 'IN_VAULT') {
                vaultValue += Number(tx.car_price || 0);
            }
            totalServices += Number(tx.insurance_cost || 0) +
                Number(tx.logistics_cost || 0) +
                Number(tx.warranty_cost || 0) +
                Number(tx.gestoria_cost || 0);
            totalCommissions += Number(tx.buyer_commission || 0) +
                Number(tx.seller_success_fee || 0);
        });

        const { count: totalCount } = await supabase
            .from('transactions')
            .select('*', { count: 'exact', head: true });

        const { count: activeCount } = await supabase
            .from('transactions')
            .select('*', { count: 'exact', head: true })
            .in('status', ['PENDING', 'IN_VAULT']);

        return {
            gmv,
            vaultValue,
            serviceRevenue: totalServices,
            commissionRevenue: totalCommissions,
            totalTransactions: totalCount || 0,
            activeTransactions: activeCount || 0,
            lastUpdated: new Date().toISOString()
        };
    }

    static async getAllTransactions(supabase: SupabaseClient<Database>) {
        const { data, error } = await supabase
            .from('transactions')
            .select(`
                *,
                cars (id, make, model, year, vin, plate, documents),
                buyer:buyer_id (id, full_name, email),
                seller:seller_id (id, full_name, email)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching all transactions:', error);
            return [];
        }

        return data as any[];
    }

    static async updateTransactionServices(supabase: SupabaseClient<Database>, id: string, services: {
        insuranceId?: string;
        insuranceCost?: number;
        logisticsId?: string;
        logisticsCost?: number;
        warrantyId?: string;
        warrantyCost?: number;
        gestoriaCost?: number;
    }) {
        const { error } = await (supabase
            .from('transactions') as any)
            .update({
                insurance_id: services.insuranceId || null,
                insurance_cost: services.insuranceCost || 0,
                logistics_id: services.logisticsId || null,
                logistics_cost: services.logisticsCost || 0,
                warranty_id: services.warrantyId || null,
                warranty_cost: services.warrantyCost || 0,
                gestoria_cost: services.gestoriaCost || 0,
                updated_at: new Date().toISOString()
            } as Database['public']['Tables']['transactions']['Update'])
            .eq('id', id);

        if (error) {
            console.error(`Error saving services for transaction ${id}:`, error);
            return { success: false, error };
        }

        return { success: true };
    }

    static async overrideTransactionStatus(supabase: SupabaseClient<Database>, id: string, status: string) {
        const { data: transaction } = await supabase
            .from('transactions')
            .select('buyer_id, seller_id')
            .eq('id', id)
            .single();

        const { error } = await (supabase
            .from('transactions') as any)
            .update({
                status,
                updated_at: new Date().toISOString()
            } as Database['public']['Tables']['transactions']['Update'])
            .eq('id', id);

        if (error) {
            console.error(`Error overriding status for transaction ${id}:`, error);
            return { success: false, error };
        }

        if (transaction) {
            const t = transaction as any;
            await NotificationService.notifyMultiple(supabase, [
                {
                    userId: t.buyer_id,
                    title: "Actualización Administrativa",
                    message: `Tu transacción ha sido actualizada manualmente a estado: ${status}.`,
                    type: 'WARNING',
                    link: `/dashboard/transactions/${id}`
                },
                {
                    userId: t.seller_id,
                    title: "Actualización Administrativa",
                    message: `Tu transacción ha sido actualizada manualmente a estado: ${status}.`,
                    type: 'WARNING',
                    link: `/dashboard/transactions/${id}`
                }
            ]);
        }

        return { success: true };
    }

    static async simulateSPEIDeposit(supabase: SupabaseClient<Database>, transactionId: string): Promise<boolean> {
        const { data: transaction, error: fetchError } = await supabase
            .from('transactions')
            .select('id, buyer_id, seller_id, car_price')
            .eq('id', transactionId)
            .single();

        if (fetchError || !transaction) {
            console.error('Error fetching transaction for simulation:', fetchError);
            return false;
        }

        // --- AUTOMATED VEHICLE THEFT CHECK (OCRA/REPUVE) ---
        // "Just-in-Time" Validacion para prevenir fraude de ultima milla
        const vin = (transaction as any).cars?.vin || "VIN-NOT-FOUND";
        try {
            // 1. Run Check
            const theftData = await VehicleCheckService.verifyTheftStatus(supabase, vin);

            // 2. Enforce Hard Block
            if (theftData.status === 'STOLEN') {
                console.error(`[FRAUD-BLOCK] Vehículo reportado como ROBADO: ${vin}. Folio: ${theftData.folio}`);

                // Log Audit
                await supabase.from('audit_logs' as any).insert({
                    action: 'BLOCK_TRANSACTION_THEFT',
                    entity_type: 'TRANSACTION',
                    entity_id: transactionId,
                    metadata: theftData,
                    ip_address: 'SYSTEM_BOT',
                    created_at: new Date().toISOString()
                } as any);

                // Update Transaction Metadata with Fraud Alert (don't release funds)
                await (supabase.from('transactions') as any).update({
                    pld_status: 'BLOCKED_RISK',
                    risk_metadata: { ...((transaction as any).risk_metadata || {}), theft_check: theftData }
                }).eq('id', transactionId);

                // Notify Admins
                // In production: Send Slack/Email Alert
                return false;
            }

            // 3. Generate Evidence (Certificate)
            await VehicleCheckService.generateCertificate(supabase, transactionId, theftData);

        } catch (checkError) {
            console.error("Error en validación automática vehicular:", checkError);
            // Decide: Fail safe? Block if check fails? For now, we log and proceed but in production we might pause.
        }
        // ---------------------------------------------------

        // EXECUTE DISPERSION (STP SIMULATION)
        await SpeiService.simulateIncomingSpei(supabase, transactionId, Number((transaction as any).car_price));

        const { error: updateError } = await (supabase
            .from('transactions') as any)
            .update({ status: 'IN_VAULT' })
            .eq('id', transactionId);

        if (updateError) {
            console.error('Error updating transaction status:', updateError);
            return false;
        }

        const t = transaction as any;
        await NotificationService.notifyMultiple(supabase, [
            {
                userId: t.buyer_id,
                title: "Depósito Confirmado (SPEI)",
                message: "Hemos recibido tu transferencia. Tus fondos están en Bóveda.",
                type: 'FINANCIAL',
                link: `/dashboard/transactions/${t.id}`
            },
            {
                userId: t.seller_id,
                title: "¡Depósito Detectado!",
                message: `El comprador ha transferido $${Number(t.car_price).toLocaleString()} MXN. Dispersión programada.`,
                type: 'FINANCIAL',
                link: `/dashboard/sell`
            }
        ]);

        return true;
    }

    static getVirtualClabe(transactionId: string): string {
        return SpeiService.generateVirtualClabe(transactionId);
    }
}
