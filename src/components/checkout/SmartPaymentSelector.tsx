"use client";

import { useState, useEffect } from "react";
import { CreditCard, Landmark, CheckCircle2, Loader2, ShieldCheck, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SPEISimulator } from "@/components/transaction/SPEISimulator";

interface SmartPaymentSelectorProps {
    amount: number;
    carId?: string;
    carTitle?: string;
    imageUrl?: string;
    onPaymentMethodSelect?: (method: 'STP' | 'STRIPE', total: number) => void;
    onPaymentSuccess?: () => void;
}

export default function SmartPaymentSelector({
    amount,
    carId,
    carTitle,
    imageUrl,
    onPaymentMethodSelect,
    onPaymentSuccess
}: SmartPaymentSelectorProps) {
    const [method, setMethod] = useState<'SPEI' | 'CONEKTA' | 'CASH'>('SPEI');
    const [isLoading, setIsLoading] = useState(false);


    const CARD_FEE_PERCENT = 0.036; // 3.6%
    const cardFee = amount * CARD_FEE_PERCENT;
    const totalCard = amount + cardFee;

    const formatCurrency = (val: number) => val.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

    const handleSelect = (m: 'SPEI' | 'CONEKTA' | 'CASH') => {
        setMethod(m);
        // Map to internal codes for backward compatibility if needed, or update consumers
        if (onPaymentMethodSelect) {
            onPaymentMethodSelect(m === 'CONEKTA' ? 'STRIPE' : 'STP' as any, m === 'CONEKTA' ? totalCard : amount);
        }
    };


    const handleSPEIPayment = async () => {
        if (!carId) return;
        setIsLoading(true);
        try {
            // Simulated Success for SPEI Simulation
            if (onPaymentSuccess) onPaymentSuccess();
            setIsLoading(false);
        } catch (error) {
            console.error(error);
            setIsLoading(false);
        }
    };


    const handleConektaCheckout = async () => {
        if (!carId) return;
        setIsLoading(true);
        try {
            const res = await fetch('/api/checkout/conekta', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    carId,
                    amount: totalCard,
                    description: `Pago Auto ${carTitle}`
                }),
            });

            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert("Error: No se pudo generar el link de pago.");
                setIsLoading(false);
            }
        } catch (error) {
            setIsLoading(false);
        }
    };


    return (
        <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Selecciona Método de Pago</h3>

            <div className="grid gap-4">
                {/* Opción 1: SPEI / CoDi (QR) - PRIMARIO */}
                <div
                    onClick={() => handleSelect('SPEI')}
                    className={cn(
                        "relative cursor-pointer rounded-2xl border-2 p-5 transition-all hover:bg-slate-50/50",
                        method === 'SPEI' ? "border-indigo-600 bg-indigo-50/30 shadow-md" : "border-slate-200"
                    )}
                >
                    {method === 'SPEI' && (
                        <div className="absolute top-4 right-4 text-indigo-600">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                    )}
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "h-14 w-14 rounded-2xl flex items-center justify-center transition-all",
                            method === 'SPEI' ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
                        )}>
                            <Landmark className="h-7 w-7" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-black text-slate-900 text-lg uppercase tracking-tight italic">SPEI / CoDi (QR)</span>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-wider">
                                    Recomendado
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 font-medium italic">Sin comisiones bancarias • Liquidacin inmediata</p>
                        </div>
                    </div>

                    {method === 'SPEI' && (
                        <div className="mt-6 pt-6 border-t border-indigo-100 animate-in fade-in slide-in-from-top-4">
                            <SPEISimulator
                                amount={amount}
                                onPaymentComplete={handleSPEIPayment}
                            />
                        </div>
                    )}
                </div>

                {/* Opción 2: Conekta (Tarjeta/Link) - OPCIONAL */}
                <div
                    onClick={() => handleSelect('CONEKTA')}
                    className={cn(
                        "relative cursor-pointer rounded-2xl border-2 p-5 transition-all hover:bg-slate-50/50",
                        method === 'CONEKTA' ? "border-blue-600 bg-blue-50/30 shadow-md" : "border-slate-200"
                    )}
                >
                    {method === 'CONEKTA' && (
                        <div className="absolute top-4 right-4 text-blue-600">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                    )}
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "h-14 w-14 rounded-2xl flex items-center justify-center transition-all",
                            method === 'CONEKTA' ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
                        )}>
                            <CreditCard className="h-7 w-7" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">Tarjeta / Transferencia Bancaria</span>
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[9px] font-black uppercase">
                                    Va Conekta
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                +3.6% Comisin de procesamiento
                            </p>
                        </div>
                    </div>

                    {method === 'CONEKTA' && (
                        <div className="mt-6 pt-6 border-t border-blue-100 cursor-default animate-in fade-in slide-in-from-top-4">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleConektaCheckout();
                                }}
                                disabled={isLoading}
                                className="w-full bg-blue-600 text-white font-black h-14 rounded-2xl hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-3 transition-all shadow-xl shadow-blue-500/20"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin h-5 w-5" />
                                        Generando Orden...
                                    </>
                                ) : (
                                    <>
                                        Pagar con Conekta
                                        <ChevronRight className="h-5 w-5" />
                                    </>
                                )}
                            </button>
                            <p className="text-center text-[10px] text-slate-400 mt-3 italic font-medium">
                                Sers redirigido al Checkout Seguro de Conekta para completar tu pago.
                            </p>
                        </div>
                    )}
                </div>

                {/* Opción 3: Efectivo - ÚLTIMO RECURSO (RIESGOSO) */}
                <div
                    onClick={() => handleSelect('CASH')}
                    className={cn(
                        "relative cursor-pointer rounded-2xl border-2 p-5 transition-all hover:bg-red-50/30",
                        method === 'CASH' ? "border-red-500 bg-red-50/30 shadow-md" : "border-slate-200"
                    )}
                >
                    {method === 'CASH' && (
                        <div className="absolute top-4 right-4 text-red-600">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                    )}
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "h-14 w-14 rounded-2xl flex items-center justify-center transition-all",
                            method === 'CASH' ? "bg-red-600 text-white" : "bg-slate-100 text-slate-400"
                        )}>
                            <span className="font-black text-2xl">$</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">Pago en Efectivo</span>
                                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[9px] font-black uppercase">
                                    Alto Riesgo
                                </span>
                            </div>
                            <p className="text-xs text-red-600 mt-1 font-bold italic">
                                Solo en cita presencial certificada • Bajo tu propia responsabilidad
                            </p>
                        </div>
                    </div>

                    {method === 'CASH' && (
                        <div className="mt-6 pt-6 border-t border-red-100 animate-in fade-in slide-in-from-top-4">
                            <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                                <p className="text-xs text-red-800 leading-relaxed font-medium">
                                    <b>Atencin:</b> El manejo de grandes sumas de efectivo conlleva riesgos de seguridad. StarterKar recomienda SPEI por su trazabilidad legal. Si decides continuar, nuestro equipo estar presente en la entrega física en Taller Aliado para supervisar la operacin.
                                </p>
                                <button
                                    onClick={() => onPaymentSuccess?.()}
                                    className="w-full mt-4 bg-red-600 text-white font-black h-12 rounded-xl hover:bg-red-700 shadow-lg shadow-red-500/20 uppercase text-[11px] tracking-widest"
                                >
                                    Confirmar Trato en Efectivo
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>


            {/* Total Summary */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-2">
                <div className="flex justify-between text-sm text-slate-500">
                    <span>Monto de la Operación</span>
                    <span>{formatCurrency(amount)}</span>
                </div>
                {method === 'CONEKTA' && (
                    <div className="flex justify-between text-xs text-slate-400">
                        <span>Fee de Procesamiento (+3.6%)</span>
                        <span>+{formatCurrency(cardFee)}</span>
                    </div>
                )}
                <div className="flex justify-between text-xl font-black text-slate-900 pt-2 border-t border-slate-200">
                    <span>Total a Liquidar</span>
                    <span>{formatCurrency(method === 'CONEKTA' ? totalCard : amount)}</span>
                </div>
            </div>

        </div>
    );
}
