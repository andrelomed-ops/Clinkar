"use client";

import { useState, useEffect } from "react";
import { startTransaction } from "@/app/actions/transaction";
import SmartPaymentSelector from "@/components/checkout/SmartPaymentSelector";
import TrustSeal from "@/components/checkout/TrustSeal";
import SellerDashboardView from "@/components/dashboard/SellerDashboardView";
import { WarrantyService } from "@/services/WarrantyService";
import { PldService } from "@/services/PldService";
import { ArrowLeft, X, Loader2, ShieldCheck, MapPin, Truck, AlertTriangle } from "lucide-react";
import Link from "next/link";
import LEGAL_TEXTS from "@/data/legal_texts.json";

const SIMULATION_CONFIG = {
    CAR_PRICE: 200000,
    DELIVERY_COST: 3500,
    DEFAULT_VEHICLE: "Tesla Model 3",
    DEFAULT_YEAR: "2022",
    DEFAULT_KM: "25,000 km"
};

export default function CheckoutSimulationPage() {
    const [step, setStep] = useState<'DETAILS' | 'PAYMENT' | 'PROCESSING' | 'SUCCESS'>('DETAILS');
    const [selectedMethod, setSelectedMethod] = useState<'STP' | 'STRIPE'>('STP');
    const [deliveryMethod, setDeliveryMethod] = useState<'PICKUP' | 'HOME'>('PICKUP');
    const [isMounted, setIsMounted] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

    const DEPOSIT_AMOUNT = 2500;

    // Concurrency Lock Timer
    const [timeLeft, setTimeLeft] = useState(15 * 60);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (step === 'SUCCESS' || timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    alert("Tu tiempo de apartado ha expirado. El vehículo ha sido liberado.");
                    window.location.href = "/buy";
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [step, timeLeft]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const formatCurrency = (val: number) => isMounted ? val.toLocaleString() : "...";

    const handleProcessDeposit = async () => {
        setStep('PROCESSING');
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            // Inicia la transacción con el depósito
            await startTransaction("00000000-0000-0000-0000-000000000003", {
                deliveryType: deliveryMethod === 'HOME' ? 'home' : 'workshop',
                metadata: {
                    is_deposit_only: true,
                    deposit_amount: DEPOSIT_AMOUNT
                }
            } as any);
            setStep('SUCCESS');
        } catch (error: any) {
            console.error("Deposit failed", error);
            alert("Error en la operación: " + error.message);
            setStep('DETAILS');
        }
    };

    return (
        <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-emerald-500/30">
            {/* UNIFIED HEADER */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-md border-b border-zinc-800 z-50 flex items-center justify-between px-6">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs font-bold tracking-widest uppercase text-emerald-500">Apartado Seguro StarterKar</span>
                </div>
                <Link href="/buy" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
                    <span className="text-sm font-medium">Cancelar</span>
                    <X className="h-5 w-5" />
                </Link>
            </header>

            <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* COLUMNA IZQUIERDA: FLUJO DE APARTADO */}
                    <div className="lg:col-span-7 space-y-6">
                        {step === 'SUCCESS' ? (
                            <div className="bg-zinc-900 rounded-[2rem] p-10 text-center border border-zinc-800 shadow-2xl space-y-6 animate-in zoom-in duration-500">
                                <div className="h-24 w-24 bg-emerald-500/10 text-emerald-500 rounded-full mx-auto flex items-center justify-center border border-emerald-500/20">
                                    <ShieldCheck className="h-12 w-12" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-white">¡Apartado Confirmado!</h2>
                                    <p className="text-zinc-400 mt-2 max-w-md mx-auto">
                                        Tu depósito de <strong>$2,500 MXN</strong> ha sido recibido correctamente. El vehículo ha sido bloqueado exclusivamente para ti.
                                    </p>
                                </div>
                                
                                <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-2xl text-left space-y-4">
                                    <h3 className="font-bold text-emerald-400 flex items-center gap-2">
                                        <Truck className="h-4 w-4" />
                                        Próximos Pasos (Torre de Control)
                                    </h3>
                                    <p className="text-sm text-zinc-300 leading-relaxed">
                                        Nuestra <strong>Torre de Control Central</strong> ha recibido tu solicitud. En un plazo máximo de 2 horas, un administrador te asignará un <strong>Árbitro StarterKar</strong> para coordinar la inspección y entrega física.
                                    </p>
                                    <ul className="text-xs text-zinc-500 space-y-2 list-disc ml-4">
                                        <li>No necesitas contactar al vendedor directamente.</li>
                                        <li>El Árbitro StarterKar será tu único punto de contacto.</li>
                                        <li>Ten lista tu identificación oficial para la cita.</li>
                                    </ul>
                                </div>

                                <Link 
                                    href="/dashboard"
                                    className="inline-flex h-14 items-center justify-center px-8 bg-white text-black rounded-xl font-bold hover:scale-105 transition-transform"
                                >
                                    Ir a mi Dashboard
                                </Link>
                            </div>
                        ) : (
                            <div className="bg-zinc-900 rounded-[2rem] p-8 border border-zinc-800 shadow-2xl space-y-8">
                                <div className="flex items-start justify-between pb-6 border-b border-zinc-800">
                                    <div>
                                        <h1 className="text-2xl font-black text-white">Tesla Model 3</h1>
                                        <p className="text-zinc-400">2022 • 25,000 km</p>
                                        <div className="mt-2 inline-flex flex-col">
                                            <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">Tiempo para Apartar</span>
                                            <span className="text-lg font-black text-amber-400 font-mono">
                                                ⏱ {formatTime(timeLeft)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-zinc-500 uppercase tracking-widest">Monto de Apartado</p>
                                        <p className="text-3xl font-black text-emerald-400 tracking-tight">
                                            ${formatCurrency(DEPOSIT_AMOUNT)}
                                        </p>
                                        <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold">
                                            Abonable al precio total
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl flex gap-4 items-start">
                                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                                    <div className="text-xs text-amber-200/70 leading-relaxed">
                                        <strong>Política de Apartado:</strong> Este monto de $2,500 MXN es <strong>no reembolsable</strong>, ya que cubre los costos logísticos de movilización del Árbitro StarterKar y personal mecánico a la ubicación de entrega. Si decides no concretar la compra por causas ajenas a la unidad, el monto se retiene por gastos de gestión.
                                    </div>
                                </div>

                                <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 space-y-4">
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            id="terms-check"
                                            className="mt-1 h-5 w-5 rounded border-zinc-700 text-emerald-500 focus:ring-emerald-500 bg-zinc-800 cursor-pointer"
                                            checked={agreedToTerms}
                                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                                        />
                                        <label htmlFor="terms-check" className="text-xs text-zinc-300 leading-relaxed cursor-pointer select-none">
                                            Acepto que el depósito es no reembolsable y autorizo a la <strong>Torre de Control StarterKar</strong> para gestionar mi cita de entrega.
                                        </label>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            id="privacy-check"
                                            className="mt-1 h-5 w-5 rounded border-zinc-700 text-emerald-500 focus:ring-emerald-500 bg-zinc-800 cursor-pointer"
                                            checked={agreedToPrivacy}
                                            onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                                        />
                                        <label htmlFor="privacy-check" className="text-xs text-zinc-300 leading-relaxed cursor-pointer select-none">
                                            Consiento el tratamiento de mis datos personales para la asignación del Árbitro StarterKar conforme al Aviso de Privacidad.
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">¿Dónde quieres recibir el auto?</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setDeliveryMethod('PICKUP')}
                                            className={`p-4 rounded-xl border-2 text-left transition-all ${deliveryMethod === 'PICKUP' ? 'border-emerald-500 bg-emerald-500/5' : 'border-zinc-800 bg-zinc-950'}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <MapPin className="h-5 w-5 text-zinc-400" />
                                                <div>
                                                    <p className="font-bold">Hub StarterKar</p>
                                                    <p className="text-xs text-emerald-500">Sin costo extra</p>
                                                </div>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => setDeliveryMethod('HOME')}
                                            className={`p-4 rounded-xl border-2 text-left transition-all ${deliveryMethod === 'HOME' ? 'border-emerald-500 bg-emerald-500/5' : 'border-zinc-800 bg-zinc-950'}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <Truck className="h-5 w-5 text-zinc-400" />
                                                <div>
                                                    <p className="font-bold">A Domicilio</p>
                                                    <p className="text-xs text-emerald-500">Sujeto a cobertura</p>
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={handleProcessDeposit}
                                    disabled={step === 'PROCESSING' || !agreedToTerms || !agreedToPrivacy}
                                    className="w-full h-16 bg-emerald-500 text-black rounded-2xl font-bold text-lg hover:bg-emerald-400 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center justify-center gap-3 disabled:opacity-50 disabled:pointer-events-none"
                                >
                                    {step === 'PROCESSING' ? (
                                        <>
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                            Procesando Apartado...
                                        </>
                                    ) : (
                                        `Apartar con $${formatCurrency(DEPOSIT_AMOUNT)}`
                                    )}
                                </button>

                                <TrustSeal />
                            </div>
                        )}
                    </div>

                    {/* COLUMNA DERECHA: INFO DE SEGURIDAD */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-zinc-900/50 rounded-3xl p-6 border border-zinc-800 space-y-6">
                            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                Garantía StarterKar
                            </h3>
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                                        <span className="text-lg">⚖️</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">Arbitraje Neutral</p>
                                        <p className="text-xs text-zinc-500 mt-1">Un profesional independiente supervisará la entrega para evitar fraudes y asegurar legalidad.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                                        <span className="text-lg">💰</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">Escrow Blindado</p>
                                        <p className="text-xs text-zinc-500 mt-1">El resto del pago solo se libera al vendedor cuando tú confirmas la recepción del auto ante el Árbitro.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                                        <span className="text-lg">📋</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">Cero Contacto Directo</p>
                                        <p className="text-xs text-zinc-500 mt-1">Protegemos tu privacidad. La Torre de Control gestiona todo para evitar negociaciones fuera de protocolo.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
