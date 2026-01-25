"use client";

import { useState, useEffect } from "react";
import SmartPaymentSelector from "@/components/checkout/SmartPaymentSelector";
import TrustSeal from "@/components/checkout/TrustSeal";
import SellerDashboardView from "@/components/dashboard/SellerDashboardView";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import LEGAL_TEXTS from "@/data/legal_texts.json";

export default function CheckoutSimulationPage() {
    const [step, setStep] = useState<'DETAILS' | 'PAYMENT' | 'PROCESSING' | 'SUCCESS'>('DETAILS');
    const [selectedMethod, setSelectedMethod] = useState<'STP' | 'STRIPE'>('STP');
    const [finalAmount, setFinalAmount] = useState(200000); // 200k base
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const formatCurrency = (val: number) => isMounted ? val.toLocaleString() : "...";

    const handleProcessPayment = () => {
        setStep('PROCESSING');
        // Mock API Latency
        setTimeout(() => {
            setStep('SUCCESS');
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4">

            <header className="w-full max-w-4xl flex items-center gap-4 mb-8">
                <Link href="/dashboard" className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-400 hover:text-slate-900 transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Checkout Seguro</h1>
                    <p className="text-xs text-slate-500">Transacción ID: #CLK-MOCK-99</p>
                </div>
            </header>

            <main className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT COLUMN: Payment Block */}
                <div className="lg:col-span-7 space-y-6">
                    {step === 'SUCCESS' ? (
                        <div className="bg-white rounded-[2rem] p-10 text-center shadow-sm space-y-6 animate-in zoom-in duration-500">
                            <div className="h-24 w-24 bg-green-100 text-green-600 rounded-full mx-auto flex items-center justify-center">
                                <span className="text-4xl">🎉</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900">¡Pago Exitoso!</h2>
                                <p className="text-slate-500 mt-2">
                                    Hemos recibido tu {selectedMethod === 'STP' ? 'transferencia' : 'pago con tarjeta'}.
                                </p>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-2xl text-left text-sm space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Monto Total</span>
                                    <span className="font-bold text-slate-900">${formatCurrency(finalAmount)} MXN</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Referencia</span>
                                    <span className="font-mono text-slate-900">#CLK-SUCCESS-001</span>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400">
                                {LEGAL_TEXTS.FINANCING_DISCLAIMER}
                            </p>
                        </div>
                    ) : (
                        // PAYMENT FORM
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm space-y-8">
                            <SmartPaymentSelector
                                amount={200000}
                                onPaymentMethodSelect={(m, total) => {
                                    setSelectedMethod(m);
                                    setFinalAmount(total);
                                }}
                            />

                            <TrustSeal />

                            <button
                                onClick={handleProcessPayment}
                                disabled={step === 'PROCESSING'}
                                className="w-full h-16 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {step === 'PROCESSING' ? (
                                    <>
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                        Procesando...
                                    </>
                                ) : (
                                    `Pagar $${formatCurrency(finalAmount)}`
                                )}
                            </button>

                            <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest">
                                Encriptación SSL de 256-bits
                            </p>
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: Sidebar Summary / Dashboard Preview */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Car Summary */}
                    <div className="bg-slate-900 text-slate-300 rounded-[2rem] p-8">
                        <img src="https://images.unsplash.com/photo-1541443131876-44b03de101c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                            alt="Car"
                            className="w-full h-40 object-cover rounded-xl mb-4 opacity-80"
                        />
                        <h3 className="text-xl font-bold text-white">Tesla Model 3 (2022)</h3>
                        <p className="text-sm">Dual Motor • 15,000 km</p>
                    </div>

                    {/* Simulating what the SELLER sees */}
                    <div className="opacity-80 hover:opacity-100 transition-opacity">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-2 pl-4">Vista del Vendedor (Simulación)</p>
                        <SellerDashboardView />
                    </div>
                </div>

            </main>
        </div>
    );
}
