"use client";

import { useState } from "react";
import { Truck, MapPin, ShieldCheck, Info, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogisticsSelectorProps {
    carValue: number;
    origin: string;
    destination: string;
    onSelectOption: (option: 'pickup' | 'concierge', cost: number) => void;
}

export function LogisticsSelector({ carValue, origin, destination, onSelectOption }: LogisticsSelectorProps) {
    const [selected, setSelected] = useState<'pickup' | 'concierge' | null>(null);
    const [calculating, setCalculating] = useState(false);

    // Mock Calculation Logic
    const baseShippingRate = 12000; // Base fee for long distance
    const insuranceRate = 0.005; // 0.5% of car value for insurance
    const insuranceCost = carValue * insuranceRate;
    const totalShippingCost = baseShippingRate + insuranceCost;

    const handleSelect = (option: 'pickup' | 'concierge') => {
        if (option === 'concierge') {
            setCalculating(true);
            setTimeout(() => {
                setCalculating(false);
                setSelected(option);
                onSelectOption(option, totalShippingCost);
            }, 1500); // Simulate API quote
        } else {
            setSelected(option);
            onSelectOption(option, 0);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 mb-2 px-1">
                <Truck className="h-5 w-5 text-slate-400" />
                <h2 className="text-lg font-bold text-slate-900">Logística de Entrega</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* OPTION 1: PICKUP */}
                <div
                    onClick={() => handleSelect('pickup')}
                    className={cn(
                        "relative p-6 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-lg group",
                        selected === 'pickup'
                            ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900"
                            : "border-slate-200 bg-white hover:border-slate-300"
                    )}
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                            <MapPin className="h-5 w-5 text-slate-600" />
                        </div>
                        {selected === 'pickup' && <CheckCircle2 className="h-6 w-6 text-slate-900" />}
                    </div>
                    <h3 className="font-black text-slate-900 text-lg mb-1">Voy por él</h3>
                    <p className="text-sm text-slate-500 font-medium mb-4">Entrega personal en punto seguro.</p>

                    <div className="space-y-2 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                            <span>Sin costo adicional</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                            <span>Verificación física inmediata</span>
                        </div>
                    </div>
                </div>

                {/* OPTION 2: CONCIERGE */}
                <div
                    onClick={() => handleSelect('concierge')}
                    className={cn(
                        "relative p-6 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-lg group overflow-hidden",
                        selected === 'concierge'
                            ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600"
                            : "border-slate-200 bg-white hover:border-blue-200"
                    )}
                >
                    {/* Badge */}
                    <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                        RECOMENDADO
                    </div>

                    <div className="flex justify-between items-start mb-4">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                            <Truck className="h-5 w-5 text-blue-600" />
                        </div>
                        {selected === 'concierge' && !calculating && <CheckCircle2 className="h-6 w-6 text-blue-600" />}
                    </div>

                    <h3 className="font-black text-slate-900 text-lg mb-1">Clinkar Concierge</h3>
                    <p className="text-sm text-slate-500 font-medium mb-4">Te lo llevamos a la puerta de tu casa.</p>

                    {calculating ? (
                        <div className="py-4 flex items-center gap-3 text-blue-600">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span className="text-xs font-bold">Cotizando ruta segura...</span>
                        </div>
                    ) : selected === 'concierge' ? (
                        <div className="bg-white/80 rounded-xl p-3 border border-blue-200 space-y-2 animate-in zoom-in-95">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Envío Blindado</span>
                                <span className="font-bold text-slate-900">${baseShippingRate.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500 flex items-center gap-1">
                                    <ShieldCheck className="h-3 w-3 text-blue-500" /> Seguro de Traslado
                                </span>
                                <span className="font-bold text-slate-900">${insuranceCost.toLocaleString()}</span>
                            </div>
                            <div className="border-t border-dashed border-blue-200 pt-2 flex justify-between text-sm font-black text-blue-700">
                                <span>Total Logística</span>
                                <span>${totalShippingCost.toLocaleString()}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2 text-xs text-slate-600">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-3 w-3 text-blue-500" />
                                <span>Rastreo GPS en tiempo real</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-3 w-3 text-blue-500" />
                                <span>Incluye Seguro de Traslado (Cobertura 100%)</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
