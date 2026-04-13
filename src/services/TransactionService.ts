import { Database } from '@/lib/database.types';
import { NotificationService } from './NotificationService';
import { SupabaseClient } from '@supabase/supabase-js';
import { BaseService } from './BaseService';
import { TransactionSchema } from './schemas';
import { PldService } from './PldService';
import { VehicleCheckService } from './VehicleCheckService';
import { SpeiService } from './SpeiService';
import { Logger } from '@/lib/logger';
import { PRICING_CONFIG } from '@/config/pricing';
import { ReferralService } from './ReferralService';

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
        Logger.info(`[GATEKEEPER] Iniciando creación de transacción para ${data.sellerId} (Monto: $${data.amount})`);

        // 1. PLD / AML Screening
        const sellerName = "Seller Name Placeholder";
        const pldResult = await PldService.screenPerson(supabase, data.sellerId, sellerName, undefined, 'TRANSACTION');

        if (pldResult.riskLevel === 'BLOCKED') {
            await supabase.from('audit_logs' as any).insert({
                actor_id: data.sellerId,
                action: 'ATTEMPT_BLOCKED',
                entity_type: 'TRANSACTION',
                metadata: { reason: 'PLD_RISK_DETECTED', details: pldResult.matches },
                ip_address: '127.0.0.1'
            } as any);
            throw new Error("OPERACIÓN BLOQUEADA: Su perfil presenta restricciones de cumplimiento normativo (PLD).");
        }

        // 2. AML Thresholds
        const UMBRAL_IDENTIFICACION = 360000;
        if (data.amount > UMBRAL_IDENTIFICACION) {
            const { data: profile } = await supabase.from('risk_profiles' as any).select('verification_status').eq('user_id', data.sellerId).single();
            if ((profile as any)?.verification_status !== 'VERIFIED') {
                throw new Error("KYC_REQUIRED: Para operar montos mayores a $360,000 MXN, necesitamos verificar tu identidad.");
            }
        }

        // 3. Calculate Commissions
        // 3.1 Buyer Commission (Free on 1st purchase)
        const { count: previousPurchases } = await supabase
            .from('transactions')
            .select('*', { count: 'exact', head: true })
            .eq('buyer_id', data.buyerId)
            .eq('status', 'RELEASED');
        
        const isFirstPurchase = (previousPurchases || 0) === 0;
        const buyerCommission = isFirstPurchase ? PRICING_CONFIG.BUYER_FIRST_PURCHASE_FEE : PRICING_CONFIG.BUYER_STANDARD_SERVICE_FEE;

        // 3.2 Seller Fee (3.5% standard, check for discounts)
        let sellerFeePercent = PRICING_CONFIG.SELLER_SUCCESS_FEE_PERCENT;
        const { data: discountPerk } = await supabase
            .from('user_perks' as any)
            .select('id')
            .eq('user_id', data.sellerId)
            .eq('perk_type', 'FEE_DISCOUNT')
            .eq('status', 'AVAILABLE')
            .limit(1)
            .maybeSingle();

        if (discountPerk) {
            sellerFeePercent = sellerFeePercent * (PRICING_CONFIG.REFERRAL_REWARD_FEE_DISCOUNT_PERCENT / 100);
            Logger.info(`[PRICING] Applying ${PRICING_CONFIG.REFERRAL_REWARD_FEE_DISCOUNT_PERCENT}% discount to seller ${data.sellerId}`);
        }

        const sellerSuccessFee = (data.amount * sellerFeePercent) / 100;
        const totalAmount = data.amount + (data.logisticsQuote?.cost || 0) + (data.warrantyQuote?.cost || 0);

        // 4. Create Transaction
        const { data: transaction, error } = await supabase
            .from('transactions')
            .insert({
                car_id: data.carId,
                buyer_id: data.buyerId,
                seller_id: data.sellerId,
                car_price: data.amount,
                buyer_commission: buyerCommission,
                seller_success_fee: sellerSuccessFee,
                logistics_cost: data.logisticsQuote?.cost || 0,
                warranty_cost: data.warrantyQuote?.cost || 0,
                stripe_session_id: data.stripeSessionId,
                status: 'PENDING',
                pld_status: pldResult.riskLevel === 'CLEAN' ? 'APPROVED' : 'PENDING',
                risk_metadata: pldResult,
                metadata: discountPerk ? { used_perk_id: (discountPerk as any).id } : {}
            } as any)
            .select()
            .single();

        if (error || !transaction) {
            Logger.error('Error creating transaction:', error);
            throw new Error(error?.message || 'Transaction creation failed');
        }

        const typedTransaction = transaction as any;

        // 4.1 Side Orders
        if (data.logisticsQuote) {
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
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + (data.warrantyQuote.type === 'STANDARD' ? 3 : 12));
            await supabase.from('warranty_policies' as any).insert({
                car_id: data.carId,
                transaction_id: typedTransaction.id,
                type: data.warrantyQuote.type,
                status: 'PENDING',
                start_date: new Date().toISOString(),
                end_date: endDate.toISOString(),
                coverage_cap_amount: data.warrantyQuote.cost * 10
            });
        }

        // 5. Audit & Notif
        await supabase.from('audit_logs' as any).insert({
            actor_id: data.sellerId,
            action: 'CREATE_TRANSACTION',
            entity_type: 'TRANSACTION',
            entity_id: typedTransaction.id,
            metadata: { totalAmount, buyerCommission, sellerSuccessFee },
            ip_address: '127.0.0.1'
        } as any);

        await NotificationService.notify(supabase, {
            userId: data.sellerId,
            title: "Nueva Oferta Recibida",
            message: `Oferta por $${data.amount.toLocaleString()}. Comisión: $${sellerSuccessFee.toLocaleString()}.`,
            type: 'INFO',
            link: `/dashboard/transactions/${typedTransaction.id}`
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

        const { error } = await (supabase.from('transactions') as any)
            .update({ status })
            .eq('stripe_session_id', sessionId);

        if (error) {
            Logger.error(`Error updating transaction for session ${sessionId}:`, error);
            throw new Error(error.message);
        }

if (transaction && status === 'IN_VAULT') {
            const t = transaction as any;
            await NotificationService.notifyMultiple(supabase, [
                {
                    userId: t.buyer_id,
                    title: "Pago Exitoso",
                    message: "Fondos protegidos en Bóveda.",
                    type: 'FINANCIAL',
                    link: `/dashboard/transactions/${t.id}`
                },
                {
                    userId: t.seller_id,
                    title: "Fondos en bóveda",
                    message: `El comprador ha pagado $${Number(t.car_price).toLocaleString()}.`,
                    type: 'FINANCIAL',
                    link: `/dashboard/transactions/${t.id}`
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
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('stripe_session_id', sessionId)
            .single();

        if (error) {
            Logger.error(`Error getting transaction for session ${sessionId}:`, error);
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
            Logger.error(`[Fail-Safe] Error getting transaction ${id}:`, result.error);
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
            Logger.error('Error fetching all transactions:', error);
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
            Logger.error(`Error saving services for transaction ${id}:`, error);
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
            Logger.error(`Error overriding status for transaction ${id}:`, error);
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
            Logger.error('Error fetching transaction for simulation:', fetchError);
            return false;
        }

        const vin = (transaction as any).cars?.vin || "VIN-NOT-FOUND";
        try {
            const theftData = await VehicleCheckService.verifyTheftStatus(supabase, vin);
            if (theftData.status === 'STOLEN') {
                Logger.error(`[FRAUD-BLOCK] Vehículo reportado como ROBADO: ${vin}.`);
                await (supabase.from('transactions') as any).update({ pld_status: 'BLOCKED_RISK' }).eq('id', transactionId);
                return false;
            }
            await VehicleCheckService.generateCertificate(supabase, transactionId, theftData);
        } catch (checkError) {
            Logger.error("Error en validación automática vehicular:", checkError);
        }

        await SpeiService.simulateIncomingSpei(supabase, transactionId, Number((transaction as any).car_price));

        const { error: updateError } = await (supabase
            .from('transactions') as any)
            .update({ status: 'IN_VAULT' })
            .eq('id', transactionId);

        if (updateError) {
            Logger.error('Error updating transaction status:', updateError);
            return false;
        }

        const t = transaction as any;
        await NotificationService.notifyMultiple(supabase, [
            {
                userId: t.buyer_id,
                title: "Depósito Confirmado (SPEI)",
                message: "Hemos recibido tu transferencia.",
                type: 'FINANCIAL',
                link: `/dashboard/transactions/${t.id}`
            },
            {
                userId: t.seller_id,
                title: "¡Depósito Detectado!",
                message: `El comprador ha transferido $${Number(t.car_price).toLocaleString()} MXN.`,
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
