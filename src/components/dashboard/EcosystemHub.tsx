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
    Gift,
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EcosystemHubProps {
    userProfile: any;
    activeInspections: any[];
    investorApp: any;
}

export function EcosystemHub({ userProfile, activeInspections, investorApp }: EcosystemHubProps) {
    return (
        <section className="mt-20 space-y-12">
            {/* Header: Minimalist & Bold */}
            <div className="flex flex-col gap-1">
                <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-indigo-600/60 ml-1">Servicios & Ecosistema</h2>
                <div className="h-[1px] w-full bg-zinc-100 dark:bg-zinc-800" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                
                {/* 1. GESTIÓN ACTIVA (OPERATIONS) */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Operaciones en curso</h3>
                    
                    {/* Active Inspection Item */}
                    {activeInspections.length > 0 ? (
                        <div className="flex items-center gap-4 p-5 rounded-3xl bg-amber-500/5 border border-amber-500/10 hover:bg-amber-500/10 transition-colors group">
                            <div className="h-10 w-10 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-600">
                                <Wrench className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-amber-600/70 leading-none mb-1">Cita Confirmada</p>
                                <p className="font-black text-sm text-zinc-900 dark:text-zinc-100 italic">{activeInspections[0].car}</p>
                            </div>
                            <Clock className="h-4 w-4 text-amber-500 animate-pulse" />
                        </div>
                    ) : null}

                    {/* Sales Hub Link */}
                    <Link 
                        href="/dashboard/sell"
                        className="flex items-center justify-between p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 hover:border-indigo-500/30 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-indigo-600 transition-colors">
                                <QrCode className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-black text-sm text-zinc-900 dark:text-zinc-100 uppercase italic tracking-tighter">Gestión de Ventas</p>
                                <p className="text-[10px] text-zinc-400 font-bold">Bóveda & Documentos</p>
                            </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-zinc-300 group-hover:translate-x-1 group-hover:text-indigo-600 transition-all" />
                    </Link>
                </div>

                {/* 2. PROGRAMAS & MEMBRESÍAS */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Membresía & Beneficios</h3>

                    {/* Investor Membership */}
                    <Link 
                        href="/investor/apply"
                        className={cn(
                            "flex items-center justify-between p-5 rounded-3xl border transition-all group",
                            investorApp?.status === 'pending' 
                                ? "bg-amber-50/50 border-amber-100" 
                                : "bg-zinc-50 dark:bg-zinc-900/40 border-zinc-100 dark:border-zinc-800 hover:border-indigo-500/30"
                        )}
                    >
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "h-10 w-10 rounded-2xl flex items-center justify-center transition-colors",
                                investorApp?.status === 'pending' ? "bg-amber-100 text-amber-600" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:text-indigo-600"
                            )}>
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-black text-sm text-zinc-900 dark:text-zinc-100 uppercase italic tracking-tighter">Inversionista</p>
                                <p className={cn(
                                    "text-[10px] font-bold",
                                    investorApp?.status === 'pending' ? "text-amber-600" : "text-zinc-400"
                                )}>
                                    {investorApp?.status === 'pending' ? 'Solicitud en revisión' : 'Haz crecer tu capital'}
                                </p>
                            </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-zinc-300 group-hover:translate-x-1 group-hover:text-indigo-600 transition-all" />
                    </Link>

                    {/* Referrals */}
                    <Link 
                        href="/dashboard/referrals"
                        className="flex items-center justify-between p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 hover:border-emerald-500/30 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-emerald-600 transition-colors">
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-black text-sm text-zinc-900 dark:text-zinc-100 uppercase italic tracking-tighter">Referidos Pro</p>
                                <p className="text-[10px] text-zinc-400 font-bold">Gana $500 por invitado</p>
                            </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-zinc-300 group-hover:translate-x-1 group-hover:text-emerald-600 transition-all" />
                    </Link>
                </div>

                {/* 3. EXPLORACIÓN & UPGRADE */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Próximo Nivel</h3>
                    
                    {/* New Cars Upgrade */}
                    <Link 
                        href="/new-cars"
                        className="flex items-center justify-between p-6 rounded-[2rem] bg-zinc-950 text-white hover:bg-zinc-900 transition-all group relative overflow-hidden"
                    >
                        <div className="relative z-10 flex items-center gap-4">
                            <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                                <CarFront className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-black text-sm uppercase italic tracking-tighter">Upgrade StarterKar</p>
                                <p className="text-[10px] text-zinc-500 font-bold">Estrena BMW, Tesla o Toyota</p>
                            </div>
                        </div>
                        <ArrowRight className="relative z-10 h-5 w-5 text-white/50 group-hover:translate-x-1 group-hover:text-white transition-all" />
                        
                        {/* Subtle Glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[60px] translate-x-16 -translate-y-16" />
                    </Link>

                    {/* Secondary CTA */}
                    <div className="p-6 rounded-[2rem] border border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center space-y-2">
                        <TrendingUp className="h-5 w-5 text-zinc-300" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Optimización de Cartera</p>
                        <p className="text-[9px] text-zinc-400 leading-tight">Tu patrimonio automotriz está siendo gestionado por IA.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
