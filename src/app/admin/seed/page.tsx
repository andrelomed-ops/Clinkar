"use client";

import { useState } from "react";
import { ALL_CARS } from "@/data/cars";
import { supabase } from "@/lib/supabase";
import { Database, Play, Loader2, CheckCircle } from "lucide-react";

export default function SeedPage() {
    const [status, setStatus] = useState<"IDLE" | "SEEDING" | "DONE">("IDLE");
    const [logs, setLogs] = useState<string[]>([]);

    const runSeed = async () => {
        setStatus("SEEDING");
        setLogs(prev => [...prev, "🚀 Iniciando proceso de Seed..."]);

        try {
            // 1. Get current user to set as seller (or use null if RLS allows)
            const { data: { user } } = await supabase.auth.getUser();
            const userId = user?.id || null;

            if (!userId) setLogs(prev => [...prev, "⚠️ Advertencia: No hay usuario autenticado. Los autos no tendrán seller_id."]);

            // 2. Iterate and insert
            let count = 0;
            for (const car of ALL_CARS) {
                // Map local structure to DB structure
                const dbCar = {
                    make: car.make,
                    model: car.model,
                    year: car.year,
                    price: car.price,
                    mileage: car.distance * 1000, // Convierte klick a metros o asume km? Asumamos input es km
                    vin: car.vin || `VIN-${car.id}-${Math.random().toString(36).substring(7).toUpperCase()}`,
                    // color: "N/A", // Removed to fix schema mismatch
                    description: car.tags.join(", "),
                    images: car.images,
                    status: car.status === 'CERTIFIED' ? 'AVAILABLE' : 'IN_REVIEW', // Map status
                    seller_id: userId,
                    // location: car.location // Removed to fix schema mismatch
                };

                const { error } = await supabase.from('cars').insert(dbCar as any); // Type assertion needed due to strict matching

                if (error) {
                    console.error(error);
                    setLogs(prev => [...prev, `❌ Error en ${car.make} ${car.model}: ${error.message}`]);
                } else {
                    count++;
                    setLogs(prev => [...prev, `✅ Insertado: ${car.make} ${car.model}`]);
                }
            }

            setLogs(prev => [...prev, `✨ Proceso terminado. ${count} autos insertados.`]);
            setStatus("DONE");

        } catch (e: any) {
            setLogs(prev => [...prev, `💀 Error Fatal: ${e.message}`]);
            setStatus("IDLE");
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-8 font-mono bg-black min-h-screen text-green-500">
            <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Database className="h-6 w-6" />
                Supabase Seeder
            </h1>
            <p className="text-zinc-500 mb-8">Esta herramienta migrará los datos de `mockCars` a tu base de datos real.</p>

            <button
                onClick={runSeed}
                disabled={status === "SEEDING"}
                className="bg-green-600 text-black px-6 py-3 font-bold rounded hover:bg-green-500 disabled:opacity-50 flex items-center gap-2 mb-8"
            >
                {status === "SEEDING" ? <Loader2 className="animate-spin" /> : <Play className="h-4 w-4 fill-current" />}
                {status === "SEEDING" ? "Migrando..." : "Ejecutar Migración"}
            </button>

            <div className="bg-zinc-900 rounded border border-zinc-800 p-4 h-96 overflow-y-auto font-mono text-xs">
                {logs.length === 0 && <span className="text-zinc-600">Esperando comando...</span>}
                {logs.map((log, i) => (
                    <div key={i} className="mb-1 border-b border-zinc-800/50 pb-1">{log}</div>
                ))}
            </div>
        </div>
    );
}
