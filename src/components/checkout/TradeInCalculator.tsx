"use client";

import { useState } from "react";
import { Car, RefreshCcw, DollarSign, Calculator, ChevronRight, Gauge, Calendar, Zap, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface TradeInCalculatorProps {
    onAppraisalComplete: (value: number) => void;
}

export function TradeInCalculator({ onAppraisalComplete }: TradeInCalculatorProps) {
    const [step, setStep] = useState<'IDLE' | 'FORM' | 'CALCULATING' | 'RESULT'>('IDLE');
    const [carData, setCarData] = useState({ make: '', model: '', year: '', mileage: '' });
    const [result, setResult] = useState<number | null>(null);

    const handleCalculate = () => {
        setStep('CALCULATING');
        // Simulate Clinkar AI Appraisal
        setTimeout(() => {
            const baseValue = Math.floor(Math.random() * (450000 - 150000) + 150000);
            setResult(baseValue);
            setStep('RESULT');
        }, 2500);
    };

    const handleApplyCredit = () => {
        if (result) onAppraisalComplete(result);
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-border overflow-hidden shadow-xl shadow-indigo-500/5">
            <div className="p-8 border-b border-border bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-zinc-900">
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                        <RefreshCcw className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black tracking-tight">Clinkar Bridge</h3>
                        <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Trade-in & Liquidez</p>
                    </div>
                </div>
                <p className="text-sm text-zinc-500 font-medium max-w-md">
                    ¿Quieres usar tu auto actual como parte del pago? Nosotros lo valuamos y garantizamos el intercambio.
                </p>
            </div>

            <div className="p-8">
                {step === 'IDLE' && (
                    <div className="text-center space-y-6 py-4">
                        <div className="flex justify-center -space-x-4">
                            <div className="h-16 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-full border-4 border-white dark:border-zinc-950 flex items-center justify-center">
                                <Car className="h-8 w-8 text-zinc-400" />
                            </div>
                            <div className="h-16 w-16 bg-indigo-600 rounded-full border-4 border-white dark:border-zinc-950 flex items-center justify-center shadow-xl">
                                <RefreshCcw className="h-8 w-8 text-white" />
                            </div>
                            <div className="h-16 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-full border-4 border-white dark:border-zinc-950 flex items-center justify-center">
                                <DollarSign className="h-8 w-8 text-zinc-400" />
                            </div>
                        </div>
                        <Button
                            onClick={() => setStep('FORM')}
                            className="bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 font-black px-8 h-12 rounded-xl"
                        >
                            Comenzar Valuación AI <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                )}

                {step === 'FORM' && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Marca / Modelo</label>
                            <Input
                                placeholder="Ej: BMW 330i"
                                value={carData.make}
                                onChange={(e) => setCarData({ ...carData, make: e.target.value })}
                                className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-bold"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Año</label>
                            <Input
                                placeholder="2020"
                                value={carData.year}
                                onChange={(e) => setCarData({ ...carData, year: e.target.value })}
                                className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-bold"
                            />
                        </div>
                        <div className="space-y-1.5 col-span-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Kilometraje</label>
                            <Input
                                placeholder="45,000"
                                value={carData.mileage}
                                onChange={(e) => setCarData({ ...carData, mileage: e.target.value })}
                                className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-bold"
                            />
                        </div>
                        <Button
                            onClick={handleCalculate}
                            disabled={!carData.make || !carData.year}
                            className="col-span-2 h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl mt-4 shadow-lg shadow-indigo-600/20"
                        >
                            <Calculator className="mr-2 h-5 w-5" /> Obtener Cotización Instantánea
                        </Button>
                    </div>
                )}

                {step === 'CALCULATING' && (
                    <div className="py-8 text-center space-y-4">
                        <div className="relative h-20 w-20 mx-auto">
                            <Loader2 className="h-20 w-20 text-indigo-600 animate-spin" />
                            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-indigo-400 animate-pulse" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-black text-lg">Analizando mercado regional...</p>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Consultando Bóveda de Precios Clinkar</p>
                        </div>
                    </div>
                )}

                {step === 'RESULT' && result && (
                    <div className="animate-in zoom-in duration-500">
                        <div className="bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-500/30 rounded-3xl p-6 mb-6 text-center">
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1 block">Valor de Toma Estimado</span>
                            <div className="text-4xl font-black text-emerald-600">${result.toLocaleString()}</div>
                            <div className="flex items-center justify-center gap-1.5 mt-2 text-emerald-600/70 text-[10px] font-bold">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Sujeto a Inspección Técnica Clinkar
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setStep('FORM')}
                                className="flex-1 h-12 rounded-xl font-bold"
                            >
                                Recalcular
                            </Button>
                            <Button
                                onClick={handleApplyCredit}
                                className="flex-[2] h-12 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-black rounded-xl"
                            >
                                Aplicar como Crédito Bridge
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <div className="px-8 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Zap className="h-3 w-3 text-amber-500" />
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter">Powered by Clinkar AI Engine</span>
                </div>
                <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-5 w-5 rounded-full border-2 border-white dark:border-zinc-800 bg-zinc-200 dark:bg-zinc-700" />
                    ))}
                    <div className="h-5 px-1.5 rounded-full border-2 border-white dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-600 text-[8px] font-black flex items-center">+42</div>
                </div>
            </div>
        </div>
    );
}
