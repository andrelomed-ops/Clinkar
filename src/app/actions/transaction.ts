'use server';

import { createClient } from '@/lib/supabase/server';
import { TransactionService } from '@/services/TransactionService';
import { CarService } from '@/services/CarService';
import { ALL_CARS } from '@/data/cars';
import { emails } from '@/lib/emails';
import { redirect } from 'next/navigation';

// function corrected below

// RE-WRITING THE FUNCTION TO FIX SCOPING AND PATH
export async function startTransaction(carId: string, addOns?: {
    logistics?: any;
    warranty?: any;
}) {
    const supabase = await createClient();

    // 1. Check Auth (Real or Demo)
    const { data: { user } } = await supabase.auth.getUser();
    let buyerId = user?.id;

    if (!buyerId) {
        // Fallback: Check for Demo Cookie
        const { cookies } = await import('next/headers');
        const cookieStore = await cookies();
        const demoRole = cookieStore.get('clinkar_role')?.value;

        if (demoRole === 'buyer' || demoRole === 'seller') {
            buyerId = 'demo-user-123'; // Mock ID for demo
        } else {
            redirect(`/login?next=/buy/${carId}`);
        }
    }

    // 2. SECURITY CHECK: Availability
    // Prevent double spending or buying sold cars
    const dbCar = await CarService.getCarById(supabase, carId);
    const car = dbCar || ALL_CARS.find(c => c.id === carId);

    if (!car) throw new Error("Car not found");

    if (dbCar) {
        // Real logic for production
        if (dbCar.status === 'SOLD' || dbCar.status === 'RESERVED') {
            console.warn(`[Security] Attempt to buy unavailable car ${carId}. Status: ${dbCar.status}`);
            redirect(`/buy/${carId}?error=unavailable`);
        }
    }

    // 3. SECURITY CHECK: KYC (Know Your Customer)
    // Only verified users can buy
    // TODO: Un-comment when KYC module is fully active
    /*
    const { data: profile } = await supabase.from('profiles').select('kyc_status').eq('id', buyerId).single();
    if (profile?.kyc_status !== 'verified' && buyerId !== 'demo-user-123') {
        redirect(`/dashboard/profile?error=kyc_required&next=/buy/${carId}`);
    }
    */

    const sellerId = car.seller_id || '00000000-0000-0000-0000-000000000000';
    const mockStripeSessionId = `sess_${crypto.randomUUID()}`;

    let transactionId;

    try {
        // If it's a Demo User OR a Mock Car (not in DB), process as simulation
        if (buyerId === 'demo-user-123' || !dbCar) {
            console.log("Demo/Mock Transaction Detected. Skipping DB Insert.");
            // Use a deterministic mock ID for mock cars to allow "persistence" in the session if needed
            transactionId = dbCar ? "demo-tx-123" : `mock-tx-${car.id}`;
        } else {
            // 4. ATOMIC TRANSACTION CREATION
            const transaction = await TransactionService.createTransaction(supabase, {
                carId: car.id,
                buyerId: buyerId,
                sellerId: sellerId,
                amount: car.price,
                stripeSessionId: mockStripeSessionId,
                logisticsQuote: addOns?.logistics,
                warrantyQuote: addOns?.warranty
            });

            if (!transaction) throw new Error("Failed to create transaction record");
            transactionId = transaction.id;

            // 5. UPDATE CAR STATUS TO RESERVED (Optimistic Lock)
            await CarService.updateCarStatus(supabase, car.id, 'RESERVED');

            if (sellerId !== '00000000-0000-0000-0000-000000000000') {
                // emails.sendOfferReceived...
            }
        }

    } catch (error) {
        console.error("Transaction Error:", error);
        throw error;
    }

    // Redirect outside try/catch
    console.log(`[StartTransaction] Redirecting to: /dashboard/handover/${transactionId}`);
    redirect(`/dashboard/handover/${transactionId}`);
}
