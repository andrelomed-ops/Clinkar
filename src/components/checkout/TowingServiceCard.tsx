"use client";

import { useState } from "react";
import { Truck, MapPin, Navigation, ArrowRight, ShieldCheck, Clock, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TowingServiceCardProps {
    carLocation: string;
    carName: string;
    isBusinessProfile?: boolean;
}

export function TowingServiceCard({ carLocation, carName, isBusinessProfile = false }: TowingServiceCardProps) {
    const [step, setStep] = useState<'IDLE' | 'CALCULATING' | 'QUOTE'>('IDLE');
    const [destination, setDestination] = useState("");

    const handleCalculate = () => {
        setStep('CALCULATING');
        setTimeout(() => setStep('QUOTE'), 1500);
    };

    return (
        <div className="glass-card rounded-[2.5rem] p-8 border-indigo-500/10 shadow-2xl shadow-indigo-500/5 relative overflow-hidden group">
            {/* Background Accent */}
            <div className="absolute -top-10 -right-10 opacity-5 group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
                <Truck className="h-40 w-40 text-indigo-600" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                        <Truck className="h-7 w-7" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black tracking-tight italic">Ecosistema Logística</h3>
                        <p className="text-sm text-indigo-500 font-bold uppercase tracking-widest flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3" /> Red de Grúas Certificadas
                        </p>
                    </div>
                </div>

                {step === 'IDLE' && (
                    <div className="space-y-6 animate-reveal">
                        <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                            {isBusinessProfile
                                ? "Optimiza el traslado de este vehículo a tu patio de autopartes. Solicita una grúa aliada con tarifa preferencial Business."
                                : `¿Necesitas trasladar tu ${carName}? Conéctate con grúas verificadas por Clinkar desde ${carLocation}.`
                            }
                        </p>

                        <div className="space-y-4">
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                <input
                                    className="w-full h-14 pl-12 pr-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border-2 border-transparent focus:border-indigo-500/50 transition-all outline-none font-bold text-sm"
                                    placeholder="¿A dónde enviamos el vehículo?"
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                />
                            </div>
                            <Button
                                onClick={handleCalculate}
                                disabled={!destination}
                                className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-xl"
                            >
                                Calcular Traslado <Navigation className="ml-2 h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                )}

                {step === 'CALCULATING' && (
                    <div className="py-12 flex flex-col items-center justify-center space-y-4 animate-pulse">
                        <Calculator className="h-10 w-10 text-indigo-500 animate-spin" />
                        <p className="text-sm font-black text-zinc-500 uppercase tracking-widest">Calculando ruta óptima...</p>
                    </div>
                )}

                {step === 'QUOTE' && (
                    <div className="animate-reveal space-y-6">
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-500/20 p-6 rounded-3xl">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Tarifa Clinkar Express</span>
                                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 italic"><Clock className="h-3 w-3" /> Disponible ahora</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-emerald-600">$1,850</span>
                                <span className="text-sm font-bold text-zinc-400 text-line-through decoration-red-500/50">$2,400</span>
                            </div>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase mt-2 italic">Ahorro del 23% por ser miembro de la Bóveda</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                                <p className="text-[9px] font-black text-zinc-400 uppercase mb-1">Distancia</p>
                                <p className="font-bold">24.5 km</p>
                            </div>
                            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                                <p className="text-[9px] font-black text-zinc-400 uppercase mb-1">ETA Gruero</p>
                                <p className="font-bold text-indigo-600">35-45 min</p>
                            </div>
                        </div>

                        <Button className="w-full h-14 rounded-2xl bg-zinc-900 dark:bg-white dark:text-zinc-900 font-black text-lg shadow-xl shadow-zinc-500/20">
                            Confirmar Grúa <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>

                        <button
                            onClick={() => setStep('IDLE')}
                            className="w-full text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
                        >
                            Modificar destino
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
