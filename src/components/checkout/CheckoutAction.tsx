"use client";

import { useState } from "react";
import { startTransaction } from "@/app/actions/transaction";
import { Loader2, ShieldCheck, Zap, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createBrowserClient } from "@/lib/supabase/client";
import { useEffect } from "react";

export function CheckoutAction({ carId, carPrice, carLocation, category }: { carId: string, carPrice: number, carLocation: string, category: string }) {
    const supabase = createBrowserClient();
    const [loading, setLoading] = useState(false);
    const [partners, setPartners] = useState<any[]>([]);
    const [selectedWorkshop, setSelectedWorkshop] = useState("");
    const [scheduledDate, setScheduledDate] = useState("");
    const [scheduledTime, setScheduledTime] = useState("");
    const [buyerPhone, setBuyerPhone] = useState("");

    useEffect(() => {
        async function fetchWorkshops() {
            const { data } = await supabase
                .from('partners')
                .select('*')
                .eq('is_active', true);
            
            if (data) {
                // Filter by specialty
                const filtered = data.filter(p => 
                    p.specialties?.includes(category) || 
                    (category === 'Car' && (!p.specialties || p.specialties.length === 0))
                );
                setPartners(filtered);
                if (filtered.length > 0) setSelectedWorkshop(filtered[0].id);
            }
        }
        fetchWorkshops();
    }, [category]);

    const handleAction = async () => {
        if (!scheduledDate || !scheduledTime) {
            toast.error("Por favor, selecciona fecha y hora de entrega");
            return;
        }
        if (!buyerPhone) {
            toast.error("Por favor, ingresa tu WhatsApp para seguimiento");
            return;
        }
        if (partners.length > 0 && !selectedWorkshop) {
            toast.error("Por favor, selecciona un taller");
            return;
        }

        console.log("[StarterKar] Click detectado. Iniciando...", { carId, scheduledDate, scheduledTime });
        setLoading(true);
        
        try {
            const result = await startTransaction(carId, {
                deliveryType: selectedWorkshop ? 'workshop' : 'home',
                scheduledDate,
                scheduledTime,
                workshopId: selectedWorkshop || undefined,
                buyerPhone
            });

            console.log("[StarterKar] Resultado del servidor:", result);

            if (result.success && result.transactionId) {
                toast.success("¡Auto Bloqueado!");
                // Force jump to handover
                window.location.assign(`/dashboard/handover/${result.transactionId}`);
            } else {
                toast.error(result.error || "Error al procesar el bloqueo");
                setLoading(false);
            }
        } catch (err: any) {
            if (err.message?.includes('NEXT_REDIRECT')) {
                // Ignore, browser will handle it
                return;
            }
            console.error("[StarterKar] Error fatal:", err);
            toast.error("Error de comunicación. Intenta de nuevo.");
            setLoading(false);
        }
    };

    const dateFormatted = scheduledDate ? new Date(scheduledDate + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) : '---';

    return (
        <div className="space-y-6">
            <div className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-200/50 dark:border-indigo-800/30 p-6 rounded-2xl flex items-start gap-4 shadow-sm">
                <ShieldCheck className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mt-1 shrink-0" />
                <div>
                    <h4 className="font-black text-xs text-indigo-900 dark:text-indigo-300 uppercase tracking-tight">
                        Bloqueo Seguro (Bóveda Digital)
                    </h4>
                    <p className="text-[10px] text-indigo-700/80 dark:text-indigo-300/70 mt-2 leading-relaxed text-justify font-medium">
                        Al bloquear el activo, activas el protocolo de resguardo legal de StarterKar. El vehículo queda reservado exclusivamente para ti mientras coordinamos la inspección final en el Taller Aliado.
                    </p>
                </div>
            </div>

            {/* Scheduling Section */}
            <div className="space-y-5 p-8 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2rem] shadow-xl shadow-zinc-200/50 dark:shadow-none">
                <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-indigo-600 animate-pulse" />
                    <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-500">Agendar Entrega en Taller</h4>
                </div>
                
                <div className="grid grid-cols-1 gap-5">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-zinc-400 uppercase ml-1">Taller Especializado ({category})</label>
                        {partners.length === 0 ? (
                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-zinc-400 uppercase ml-1">Taller Sugerido (Coordinación StarterKar)</label>
                                <select 
                                    className="w-full h-14 px-5 rounded-2xl border-2 border-indigo-200 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-800 text-sm font-black text-indigo-700 dark:text-indigo-300 outline-none transition-all"
                                    value={selectedWorkshop}
                                    onChange={(e) => setSelectedWorkshop(e.target.value)}
                                >
                                    <option value="">Selecciona un Taller...</option>
                                    <option value="PARTNER-MX-001">Mecánica Tek Satélite (Centro de Certificación)</option>
                                    <option value="PARTNER-MX-002">EV Specialists Condesa</option>
                                    <option value="PARTNER-MX-003">Taller 4x4 Offroad (Aliado StarterKar)</option>
                                </select>
                            </div>
                        ) : (
                            <select 
                                className="w-full h-14 px-5 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm font-black focus:border-indigo-600 outline-none transition-all"
                                value={selectedWorkshop}
                                onChange={(e) => setSelectedWorkshop(e.target.value)}
                            >
                                {partners.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} - {p.city}</option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-zinc-400 uppercase ml-1">WhatsApp de Seguimiento</label>
                        <div className="relative">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-sm font-black text-zinc-400">+52</span>
                            <input 
                                type="tel" 
                                placeholder="55 1234 5678"
                                className="w-full h-14 pl-14 pr-5 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm font-black focus:border-indigo-600 outline-none transition-all"
                                value={buyerPhone}
                                onChange={(e) => setBuyerPhone(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-zinc-400 uppercase ml-1">Fecha de Cita</label>
                        <input 
                            type="date" 
                            className="w-full h-14 px-5 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm font-black focus:border-indigo-600 outline-none transition-all"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-zinc-400 uppercase ml-1">Hora de Cita</label>
                        <input 
                            type="time" 
                            className="w-full h-14 px-5 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm font-black focus:border-indigo-600 outline-none transition-all"
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Total Summary */}
            <div className="bg-zinc-50 dark:bg-zinc-950 p-10 rounded-[3rem] shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden relative">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-zinc-400 dark:text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">Valor del Vehículo</span>
                    <span className="font-black text-xl italic text-zinc-900 dark:text-white">${carPrice.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-baseline mb-10 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                    <span className="font-black text-[10px] uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400 italic">Monto de Bloqueo</span>
                    <span className="font-black text-5xl tracking-tighter italic text-zinc-900 dark:text-white">${carPrice.toLocaleString()}</span>
                </div>

                <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mb-10 text-justify leading-relaxed bg-white dark:bg-zinc-900 p-6 rounded-[1.5rem] border border-zinc-100 dark:border-zinc-800 italic font-medium" style={{ textAlign: 'justify', textJustify: 'inter-word' }}>
                    <b className="text-indigo-600 dark:text-indigo-400 uppercase font-black">Próximo Paso:</b> Al confirmar, bloquearemos el activo y notificaremos a logística para tu cita el día <span className="text-zinc-900 dark:text-white font-black">{dateFormatted}</span> a las <span className="text-zinc-900 dark:text-white font-black">{scheduledTime || '---'}</span>.
                </div>

                <button
                    onClick={handleAction}
                    disabled={loading}
                    className="w-full h-16 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl flex items-center justify-center gap-4 group disabled:opacity-50"
                >
                    {loading ? (
                        <div className="flex items-center gap-3">
                            <Loader2 className="animate-spin h-5 w-5" />
                            <span>Sincronizando...</span>
                        </div>
                    ) : (
                        <>
                            <span>Bloquear y Agendar Entrega</span>
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                        </>
                    )}
                </button>
            </div>
            <style jsx>{`
                .text-justify {
                    text-align: justify !important;
                    text-justify: inter-word !important;
                }
            `}</style>
        </div>
    );
}
