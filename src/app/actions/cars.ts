
"use server";

import { createClient } from "@/lib/supabase/server";
import { CarService } from "@/services/CarService";
import { revalidatePath } from "next/cache";

export async function createCarAction(carData: any) {
    console.log("[Action] Starting createCarAction with data:", { make: carData.make, model: carData.model });
    const supabase = await createClient();

    // Verify Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    const userEmail = user.email?.toLowerCase();
    if (profile?.role !== 'admin' && userEmail !== 'starterkar@hotmail.com') {
        throw new Error("Only admins can create cars directly.");
    }

    const newCar = await CarService.createCar(supabase, {
        ...carData,
        seller_id: user.id, // Admin acts as seller for initial listing
        status: carData.status || 'published'
    });

    if (!newCar) {
        console.error("[Action] CarService.createCar returned null");
        throw new Error("Failed to create car.");
    }
    
    console.log("[Action] Car created successfully:", newCar.id);

    revalidatePath("/admin");
    revalidatePath("/buy");
    
    return { success: true, car: newCar };
}

export async function getAdminInventoryAction() {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: cars, error } = await supabase
        .from("cars")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return cars;
}

export async function getMarketPriceAction(make: string, model: string, year: number) {
    const supabase = await createClient();
    
    const { data, error } = await supabase
        .from("pricing_market")
        .select("*")
        .eq("make", make)
        .eq("model", model)
        .eq("year", year);

    if (error) {
        console.error("Error fetching market price:", error);
        return null;
    }

    return data;
}
export async function updateCarAction(id: string, carData: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== 'admin' && user.email !== 'StarterKar@hotmail.com') throw new Error("Forbidden");

    const success = await CarService.updateCar(supabase, id, carData);
    if (!success) throw new Error("Failed to update car.");

    revalidatePath("/admin");
    revalidatePath("/buy");
    revalidatePath(`/buy/${id}`);

    return { success: true };
}

export async function deleteCarAction(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    try {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
        if (profile?.role !== 'admin' && user.email !== 'StarterKar@hotmail.com') throw new Error("Forbidden");

        console.log(`[Action] START DELETION: Car ${id}`);

        // 1. Collect all transaction IDs for this car
        const { data: txs } = await supabase.from("transactions").select("id").eq("car_id", id);
        const txIds = (txs || []).map(t => t.id);

        // 2. Sequential Safe Deletion (Protect against FK and Table Missing errors)
        const safeDelete = async (table: string, column: string, values: any[]) => {
            if (!values || values.length === 0) return;
            try {
                const { error } = await supabase.from(table as any).delete().in(column, values);
                if (error) console.warn(`[Action] Non-fatal error deleting from ${table}:`, error.message);
            } catch (e) {
                console.warn(`[Action] Exception deleting from ${table}:`, e);
            }
        };

        // Cleanup Dependencies by Car ID
        await safeDelete("user_favorites", "car_id", [id]);
        await safeDelete("car_locks", "car_id", [id]);
        await safeDelete("car_waitlists", "car_id", [id]);
        await safeDelete("service_tickets", "car_id", [id]);
        await safeDelete("warranty_policies", "car_id", [id]);
        await safeDelete("audit_logs", "entity_id", [id]);

        // Cleanup Dependencies by Transaction ID
        if (txIds.length > 0) {
            await safeDelete("logistics_orders", "transaction_id", txIds);
            await safeDelete("referrals", "transaction_id", txIds);
            await safeDelete("warranty_policies", "transaction_id", txIds);
            await safeDelete("audit_logs", "entity_id", txIds);
            await safeDelete("transactions", "id", txIds);
        }

        // 3. FINAL STEP: Delete the car itself
        const { error: carDeleteError } = await supabase.from("cars").delete().eq("id", id);
        
        if (carDeleteError) {
            console.error("[Action] FINAL DELETION ERROR:", carDeleteError);
            return { success: false, message: carDeleteError.message };
        }

        revalidatePath("/admin");
        revalidatePath("/buy");
        
        return { success: true };

    } catch (err: any) {
        console.error("[Action] CRITICAL DELETION FAILURE:", err);
        return { success: false, message: err.message || "Internal Server Error" };
    }
}

export async function getAutomatedSpecsAction(make: string, model: string) {
    const { getSpecsForModel } = await import("@/lib/car-data");
    const specs = getSpecsForModel(make, model);
    
    if (specs) {
        return { success: true, specs };
    }

    // Fallback: If not in local dict, we could call an AI service here.
    // For now, return generic data based on common sense if the user insists.
    return { success: false, message: "Modelo no encontrado en base de datos local." };
}
