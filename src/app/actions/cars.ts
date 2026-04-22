
"use server";

import { createClient } from "@/lib/supabase/server";
import { CarService } from "@/services/CarService";
import { revalidatePath } from "next/cache";

export async function createCarAction(carData: any) {
    const supabase = await createClient();

    // Verify Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== 'admin') {
        throw new Error("Only admins can create cars directly.");
    }

    const newCar = await CarService.createCar(supabase, {
        ...carData,
        seller_id: user.id, // Admin acts as seller for initial listing
        status: carData.status || 'published'
    });

    if (!newCar) throw new Error("Failed to create car.");

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
