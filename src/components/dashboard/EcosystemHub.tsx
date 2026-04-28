"use client";

import React from "react";
import Link from "next/link";
import { 
    ArrowRight, 
    QrCode, 
    Wrench, 
    Clock, 
    ShieldCheck, 
    Users, 
    CarFront, 
    TrendingUp,
    ChevronRight,
    Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EcosystemHubProps {
    userProfile: any;
    activeInspections: any[];
    investorApp: any;
}

export function EcosystemHub({ userProfile, activeInspections, investorApp }: EcosystemHubProps) {
    return (
        <section className="space-y-8 animate-reveal stagger-5">
            {/* Header: Institutional & Premium */}
            <div className="flex items-center gap-3 px-2">
                <div className="h-4 w-1 bg-indigo-600 rounded-full" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Control Hub</h2>
            </div>

            <div className="flex flex-col gap-4">
                
                {/* 1. GESTIÓN OPERATIVA (Highlight) */}
                <div className="p-1 bg-zinc-100/50 dark:bg-zinc-900/50 rounded-[2rem] border border-zinc-200/50 dark:border-zinc-800/50">
                    <div className="p-4 space-y-4">
                        <h3 className="text-[9px] font-black uppercase tracking-widest text-zinc-400 px-2">Operaciones</h3>
                        
                        {/* Active Inspection */}
                        {activeInspections.length > 0 && (
                            <div className="bg-white dark:bg-zinc-950 rounded-2xl p-4 border border-amber-200/50 dark:border-amber-900/30 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="h-8 w-8 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600">
                                        <Wrench className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black uppercase tracking-tighter text-amber-600/70">Cita Programada</p>
                                        <p className="font-black text-xs text-zinc-900 dark:text-zinc-100 truncate w-32 italic uppercase">{activeInspections[0].car}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 bg-zinc-50 dark:bg-zinc-900 p-2 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-3 w-3" />
                                        <span>{activeInspections[0].date.split(',')[0]}</span>
                                    </div>
                                    <span className="text-indigo-600 font-black">{activeInspections[0].date.split(',')[1]}</span>
                                </div>
                            </div>
                        )}

                        {/* Sales Link */}
                        <Link 
                            href="/dashboard/sell"
                            className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 hover:border-indigo-500/30 transition-all group shadow-sm"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 group-hover:text-indigo-600">
                                    <QrCode className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="font-black text-xs text-zinc-900 dark:text-zinc-100 uppercase italic tracking-tighter">Bóveda Digital</p>
                                    <p className="text-[8px] text-zinc-400 font-bold uppercase">Gestión de Ventas</p>
                                </div>
                            </div>
                            <ChevronRight className="h-3 w-3 text-zinc-300 group-hover:translate-x-1 group-hover:text-indigo-600 transition-all" />
                        </Link>
                    </div>
                </div>

                {/* 2. PROGRAMAS & UPGRADES */}
                <div className="space-y-3">
                    {/* Investor */}
                    <Link 
                        href="/investor/apply"
                        className={cn(
                            "flex items-center justify-between p-4 rounded-3xl border transition-all group",
                            investorApp?.status === 'pending' 
                                ? "bg-amber-50/30 border-amber-100" 
                                : "bg-zinc-50 dark:bg-zinc-900/40 border-zinc-100 dark:border-zinc-800 hover:border-indigo-500/30"
                        )}
                    >
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "h-10 w-10 rounded-2xl flex items-center justify-center transition-colors shadow-inner",
                                investorApp?.status === 'pending' ? "bg-amber-100 text-amber-600" : "bg-white dark:bg-zinc-800 text-zinc-400 group-hover:text-indigo-600"
                            )}>
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-black text-xs text-zinc-900 dark:text-zinc-100 uppercase italic tracking-tight">Inversionista</p>
                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">Haz crecer tu capital</p>
                            </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-zinc-300 group-hover:translate-x-1 group-hover:text-indigo-600 transition-all" />
                    </Link>

                    {/* Referrals */}
                    <Link 
                        href="/dashboard/referrals"
                        className="flex items-center justify-between p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 hover:border-emerald-500/30 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-emerald-600 shadow-inner">
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-black text-xs text-zinc-900 dark:text-zinc-100 uppercase italic tracking-tight">Referidos Pro</p>
                                <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-tighter">Gana $500 por invitado</p>
                            </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-zinc-300 group-hover:translate-x-1 group-hover:text-emerald-600 transition-all" />
                    </Link>

                    {/* Upgrade */}
                    <Link 
                        href="/new-cars"
                        className="flex items-center justify-between p-5 rounded-[2.5rem] bg-zinc-950 text-white hover:bg-zinc-900 transition-all group relative overflow-hidden shadow-xl"
                    >
                        <div className="relative z-10 flex items-center gap-4">
                            <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                                <Zap className="h-5 w-5 text-indigo-400" />
                            </div>
                            <div>
                                <p className="font-black text-xs uppercase italic tracking-tighter">Upgrade Auto</p>
                                <p className="text-[9px] text-zinc-500 font-bold uppercase">Estrena BMW o Tesla</p>
                            </div>
                        </div>
                        <ArrowRight className="relative z-10 h-4 w-4 text-white/50 group-hover:translate-x-1 group-hover:text-white transition-all" />
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/20 blur-[50px] translate-x-12 -translate-y-12" />
                    </Link>
                </div>

                {/* Status Indicator */}
                <div className="mt-4 p-4 rounded-3xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100/50 dark:border-indigo-800/20 flex items-center gap-4">
                    <div className="relative">
                        <TrendingUp className="h-5 w-5 text-indigo-500" />
                        <span className="absolute -top-1 -right-1 h-2 w-2 bg-emerald-500 rounded-full animate-ping" />
                        <span className="absolute -top-1 -right-1 h-2 w-2 bg-emerald-500 rounded-full" />
                    </div>
                    <div className="flex-1">
                        <p className="text-[8px] font-black uppercase tracking-widest text-indigo-600/70">IA Operativa</p>
                        <p className="text-[9px] text-zinc-500 font-medium leading-tight">Tu patrimonio está siendo optimizado en tiempo real.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
