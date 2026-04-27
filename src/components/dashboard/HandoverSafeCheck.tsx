"use client";

import { useState } from "react";
import { ClipboardCheck, AlertCircle, CheckCircle2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface HandoverSafeCheckProps {
    onComplete?: () => void;
    onNegotiate?: () => void;
    isProcessing?: boolean;
    role?: 'buyer' | 'seller';
}

export function HandoverSafeCheck({ onComplete, onNegotiate, isProcessing, role = 'buyer' }: HandoverSafeCheckProps) {
    const [checks, setChecks] = useState({
        check1: false,
        check2: false,
        check3: false,
        check4: false
    });

    const allPassed = Object.values(checks).every(v => v);

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-100 dark:border-white/5 p-10 shadow-2xl shadow-zinc-200/50 dark:shadow-none">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-6 mb-10 pb-8 border-b border-zinc-50 dark:border-white/5">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                        <ClipboardCheck className="h-7 w-7" />
                    </div>
                    <div>
                        <h3 className="font-black text-2xl italic tracking-tighter uppercase leading-none mb-1">
                            {role === 'buyer' ? 'Checklist ' : 'Preparación '}<span className="text-indigo-600">Protocol</span>
                        </h3>
                        <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em] leading-none">
                            {role === 'buyer' ? 'Validación de activos en Taller Aliado' : 'Requisitos para entrega exitosa'}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-start sm:items-end">
                    <div className="flex items-center gap-2 text-[9px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 px-4 py-2 rounded-xl border border-indigo-100 dark:border-indigo-800/50 uppercase tracking-widest">
                        <MapPin className="h-3 w-3" /> Punto de Control: Taller de Mecánico Aliado
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {role === 'buyer' ? (
                    <>
                        <CheckItem
                            title="Odómetro & Kilometraje"
                            desc="Verificación visual del odómetro contra reporte de inspección inicial."
                            checked={checks.check1}
                            onChange={(v) => setChecks(s => ({ ...s, check1: v }))}
                        />
                        <CheckItem
                            title="Testigos & Electrónica"
                            desc="Escaneo de testigos de motor, ABS y bolsas de aire activos."
                            checked={checks.check2}
                            onChange={(v) => setChecks(s => ({ ...s, check2: v }))}
                        />
                        <CheckItem
                            title="Condición Física"
                            desc="Evaluación de daños cosméticos, cristales y pintura post-traslado."
                            checked={checks.check3}
                            onChange={(v) => setChecks(s => ({ ...s, check3: v }))}
                        />
                        <CheckItem
                            title="Certificación Mecánica"
                            desc="Firma del experto aliado validando el estado del activo."
                            checked={checks.check4}
                            onChange={(v) => setChecks(s => ({ ...s, check4: v }))}
                        />
                    </>
                ) : (
                    <>
                        <CheckItem
                            title="Factura Original"
                            desc="Lleva la factura original para el endoso correspondiente y los comprobantes de tenencias."
                            checked={checks.check1}
                            onChange={(v) => setChecks(s => ({ ...s, check1: v }))}
                        />
                        <CheckItem
                            title="Llaves y Manuales"
                            desc="Asegúrate de llevar los duplicados de llaves, manual de usuario y póliza de garantía original (si aplica)."
                            checked={checks.check2}
                            onChange={(v) => setChecks(s => ({ ...s, check2: v }))}
                        />
                        <CheckItem
                            title="Identificación Oficial"
                            desc="Es estrictamente necesario presentar tu INE o pasaporte vigente para firmar el contrato de compraventa."
                            checked={checks.check3}
                            onChange={(v) => setChecks(s => ({ ...s, check3: v }))}
                        />
                        <CheckItem
                            title="Limpieza y Pertenencias"
                            desc="Verifica que el vehículo esté limpio y no dejes objetos personales ni documentos ajenos al auto en el interior."
                            checked={checks.check4}
                            onChange={(v) => setChecks(s => ({ ...s, check4: v }))}
                        />
                    </>
                )}
            </div>

            <div className="mt-8 pt-6 border-t border-dashed border-border flex flex-col gap-4">
                {!allPassed ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 bg-amber-500/5 p-4 rounded-2xl border border-amber-500/10">
                            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                            <p className="text-[10px] text-amber-800 leading-relaxed text-justify font-medium">
                                {role === 'buyer' 
                                    ? 'Si algún punto no se cumple, tienes derecho a negociar antes de liberar el pago.' 
                                    : 'Asegúrate de cumplir todos los puntos para evitar retrasos o cancelaciones por parte del comprador.'}
                            </p>
                        </div>
                        {onNegotiate && role === 'buyer' && (
                            <button
                                onClick={onNegotiate}
                                className="w-full h-16 bg-amber-50 hover:bg-amber-100 text-amber-700 font-black rounded-2xl border-2 border-amber-200 transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em] shadow-lg shadow-amber-500/5 hover:scale-[1.02] active:scale-95"
                            >
                                <AlertCircle className="h-5 w-5" />
                                Reportar Discrepancia y Negociar
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-3 bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10 animate-in fade-in zoom-in duration-500">
                            <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
                            <div>
                                <p className="text-xs font-black text-emerald-900 uppercase">
                                    {role === 'buyer' ? 'Vehículo Validado' : 'Requisitos Listos'}
                                </p>
                                <p className="text-[10px] text-emerald-700 font-medium">
                                    {role === 'buyer' 
                                        ? 'Puedes proceder con la firma digital. StarterKar ha blindado tu compra.' 
                                        : 'Estás listo para proceder con la firma digital y entregar el vehículo.'}
                                </p>
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
                                        {role === 'buyer' ? 'Liberar Fondos y Finalizar Entrega' : 'Confirmar Entrega de Vehículo'}
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
                "p-6 rounded-[2rem] border-2 text-left transition-all duration-500 flex items-start gap-4",
                checked 
                    ? "border-emerald-600 bg-emerald-50 shadow-xl shadow-emerald-500/10" 
                    : "border-zinc-100 bg-zinc-50/50 hover:border-zinc-200 dark:border-white/5 dark:bg-white/5"
            )}
        >
            <div className={cn(
                "h-6 w-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all duration-500",
                checked ? "bg-emerald-600 border-emerald-600 text-white rotate-0 scale-110" : "border-zinc-300 rotate-45"
            )}>
                {checked && <CheckCircle2 className="h-4 w-4" />}
            </div>
            <div>
                <h4 className={cn(
                    "font-black text-xs uppercase tracking-widest mb-1 transition-colors",
                    checked ? "text-emerald-900" : "text-zinc-800 dark:text-zinc-200"
                )}>{title}</h4>
                <p className={cn(
                    "text-[10px] leading-relaxed text-justify font-medium",
                    checked ? "text-emerald-700/80" : "text-zinc-400"
                )} style={{ textAlign: 'justify' }}>{desc}</p>
            </div>
        </button>
    );
}
