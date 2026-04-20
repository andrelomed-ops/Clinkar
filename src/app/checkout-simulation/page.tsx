"use client";

import { useState, useEffect } from "react";
import { startTransaction } from "@/app/actions/transaction";
import SmartPaymentSelector from "@/components/checkout/SmartPaymentSelector";
import TrustSeal from "@/components/checkout/TrustSeal";
import SellerDashboardView from "@/components/dashboard/SellerDashboardView";
import { ArrowLeft, X, Loader2, ShieldCheck, MapPin, Truck } from "lucide-react";
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
    // Single step flow now: DETAILS -> PROCESSING -> SUCCESS
    const [step, setStep] = useState<'DETAILS' | 'PAYMENT' | 'PROCESSING' | 'SUCCESS'>('DETAILS');
    const [selectedMethod, setSelectedMethod] = useState<'STP' | 'STRIPE'>('STP');
    const [deliveryMethod, setDeliveryMethod] = useState<'PICKUP' | 'HOME'>('PICKUP');
    const [isMounted, setIsMounted] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

    // Concurrency Lock Timer
    const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (step === 'SUCCESS' || timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    // Lock Expired
                    alert("Tu tiempo para procesar el pago ha expirado. El vehículo ha sido liberado para otros compradores.");
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

    // Dynamic Total Calculation
    const totalAmount = deliveryMethod === 'HOME' ? SIMULATION_CONFIG.CAR_PRICE + SIMULATION_CONFIG.DELIVERY_COST : SIMULATION_CONFIG.CAR_PRICE;

    const handleProcessPayment = async () => {
        setStep('PROCESSING');

        try {
            await startTransaction("00000000-0000-0000-0000-000000000003", {
                logistics: deliveryMethod === 'HOME' ? { type: 'HOME', cost: SIMULATION_CONFIG.DELIVERY_COST } : undefined
            });
            // If we're here, it succeeded but since startTransaction redirects, it shouldn't execute.
            setStep('SUCCESS');
        } catch (error: any) {
            console.error("Payment failed", error);
            alert("Payment Error: " + error.message);
            setStep('DETAILS'); // Reset
        }
    };

    return (
        <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-blue-500/30">

            {/* UNIFIED HEADER */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-md border-b border-zinc-800 z-50 flex items-center justify-between px-6">
                <Link href="/buy" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                    <span className="text-sm font-medium">Volver al Mercado</span>
                </Link>

                <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs font-bold tracking-widest uppercase text-emerald-500">Checkout Seguro</span>
                </div>

                <Link href="/buy" className="flex items-center gap-2 text-red-500/80 hover:text-red-400 transition-colors">
                    <span className="text-sm font-medium">Cancelar Operación</span>
                    <X className="h-5 w-5" />
                </Link>
            </header>

            <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* COLUMNA IZQUIERDA: PERFIL COMPRADOR */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-xl font-bold text-white">Tu Compra</h2>
                            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">
                                VISTA COMPRADOR
                            </span>
                        </div>

                        {step === 'SUCCESS' ? (
                            <div className="bg-zinc-900 rounded-[2rem] p-10 text-center border border-zinc-800 shadow-2xl space-y-6 animate-in zoom-in duration-500">
                                <div className="h-24 w-24 bg-emerald-500/10 text-emerald-500 rounded-full mx-auto flex items-center justify-center border border-emerald-500/20">
                                    <span className="text-4xl">🎉</span>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white">¡Todo Listo!</h2>
                                    <p className="text-zinc-400 mt-2">
                                        Pago recibido y tu auto está en camino.
                                    </p>
                                </div>
                                <div className="bg-zinc-950 p-6 rounded-2xl text-left text-sm space-y-3 border border-zinc-800">
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">Método de Entrega</span>
                                        <span className="font-medium text-white">
                                            {deliveryMethod === 'HOME' ? 'Envío a Domicilio' : 'Pick-up en Hub'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-t border-zinc-800 pt-3 mt-3">
                                        <span className="text-zinc-500">Monto Total Pagado</span>
                                        <span className="font-bold text-white">${formatCurrency(totalAmount)} MXN</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">Referencia</span>
                                        <span className="font-mono text-zinc-300">#CLK-SUCCESS-001</span>
                                    </div>
                                </div>
                                <p className="text-xs text-zinc-600 px-4">
                                    {LEGAL_TEXTS.FINANCING_DISCLAIMER}
                                </p>
                            </div>
                        ) : (
                            // PAYMENT FORM (Details, Payment, Processing)
                            (step === 'DETAILS' || step === 'PAYMENT' || step === 'PROCESSING') && (
                                <div className="bg-zinc-900 rounded-[2rem] p-8 border border-zinc-800 shadow-2xl space-y-8">
                                    {/* Header del Auto */}
                                    <div className="flex items-start justify-between pb-6 border-b border-zinc-800">
                                        <div>
                                            <h1 className="text-2xl font-black text-white">Tesla Model 3</h1>
                                            <p className="text-zinc-400">2022 • 25,000 km</p>
                                            <div className="mt-2 inline-flex flex-col">
                                                <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">Tiempo Exclusivo de Compra</span>
                                                <span className="text-lg font-black text-amber-400 font-mono flex items-center gap-2">
                                                    ⏱ {formatTime(timeLeft)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-zinc-500 uppercase tracking-widest">Total a Pagar</p>
                                            <p className="text-3xl font-black text-emerald-400 tracking-tight transition-all duration-300">
                                                ${formatCurrency(totalAmount)}
                                            </p>
                                            {deliveryMethod === 'HOME' && (
                                                <p className="text-xs text-emerald-500 mt-1 animate-in fade-in font-medium">
                                                    + Envío (${formatCurrency(SIMULATION_CONFIG.DELIVERY_COST)}) incluido
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {/* Legal Consent Checkboxes */}
                                    <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 space-y-4">
                                        <div className="flex items-start gap-3">
                                            <input
                                                type="checkbox"
                                                id="terms-check"
                                                className="mt-1 h-5 w-5 rounded border-zinc-700 text-emerald-500 focus:ring-emerald-500 bg-zinc-800 transition-all cursor-pointer"
                                                checked={agreedToTerms}
                                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                                aria-label="Aceptar términos y condiciones"
                                                required
                                            />
                                            <label htmlFor="terms-check" className="text-xs text-zinc-300 leading-relaxed cursor-pointer select-none">
                                                He leído y acepto los <Link href="/terms" className="text-emerald-500 hover:text-emerald-400 font-bold transition-colors underline decoration-emerald-500/30 underline-offset-4">Términos y Condiciones de Uso</Link>, incluyendo la validez de la Firma Electrónica mediante Código QR.
                                            </label>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <input
                                                type="checkbox"
                                                id="privacy-check"
                                                className="mt-1 h-5 w-5 rounded border-zinc-700 text-emerald-500 focus:ring-emerald-500 bg-zinc-800 transition-all cursor-pointer"
                                                checked={agreedToPrivacy}
                                                onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                                                aria-label="Aceptar aviso de privacidad"
                                                required
                                            />
                                            <label htmlFor="privacy-check" className="text-xs text-zinc-300 leading-relaxed cursor-pointer select-none">
                                                Consiento el tratamiento de mis datos personales conforme al <Link href="/privacy" className="text-emerald-500 hover:text-emerald-400 font-bold transition-colors underline decoration-emerald-500/30 underline-offset-4">Aviso de Privacidad Integral</Link> (LFPDPPP).
                                            </label>
                                        </div>
                                    </div>

                                    {/* DELIVERY SELECTION SECTION */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Método de Entrega</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <button
                                                onClick={() => setDeliveryMethod('PICKUP')}
                                                className={`group relative p-4 rounded-xl border-2 text-left transition-all ${deliveryMethod === 'PICKUP'
                                                    ? 'border-emerald-500 bg-emerald-500/5'
                                                    : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`p-2 rounded-lg ${deliveryMethod === 'PICKUP' ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                                                        <MapPin className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className={`font-bold ${deliveryMethod === 'PICKUP' ? 'text-white' : 'text-zinc-300'}`}>Pick-up en Hub</p>
                                                        <p className="text-xs text-emerald-500 font-bold mt-0.5">Gratis</p>
                                                    </div>
                                                </div>
                                            </button>

                                            <button
                                                onClick={() => setDeliveryMethod('HOME')}
                                                className={`group relative p-4 rounded-xl border-2 text-left transition-all ${deliveryMethod === 'HOME'
                                                    ? 'border-emerald-500 bg-emerald-500/5'
                                                    : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`p-2 rounded-lg ${deliveryMethod === 'HOME' ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                                                        <Truck className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className={`font-bold ${deliveryMethod === 'HOME' ? 'text-white' : 'text-zinc-300'}`}>Envío a Domicilio</p>
                                                        <p className="text-xs text-emerald-500 font-bold mt-0.5">+${formatCurrency(SIMULATION_CONFIG.DELIVERY_COST)}</p>
                                                    </div>
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="border-t border-zinc-800 my-6"></div>

                                    <SmartPaymentSelector
                                        amount={totalAmount}
                                        onPaymentMethodSelect={(m) => {
                                            setSelectedMethod(m);
                                        }}
                                    />

                                    <TrustSeal />

                                    <button
                                        onClick={handleProcessPayment}
                                        disabled={step === 'PROCESSING' || !agreedToTerms || !agreedToPrivacy}
                                        className="w-full h-16 bg-white text-black rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center justify-center gap-3 disabled:opacity-50 disabled:pointer-events-none"
                                    >
                                        {step === 'PROCESSING' ? (
                                            <>
                                                <Loader2 className="h-6 w-6 animate-spin" />
                                                Procesando Pago Total...
                                            </>
                                        ) : (
                                            `Pagar $${formatCurrency(totalAmount)}`
                                        )}
                                    </button>

                                    <p className="text-center text-[10px] text-zinc-600 uppercase tracking-widest">
                                        Encriptación SSL de 256-bits • Transacción Segura
                                    </p>
                                </div>
                            )
                        )}
                    </div>

                    {/* COLUMNA DERECHA: PERFIL VENDEDOR */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Monitor en Tiempo Real</h2>
                            <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 text-xs font-bold border border-zinc-700">
                                VISTA VENDEDOR
                            </span>
                        </div>
                        <div className="sticky top-24 opacity-80 hover:opacity-100 transition-opacity">
                            <SellerDashboardView />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
