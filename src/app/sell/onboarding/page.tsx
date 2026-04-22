"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { NotificationService } from "@/services/NotificationService";
import { ShieldCheck, Calendar, MapPin, CheckCircle2, Warehouse, Clock, ChevronDown } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { VEHICLE_CATEGORIES } from "@/lib/vehicle-intake-config";
import { cn } from "@/lib/utils";

interface Partner {
    id: string;
    name: string;
    address: string;
    city: string;
}

export default function SellOnboardingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createBrowserClient();

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    
    // Partners data
    const [partners, setPartners] = useState<Partner[]>([]);
    const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

    // Car Details from Wizard
    const categoryId = searchParams.get('category') || "";
    const year = searchParams.get('year') || "";
    const make = searchParams.get('make') || "";
    const model = searchParams.get('model') || "";
    const km = searchParams.get('km') || "0";
    const isAdmin = searchParams.get('admin') === 'true';
    
    const categoryInfo = VEHICLE_CATEGORIES.find(c => c.id === categoryId);
    
    // Form Details
    const [date, setDate] = useState("");

    const INSPECTION_BASE_COST = 1500;
    const totalCost = INSPECTION_BASE_COST;

    useEffect(() => {
        const timer = setTimeout(() => setIsMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const fetchPartners = async () => {
            const { data } = await supabase
                .from('partners')
                .select('*')
                .eq('is_active', true);
            if (data) setTimeout(() => setPartners(data), 0);
        };
        fetchPartners();
    }, [supabase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        if (inspectionType === 'workshop' && !selectedPartner) {
            alert("Por favor selecciona un Taller Aliado para la revisión.");
            return;
        }

        const selectedDate = new Date(date);
        const hours = selectedDate.getHours();
        
        if (hours < 10 || hours >= 16) {
            alert("El horario de inspección es únicamente entre las 10:00 y las 16:00 horas. Por favor selecciona un horario válido.");
            return;
        }

        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user && !isAdmin) {
                alert("Debes iniciar sesión para publicar un auto.");
                router.push('/login?next=/sell');
                return;
            }

            const finalAddress = `${selectedPartner?.name} - ${selectedPartner?.address}, ${selectedPartner?.city}`;

            // 1. Create the car in Draft/Pending status
            const { data: carData, error: carError } = await supabase.from('cars').insert({
                seller_id: user?.id || '00000000-0000-0000-0000-000000000000', // Mock UUID if admin without user
                make,
                model,
                year: parseInt(year) || new Date().getFullYear(),
                price: 0, // To be defined after inspection/agreement
                status: 'pending_inspection',
                mileage: parseInt(km),
                description: `Registro vía Wizard. Categoría: ${categoryInfo?.title}. Ubicación: ${finalAddress}`
            }).select('id').single();

            if (carError || !carData) throw new Error("Error creando pre-registro del auto.");

            // 2. Schedule the 150-point inspection ticket
            const { error: ticketError } = await supabase.from('service_tickets').insert({
                car_id: carData.id,
                type: '150_point_inspection',
                status: 'SCHEDULED',
                scheduled_at: new Date(date).toISOString(),
                partner_id: selectedPartner?.id
            });

            if (ticketError) throw new Error("Error agendando inspección.");

            // 3. Admin Notification
            await NotificationService.notifyAdmin(supabase, {
                action: "INSPECTION_SCHEDULED",
                entityType: "SERVICE_TICKETS",
                entityId: carData.id,
                metadata: { 
                    address: finalAddress, 
                    type: 'workshop',
                    vehicleCategory: categoryId,
                    make, 
                    model, 
                    year, 
                    isAdminAction: isAdmin,
                    total_to_pay: totalCost
                }
            });

            setSuccess(true);
            
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
                            Te esperamos en <span className="font-bold">{selectedPartner?.name}</span> en la fecha y hora seleccionada para tu inspección de 150 puntos. 
                            Una vez aprobada, tu {make} {model} será publicado oficialmente.
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
                                Agenda la revisión de 150 puntos para el <span className="font-bold text-indigo-600 dark:text-indigo-400">{make} {model} {year}</span>.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm space-y-8">
                            <div className="space-y-8">
                                <div className="p-6 rounded-2xl border-2 border-indigo-600 bg-indigo-50 dark:bg-indigo-900/10 text-left flex flex-col gap-3 group">
                                    <Warehouse className="h-6 w-6 text-indigo-600" />
                                    <div>
                                        <div className="font-bold text-sm">Taller Aliado (Zona Segura)</div>
                                        <div className="text-xs text-zinc-500 font-medium">Inspección física obligatoria por seguridad</div>
                                    </div>
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-3">
                                        <Clock className="h-4 w-4" />
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
                                    <p className="mt-2 text-[10px] uppercase font-bold text-zinc-400 tracking-tighter">
                                        * Horario de atención: Lunes a Sábado de 10:00 a 16:00 hrs.
                                    </p>
                                </div>

                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="flex items-center gap-2 text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-3">
                                        <MapPin className="h-4 w-4" />
                                        Selecciona el Taller Aliado para la revisión de 150 puntos
                                    </label>
                                        <div className="relative">
                                            <select
                                                required
                                                onChange={(e) => {
                                                    const partner = partners.find(p => p.id === e.target.value);
                                                    if (partner) setSelectedPartner(partner);
                                                }}
                                                className="w-full appearance-none bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 rounded-xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium transition-all"
                                            >
                                                <option value="">Selecciona un taller...</option>
                                                {partners.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name} ({p.city})</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 pointer-events-none" />
                                        </div>
                                    {selectedPartner && (
                                        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-start gap-3">
                                            <MapPin className="h-4 w-4 text-indigo-500 mt-1 shrink-0" />
                                            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                                {selectedPartner.address}, {selectedPartner.city}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-900/30 rounded-2xl">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-bold text-indigo-900 dark:text-indigo-300">Costo Inspección Estándar</span>
                                        <span className="font-black">${INSPECTION_BASE_COST.toLocaleString()}</span>
                                    </div>
                                    <div className="h-px bg-indigo-200 dark:bg-indigo-800 my-4" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-black uppercase tracking-widest text-indigo-900 dark:text-indigo-300">Costo Certificación</span>
                                        <span className="font-black text-indigo-900 dark:text-indigo-200">${INSPECTION_BASE_COST.toLocaleString()}</span>
                                    </div>
                                    <div className="h-px bg-indigo-200 dark:bg-indigo-800/50 my-4" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-xl font-black italic text-indigo-900 dark:text-indigo-200">Total</span>
                                        <span className="text-3xl font-black text-indigo-600">${totalCost.toLocaleString()}</span>
                                    </div>
                                    <p className="mt-4 text-[10px] text-indigo-500 dark:text-indigo-400 leading-tight font-medium">
                                        * Este costo es reembolsable si vendes el auto a través de StarterKar.
                                    </p>
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:scale-[1.02] active:scale-[0.98] rounded-2xl py-4 font-black text-lg disabled:opacity-50 transition-all shadow-xl"
                            >
                                {loading ? "Asegurando Turno..." : "Confirmar Agenda"}
                            </button>
                        </form>
                    </>
                )}
            </main>
        </div>
    );
}
