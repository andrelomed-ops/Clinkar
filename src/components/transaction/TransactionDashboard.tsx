"use client";

import { useState } from "react";
import { VisualEscrow } from "./VisualEscrow";
import { SPEISimulator } from "./SPEISimulator";
import { LogisticsTracker } from "./LogisticsTracker";
import { CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";

interface TransactionDashboardProps {
    car: any; // Using any for simplicity in mock, realistically Vehicle type
    totalPrice: number;
}

type TransactionStep = 'AWAITING_PAYMENT' | 'FUNDS_SECURED' | 'IN_TRANSIT' | 'DELIVERED';

export const TransactionDashboard = ({ car, totalPrice }: TransactionDashboardProps) => {
    const [step, setStep] = useState<TransactionStep>('AWAITING_PAYMENT');
    const [trxId] = useState(() => Math.floor(Math.random() * 1000000));

    const handlePaymentComplete = () => {
        setStep('FUNDS_SECURED');
        // Simulate logistics kickoff
        setTimeout(() => {
            setStep('IN_TRANSIT');
        }, 8000); // 8 seconds to admire the secured vault before shipping starts
    };

    return (
        <div className="space-y-8">
            {/* Status Header */}
            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                    <ShieldCheck size={200} />
                </div>

                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase mb-4">
                        <div className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                        ID: #TRX-{trxId}
                    </div>
                    <h1 className="text-3xl font-black mb-2">
                        {step === 'AWAITING_PAYMENT' && "Esperando Depósito"}
                        {step === 'FUNDS_SECURED' && "Pago Asegurado"}
                        {step === 'IN_TRANSIT' && "Vehículo en Camino"}
                        {step === 'DELIVERED' && "Entregado"}
                    </h1>
                    <p className="text-slate-400 max-w-xl">
                        {step === 'AWAITING_PAYMENT' && "Realiza la transferencia SPEI para asegurar el vehículo. Tu dinero no se libera al vendedor hasta tu aprobación."}
                        {step === 'FUNDS_SECURED' && "Hemos recibido tus fondos. Están resguardados en la Bóveda Clinkar mientras preparamos el envío."}
                        {step === 'IN_TRANSIT' && "El vendedor ha entregado el vehículo y nuestro equipo logístico lo lleva hacia ti."}
                    </p>
                </div>

                {/* Step Indicator */}
                <div className="flex gap-2 mt-8">
                    {['Pago', 'Custodia', 'Envío', 'Entrega'].map((label, i) => {
                        const isActive = (step === 'AWAITING_PAYMENT' && i === 0) ||
                            (step === 'FUNDS_SECURED' && i <= 1) ||
                            (step === 'IN_TRANSIT' && i <= 2) ||
                            (step === 'DELIVERED' && i <= 3);
                        return (
                            <div key={label} className={`h-1 flex-1 rounded-full transitions-all duration-500 ${isActive ? 'bg-indigo-500' : 'bg-slate-700'}`} />
                        );
                    })}
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Action Area */}
                <div className="lg:col-span-2 space-y-8">
                    {step === 'AWAITING_PAYMENT' && (
                        <SPEISimulator amount={totalPrice} onPaymentComplete={handlePaymentComplete} />
                    )}

                    {(step === 'FUNDS_SECURED' || step === 'IN_TRANSIT') && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <VisualEscrow amount={totalPrice} isSecured={true} />
                        </div>
                    )}

                    {step === 'IN_TRANSIT' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                            <LogisticsTracker
                                origin={car.location}
                                destination="Tu Ubicación (CDMX)"
                                status="in_transit"
                                eta="Mañana, 14:00 PM"
                            />
                        </div>
                    )}
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
                        <h3 className="font-bold text-lg mb-4">Resumen</h3>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="h-16 w-16 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                                    <img src={car.images[0]} className="h-full w-full object-cover" />
                                </div>
                                <div>
                                    <div className="font-bold text-sm">{car.make} {car.model}</div>
                                    <div className="text-xs text-muted-foreground">{car.year} • {car.location}</div>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-border space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Vehículo</span>
                                    <span className="font-medium">${car.price.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Operación Clinkar</span>
                                    <span className="font-medium">$3,448</span>
                                </div>
                                <div className="flex justify-between text-primary font-bold pt-2 border-t border-border">
                                    <span>Total</span>
                                    <span>${totalPrice.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100 text-xs text-indigo-900 space-y-3">
                        <div className="font-bold flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" />
                            Garantía de Satisfacción
                        </div>
                        <p className="leading-relaxed opacity-80">
                            Tienes 7 días o 300km después de recibir el auto para probarlo. Si no te convence, lo devuelves y te regresamos el 100% de tu dinero desde la Bóveda.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
