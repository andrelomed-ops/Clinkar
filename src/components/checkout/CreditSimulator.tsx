"use client";

import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { CreditCard, Info, Calculator, Calendar, ArrowRight, Wallet } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CreditSimulatorProps {
    carPrice: number;
    carName: string;
    carId: string;
}

export function CreditSimulator({ carPrice, carName, carId }: CreditSimulatorProps) {
    const [downPaymentPercent, setDownPaymentPercent] = useState(20);
    const [term, setTerm] = useState(48); // months
    const annualInterestRate = 0.1299; // 12.99% fixed for simulation
    const downPaymentAmount = (carPrice * downPaymentPercent) / 100;
    const loanAmount = carPrice - downPaymentAmount;

    // Derived state: compute directly during render to avoid cascading re-renders
    const r = annualInterestRate / 12;
    const n = term;
    const P = (r * loanAmount) / (1 - Math.pow(1 + r, -n));
    const monthlyPayment = Math.round(P);
    const totalInterest = Math.round((P * n) - loanAmount);

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="glass-card rounded-3xl p-8 border-indigo-500/20 shadow-2xl shadow-indigo-500/10 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <Calculator className="h-40 w-40 text-indigo-600" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                    <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/40">
                        <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black tracking-tight">Simulador de Crédito</h3>
                        <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{carName}</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Controls */}
                    <div className="space-y-10">
                        <div className="space-y-6">
                            <div className="flex justify-between items-end">
                                <label className="text-sm font-bold text-zinc-500 uppercase flex items-center gap-2">
                                    <Wallet className="h-4 w-4 text-indigo-600" /> Enganche ({downPaymentPercent}%)
                                </label>
                                <span className="text-xl font-black text-indigo-600">{formatCurrency(downPaymentAmount)}</span>
                            </div>
                            <Slider
                                value={[downPaymentPercent]}
                                min={20}
                                max={80}
                                step={5}
                                onValueChange={(val) => setDownPaymentPercent(val[0])}
                                className="py-4"
                            />
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter flex justify-between">
                                <span>Enganche mínimo recomendado: 20%</span>
                                <span className="text-indigo-500 animate-bounce">← Desliza para ajustar →</span>
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex justify-between items-end">
                                <label className="text-sm font-bold text-zinc-500 uppercase flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-indigo-600" /> Plazo ({term} meses)
                                </label>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {[12, 24, 36, 48].map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => setTerm(m)}
                                        className={cn(
                                            "py-3 rounded-xl text-sm font-bold transition-all border-2 active:scale-95",
                                            term === m
                                                ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                                                : "bg-secondary/50 border-transparent text-muted-foreground hover:border-zinc-300"
                                        )}
                                    >
                                        {m}m
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl p-8 flex flex-col justify-center items-center text-center border border-zinc-200 dark:border-zinc-800 relative group overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                        <div className="relative z-10 w-full space-y-6">
                            <div>
                                <p className="text-sm font-bold text-zinc-500 uppercase mb-1">Pago Mensual Estimado</p>
                                <h4 className="text-5xl font-black tracking-tighter text-indigo-600">{formatCurrency(monthlyPayment)}</h4>
                            </div>

                            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 w-full" />

                            <Button
                                asChild
                                className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-lg font-black shadow-xl shadow-indigo-500/20 mt-4 active:scale-95 transition-all"
                            >
                                <Link href={`/contact?subject=Pre-aprobación para ${carName}&id=${carId}`}>
                                    Solicitar Pre-aprobación <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>

                            <div className="flex items-center justify-center gap-1.5 text-[9px] text-zinc-400 font-medium uppercase mt-4">
                                <Info className="h-3 w-3" />
                                Sujeto a aprobación de crédito y cambios de tasa sin previo aviso.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
