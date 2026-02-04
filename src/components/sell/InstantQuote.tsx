
"use client";

import React, { useState, useMemo } from 'react';
import { ArrowRight, Banknote, ShieldCheck, Sparkles, RefreshCw, BarChart3 } from 'lucide-react';
import { ALL_CARS } from "@/data/cars";

export const InstantQuote = () => {
    const [step, setStep] = useState<'INPUT' | 'ANALYZING' | 'RESULT'>('INPUT');

    // Form State
    const [year, setYear] = useState("");
    const [make, setMake] = useState("");
    const [model, setModel] = useState("");
    const [mileage, setMileage] = useState("");

    const [quote, setQuote] = useState<{ min: number, max: number, confidence: number } | null>(null);

    const availableMakes = useMemo(() => {
        const makes = new Set(ALL_CARS.map(car => car.make));
        return Array.from(makes).sort();
    }, []);

    const handleCalculate = () => {
        setStep('ANALYZING');

        // Simulate AI Processing Steps
        setTimeout(() => {
            // Logic: Base price from inventory or default, adjusted by mileage/year
            const brandCars = ALL_CARS.filter(c => c.make === make);
            let basePrice = brandCars.length > 0
                ? brandCars.reduce((acc, c) => acc + c.price, 0) / brandCars.length
                : 350000; // Default if brand not found

            // Year Adjustment (Assuming 2025 is base, -5% per year old)
            const age = 2025 - parseInt(year);
            basePrice = basePrice * Math.pow(0.95, age);

            // Mileage Adjustment (Assuming 15k km/year is standard)
            const standardMileage = age * 15000;
            const inputMileage = parseInt(mileage) || standardMileage;
            if (inputMileage > standardMileage) {
                basePrice = basePrice * 0.90; // High mileage penalty
            }

            // Create a range (+/- 5%)
            setQuote({
                min: Math.floor(basePrice * 0.85), // Buy price is usually lower than retail
                max: Math.floor(basePrice * 0.95),
                confidence: 96
            });
            setStep('RESULT');
        }, 2500);
    };

    const reset = () => {
        setStep('INPUT');
        setQuote(null);
        setYear("");
        setMake("");
        setModel("");
        setMileage("");
    };

    return (
        <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-[2rem] shadow-2xl space-y-8 transition-all min-h-[480px] flex flex-col justify-center overflow-hidden">

            {/* Background Decor */}
            <div className={`absolute top-0 right-0 p-12 transition-opacity duration-1000 ${step === 'ANALYZING' ? 'opacity-100' : 'opacity-0'}`}>
                <div className="h-32 w-32 bg-indigo-500 rounded-full blur-3xl opacity-20 animate-pulse" />
            </div>

            {step === 'INPUT' && (
                <div className="animate-in fade-in zoom-in duration-500 space-y-6">
                    <div>
                        <div className="inline-flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400">
                            <Sparkles className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Algoritmo Neural v2.0</span>
                        </div>
                        <h3 className="text-3xl font-black tracking-tight leading-none text-zinc-900 dark:text-white">
                            Cotiza tu Auto<br />
                            <span className="text-zinc-400">en Segundos.</span>
                        </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <select
                            className="h-14 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 font-bold border-2 border-transparent focus:border-indigo-500 outline-none transition-all"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                        >
                            <option value="">Año</option>
                            {Array.from({ length: 15 }, (_, i) => 2025 - i).map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                        <select
                            className="h-14 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 font-bold border-2 border-transparent focus:border-indigo-500 outline-none transition-all"
                            value={make}
                            onChange={(e) => setMake(e.target.value)}
                        >
                            <option value="">Marca</option>
                            {availableMakes.map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>

                    <input
                        type="text"
                        placeholder="Modelo (Ej. CX-5 Grand Touring)"
                        className="w-full h-14 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 font-bold border-2 border-transparent focus:border-indigo-500 outline-none transition-all"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                    />

                    <input
                        type="number"
                        placeholder="Kilometraje (Ej. 45000)"
                        className="w-full h-14 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 font-bold border-2 border-transparent focus:border-indigo-500 outline-none transition-all"
                        value={mileage}
                        onChange={(e) => setMileage(e.target.value)}
                    />

                    <button
                        onClick={handleCalculate}
                        disabled={!year || !make || !model}
                        className="w-full h-14 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                    >
                        Generar Oferta Preliminar <ArrowRight className="h-5 w-5" />
                    </button>
                </div>
            )}

            {step === 'ANALYZING' && (
                <div className="text-center space-y-8 animate-in fade-in duration-700">
                    <div className="relative h-24 w-24 mx-auto">
                        <div className="absolute inset-0 border-4 border-zinc-200 dark:border-zinc-800 rounded-full" />
                        <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Sparkles className="h-8 w-8 text-indigo-500 animate-pulse" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold">Analizando Mercado...</h3>
                        <div className="h-1.5 w-48 bg-zinc-100 dark:bg-zinc-800 rounded-full mx-auto overflow-hidden">
                            <div className="h-full bg-indigo-500 w-1/2 animate-[shimmer_1.5s_infinite]" />
                        </div>
                        <p className="text-xs text-zinc-400">Comparando con {ALL_CARS.length} vehículos similares</p>
                    </div>
                </div>
            )}

            {step === 'RESULT' && quote && (
                <div className="text-center space-y-6 animate-in slide-in-from-bottom-8 duration-500">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-bold">
                        <BarChart3 className="h-3 w-3" />
                        Confianza del Algoritmo: {quote.confidence}%
                    </div>

                    <div>
                        <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-2">Tu {make} {model} vale entre</p>
                        <div className="flex items-baseline justify-center gap-2 text-zinc-900 dark:text-white">
                            <span className="text-4xl lg:text-5xl font-black tracking-tighter">${quote.min.toLocaleString()}</span>
                            <span className="text-xl text-zinc-400">-</span>
                            <span className="text-4xl lg:text-5xl font-black tracking-tighter">${quote.max.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="p-4 bg-zinc-50 dark:bg-black/40 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        Esta oferta preliminar está garantizada por 7 días, sujeta a la inspección física de 150 puntos.
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => {
                                const params = new URLSearchParams({
                                    year,
                                    make,
                                    model,
                                    mileage,
                                    min: quote.min.toString(),
                                    max: quote.max.toString()
                                });
                                window.location.href = `/sell/onboarding?${params.toString()}`;
                            }}
                            className="w-full h-14 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
                        >
                            <ShieldCheck className="h-5 w-5" />
                            Agendar Inspección Gratis
                        </button>
                        <button
                            onClick={reset}
                            className="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                        >
                            <RefreshCw className="h-3 w-3" /> Cotizar otro vehículo
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
