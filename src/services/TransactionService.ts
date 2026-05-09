import { Database } from '@/lib/database.types';
import { NotificationService } from './NotificationService';
import { SupabaseClient } from '@supabase/supabase-js';
import { BaseService } from './BaseService';
import { Logger } from '@/lib/logger';
import { PRICING_CONFIG } from '@/config/pricing';
import { ReferralService } from './ReferralService';
import { LockService } from './LockService';
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
        metadata?: any;
    }): Promise<Transaction | null> {
        const isDepositOnly = data.metadata?.is_deposit_only || false;
        const depositAmount = data.metadata?.deposit_amount || 2500;

        Logger.info(`[TORRE-CONTROL] Creando transacción (${isDepositOnly ? 'DEPOSITO' : 'TOTAL'}) para auto ${data.carId}`);

        // 0. Concurrency Control lock
        const lockResult = await LockService.acquireLock(supabase, data.carId, data.buyerId, 15);
        if (!lockResult.success) {
            throw new Error(`RESOURCE_LOCKED: Vehículo temporalmente apartado.`);
        }

        const totalAmount = isDepositOnly ? depositAmount : (data.amount + (data.logisticsQuote?.cost || 0));

        // 4. Create Transaction
        const { data: transaction, error } = await (supabase
            .from('transactions') as any)
            .insert({
                car_id: data.carId,
                buyer_id: data.buyerId,
                seller_id: data.sellerId,
                car_price: data.amount,
                total_amount: totalAmount,
                status: isDepositOnly ? 'DEPOSIT_PAID' : 'PENDING',
                metadata: {
                    ...data.metadata,
                    is_non_refundable: true,
                    coordination_status: 'WAITING_ADMIN_ASSIGNMENT'
                }
            })
            .select()
            .single();

        if (error) throw new Error(error.message);

        // 5. NOTIFICACIÓN CENTRALIZADA (TORRE DE CONTROL)
        // Simulamos el envío al número maestro de WhatsApp
        const MASTER_ADMIN_WHATSAPP = "5215500000000"; // Número maestro configurado
        
        await NotificationService.notifyAdmin(supabase, {
            action: 'NUEVO_APARTADO_RECIBIDO',
            entityType: 'TRANSACTION',
            entityId: transaction.id,
            metadata: {
                master_phone: MASTER_ADMIN_WHATSAPP,
                deposit: depositAmount,
                car_id: data.carId,
                buyer_id: data.buyerId,
                message: `[ALERTA] Apartado de $${depositAmount} recibido para Auto ID:${data.carId}. Asignar Árbitro.`
            }
        });

        return transaction;
    }

    static async assignArbitrator(supabase: SupabaseClient<Database>, transactionId: string, arbitratorId: string) {
        Logger.info(`[TORRE-CONTROL] Asignando Árbitro ${arbitratorId} a TX ${transactionId}`);
        
        const { error } = await (supabase.from('transactions') as any)
            .update({ 
                status: 'ARBITRATOR_ASSIGNED',
                metadata: {
                    arbitrator_assigned_at: new Date().toISOString(),
                    coordination_status: 'ARBITRATOR_NOTIFIED'
                }
            })
            .eq('id', transactionId);

        if (error) throw error;

        // El Árbitro solo recibe los datos de la cita, NO los del cliente.
        await NotificationService.notify(supabase, {
            userId: arbitratorId,
            title: "Nueva Misión: Arbitraje Asignado",
            message: "Se te ha asignado una inspección/entrega. Revisa tu panel para ver ubicación y hora. (Contactos bloqueados por Torre de Control)",
            type: 'INFO',
            link: `/dashboard/arbitrator/${transactionId}`
        });

        return { success: true };
    }


    static async updateTransactionStatusBySessionId(
        supabase: SupabaseClient<Database>,
        sessionId: string,
        status: string
    ): Promise<void> {
        const { data: transaction } = await (supabase
            .from('transactions') as any)
            .select('id, buyer_id, seller_id, car_price')
            .eq('stripe_session_id', sessionId)
            .maybeSingle();

        const { error } = await (supabase.from('transactions') as any)
            .update({ status })
            .eq('stripe_session_id', sessionId);

        if (error) {
            Logger.error(`Error updating transaction for session ${sessionId}:`, error);
            throw new Error(error.message);
        }

        if (transaction && status === 'P2P_WAITING_PROOF') {
            await NotificationService.notifyMultiple(supabase, [
                {
                    userId: transaction.buyer_id,
                    title: "Esperando Comprobante P2P",
                    message: "Por favor sube tu comprobante SPEI (CEP) para validación.",
                    type: 'FINANCIAL',
                    link: `/dashboard/transactions/${transaction.id}`
                },
                {
                    userId: transaction.seller_id,
                    title: "Pago en Proceso P2P",
                    message: `El comprador ha iniciado la transferencia de $${Number(transaction.car_price).toLocaleString()}.`,
                    type: 'FINANCIAL',
                    link: `/dashboard/transactions/${transaction.id}`
                }
            ]);
        }

        // Trigger referral rewards when transaction is RELEASED
        if (transaction && status === 'RELEASED') {
            try {
                await ReferralService.markOperationAsClosed(supabase, transaction.id);
                Logger.info(`[REFERRAL] Referral rewards processed for transaction ${transaction.id}`);
            } catch (err) {
                Logger.error(`[REFERRAL] Error processing referral rewards:`, err);
            }
        }
    }

    static async getTransactionBySessionId(supabase: SupabaseClient<Database>, sessionId: string): Promise<Transaction | null> {
        const { data: result, error } = await (supabase
            .from('transactions') as any)
            .select('*')
            .eq('stripe_session_id', sessionId)
            .maybeSingle();

        if (error || !result) return null;
        return result as any;
    }

    static async getTransactionById(supabase: SupabaseClient<Database>, id: string): Promise<Transaction | null> {
        const { data, error } = await (supabase
            .from('transactions') as any)
            .select("*, cars(*)")
            .eq('id', id)
            .maybeSingle();

        if (error || !data) {
            Logger.error(`Error fetching transaction by id: ${id}`, error);
            return null;
        }

        return data as Transaction;
    }

    static async getGlobalStats(supabase: SupabaseClient<Database>) {
        const { data: txs } = await (supabase
            .from('transactions') as any)
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
            if (tx.status === 'P2P_VALIDATED' || tx.status === 'HANDOVER_SCHEDULED') {
                vaultValue += Number(tx.car_price || 0);
            }
            totalServices += Number(tx.insurance_cost || 0) +
                Number(tx.logistics_cost || 0) +
                Number(tx.warranty_cost || 0) +
                Number(tx.gestoria_cost || 0);
            totalCommissions += Number(tx.buyer_commission || 0) +
                Number(tx.seller_success_fee || 0);
        });

        const { count: totalCount } = await (supabase
            .from('transactions') as any)
            .select('*', { count: 'exact', head: true });

        const { count: activeCount } = await (supabase
            .from('transactions') as any)
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

    static async validateCEP(supabase: SupabaseClient<Database>, transactionId: string, cepData: any) {
        Logger.info(`[P2P-VALIDATION] Validando CEP para transacción ${transactionId}`);
        
        // Simulation of Banxico CEP Validation
        const isValid = cepData.clave_rastreo && cepData.clave_rastreo.length > 10;

        if (isValid) {
            await (supabase.from('transactions') as any)
                .update({ 
                    status: 'P2P_VALIDATED',
                    metadata: { cep_validated_at: new Date().toISOString(), cep_details: cepData }
                })
                .eq('id', transactionId);

            return { success: true };
        }

        return { success: false, error: 'CEP_INVALIDO' };
    }

    static async getAllTransactions(supabase: SupabaseClient<Database>) {
        const { data, error } = await (supabase
            .from('transactions') as any)
            .select("*, cars(*)")
            .order('created_at', { ascending: false });

        if (error) {
            Logger.error('Error fetching all transactions:', error);
            return [];
        }

        return (data || []) as any[];
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
            })
            .eq('id', id);

        if (error) {
            Logger.error(`Error saving services for transaction ${id}:`, error);
            return { success: false, error };
        }

        return { success: true };
    }

    static async overrideTransactionStatus(supabase: SupabaseClient<Database>, id: string, status: string) {
        const { data: transaction } = await (supabase
            .from('transactions') as any)
            .select('buyer_id, seller_id')
            .eq('id', id)
            .maybeSingle();

        const { error } = await (supabase
            .from('transactions') as any)
            .update({
                status,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) {
            Logger.error(`Error overriding status for transaction ${id}:`, error);
            return { success: false, error };
        }

        if (transaction) {
            await NotificationService.notifyMultiple(supabase, [
                {
                    userId: transaction.buyer_id,
                    title: "Actualización Administrativa",
                    message: `Tu transacción ha sido actualizada manualmente a estado: ${status}.`,
                    type: 'WARNING',
                    link: `/dashboard/transactions/${id}`
                },
                {
                    userId: transaction.seller_id,
                    title: "Actualización Administrativa",
                    message: `Tu transacción ha sido actualizada manualmente a estado: ${status}.`,
                    type: 'WARNING',
                    link: `/dashboard/transactions/${id}`
                }
            ]);

            // [FIX] Update Car Status based on terminal transaction states
            const { data: txData } = await (supabase.from('transactions') as any).select('car_id').eq('id', id).single();
            if (txData?.car_id) {
                if (status === 'RELEASED') {
                    await (supabase.from('cars') as any).update({ status: 'SOLD' }).eq('id', txData.car_id);
                } else if (status === 'CANCELLED') {
                    await (supabase.from('cars') as any).update({ status: 'CERTIFIED' }).eq('id', txData.car_id);
                }
            }

            // [NEW] Trigger referral rewards if manual override to RELEASED
            if (status === 'RELEASED') {
                try {
                    await ReferralService.markOperationAsClosed(supabase, id);
                    Logger.info(`[REFERRAL] Referral rewards processed for transaction ${id} (Manual Override)`);
                } catch (err) {
                    Logger.error(`[REFERRAL] Error processing referral rewards (Manual Override):`, err);
                }
            }
        }

        return { success: true };
    }

    static async simulateSPEIDeposit(supabase: SupabaseClient<Database>, transactionId: string): Promise<boolean> {
        const { data: transaction, error: fetchError } = await (supabase
            .from('transactions') as any)
            .select('id, buyer_id, seller_id, car_id, car_price')
            .eq('id', transactionId)
            .maybeSingle();

        if (fetchError || !transaction) {
            Logger.error('Error fetching transaction for simulation:', fetchError);
            return false;
        }

        const vin = (transaction as any).cars?.vin || "VIN-NOT-FOUND";
        try {
            const theftData = await VehicleCheckService.verifyTheftStatus(supabase, vin);
            if (theftData.status === 'STOLEN') {
                Logger.error(`[FRAUD-BLOCK] Vehículo reportado como ROBADO: ${vin}.`);
                await (supabase.from('transactions') as any).update({ pld_status: 'BLOCKED_RISK' as any }).eq('id', transactionId);
                return false;
            }
            await VehicleCheckService.generateCertificate(supabase, transactionId, theftData);
        } catch (checkError) {
            Logger.error("Error en validación automática vehicular:", checkError);
        }

        await SpeiService.simulateIncomingSpei(supabase, transactionId, Number(transaction.car_price));
 
        const { error: updateError } = await (supabase
            .from('transactions') as any)
            .update({ status: 'P2P_VALIDATED' })
            .eq('id', transactionId);

        if (updateError) {
            Logger.error('Error updating transaction status:', updateError);
            return false;
        }

        // Release the temporary lock since the vehicle is now successfully bought/vaulted
        if (transaction.car_id) {
            await LockService.releaseLock(supabase, transaction.car_id);
            // Lock is released, now we update the car status to SOLD
            await (supabase.from('cars') as any).update({ status: 'SOLD' }).eq('id', transaction.car_id);
        }

        await NotificationService.notifyMultiple(supabase, [
            {
                userId: transaction.buyer_id,
                title: "Depósito Confirmado (SPEI)",
                message: "Hemos recibido tu transferencia.",
                type: 'FINANCIAL',
                link: `/dashboard/transactions/${transaction.id}`
            },
            {
                userId: transaction.seller_id,
                title: "¡Depósito Detectado!",
                message: `El comprador ha transferido $${Number(transaction.car_price).toLocaleString()} MXN.`,
                type: 'FINANCIAL',
                link: `/dashboard/sell`
            }
        ]);

        return true;
    }

    static getVirtualClabe(transactionId: string): string {
        return SpeiService.generateVirtualClabe(transactionId);
    }

    static async confirmP2PHandover(supabase: SupabaseClient<Database>, transactionId: string): Promise<{ success: boolean; error?: any }> {
        Logger.info(`[P2P-HANDOVER] Confirmando entrega y liberación P2P para transacción ${transactionId}`);

        // 1. Fetch transaction details
        const { data: transaction, error: fetchError } = await (supabase
            .from('transactions') as any)
            .select('id, buyer_id, seller_id, status, car_price, car_id')
            .eq('id', transactionId)
            .single();

        if (fetchError || !transaction) {
            Logger.error('Error fetching transaction for handover:', fetchError);
            return { success: false, error: 'TRANSACCION_NO_ENCONTRADA' };
        }

        // 2. Validate status (Must be P2P_VALIDATED, HANDOVER_SCHEDULED, RESERVED, or PENDING)
        const allowedStatuses = ['P2P_VALIDATED', 'HANDOVER_SCHEDULED', 'RESERVED', 'PENDING'];
        if (!allowedStatuses.includes(transaction.status)) {
            Logger.warn(`[Security] Attempt to confirm handover for tx ${transactionId} in status ${transaction.status}`);
            return { success: false, error: `[V4] ESTADO_INVALIDO: El estado actual es ${transaction.status}. Se requiere PENDING, RESERVED o VALIDATED.` };
        }

        // 3. Update status to RELEASED
        const { error: updateError } = await (supabase
            .from('transactions') as any)
            .update({ 
                status: 'RELEASED',
                updated_at: new Date().toISOString()
            })
            .eq('id', transactionId);

        if (updateError) {
            Logger.error('Error updating transaction status to RELEASED:', updateError);
            return { success: false, error: updateError.message };
        }

        // 3.1 Update car status to SOLD
        if ((transaction as any).car_id) {
            await (supabase.from('cars') as any)
                .update({ status: 'SOLD' })
                .eq('id', (transaction as any).car_id);
        }

        // 4. Trigger Referral Rewards & Admin Notification
        try {
            await ReferralService.markOperationAsClosed(supabase, transactionId);
            
            // [NEW] Notify Admin for Commission Tracking
            const { data: carData } = await (supabase.from('cars').select('make, model, price').eq('id', transaction.car_id).single() as any);
            await NotificationService.notifyAdmin(supabase, {
                action: 'VENTA_P2P_FINALIZADA',
                entityType: 'TRANSACTION',
                entityId: transactionId,
                metadata: {
                    car: carData ? `${(carData as any).make} ${(carData as any).model}` : 'Vehículo',
                    amount: (carData as any)?.price || transaction.car_price,
                    seller_id: transaction.seller_id,
                    buyer_id: transaction.buyer_id
                }
            });

            Logger.info(`[P2P-SUCCESS] Admin notified for tx ${transactionId}`);
        } catch (err) {
            Logger.error(`[P2P-SUCCESS] Background tasks error:`, err);
        }


        // 5. Notify both parties
        await NotificationService.notifyMultiple(supabase, [
            {
                userId: transaction.buyer_id,
                title: "Trato Seguro StarterKar Finalizado",
                message: "Has confirmado la recepción del auto. ¡Felicidades!",
                type: 'FINANCIAL',
                link: `/dashboard/transactions/${transactionId}`
            },
            {
                userId: transaction.seller_id,
                title: "Venta Confirmada P2P",
                message: `El comprador ha confirmado la entrega. Tu comisión de éxito de 3.5% está pendiente de facturación.`,
                type: 'FINANCIAL',
                link: `/dashboard/transactions/${transactionId}`
            }
        ]);

        return { success: true };
    }
}
