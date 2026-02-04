"use client";

import { CreditCard, TrendingUp, History, Info, Lock, ChevronRight, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export function PartnerFinanceWidget() {
    const creditUsed = 5000;
    const creditLimit = 25000;
    const clinkarScore = 840;

    return (
        <div className="bg-gradient-to-br from-zinc-900 to-black rounded-[2rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden">
            {/* Decorative Grid */}
            <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />

            <div className="relative z-10 space-y-8">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Landmark className="h-4 w-4 text-indigo-400" />
                            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Partner FinTech</h3>
                        </div>
                        <h2 className="text-3xl font-black text-white">$ {(creditLimit - creditUsed).toLocaleString()} <span className="text-xs text-zinc-500">Disponible</span></h2>
                    </div>
                    <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-3 text-center min-w-[100px]">
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block mb-1">Clinkar Score</span>
                        <span className="text-2xl font-black text-white">{clinkarScore}</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold">
                        <span className="text-zinc-500">Crédito para Refacciones</span>
                        <span className="text-white">${creditUsed.toLocaleString()} / ${creditLimit.toLocaleString()}</span>
                    </div>
                    <Progress value={(creditUsed / creditLimit) * 100} className="h-2 bg-zinc-800" />
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                        <span className="text-emerald-500 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" /> Tasa PRO: 2.1% mensual
                        </span>
                        <span className="text-zinc-500">Límite: $25k Gold</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Button variant="secondary" className="h-12 rounded-xl bg-white text-black font-black hover:bg-zinc-200 transition-all border-0">
                        Pagar Saldo
                    </Button>
                    <Button variant="outline" className="h-12 rounded-xl border-white/10 bg-transparent text-white font-bold hover:bg-white/5 transition-all">
                        <History className="mr-2 h-4 w-4" /> Historial
                    </Button>
                </div>

                <div className="pt-6 border-t border-white/5 space-y-4">
                    <div className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-zinc-800 rounded-lg flex items-center justify-center">
                                <Lock className="h-4 w-4 text-zinc-500" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-white">Siguiente Nivel: Platinum</p>
                                <p className="text-[10px] text-zinc-500">Mantén tu Quality Score {'>'} 4.9 por 30 días</p>
                            </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-zinc-700 group-hover:text-white transition-colors" />
                    </div>
                </div>
            </div>
        </div>
    );
}
