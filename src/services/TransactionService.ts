import { Database } from '@/lib/database.types';
import { NotificationService } from './NotificationService';
import { SupabaseClient } from '@supabase/supabase-js';

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
        gestoriaQuote?: { active: boolean, cost: number };
        insuranceQuote?: { provider: string, cost: number };
        appliedPerkId?: string;
        metadata?: any;
    }): Promise<Transaction | null> {
        Logger.info(`[GATEKEEPER] Iniciando creación de transacción para ${data.sellerId} (Monto: $${data.amount})`);

        // 0. Concurrency Control lock
        const lockResult = await LockService.acquireLock(supabase, data.carId, data.buyerId, 15);
        if (!lockResult.success) {
            throw new Error(`RESOURCE_LOCKED: Vehículo temporalmente reservado y en proceso de pago por otro usuario. Por favor, espera e intenta de nuevo más tarde. Únete a la fila de este auto para ser el primero en fila.`);
        }

        // 1. PLD / AML Screening
        const sellerName = "Seller Name Placeholder";
        const pldResult = await PldService.screenPerson(supabase, data.sellerId, sellerName, undefined, 'TRANSACTION');

        if (pldResult.riskLevel === 'BLOCKED') {
            await (supabase.from('audit_logs') as any).insert({
                actor_id: data.sellerId,
                action: 'ATTEMPT_BLOCKED',
                entity_type: 'TRANSACTION',
                metadata: { reason: 'PLD_BLOCKED', details: pldResult.matches },
                ip_address: '0.0.0.0'
            });
            throw new Error("OPERACIÓN BLOQUEADA: Su perfil presenta restricciones de cumplimiento normativo (PLD).");
        }

        // 2. AML Thresholds
        const UMBRAL_IDENTIFICACION = 360000;
        if (data.amount > UMBRAL_IDENTIFICACION) {
            const { data: profile } = await (supabase.from('risk_profiles') as any)
                .select('verification_status')
                .eq('user_id', data.sellerId)
                .maybeSingle();
            if (profile?.verification_status !== 'VERIFIED') {
                throw new Error("KYC_REQUIRED: Para operar montos mayores a $360,000 MXN, necesitamos verificar tu identidad.");
            }
        }

        // 3. Calculate Commissions
        // 3.1 Buyer Commission (Free on 1st purchase)
        const { count: previousPurchases } = await (supabase
            .from('transactions') as any)
            .select('*', { count: 'exact', head: true })
            .eq('buyer_id', data.buyerId)
            .eq('status', 'RELEASED');
        
        const isFirstPurchase = (previousPurchases || 0) === 0;
        const buyerCommission = isFirstPurchase ? PRICING_CONFIG.BUYER_FIRST_PURCHASE_FEE : PRICING_CONFIG.BUYER_STANDARD_SERVICE_FEE;

        // 3.2 Seller Fee (3.5% standard, check for discounts)
        let sellerFeePercent = PRICING_CONFIG.SELLER_SUCCESS_FEE_PERCENT;
        const { data: feeDiscount } = await (supabase
            .from('user_perks') as any)
            .select('id')
            .eq('user_id', data.sellerId)
            .eq('perk_type', 'FEE_DISCOUNT')
            .eq('status', 'AVAILABLE')
        
        // 3.3 Optional Discount Perks (Referrals)
        let appliedPerk = null;
        if (data.appliedPerkId) {
            const { data: perk } = await (supabase.from('user_perks') as any).select('*').eq('id', data.appliedPerkId).single();
            if (perk && perk.status === 'AVAILABLE') {
                appliedPerk = perk;
                sellerFeePercent = sellerFeePercent * (PRICING_CONFIG.REFERRAL_REWARD_FEE_DISCOUNT_PERCENT / 100);
                Logger.info(`[PRICING] Applying ${PRICING_CONFIG.REFERRAL_REWARD_FEE_DISCOUNT_PERCENT}% discount to seller ${data.sellerId}`);
            }
        }

        const sellerSuccessFee = (data.amount * sellerFeePercent) / 100;
        const totalAmount = data.amount + 
            (data.logisticsQuote?.cost || 0) + 
            (data.warrantyQuote?.cost || 0) + 
            (data.gestoriaQuote?.cost || 0) + 
            (data.insuranceQuote?.cost || 0);

        // 4. Create Transaction
        const { data: transaction, error } = await (supabase
            .from('transactions') as any)
            .insert({
                car_id: data.carId,
                buyer_id: data.buyerId,
                seller_id: data.sellerId,
                car_price: data.amount,
                status: 'PENDING'
            })
            .select()
            .single();

        if (error) {
            if (error.code === '42501') {
                Logger.error('[TransactionService] RLS Error: El usuario no tiene permisos para insertar en la tabla "transactions".');
                throw new Error("ERROR DE PERMISOS (RLS): No tienes permiso para registrar esta transacción en la base de datos. Por favor verifica las políticas de Supabase.");
            }
            Logger.error('Error creating transaction:', error);
            throw new Error(error?.message || 'Transaction creation failed');
        }

        if (!transaction) throw new Error('No se pudo crear el registro de la transacción.');

        const typedTransaction = transaction as any;

        // 4.1 Side Orders
        if (data.logisticsQuote) {
            await (supabase.from('logistics_orders') as any).insert({
                transaction_id: transaction.id,
                origin_address: data.logisticsQuote.origin,
                destination_address: data.logisticsQuote.dest,
                distance_km: data.logisticsQuote.distance,
                cost: data.logisticsQuote.cost,
                status: 'PENDING'
            });
        }

        if (data.warrantyQuote) {
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + (data.warrantyQuote.type === 'STANDARD' ? 3 : 12));
            await (supabase.from('warranty_policies') as any).insert({
                car_id: data.carId,
                transaction_id: transaction.id,
                type: data.warrantyQuote.type,
                status: 'PENDING',
                start_date: new Date().toISOString(),
                end_date: endDate.toISOString(),
                coverage_cap_amount: data.warrantyQuote.cost * 10,
                coverage_details: {}
            });
        }

        // 5. Audit & Notif
        await (supabase.from('audit_logs') as any).insert({
            actor_id: data.sellerId,
            action: 'CREATE_TRANSACTION',
            entity_type: 'TRANSACTION',
            entity_id: transaction.id,
            metadata: { totalAmount, buyerCommission, sellerSuccessFee },
            ip_address: '127.0.0.1'
        });

        await NotificationService.notify(supabase, {
            userId: data.sellerId,
            title: "Nueva Oferta Recibida",
            message: `Oferta por $${data.amount.toLocaleString()}. Comisión: $${sellerSuccessFee.toLocaleString()}.`,
            type: 'INFO',
            link: `/dashboard/transactions/${transaction.id}`
        });

        return transaction;
    }

    static async updateTransactionStatusBySessionId(
        supabase: SupabaseClient<Database>,
        sessionId: string,
        status: 'PENDING' | 'IN_VAULT' | 'RELEASED' | 'CANCELLED'
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
        const query = (supabase
            .from('transactions') as any)
            .select("*")
            .eq('id', id)
            .maybeSingle();

        const { data, error } = await query;

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
            .select("*")
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
            .select('id, buyer_id, seller_id, status, car_price')
            .eq('id', transactionId)
            .single();

        if (fetchError || !transaction) {
            Logger.error('Error fetching transaction for handover:', fetchError);
            return { success: false, error: 'TRANSACCION_NO_ENCONTRADA' };
        }

        // 2. Validate status (Must be P2P_VALIDATED or HANDOVER_SCHEDULED)
        if (!['P2P_VALIDATED', 'HANDOVER_SCHEDULED'].includes(transaction.status)) {
            Logger.warn(`[Security] Attempt to confirm handover for tx ${transactionId} in status ${transaction.status}`);
            return { success: false, error: 'ESTADO_INVALIDO: El pago no ha sido validado aún.' };
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

        // 4. Trigger Referral Rewards
        try {
            await ReferralService.markOperationAsClosed(supabase, transactionId);
            Logger.info(`[REFERRAL] Recompensas procesadas para tx ${transactionId}`);
        } catch (err) {
            Logger.error(`[REFERRAL] Error procesando recompensas de referido:`, err);
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
