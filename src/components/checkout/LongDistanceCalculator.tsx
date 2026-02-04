"use client";

import { useState } from "react";
import { Truck, MapPin, ArrowRight, Info, Calculator, Navigation2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LongDistanceCalculatorProps {
    origin: string;
    onSelectPrice?: (price: number) => void;
}

export function LongDistanceCalculator({ origin, onSelectPrice }: LongDistanceCalculatorProps) {
    const [destination, setDestination] = useState("");
    const [calculating, setCalculating] = useState(false);
    const [result, setResult] = useState<{ distance: number, price: number } | null>(null);

    const handleCalculate = () => {
        if (!destination) return;
        setCalculating(true);
        // Simulate complex route calculation
        setTimeout(() => {
            const mockDistance = Math.floor(Math.random() * 800) + 200; // 200 - 1000 km
            const pricePerKm = 18.5;
            setResult({
                distance: mockDistance,
                price: Math.floor(mockDistance * pricePerKm)
            });
            setCalculating(false);
        }, 2000);
    };

    return (
        <div className="glass-card rounded-[2.5rem] p-8 border-indigo-500/10 shadow-2xl shadow-indigo-500/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                <Navigation2 className="h-40 w-40 text-indigo-600" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                        <Truck className="h-7 w-7" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black tracking-tight">Traslado Interestatal</h3>
                        <p className="text-xs text-indigo-500 font-bold uppercase tracking-widest">Alianza Logística Nacional</p>
                    </div>
                </div>

                {!result ? (
                    <div className="space-y-6">
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-500/10 flex gap-3">
                            <Info className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 font-medium">
                                Ideal para compras desde <strong>Tijuana, Monterrey o Guadalajara</strong> hacia el centro del país. Servicio en nodriza con seguro total.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Origen</label>
                                <div className="h-12 flex items-center px-4 bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-transparent font-bold text-sm text-zinc-500 italic">
                                    {origin}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Destino</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-indigo-500" />
                                    <input
                                        className="w-full h-12 pl-9 pr-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-2 border-transparent focus:border-indigo-500/50 outline-none font-bold text-sm"
                                        placeholder="Ej: CDMX"
                                        value={destination}
                                        onChange={(e) => setDestination(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={handleCalculate}
                            disabled={!destination || calculating}
                            className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-xl"
                        >
                            {calculating ? <Calculator className="animate-spin h-5 w-5" /> : "Calcular Cotización"}
                        </Button>
                    </div>
                ) : (
                    <div className="animate-reveal space-y-6">
                        <div className="flex justify-between items-end p-6 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-3xl">
                            <div>
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Costo Estimado Nodriza</p>
                                <div className="text-4xl font-black text-emerald-600 tracking-tighter">${result.price.toLocaleString()}</div>
                                <p className="text-[10px] text-zinc-400 font-bold mt-2 flex items-center gap-1">
                                    <Check className="h-3 w-3" /> Seguro de carga incluido (hasta $1M)
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-zinc-400 uppercase mb-1">Distancia</p>
                                <p className="text-lg font-black">{result.distance} km</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setResult(null)}
                                className="flex-1 h-12 rounded-xl border border-zinc-200 dark:border-zinc-800 font-bold text-xs uppercase tracking-widest hover:bg-zinc-50 transition-colors"
                            >
                                Recalcular
                            </button>
                            <Button
                                onClick={() => onSelectPrice?.(result.price)}
                                className="flex-[2] h-12 rounded-xl bg-zinc-900 dark:bg-white dark:text-zinc-900 font-black text-xs uppercase tracking-widest"
                            >
                                Contratar Servicio <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
