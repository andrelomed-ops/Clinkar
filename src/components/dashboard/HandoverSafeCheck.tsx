"use client";

import { useState } from "react";
import { ClipboardCheck, AlertCircle, CheckCircle2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface HandoverSafeCheckProps {
    onComplete?: () => void;
    onNegotiate?: () => void;
    isProcessing?: boolean;
}

export function HandoverSafeCheck({ onComplete, onNegotiate, isProcessing }: HandoverSafeCheckProps) {
    const [checks, setChecks] = useState({
        odometer: false,
        fluids: false,
        lights: false,
        physical: false
    });

    const allPassed = Object.values(checks).every(v => v);

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-border p-8 shadow-sm">
            <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600">
                        <ClipboardCheck className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-black text-lg italic tracking-tight uppercase">SafeHandover Checklist</h3>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-none">Protocolo de Entrega en Taller Aliado</p>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
                        <MapPin className="h-3 w-3" /> Punto de Control: Taller de Mecánico Aliado
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-1 text-right italic leading-tight">
                        El mecánico validará esta lista antes de que firmes el contrato final.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CheckItem
                    title="Kilometraje (Odómetro)"
                    desc="Debe coincidir con el reporte (max. +100km de traslado)."
                    checked={checks.odometer}
                    onChange={(v) => setChecks(s => ({ ...s, odometer: v }))}
                />
                <CheckItem
                    title="Testigos del Tablero"
                    desc="Sin Check Engine, ABS o Airbags encendidos ahora."
                    checked={checks.fluids}
                    onChange={(v) => setChecks(s => ({ ...s, fluids: v }))}
                />
                <CheckItem
                    title="Integridad Estética"
                    desc="Sin golpes, rayones o cristales rotos nuevos."
                    checked={checks.physical}
                    onChange={(v) => setChecks(s => ({ ...s, physical: v }))}
                />
                <CheckItem
                    title="Validación del Mecánico"
                    desc="El experto confirma que el auto es el mismo reportado."
                    checked={checks.lights}
                    onChange={(v) => setChecks(s => ({ ...s, lights: v }))}
                />
            </div>

            <div className="mt-8 pt-6 border-t border-dashed border-border flex flex-col gap-4">
                {!allPassed ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 bg-amber-500/5 p-4 rounded-2xl border border-amber-500/10">
                            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                            <p className="text-[10px] text-amber-800 leading-tight italic font-medium">
                                Si algún punto no se cumple, tienes derecho a negociar antes de liberar el pago.
                            </p>
                        </div>
                        {onNegotiate && (
                            <button
                                onClick={onNegotiate}
                                className="w-full h-12 bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold rounded-xl border border-amber-200 transition-colors flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                            >
                                <AlertCircle className="h-4 w-4" />
                                Reportar Discrepancia y Negociar
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-3 bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10 animate-in fade-in zoom-in duration-500">
                            <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
                            <div>
                                <p className="text-xs font-black text-emerald-900 uppercase">Vehículo Validado</p>
                                <p className="text-[10px] text-emerald-700 font-medium">Puedes proceder con la firma digital. Clinkar ha blindado tu compra.</p>
                            </div>
                        </div>
                        {onComplete && (
                            <button
                                onClick={onComplete}
                                disabled={isProcessing}
                                className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                {isProcessing ? (
                                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle2 className="h-5 w-5" />
                                        Liberar Fondos y Finalizar Entrega
                                    </>
                                )}
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function CheckItem({ title, desc, checked, onChange }: { title: string, desc: string, checked: boolean, onChange: (v: boolean) => void }) {
    return (
        <button
            onClick={() => onChange(!checked)}
            className={cn(
                "p-4 rounded-2xl border-2 text-left transition-all duration-300 flex items-start gap-3",
                checked ? "border-emerald-500 bg-emerald-500/5 shadow-sm" : "border-zinc-100 bg-zinc-50 hover:border-zinc-200"
            )}
        >
            <div className={cn(
                "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                checked ? "bg-emerald-500 border-emerald-500 text-white" : "border-zinc-300"
            )}>
                {checked && <CheckCircle2 className="h-3 w-3" />}
            </div>
            <div>
                <h4 className="font-bold text-xs text-zinc-900 leading-tight mb-1">{title}</h4>
                <p className="text-[10px] text-zinc-500 leading-tight">{desc}</p>
            </div>
        </button>
    );
}
