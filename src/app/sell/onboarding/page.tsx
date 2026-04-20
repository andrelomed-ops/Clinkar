"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { NotificationService } from "@/services/NotificationService";
import { ShieldCheck, Calendar, MapPin, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";

export default function SellOnboardingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createBrowserClient();

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Car Details
    const year = searchParams.get('year') || "";
    const make = searchParams.get('make') || "";
    const model = searchParams.get('model') || "";
    const priceMin = searchParams.get('min') || "0";
    
    // Form Details
    const [date, setDate] = useState("");
    const [address, setAddress] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                // Should redirect to protected login, but simulating for now or pushing to login check
                alert("Debes iniciar sesión para publicar un auto.");
                router.push('/login?next=/sell');
                return;
            }

            // 1. Create the car in Draft/Pending status
            const { data: carData, error: carError } = await supabase.from('cars').insert({
                seller_id: user.id,
                make,
                model,
                year: parseInt(year) || new Date().getFullYear(),
                price: parseInt(priceMin) * 1.05, // Estimate in the top middle of the quote
                status: 'pending_inspection',
                description: `Pendiente de inspección mecánica de 150 puntos en ${address}.`
            }).select('id').single();

            if (carError || !carData) throw new Error("Error creando pre-registro del auto.");

            // 2. Schedule the 150-point inspection ticket
            const { error: ticketError } = await supabase.from('service_tickets').insert({
                car_id: carData.id,
                type: '150_point_inspection',
                status: 'SCHEDULED',
                scheduled_at: new Date(date).toISOString()
            });

            if (ticketError) throw new Error("Error agendando inspección.");

            // 3. Admin Notification
            await NotificationService.notifyAdmin(supabase, {
                action: "INSPECTION_SCHEDULED",
                entityType: "SERVICE_TICKETS",
                entityId: carData.id,
                metadata: { address, make, model, year, seller_id: user.id }
            });

            setSuccess(true);
            
            // Redirect after brief pause
            setTimeout(() => {
                router.push('/dashboard');
            }, 3000);

        } catch (err) {
            console.error("Error en onboarding completo:", err);
            alert("Ocurrió un error al agendar la revisión. Por favor intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans">
            <Navbar variant="sell" showBack backHref="/sell" />
            
            <main className="pt-32 pb-20 px-6 max-w-2xl mx-auto">
                {success ? (
                    <div className="bg-white dark:bg-zinc-900 p-12 rounded-3xl text-center space-y-6 shadow-xl border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95">
                        <div className="mx-auto w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h2 className="text-3xl font-black text-zinc-900 dark:text-white">¡Inspección Agendada!</h2>
                        <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            Nuestro inspector acudirá a la dirección indicada para realizar la certificación de 150 puntos. Una vez aprobada, tu {make} {model} será publicado oficialmente en la plataforma.
                        </p>
                        <p className="text-xs font-bold text-zinc-400 pt-4 uppercase tracking-wider animate-pulse">
                            Redirigiendo a tu Dashboard...
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-10 space-y-4">
                            <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-2xl mb-2">
                                <ShieldCheck className="h-8 w-8" />
                            </div>
                            <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
                                Certifica tu Vehículo
                            </h1>
                            <p className="text-lg text-zinc-600 dark:text-zinc-400">
                                Agenda la revisión de 150 puntos a domicilio para el <span className="font-bold text-indigo-600 dark:text-indigo-400">{make} {model} {year}</span>. Requisito indispensable antes de publicar por seguridad.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm space-y-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                                        ¿Cuándo mandamos a nuestro inspector experto?
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Calendar className="h-5 w-5 text-zinc-400" />
                                        </div>
                                        <input 
                                            type="datetime-local" 
                                            required
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                                        ¿A qué dirección completa y segura acudimos?
                                    </label>
                                    <div className="relative">
                                        <div className="absolute top-4 left-0 pl-4 pointer-events-none">
                                            <MapPin className="h-5 w-5 text-zinc-400" />
                                        </div>
                                        <textarea 
                                            required
                                            placeholder="Ej: Privada Altair 123, Colonia Valle, Monterrey, NL. C.P. 64000. Referencias adicionales."
                                            value={address}
                                            rows={3}
                                            onChange={(e) => setAddress(e.target.value)}
                                            className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium transition-all resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-xl text-sm text-blue-800 dark:text-blue-300 leading-relaxed font-medium">
                                    StarterKar asume el costo integro de la revisión ($1,500 MXN) si el vehículo se publica en nuestra plataforma. 
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:scale-[1.02] active:scale-[0.98] rounded-xl py-4 font-black text-lg disabled:opacity-50 transition-all shadow-xl"
                            >
                                {loading ? "Asegurando Turno..." : "Confirmar Inspección sin Costo"}
                            </button>
                        </form>
                    </>
                )}
            </main>
        </div>
    );
}
