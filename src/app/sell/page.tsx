"use client";

import { ShieldCheck, Camera, Banknote, Car, CheckCircle2, FileText, Calculator, Search } from "lucide-react";
import { InstantQuote } from "@/components/sell/InstantQuote";
import { IntakeWizard } from "@/components/sell/IntakeWizard";
import { Navbar } from "@/components/ui/navbar";
import { useState, useEffect } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export default function SellPage() {
    const [view, setView] = useState<'quote' | 'documents'>('quote');
    const [isAdmin, setIsAdmin] = useState(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            return params.get('admin') === 'true';
        }
        return false;
    });
    const supabase = createBrowserClient();

    useEffect(() => {
        async function checkAdmin() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email === 'admin@starterkar.mx' || (user as any)?.role === 'admin') {
                setIsAdmin(true);
            }
        }
        checkAdmin();
    }, [supabase]);

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-500">

            <Navbar
                variant="sell"
            />

            <main className="pt-32 pb-20 px-6">
                <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-20 items-center">

                    {/* Left: Manifesto & Value Prop */}
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-900/20">
                            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 fill-current" />
                            <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-[0.2em]">Operación Blindada 2026</span>
                        </div>

                        <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.85] text-zinc-900 dark:text-white">
                            Certifica. <br />
                            <span className="text-indigo-600 dark:text-indigo-500 italic">Vende.</span> <br />
                            Gana.
                        </h1>

                        <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-lg leading-relaxed font-bold">
                            No malbarates tu patrimonio. Recupera hasta el **95% del valor real** de tu auto mediante nuestra Certificación de 150 Puntos. 
                        </p>

                        {/* Comparative Box: Why us? */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 bg-zinc-100 dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Agencias / Lotes</p>
                                <p className="text-xl font-black text-red-500">70% Valor</p>
                                <p className="text-[9px] text-zinc-500 mt-1 font-bold italic">Malbaratado y sin asesoría.</p>
                            </div>
                            <div className="p-5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                                <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-2">StarterKar Elite</p>
                                <p className="text-xl font-black text-emerald-500">95% Valor</p>
                                <p className="text-[9px] text-emerald-600/70 mt-1 font-bold italic">Precio justo y Blindaje Legal.</p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                            <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4">Nuestro Blindaje para ti:</p>
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center">
                                    <Banknote className="h-5 w-5 text-indigo-500" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">Cero Efectivo, Cero Riesgos</p>
                                    <p className="text-[10px] text-zinc-500 font-medium italic">Dinero en Bóveda antes de entregar llaves.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center">
                                    <ShieldCheck className="h-5 w-5 text-indigo-500" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">Concierge Legal Integral</p>
                                    <p className="text-[10px] text-zinc-500 font-medium italic">Validamos REPUVE, Infracciones y Tenencias por ti.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Valuation UI Wrapper */}
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-[2.5rem] blur-xl opacity-20 dark:opacity-40 pointer-events-none" />

                        {/* View Toggle */}
                        <div className="relative z-10 flex p-1 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl mb-6 mx-auto max-w-sm border border-zinc-200 dark:border-zinc-700">
                            <button
                                onClick={() => setView('quote')}
                                className={cn(
                                    "flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2",
                                    view === 'quote'
                                        ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm"
                                        : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                                )}
                            >
                                <Calculator className="h-4 w-4" />
                                Cotizador
                            </button>
                            <button
                                onClick={() => setView('documents')}
                                className={cn(
                                    "flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2",
                                    view === 'documents'
                                        ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm"
                                        : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                                )}
                            >
                                <FileText className="h-4 w-4" />
                                Subir Papeles
                            </button>
                        </div>

                        {view === 'quote' ? (
                            <InstantQuote />
                        ) : (
                            <IntakeWizard isAdminMode={isAdmin} />
                        )}
                    </div>
                </div>

                {/* Steps */}
                <div className="mt-32 max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black mb-4">El Proceso de Certificación</h2>
                        <p className="text-zinc-500 dark:text-zinc-400">Diseñado para leads serios que valoran su tiempo y seguridad.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-8 glass-card rounded-premium border-border/40 hover:border-indigo-500/30 transition-all duration-500 group animate-reveal stagger-1">
                            <div className="h-12 w-12 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                <Search className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h3 className="font-bold text-xl mb-3 text-foreground">1. Validación de Intención</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">Cualquier auto es comercializable. Clasifica tu unidad y recibe un rango de valor real.</p>
                        </div>

                        <div className="p-8 glass-card rounded-premium border-border/40 hover:border-indigo-500/30 transition-all duration-500 group animate-reveal stagger-2">
                            <div className="h-12 w-12 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h3 className="font-bold text-xl mb-3 text-foreground">2. Agendamiento Directo</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">Sube tus papeles básicos. Nuestro equipo legal valida el VIN antes de la visita física.</p>
                        </div>

                        <div className="p-8 glass-card rounded-premium border-border/40 hover:border-indigo-500/30 transition-all duration-500 group animate-reveal stagger-3">
                            <div className="h-12 w-12 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                <Car className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h3 className="font-bold text-xl mb-3 text-foreground">3. Inspección Física</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">Revisión de 150 puntos en zona segura. Sin riesgos, sin pérdida de tiempo.</p>
                        </div>
                    </div>
                </div>

                {/* WhatsApp Bot Float */}
                <div className="fixed bottom-8 right-8 z-[100]">
                    <a 
                        href="https://wa.me/yournumber?text=Hola,%20tengo%20dudas%20sobre%20la%20operación%20de%20StarterKar"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-4 rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all group border border-zinc-800 dark:border-zinc-200"
                    >
                        <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                        ¿Dudas de Operación? Habla con el Bot
                    </a>
                </div>

            </main>
        </div>
    );
}
