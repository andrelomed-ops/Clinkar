"use client";

import React from "react";
import Link from "next/link";
import { 
    ArrowRight, 
    QrCode, 
    Wrench, 
    Clock, 
    Search, 
    ShieldCheck, 
    Users, 
    CarFront, 
    TrendingUp,
    Gift,
    Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EcosystemHubProps {
    userProfile: any;
    activeInspections: any[];
    investorApp: any;
}

export function EcosystemHub({ userProfile, activeInspections, investorApp }: EcosystemHubProps) {
    return (
        <section className="mt-16 space-y-8">
            <div className="flex items-center gap-3 mb-8">
                <div className="h-1.5 w-12 bg-indigo-600 rounded-full" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600">Ecosistema StarterKar</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 1. GESTIÓN DE OPERACIONES (Agenda + Ventas) - 8 columns */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Active Inspection Card */}
                    {activeInspections.length > 0 ? (
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
                            <div className="flex items-start justify-between mb-8">
                                <div className="h-12 w-12 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner">
                                    <Wrench className="h-6 w-6" />
                                </div>
                                <div className="px-4 py-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-full text-[10px] font-black text-amber-600 uppercase tracking-widest border border-amber-100 dark:border-amber-900/40 animate-pulse">
                                    Cita Confirmada
                                </div>
                            </div>
                            <h3 className="font-black text-2xl mb-1 tracking-tight italic uppercase">{activeInspections[0].car}</h3>
                            <p className="text-[10px] text-muted-foreground mb-8 font-black uppercase tracking-widest">Reporte Técnico StarterKar</p>

                            <div className="space-y-4 pt-6 border-t border-dashed border-zinc-100 dark:border-zinc-800">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center">
                                        <Clock className="h-5 w-5 text-indigo-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-none mb-1">Fecha y Hora</p>
                                        <p className="font-black text-sm text-zinc-900 dark:text-zinc-100">{activeInspections[0].date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center">
                                        <Search className="h-5 w-5 text-indigo-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-none mb-1">Inspector Master</p>
                                        <p className="font-black text-sm text-zinc-900 dark:text-zinc-100">{activeInspections[0].inspector}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center space-y-4 min-h-[320px]">
                             <div className="h-16 w-16 bg-white dark:bg-zinc-800 rounded-3xl flex items-center justify-center shadow-sm">
                                <Clock className="h-8 w-8 text-zinc-300" />
                             </div>
                             <div>
                                <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Sin Citas Pendientes</p>
                                <p className="text-[10px] text-zinc-500 mt-2">Tus inspecciones agendadas aparecerán aquí.</p>
                             </div>
                        </div>
                    )}

                    {/* Sales Management Card */}
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl shadow-indigo-500/20 flex flex-col justify-between min-h-[320px]">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-1000">
                            <QrCode className="h-48 w-48" />
                        </div>
                        <div className="relative z-10">
                            <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md mb-6">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                            <h3 className="text-3xl font-black mb-2 tracking-tighter italic uppercase">Gestión de Ventas</h3>
                            <p className="text-indigo-100/80 font-bold text-xs leading-relaxed max-w-[240px]">
                                Control total de tus publicaciones, documentos legales y depósitos en Bóveda Segura.
                            </p>
                        </div>
                        <div className="relative z-10 space-y-3">
                            <Button asChild variant="secondary" className="w-full rounded-2xl h-14 font-black text-indigo-700 bg-white hover:bg-zinc-50 shadow-xl transition-all hover:translate-y-[-2px] active:translate-y-0">
                                <Link href="/dashboard/sell">
                                    Mi Bóveda <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                            <Link href="/sell" className="block text-center text-[10px] font-black text-indigo-200 hover:text-white uppercase tracking-[0.2em] transition-colors py-2">
                                + Vender otro auto
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 2. STARTERKAR INVERSIONISTA - 4 columns */}
                <div className="lg:col-span-4">
                    <div className={cn(
                        "rounded-[2.5rem] p-8 relative overflow-hidden group shadow-2xl flex flex-col justify-between h-full min-h-[320px] border transition-all hover:scale-[1.01]",
                        investorApp?.status === 'pending' 
                            ? "bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-900/30" 
                            : "bg-zinc-950 border-zinc-800"
                    )}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[80px] -translate-y-12 translate-x-12" />
                        
                        <div className="relative z-10">
                            <div className={cn(
                                "flex items-center gap-3 mb-8",
                                investorApp?.status === 'pending' ? "text-amber-600" : "text-indigo-400"
                            )}>
                                <ShieldCheck className="h-6 w-6" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Membresía Inversionista</span>
                            </div>

                            {investorApp?.status === 'pending' ? (
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-black text-amber-900 dark:text-amber-200 tracking-tighter italic uppercase">Solicitud en Proceso</h3>
                                    <p className="text-amber-800/70 dark:text-amber-400/70 text-sm font-medium leading-relaxed">
                                        Validando tus documentos fiscales. Recibirás una notificación en <span className="font-black italic underline">24h hábiles</span>.
                                    </p>
                                    <div className="flex items-center gap-2 text-[9px] font-black text-amber-600 uppercase tracking-widest bg-white/50 dark:bg-amber-900/20 w-fit px-4 py-2 rounded-full border border-amber-200 dark:border-amber-800">
                                        <Clock className="h-3 w-3 animate-spin-slow" />
                                        Verificando Identidad
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <h3 className="text-3xl font-black text-white tracking-tighter italic uppercase">Haz crecer tu capital</h3>
                                    <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                                        Compra a precio mayorista (<span className="text-white font-bold">-15%</span>) y accede al inventario exclusivo antes que nadie.
                                    </p>
                                </div>
                            )}
                        </div>

                        {investorApp?.status !== 'pending' && (
                            <Button asChild className="relative z-10 w-full rounded-2xl h-14 bg-indigo-600 text-white font-black hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20">
                                <Link href="/investor/apply">
                                    Solicitar Acceso <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* 3. PROGRAMA DE REFERIDOS - 6 columns */}
                <div className="lg:col-span-6">
                    <div className="bg-emerald-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl shadow-emerald-500/20 min-h-[280px] flex flex-col justify-between">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <Gift className="h-40 w-40" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 text-emerald-200 mb-6">
                                <Users className="h-5 w-5" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Referidos PRO</span>
                            </div>
                            <h3 className="text-3xl font-black mb-2 tracking-tighter italic uppercase">Gana con StarterKar</h3>
                            <p className="text-emerald-100/80 text-sm font-medium leading-relaxed max-w-sm">
                                Recomienda a un amigo. Gana <span className="text-white font-black">$500 MXN</span> en efectivo por cada operación cerrada. Sin límites.
                            </p>
                        </div>
                        <Button asChild variant="secondary" className="relative z-10 w-full md:w-fit rounded-2xl h-14 px-8 bg-white text-emerald-700 font-black hover:bg-emerald-50 transition-all shadow-xl">
                            <Link href="/dashboard/referrals">
                                Invitar Amigos <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* 4. UPGRADE STARTERKAR - 6 columns */}
                <div className="lg:col-span-6">
                    <div className="bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl min-h-[280px] flex flex-col justify-between">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <Sparkles className="h-40 w-40" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 text-indigo-400 mb-6">
                                <CarFront className="h-5 w-5" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Upgrade StarterKar</span>
                            </div>
                            <h3 className="text-3xl font-black mb-2 tracking-tighter italic uppercase">¿Buscas algo nuevo?</h3>
                            <p className="text-zinc-500 text-sm font-medium leading-relaxed max-w-sm">
                                Estrena un <span className="text-white font-bold">BMW, Tesla o Toyota</span> con beneficios exclusivos de nuestras agencias aliadas.
                            </p>
                        </div>
                        <Button asChild className="relative z-10 w-full md:w-fit rounded-2xl h-14 px-8 bg-white text-zinc-950 font-black hover:bg-zinc-200 transition-all shadow-xl">
                            <Link href="/new-cars">
                                Explorar Autos Nuevos <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
