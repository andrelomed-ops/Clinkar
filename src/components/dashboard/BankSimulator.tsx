"use client";

import { useState } from "react";
import { Building2, Calculator, ChevronRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { RegulatoryDisclaimer } from "./RegulatoryDisclaimer";

interface BankSimulatorProps {
    carPrice: number;
    carYear: number;
}

export function BankSimulator({ carPrice, carYear }: BankSimulatorProps) {
    const MIN_DOWN_PAYMENT_PERCENT = 0.20; // 20%
    const ANNUAL_RATE = 0.16; // 16% Annual

    const [downPaymentPercent, setDownPaymentPercent] = useState(MIN_DOWN_PAYMENT_PERCENT);
    const [termMonths, setTermMonths] = useState(48);

    const downPaymentAmount = carPrice * downPaymentPercent;
    const loanAmount = carPrice - downPaymentAmount;

    // Simple amortization formula
    const monthlyRate = ANNUAL_RATE / 12;
    const monthlyPayment = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths));

    if (carYear < 2017) return null; // Old cars usually not eligible for bank credit

    return (
        <div className="space-y-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <Building2 className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900">Enlace Bancario</h3>
                    <p className="text-xs text-slate-500">Cotiza con instituciones reguladas</p>
                </div>
            </div>

            {/* CONTROLS */}
            <div className="space-y-6">
                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-xs font-bold text-slate-700">Enganche ({downPaymentPercent * 100}%)</label>
                        <span className="text-xs font-mono font-bold text-slate-900">${downPaymentAmount.toLocaleString()}</span>
                    </div>
                    <input
                        type="range"
                        min="0.20"
                        max="0.80"
                        step="0.05"
                        value={downPaymentPercent}
                        onChange={(e) => setDownPaymentPercent(parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                </div>

                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-xs font-bold text-slate-700">Plazo (Meses)</label>
                        <span className="text-xs font-bold text-slate-900">{termMonths} Meses</span>
                    </div>
                    <div className="flex gap-2">
                        {[12, 24, 36, 48, 60].map(m => (
                            <button
                                key={m}
                                onClick={() => setTermMonths(m)}
                                className={cn(
                                    "flex-1 py-2 text-[10px] font-bold rounded-lg border transition-all",
                                    termMonths === m
                                        ? "bg-slate-900 text-white border-slate-900"
                                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                                )}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* RESULT */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 text-center space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mensualidad Estimada</p>
                <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-black text-slate-900">${monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    <span className="text-xs text-slate-500 font-medium">/mes</span>
                </div>
                <button className="w-full mt-4 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-900/10">
                    Pre-calificar ahora <ChevronRight className="h-4 w-4" />
                </button>
            </div>

            <RegulatoryDisclaimer />
        </div>
    );
}
