'use server';

import { createClient } from '@/lib/supabase/server';
import { TransactionService } from '@/services/TransactionService';
import { CarService } from '@/services/CarService';
import { ALL_CARS } from '@/data/cars';
import { emails } from '@/lib/emails';
import { redirect } from 'next/navigation';
import { NotificationService } from '@/services/NotificationService';

export async function startTransaction(carId: string, addOns?: {
    logistics?: any;
    warranty?: any;
    gestoria?: { active: boolean, cost: number };
    insurance?: { provider: string, cost: number };
    deliveryType?: 'workshop' | 'home';
    scheduledDate?: string;
    scheduledTime?: string;
    workshopId?: string;
}) {
    const supabase = await createClient();

    // 1. Check Auth (Real or Demo)
    const { data: { user } } = await supabase.auth.getUser();
    
    // Check for Demo Cookie
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const demoRole = cookieStore.get('starterkar_role')?.value;

    const buyerId = user?.id || (demoRole ? 'demo-user-123' : null);

    console.log(`[startTransaction] Car:${carId} Buyer:${buyerId} Role:${demoRole}`);

    if (!buyerId && !demoRole) {
        redirect(`/login?next=/buy/${carId}`);
    }

    // 2. SECURITY CHECK: Availability
    const dbCar = await CarService.getCarById(supabase, carId);
    const car = dbCar || ALL_CARS.find(c => c.id === carId);

    if (!car) throw new Error("Car not found");

    if (dbCar) {
        if (dbCar.status === 'SOLD' || dbCar.status === 'RESERVED') {
            console.warn(`[Security] Attempt to buy unavailable car ${carId}. Status: ${dbCar.status}`);
            redirect(`/buy/${carId}?error=unavailable`);
        }
    }

    const sellerId = car.seller_id || buyerId; // Use buyerId as fallback to ensure valid FK if seller is missing
    const mockStripeSessionId = `sess_${crypto.randomUUID()}`;

    let transactionId;

    try {
        if (demoRole || !dbCar) {
            transactionId = dbCar ? "demo-tx-123" : `mock-tx-${car.id}`;
            console.log(`[startTransaction] SIMULATION MODE: ${transactionId}`);
        } else {
            const transaction = await TransactionService.createTransaction(supabase, {
                carId: car.id,
                buyerId: buyerId,
                sellerId: sellerId,
                amount: car.price,
                stripeSessionId: mockStripeSessionId,
                logisticsQuote: addOns?.logistics,
                warrantyQuote: addOns?.warranty,
                gestoriaQuote: addOns?.gestoria,
                insuranceQuote: addOns?.insurance,
                // Pass scheduling in metadata
                metadata: {
                    scheduled_delivery_date: addOns?.scheduledDate,
                    scheduled_delivery_time: addOns?.scheduledTime,
                    delivery_type: addOns?.deliveryType || 'workshop',
                    workshop_id: addOns?.workshopId,
                    category: car.category
                }
            });

            if (!transaction) throw new Error("Failed to create transaction record");
            transactionId = transaction.id;

            await CarService.updateCarStatus(supabase, car.id, 'RESERVED');

            // Trigger Admin Alert for Coordination
            await NotificationService.notifyAdmin(supabase, {
                action: 'NUEVA_ENTREGA_PROGRAMADA',
                entityType: 'TRANSACTION',
                entityId: transaction.id,
                metadata: {
                    car: `${car.make} ${car.model}`,
                    date: addOns?.scheduledDate,
                    time: addOns?.scheduledTime,
                    location: car.location,
                    category: car.category,
                    workshop_id: addOns?.workshopId
                }
            });
            console.log(`[startTransaction] Success: Transaction ${transactionId} created.`);
        }

        return { success: true, transactionId };
    } catch (error: any) {
        if (error.digest?.includes('NEXT_REDIRECT')) {
            throw error;
        }
        console.error('[startTransaction] CRITICAL ERROR:', error);
        return { success: false, error: error.message || "Failed to start transaction" };
    }
}

export async function getLegalTransactionsAction() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    const userEmail = user.email?.toLowerCase();
    if (profile?.role !== 'admin' && userEmail !== 'starterkar@hotmail.com') {
        throw new Error("Forbidden");
    }

    const { data: txs, error } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    // Manual join to bypass FK issues
    const txsWithCars = await Promise.all((txs || []).map(async (tx) => {
        const { data: car } = await supabase
            .from("cars")
            .select("*")
            .eq("id", tx.car_id)
            .single();
        return { ...tx, car };
    }));

    return txsWithCars;
}

