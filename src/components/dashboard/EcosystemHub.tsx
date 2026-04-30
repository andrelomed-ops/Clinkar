"use client";

import React from "react";
import Link from "next/link";
import { 
    QrCode, 
    Wrench, 
    ShieldCheck, 
    Users, 
    Zap,
    TrendingUp,
    ChevronRight,
    Car,
    Diamond,
    Crown
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EcosystemHubProps {
    userProfile: any;
    activeInspections: any[];
    investorApp: any;
}

export function EcosystemHub({ userProfile, activeInspections, investorApp }: EcosystemHubProps) {
    return (
        <div className="w-full relative overflow-hidden">
            {/* Background Aesthetic: Mesh Gradient + Glassmorphism */}
            <div className="absolute inset-0 bg-zinc-50/50 dark:bg-zinc-950/40 backdrop-blur-xl -z-10" />
            <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-indigo-500/5 to-transparent blur-3xl -z-10" />
            
            <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between gap-4 border-b border-zinc-200/60 dark:border-zinc-800/50 overflow-x-auto custom-scrollbar no-scrollbar">
                
                {/* 1. OPERATIONAL INTELLIGENCE NODE */}
                <div className="flex items-center gap-4 pr-10 border-r border-zinc-200/80 dark:border-zinc-800/80 shrink-0 group cursor-default">
                    <div className="relative">
                        <div className="h-11 w-11 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 shadow-inner group-hover:scale-110 transition-transform duration-500">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white dark:border-zinc-900"></span>
                        </span>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 leading-none mb-1">IA Operativa</p>
                        <p className="text-xs font-black text-zinc-900 dark:text-zinc-100 tracking-tight italic">Ecosistema Activo</p>
                    </div>
                </div>

                {/* 2. SERVICES FLOW */}
                <div className="flex items-center gap-12 flex-1 justify-center">
                    {/* Inventario / Marketplace */}
                    <Link href="/buy" className="flex items-center gap-3 group relative py-1">
                        <div className="h-10 w-10 rounded-2xl bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 shadow-sm transition-all border border-zinc-100 dark:border-zinc-800 group-hover:border-indigo-200 dark:group-hover:border-indigo-500/30">
                            <Car className="h-4.5 w-4.5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-zinc-500 transition-colors">Inventario</span>
                            <span className="text-xs font-black uppercase tracking-tighter text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors flex items-center gap-1">
                                Gestión Total <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </span>
                        </div>
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-indigo-500 transition-all duration-300 group-hover:w-full" />
                    </Link>

                    {/* Inversionista */}
                    <Link href="/investor/apply" className="flex items-center gap-3 group relative py-1">
                        <div className={cn(
                            "h-10 w-10 rounded-2xl flex items-center justify-center shadow-sm transition-all border",
                            userProfile?.role === 'investor' 
                                ? (userProfile?.investor_tier === 'elite' ? "bg-indigo-600 text-white border-indigo-400 shadow-indigo-500/20 shadow-lg" : "bg-amber-500 text-white border-amber-400 shadow-amber-500/20 shadow-lg")
                                : (investorApp?.status === 'pending' 
                                    ? "bg-amber-100 border-amber-200 text-amber-600 animate-pulse" 
                                    : "bg-white dark:bg-zinc-900 text-zinc-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 border-zinc-100 dark:border-zinc-800 group-hover:border-indigo-200")
                        )}>
                            {userProfile?.investor_tier === 'elite' ? <Diamond className="h-4.5 w-4.5" /> : <ShieldCheck className="h-4.5 w-4.5" />}
                        </div>
                        <div className="flex flex-col">
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest transition-colors",
                                userProfile?.investor_tier === 'elite' ? "text-indigo-600" : "text-zinc-400 group-hover:text-zinc-500"
                            )}>
                                {userProfile?.investor_tier === 'elite' ? 'Status Elite' : 'Capital'}
                            </span>
                            <span className="text-xs font-black uppercase tracking-tighter text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors flex items-center gap-1">
                                {userProfile?.role === 'investor' 
                                    ? (userProfile?.investor_tier?.toUpperCase() || 'INVERSIONISTA')
                                    : (investorApp?.status === 'pending' ? 'Membresía...' : 'Inversionista')} 
                                <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </span>
                        </div>
                        <div className={cn(
                            "absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 transition-all duration-300 group-hover:w-full",
                            userProfile?.investor_tier === 'elite' ? "bg-indigo-600 w-1/2" : "bg-indigo-500 w-0"
                        )} />
                    </Link>

                    {/* Referidos */}
                    <Link href="/dashboard/referrals" className="flex items-center gap-3 group relative py-1">
                        <div className="h-10 w-10 rounded-2xl bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-400 group-hover:text-emerald-600 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 shadow-sm transition-all border border-zinc-100 dark:border-zinc-800 group-hover:border-emerald-200">
                            <Users className="h-4.5 w-4.5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-zinc-500 transition-colors">Comunidad</span>
                            <span className="text-xs font-black uppercase tracking-tighter text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors flex items-center gap-1">
                                Referidos Pro <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </span>
                        </div>
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-emerald-500 transition-all duration-300 group-hover:w-full" />
                    </Link>

                    {/* Upgrade */}
                    <Link href="/new-cars" className="flex items-center gap-3 group relative py-1">
                        <div className="h-10 w-10 rounded-2xl bg-zinc-950 flex items-center justify-center text-white shadow-xl border border-zinc-800 group-hover:border-indigo-500/50 transition-all">
                            <Zap className="h-4.5 w-4.5 text-indigo-400 animate-pulse" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-zinc-500 transition-colors">Evolución</span>
                            <span className="text-xs font-black uppercase tracking-tighter text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors flex items-center gap-1">
                                Upgrade Auto <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </span>
                        </div>
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-indigo-500 transition-all duration-300 group-hover:w-full" />
                    </Link>
                </div>

                {/* 3. CONTEXTUAL INDICATOR (Active Citas) */}
                <div className="pl-10 border-l border-zinc-200/80 dark:border-zinc-800/80 shrink-0">
                    {activeInspections.length > 0 ? (
                        <div className="flex items-center gap-4 group cursor-pointer">
                            <div className="h-11 w-11 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 shadow-inner group-hover:bg-amber-500 group-hover:text-white transition-all duration-500">
                                <Wrench className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-600/70">Inspección Activa</p>
                                <p className="text-[11px] font-black text-zinc-900 dark:text-zinc-100 uppercase italic tracking-tight">{activeInspections[0].car}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4 opacity-40 grayscale group hover:grayscale-0 hover:opacity-100 transition-all cursor-help">
                            <div className="h-11 w-11 rounded-2xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 shadow-inner">
                                <Clock className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Sin citas</p>
                                <p className="text-[11px] font-bold text-zinc-300 dark:text-zinc-600 uppercase tracking-tighter italic">Agenda Disponible</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Helper icons
function Clock(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    )
}
