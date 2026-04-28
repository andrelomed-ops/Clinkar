"use client";

import React from "react";
import Link from "next/link";
import { 
    QrCode, 
    Wrench, 
    ShieldCheck, 
    Users, 
    Zap,
    TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EcosystemHubProps {
    userProfile: any;
    activeInspections: any[];
    investorApp: any;
}

export function EcosystemHub({ userProfile, activeInspections, investorApp }: EcosystemHubProps) {
    return (
        <div className="w-full bg-zinc-50/50 dark:bg-zinc-900/30 border-y border-zinc-100 dark:border-zinc-800/50 py-4 mb-10 overflow-x-auto custom-scrollbar">
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-8 min-w-max md:min-w-0">
                
                {/* 1. STATUS IA (Minimalist) */}
                <div className="flex items-center gap-3 pr-8 border-r border-zinc-200 dark:border-zinc-800">
                    <div className="relative">
                        <TrendingUp className="h-5 w-5 text-indigo-500" />
                        <span className="absolute -top-1 -right-1 h-2 w-2 bg-emerald-500 rounded-full animate-ping" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">IA Operativa</p>
                        <p className="text-[10px] font-bold text-zinc-400">Patrimonio Optimizado</p>
                    </div>
                </div>

                {/* 2. SERVICES RIBBON */}
                <div className="flex items-center gap-10 flex-1">
                    {/* Bóveda / Gestión de Ventas */}
                    <Link href="/dashboard?tab=selling" className="flex items-center gap-3 group">
                        <div className="h-9 w-9 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-indigo-600 shadow-sm transition-all border border-zinc-100 dark:border-zinc-800">
                            <QrCode className="h-4 w-4" />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-tighter text-zinc-600 group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-white transition-colors">Gestión de Ventas</span>
                    </Link>

                    {/* Inversionista */}
                    <Link href="/investor/apply" className="flex items-center gap-3 group">
                        <div className={cn(
                            "h-9 w-9 rounded-xl flex items-center justify-center shadow-sm transition-all border",
                            investorApp?.status === 'pending' 
                                ? "bg-amber-100 border-amber-200 text-amber-600" 
                                : "bg-white dark:bg-zinc-800 text-zinc-400 group-hover:text-indigo-600 border-zinc-100 dark:border-zinc-800"
                        )}>
                            <ShieldCheck className="h-4 w-4" />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-tighter text-zinc-600 group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-white transition-colors">
                            {investorApp?.status === 'pending' ? 'Membresía Pendiente' : 'Inversionista'}
                        </span>
                    </Link>

                    {/* Referidos */}
                    <Link href="/dashboard/referrals" className="flex items-center gap-3 group">
                        <div className="h-9 w-9 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-emerald-600 shadow-sm transition-all border border-zinc-100 dark:border-zinc-800">
                            <Users className="h-4 w-4" />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-tighter text-zinc-600 group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-white transition-colors">Referidos Pro</span>
                    </Link>

                    {/* Upgrade */}
                    <Link href="/new-cars" className="flex items-center gap-3 group">
                        <div className="h-9 w-9 rounded-xl bg-zinc-900 flex items-center justify-center text-white shadow-xl border border-zinc-800">
                            <Zap className="h-4 w-4 text-indigo-400" />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-tighter text-zinc-600 group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-white transition-colors">Upgrade Auto</span>
                    </Link>
                </div>

                {/* 3. ACTIVE OPERATION (If any) */}
                {activeInspections.length > 0 && (
                    <div className="flex items-center gap-3 pl-8 border-l border-zinc-200 dark:border-zinc-800">
                        <div className="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
                            <Wrench className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-amber-600/70">Cita Activa</p>
                            <p className="text-[10px] font-black text-zinc-900 dark:text-zinc-100 uppercase italic">{activeInspections[0].car}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