export async function overrideTransactionStatusAction(transactionId: string, status: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    const userEmail = user.email?.toLowerCase();
    if (profile?.role !== 'admin' && userEmail !== 'starterkar@hotmail.com') {
        throw new Error("Forbidden");
    }

    return await TransactionService.overrideTransactionStatus(supabase, transactionId, status);
}

export async function updateTransactionServicesAction(transactionId: string, services: {
    insuranceId?: string;
    insuranceCost?: number;
    gestoriaCost?: number;
}) {
    const supabase = await createClient();
    
    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    return await TransactionService.updateTransactionServices(supabase, transactionId, services);
}

export async function confirmP2PHandoverAction(transactionId: string) {
    const supabase = await createClient();
    
    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        // Allow demo users
        const { cookies } = await import('next/headers');
        const cookieStore = await cookies();
        const demoRole = cookieStore.get('starterkar_role')?.value;
        if (!demoRole) throw new Error("Unauthorized");
        
        if (transactionId.startsWith('mock-') || transactionId.startsWith('demo-')) {
            return { success: true };
        }
    }

    return await TransactionService.confirmP2PHandover(supabase, transactionId);
}

export async function reportDiscrepancyAction(transactionId: string, details: {
    reason: string;
    negotiatedAmount?: number;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Handle Mocks/Demo
    if (transactionId.startsWith('mock-') || transactionId.startsWith('demo-')) {
        console.log(`[reportDiscrepancyAction] SIMULATION: Dispute logged for ${transactionId}`);
        return { success: true };
    }

    const { data: tx } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();
    
    if (!tx) throw new Error("Transaction not found");

    const { data: carData } = await supabase
        .from('cars')
        .select('make, model, year')
        .eq('id', tx.car_id)
        .single();

    // 2. Log for Audit (Statistics & Annual Reports)
    await supabase.from('audit_logs').insert({
        actor_id: user?.id || 'demo-user',
        action: 'DISPUTE_REPORTED',
        entity_type: 'TRANSACTION',
        entity_id: transactionId,
        metadata: {
            reason: details.reason,
            negotiated_amount: details.negotiatedAmount || tx.car_price,
            original_amount: tx.car_price,
            car_info: carData ? `${carData.make} ${carData.model} ${carData.year}` : "Unknown Car"
        }
    });

    // 3. Update Transaction Metadata & Status
    const newMetadata = {
        ...(tx.metadata || {}),
        dispute: {
            reported_at: new Date().toISOString(),
            reason: details.reason,
            requested_negotiation: details.negotiatedAmount
        }
    };

    await supabase.from('transactions').update({
        status: 'DISPUTED',
        metadata: newMetadata
    }).eq('id', transactionId);

    // 4. Notify Seller (Real-time alert)
    await NotificationService.notify(supabase, {
        userId: tx.seller_id,
        title: "¡ALERTA! Discrepancia en Entrega",
        message: `El comprador ha reportado un problema: "${details.reason}". StarterKar está mediando la operación.`,
        type: 'WARNING',
        link: `/dashboard/transactions/${transactionId}`
    });

    // 5. Notify Admin (For statistics and support intervention)
    await NotificationService.notifyAdmin(supabase, {
        action: 'DISPUTE_OPENED',
        entityType: 'TRANSACTION',
        entityId: transactionId,
        metadata: {
            reason: details.reason,
            buyer_id: tx.buyer_id,
            seller_id: tx.seller_id
        }
    });
    return { success: true };
}

export async function validateCEPAction(transactionId: string, cepData: any) {
    const supabase = await createClient();
    
    // Auth check (Admin Only)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== 'admin' && user.email !== 'StarterKar@hotmail.com') throw new Error("Forbidden");

    return await TransactionService.validateCEP(supabase, transactionId, cepData);
}
export async function registerCommissionPaymentAction(transactionId: string, paymentData: { method: string, amount: number }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== 'admin' && user.email !== 'StarterKar@hotmail.com') throw new Error("Forbidden");

    const { error } = await supabase.from("transactions").update({
        commission_paid: true,
        commission_amount: paymentData.amount,
        commission_payment_method: paymentData.method,
        commission_payment_date: new Date().toISOString()
    }).eq("id", transactionId);

    if (error) throw new Error(error.message);

    revalidatePath("/admin");
    return { success: true };
}
