"use client";

import { useState, useEffect } from "react";
import { CreditCard, Landmark, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SmartPaymentSelectorProps {
    amount: number;
    onPaymentMethodSelect?: (method: 'STP' | 'STRIPE', total: number) => void;
}

export default function SmartPaymentSelector({ amount, onPaymentMethodSelect }: SmartPaymentSelectorProps) {
    const [method, setMethod] = useState<'STP' | 'STRIPE'>('STP');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const CARD_FEE_PERCENT = 0.036; // 3.6%
    const cardFee = amount * CARD_FEE_PERCENT;
    const totalCard = amount + cardFee;

    const formatCurrency = (val: number) => isMounted ? val.toLocaleString() : "...";

    const handleSelect = (m: 'STP' | 'STRIPE') => {
        setMethod(m);
        if (onPaymentMethodSelect) {
            onPaymentMethodSelect(m, m === 'STRIPE' ? totalCard : amount);
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Selecciona Método de Pago</h3>

            <div className="grid gap-4">
                {/* Opción A: SPEI (Recomendado) */}
                <div
                    onClick={() => handleSelect('STP')}
                    className={cn(
                        "relative cursor-pointer rounded-2xl border-2 p-4 transition-all hover:bg-slate-50",
                        method === 'STP' ? "border-blue-600 bg-blue-50/50 shadow-sm" : "border-slate-200"
                    )}
                >
                    {method === 'STP' && (
                        <div className="absolute top-4 right-4 text-blue-600">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                    )}
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "h-12 w-12 rounded-xl flex items-center justify-center transition-colors",
                            method === 'STP' ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400"
                        )}>
                            <Landmark className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">Transferencia SPEI / CoDi</span>
                                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wide">
                                    Recomendado
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Sin comisiones • Reflejado en minutos</p>
                        </div>
                    </div>
                </div>

                {/* Opción B: Tarjeta */}
                <div
                    onClick={() => handleSelect('STRIPE')}
                    className={cn(
                        "relative cursor-pointer rounded-2xl border-2 p-4 transition-all hover:bg-slate-50",
                        method === 'STRIPE' ? "border-blue-600 bg-blue-50/50 shadow-sm" : "border-slate-200"
                    )}
                >
                    {method === 'STRIPE' && (
                        <div className="absolute top-4 right-4 text-blue-600">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                    )}
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "h-12 w-12 rounded-xl flex items-center justify-center transition-colors",
                            method === 'STRIPE' ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400"
                        )}>
                            <CreditCard className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900">Tarjeta de Crédito / Débito</span>
                                <div className="flex gap-1">
                                    {['visa', 'mastercard', 'amex'].map(bg => (
                                        <div key={bg} className="h-4 w-6 bg-slate-200 rounded animate-pulse" />
                                    ))}
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                +3.6% Fee de Procesamiento
                                {method === 'STRIPE' && (
                                    <span className="block font-semibold text-slate-700 mt-1">
                                        Total a cargar: ${formatCurrency(totalCard)}
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Total Summary */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-2">
                <div className="flex justify-between text-sm text-slate-500">
                    <span>Monto a Pagar</span>
                    <span>${formatCurrency(amount)}</span>
                </div>
                {method === 'STRIPE' && (
                    <div className="flex justify-between text-xs text-slate-400">
                        <span>Comisión Pasarela</span>
                        <span>+${formatCurrency(cardFee)}</span>
                    </div>
                )}
                <div className="flex justify-between text-xl font-black text-slate-900 pt-2 border-t border-slate-200">
                    <span>Total</span>
                    <span>${formatCurrency(method === 'STRIPE' ? totalCard : amount)}</span>
                </div>
            </div>
        </div>
    );
}
