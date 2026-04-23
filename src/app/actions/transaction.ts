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
}) {
    const supabase = await createClient();

    // 1. Check Auth (Real or Demo)
    const { data: { user } } = await supabase.auth.getUser();
    let buyerId = user?.id;

    if (!buyerId) {
        // Fallback: Check for Demo Cookie
        const { cookies } = await import('next/headers');
        const cookieStore = await cookies();
        const demoRole = cookieStore.get('starterkar_role')?.value;

        if (demoRole === 'buyer' || demoRole === 'seller') {
            buyerId = 'demo-user-123'; // Mock ID for demo
        } else {
            redirect(`/login?next=/buy/${carId}`);
        }
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

    const sellerId = car.seller_id || '00000000-0000-0000-0000-000000000000';
    const mockStripeSessionId = `sess_${crypto.randomUUID()}`;

    let transactionId;

    try {
        if (buyerId === 'demo-user-123' || !dbCar) {
            transactionId = dbCar ? "demo-tx-123" : `mock-tx-${car.id}`;
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
                    delivery_type: addOns?.deliveryType || 'workshop'
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
                    location: car.location
                }
            });
        }

        return { success: true, transactionId };
    } catch (error) {
        console.error("Transaction Error:", error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
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

    if (profile?.role !== 'admin') {
        throw new Error("Forbidden");
    }

    const { data: txs, error } = await supabase
        .from("transactions")
        .select("*, car:cars(make, model, year)")
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return txs;
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

    if (profile?.role !== 'admin') {
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

export async function releaseVaultFundsAction(transactionId: string) {
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

    return await TransactionService.releaseVaultFunds(supabase, transactionId);
}
