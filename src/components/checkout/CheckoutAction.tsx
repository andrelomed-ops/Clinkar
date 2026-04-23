"use client";

import { useState } from "react";
import { LogisticsWidget } from "./LogisticsWidget";
import { WarrantySelector, WarrantyType } from "./WarrantySelector";
import { startTransaction } from "@/app/actions/transaction";
import { Loader2, ShieldCheck, MapPin, Home, Warehouse, Smartphone, Zap, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { startTransition } from "react";

export function CheckoutAction({ carId, carPrice, carLocation }: { carId: string, carPrice: number, carLocation: string }) {

    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const [scheduledDate, setScheduledDate] = useState("");
    const [scheduledTime, setScheduledTime] = useState("");

    const handleSubmit = async () => {
        if (!scheduledDate || !scheduledTime) {
            toast.error("Por favor, selecciona fecha y hora para la entrega");
            return;
        }

        console.log("[CheckoutAction] Iniciando proceso de bloqueo para carId:", carId);
        toast.info("Iniciando bloqueo seguro...");
        
        try {
            setIsPending(true);
            
            startTransition(async () => {
                try {
                    const result = await startTransaction(carId, {
                        deliveryType: 'workshop',
                        scheduledDate,
                        scheduledTime
                    });

                    if (result.success && result.transactionId) {
                        toast.success("¡Auto Bloqueado! Redirigiendo a la Bóveda...");
                        router.push(`/dashboard/handover/${result.transactionId}`);
                    } else {
                        toast.error(result.error || "Error al procesar el bloqueo");
                        setIsPending(false);
                    }
                } catch (err) {
                    console.error("Error in transition:", err);
                    toast.error("Error al procesar la transacción");
                    setIsPending(false);
                }
            });
        } catch (error) {
            console.error("Error starting transaction:", error);
            toast.error("Ocurrió un error inesperado");
            setIsPending(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-200/50 dark:border-indigo-800/30 p-6 rounded-2xl flex items-start gap-4 shadow-sm">
                <ShieldCheck className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mt-1 shrink-0" />
                <div>
                    <h4 className="font-bold text-sm text-indigo-900 dark:text-indigo-300 uppercase tracking-tight">
                        Bloqueo Seguro (Bóveda Digital)
                    </h4>
                    <p className="text-xs text-indigo-700/80 dark:text-indigo-300/70 mt-2 leading-relaxed text-justify">
                        Al bloquear el activo, activas el protocolo de resguardo legal de StarterKar. El vehículo queda reservado exclusivamente para ti mientras coordinamos la inspección final en el Taller Aliado.
                    </p>
                </div>
            </div>

            {/* Scheduling Section */}
            <div className="space-y-4 p-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-indigo-600" />
                    <h4 className="font-black text-xs uppercase tracking-widest text-zinc-500">Agendar Entrega en Taller</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-zinc-400 uppercase ml-1">Fecha</label>
                        <input 
                            type="date" 
                            className="w-full h-12 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-zinc-400 uppercase ml-1">Hora</label>
                        <input 
                            type="time" 
                            className="w-full h-12 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                        />
                    </div>
                </div>
                <p className="text-[10px] text-zinc-400 italic text-center px-4">
                    * El equipo de StarterKar confirmará la disponibilidad del Taller Aliado tras el bloqueo.
                </p>
            </div>

            {/* Total Summary */}
            <div className="bg-zinc-950 text-white p-8 rounded-[2.5rem] shadow-2xl border border-white/5 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[60px] rounded-full -mr-16 -mt-16" />
                
                <div className="flex justify-between items-center mb-4">
                    <span className="text-zinc-500 text-xs font-black uppercase tracking-widest">Valor del Activo</span>
                    <span className="font-bold text-lg">${carPrice.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-baseline mb-8 pt-6 border-t border-white/10">
                    <span className="font-black text-xs uppercase tracking-[0.2em] text-indigo-400 italic">Monto de Bloqueo</span>
                    <span className="font-black text-4xl tracking-tighter">${carPrice.toLocaleString()}</span>
                </div>

                <div className="text-[10px] text-zinc-500 mb-8 text-center leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5 italic">
                    <b className="text-indigo-400 uppercase">Siguiente Paso:</b> Tras confirmar el pago en bóveda, se notificará al Taller Aliado y al equipo logístico para tu cita el día <span className="text-white font-bold">{scheduledDate || '---'}</span>.
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={isPending}
                    className="w-full h-16 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-lg rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 group"
                >
                    {isPending ? <Loader2 className="animate-spin h-6 w-6" /> : (
                        <>
                            <span>Apartar y Agendar</span>
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
