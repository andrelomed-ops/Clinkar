"use client";

import { useState } from "react";
import { ShieldAlert, MessageSquare, Scale, Clock, Lock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function MediationHub({ transactionId }: { transactionId: string }) {
    const [reportActive, setReportActive] = useState(false);
    const [step, setStep] = useState(1);

    return (
        <div className="bg-rose-500/5 border border-rose-500/10 rounded-[2.5rem] p-8 mt-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-600 shrink-0">
                        <ShieldAlert className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-black text-lg text-rose-950 dark:text-rose-100 italic tracking-tight">Centro de Salvaguardia Clinkar</h3>
                        <p className="text-xs text-rose-700/70 dark:text-rose-400 font-medium">¿Algo no coincide con el reporte de inspección? Activa la mediación.</p>
                    </div>
                </div>
                {!reportActive ? (
                    <button
                        onClick={() => setReportActive(true)}
                        className="bg-rose-600 text-white px-8 h-12 rounded-full font-black text-xs hover:bg-rose-700 transition-all hover:scale-105 shadow-lg shadow-rose-600/20"
                    >
                        REPORTAR DISCREPANCIA
                    </button>
                ) : (
                    <div className="flex items-center gap-2 text-xs font-bold text-rose-600 bg-rose-50 px-4 py-2 rounded-full border border-rose-100">
                        <Clock className="h-4 w-4 animate-spin" />
                        Mediación en Proceso
                    </div>
                )}
            </div>

            {reportActive && (
                <div className="mt-8 pt-8 border-t border-rose-500/10 animate-in slide-in-from-top-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className={cn(
                            "p-6 rounded-3xl border-2 transition-all duration-500",
                            step === 1 ? "border-rose-500 bg-white shadow-xl" : "border-zinc-100 bg-zinc-50 opacity-50"
                        )}>
                            <span className="text-[10px] font-black uppercase text-rose-500 mb-2 block">Paso 01</span>
                            <h4 className="font-bold text-sm mb-2">Bloqueo de Escrow</h4>
                            <p className="text-[10px] text-muted-foreground leading-relaxed">Los fondos quedan congelados. Clinkar no liberará el pago al vendedor hasta aclarar la discrepancia detectada en el taller.</p>
                        </div>

                        <div className={cn(
                            "p-6 rounded-3xl border-2 transition-all duration-500",
                            step === 2 ? "border-rose-500 bg-white shadow-xl" : "border-zinc-100 bg-zinc-50 opacity-50"
                        )}>
                            <span className="text-[10px] font-black uppercase text-rose-500 mb-2 block">Paso 02</span>
                            <h4 className="font-bold text-sm mb-2">Arbitraje Mecánico</h4>
                            <p className="text-[10px] text-muted-foreground leading-relaxed">El mecánico que realizó la inspección valida el estado actual vs el reporte original. Él es el testigo técnico neutral.</p>
                        </div>

                        <div className={cn(
                            "p-6 rounded-3xl border-2 transition-all duration-500",
                            step === 3 ? "border-rose-500 bg-white shadow-xl" : "border-zinc-100 bg-zinc-50 opacity-50"
                        )}>
                            <span className="text-[10px] font-black uppercase text-rose-500 mb-2 block">Paso 03</span>
                            <h4 className="font-bold text-sm mb-2">Resolución Clinkar</h4>
                            <p className="text-[10px] text-muted-foreground leading-relaxed">Clinkar habilita una renegociación de precio (ajuste de Escrow) o la cancelación total con devolución inmediata al comprador.</p>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <button
                            onClick={() => setReportActive(false)}
                            className="px-6 h-10 rounded-full font-bold text-xs text-zinc-500 hover:text-zinc-800 transition-colors"
                        >
                            Cancelar reporte
                        </button>
                        <button
                            onClick={() => setStep(prev => prev < 3 ? prev + 1 : 3)}
                            className="bg-zinc-900 text-white px-8 h-10 rounded-full font-bold text-xs hover:bg-black transition-all"
                        >
                            Siguiente Paso
                        </button>
                    </div>
                </div>
            )}

            {!reportActive && (
                <div className="mt-6 flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Scale className="h-4 w-4 text-rose-900/30" />
                        <span className="text-[10px] font-bold text-rose-900/50 uppercase tracking-widest leading-none">Protección PROFECO</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-rose-900/30" />
                        <span className="text-[10px] font-bold text-rose-900/50 uppercase tracking-widest leading-none">Escrow Inteligente</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-rose-900/30" />
                        <span className="text-[10px] font-bold text-rose-900/50 uppercase tracking-widest leading-none">Garantía de Veracidad</span>
                    </div>
                </div>
            )}
        </div>
    );
}
