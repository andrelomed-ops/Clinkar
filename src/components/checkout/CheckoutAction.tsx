"use client";

import { useState } from "react";
import { startTransaction } from "@/app/actions/transaction";
import { Loader2, ShieldCheck, Zap, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function CheckoutAction({ carId, carPrice, carLocation }: { carId: string, carPrice: number, carLocation: string }) {
    const [loading, setLoading] = useState(false);
    const [scheduledDate, setScheduledDate] = useState("");
    const [scheduledTime, setScheduledTime] = useState("");

    const handleAction = async () => {
        if (!scheduledDate || !scheduledTime) {
            toast.error("Por favor, selecciona fecha y hora para la entrega");
            return;
        }

        console.log("[StarterKar] Click detectado. Iniciando...", { carId, scheduledDate, scheduledTime });
        setLoading(true);
        
        try {
            const result = await startTransaction(carId, {
                deliveryType: 'workshop',
                scheduledDate,
                scheduledTime
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
            <div className="bg-zinc-950 text-white p-10 rounded-[3rem] shadow-2xl border border-white/5 overflow-hidden relative">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">Valor del Vehículo</span>
                    <span className="font-black text-xl italic">${carPrice.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-baseline mb-10 pt-8 border-t border-white/5">
                    <span className="font-black text-[10px] uppercase tracking-[0.3em] text-indigo-400 italic">Monto de Bloqueo</span>
                    <span className="font-black text-5xl tracking-tighter italic">${carPrice.toLocaleString()}</span>
                </div>

                <div className="text-[10px] text-zinc-400 mb-10 text-justify leading-relaxed bg-white/5 p-6 rounded-[1.5rem] border border-white/5 italic font-medium" style={{ textAlign: 'justify', textJustify: 'inter-word' }}>
                    <b className="text-indigo-400 uppercase font-black">Próximo Paso:</b> Al confirmar, bloquearemos el activo y notificaremos a logística para tu cita el día <span className="text-white font-black">{dateFormatted}</span> a las <span className="text-white font-black">{scheduledTime || '---'}</span>.
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
