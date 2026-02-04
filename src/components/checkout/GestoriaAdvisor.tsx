"use client";

import { useState } from "react";
import { FileSearch, ShieldAlert, CheckCircle2, ArrowRight, Loader2, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GestoriaAdvisorProps {
    onSelect?: (active: boolean) => void;
}

export function GestoriaAdvisor({ onSelect }: GestoriaAdvisorProps) {
    const [active, setActive] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleToggle = () => {
        setLoading(true);
        setTimeout(() => {
            setActive(!active);
            onSelect?.(!active);
            setLoading(false);
        }, 800);
    };

    return (
        <div className={cn(
            "glass-card rounded-[2.5rem] p-8 transition-all duration-500 border-2",
            active
                ? "border-emerald-500/50 bg-emerald-500/5"
                : "border-indigo-500/10 hover:border-indigo-500/30 shadow-2xl shadow-indigo-500/5"
        )}>
            <div className="flex items-start justify-between gap-6">
                <div className="flex items-start gap-4 flex-1">
                    <div className={cn(
                        "h-14 w-14 rounded-2xl flex items-center justify-center transition-colors shadow-lg",
                        active ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-indigo-600 text-white shadow-indigo-500/20"
                    )}>
                        <Scale className="h-7 w-7" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black tracking-tight">Gestoría de Legalización</h3>
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-4">Revisión de Pedimento y Factura</p>

                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                            ¿El auto es importado o fronterizo? Nuestros gestores certificados validan el **Pedimento A1** y el historial de nacionalización e impagos antes de liberar tus fondos.
                        </p>

                        <div className="flex items-center gap-6">
                            <div className="text-2xl font-black text-indigo-600">$1,250 <span className="text-[10px] text-zinc-400 font-bold uppercase ml-1">Pago único</span></div>
                            <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-tighter bg-emerald-50 dark:bg-emerald-950/20 px-2 py-1 rounded">
                                <CheckCircle2 className="h-3 w-3" /> Protección Legal 100%
                            </div>
                        </div>
                    </div>
                </div>

                <Button
                    variant={active ? "secondary" : "default"}
                    onClick={handleToggle}
                    disabled={loading}
                    className={cn(
                        "h-14 rounded-2xl px-8 font-black transition-all active:scale-95 shrink-0",
                        active ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200" : "bg-zinc-900 text-white shadow-xl"
                    )}
                >
                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : active ? "Servicio Añadido" : "Añadir Asesoría"}
                </Button>
            </div>

            {active && (
                <div className="mt-8 pt-8 border-t border-emerald-500/10 animate-reveal">
                    <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4">¿Qué incluye este servicio?</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 rounded-xl border border-emerald-500/10">
                            <FileSearch className="h-5 w-5 text-emerald-500" />
                            <span className="text-[11px] font-bold">Validación de Pedimento A1</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 rounded-xl border border-emerald-500/10">
                            <ShieldAlert className="h-5 w-5 text-emerald-500" />
                            <span className="text-[11px] font-bold">Chequeo de Alerta de Robo Int.</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
