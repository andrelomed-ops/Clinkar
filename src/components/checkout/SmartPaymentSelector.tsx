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
    const [method, setMethod] = useState<'STP' | 'STRIPE'>('STP');
    const [isLoading, setIsLoading] = useState(false);

    const CARD_FEE_PERCENT = 0.036; // 3.6%
    const cardFee = amount * CARD_FEE_PERCENT;
    const totalCard = amount + cardFee;

    const formatCurrency = (val: number) => val.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

    const handleSelect = (m: 'STP' | 'STRIPE') => {
        setMethod(m);
        if (onPaymentMethodSelect) {
            onPaymentMethodSelect(m, m === 'STRIPE' ? totalCard : amount);
        }
    };

    const handleSPEIPayment = async () => {
        if (!carId) return;
        setIsLoading(true);
        try {
            const res = await fetch('/api/checkout/spei', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ carId })
            });

            const data = await res.json();
            if (data.success) {
                if (onPaymentSuccess) onPaymentSuccess();
            } else {
                alert("Error en simulación: " + (data.error || "Desconocido"));
                setIsLoading(false);
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión");
            setIsLoading(false);
        }
    };

    const handleStripeCheckout = async () => {
        if (!carId) return;
        setIsLoading(true);
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    carId,
                    carTitle,
                    amount: totalCard,
                    imageUrl,
                }),
            });

            const data = await res.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                console.error("No checkout URL returned", data);
                alert("Error iniciando pago: " + (data.error || "Desconocido"));
                setIsLoading(false);
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión");
            setIsLoading(false);
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

                    {method === 'STP' && (
                        <div className="mt-4 pt-4 border-t border-blue-200 animate-in fade-in slide-in-from-top-2">
                            <SPEISimulator
                                amount={amount}
                                onPaymentComplete={handleSPEIPayment}
                            />
                        </div>
                    )}
                </div>

                {/* Opción B: Tarjeta (Stripe) */}
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
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                +3.6% Fee de Procesamiento
                            </p>
                        </div>
                    </div>

                    {method === 'STRIPE' && (
                        <div className="mt-4 pt-4 border-t border-blue-200 cursor-default animate-in fade-in slide-in-from-top-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleStripeCheckout();
                                }}
                                disabled={isLoading}
                                className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50 flex justify-center items-center gap-2 transition-all shadow-lg shadow-indigo-200"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin h-5 w-5" />
                                        Iniciando Sesión Segura...
                                    </>
                                ) : (
                                    <>
                                        Proceder al Pago Seguro
                                        <ChevronRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                            <p className="text-center text-[10px] text-slate-400 mt-2">
                                Serás redirigido a Stripe para completar tu pago de forma segura.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Total Summary */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-2">
                <div className="flex justify-between text-sm text-slate-500">
                    <span>Monto a Pagar</span>
                    <span>{formatCurrency(amount)}</span>
                </div>
                {method === 'STRIPE' && (
                    <div className="flex justify-between text-xs text-slate-400">
                        <span>Comisión Pasarela (+3.6%)</span>
                        <span>+{formatCurrency(cardFee)}</span>
                    </div>
                )}
                <div className="flex justify-between text-xl font-black text-slate-900 pt-2 border-t border-slate-200">
                    <span>Total</span>
                    <span>{formatCurrency(method === 'STRIPE' ? totalCard : amount)}</span>
                </div>
            </div>
        </div>
    );
}
