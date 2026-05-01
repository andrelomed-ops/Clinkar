"use client";

import { ShieldCheck, Camera, Banknote, Car, CheckCircle2, FileText, Calculator, Search, ArrowRight, Zap } from "lucide-react";
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
                            Vende al <br />
                            <span className="text-indigo-600 dark:text-indigo-500 italic">100% Real.</span>
                        </h1>

                        <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-lg leading-relaxed font-bold">
                            Tu auto vale el 100% de su precio de mercado. No permitas que la urgencia de otros devalúe tu patrimonio. 
                        </p>

                        {/* Comparative Box: Net Return Focus */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 bg-zinc-100 dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Agencias / Lotes</p>
                                <p className="text-xl font-black text-red-500">~70% Retorno</p>
                                <p className="text-[9px] text-zinc-500 mt-1 font-bold italic">Castigo de precio por reventa inmediata.</p>
                            </div>
                            <div className="p-5 bg-indigo-600/10 rounded-2xl border border-indigo-600/20">
                                <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-500 uppercase tracking-widest mb-2">StarterKar Elite</p>
                                <p className="text-xl font-black text-indigo-500">~96.5% Retorno</p>
                                <p className="text-[9px] text-indigo-600/70 mt-1 font-bold italic">Vendes a precio real (solo 3.5% com).</p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                            <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4">Lo que hacemos por ti:</p>
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center">
                                    <ShieldCheck className="h-5 w-5 text-indigo-500" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">Tu Asesor StarterKar</p>
                                    <p className="text-[10px] text-zinc-500 font-medium italic">Un experto te acompaña en todo el proceso legal y técnico.</p>
                                </div>
                            </div>
                            <div className="p-4 bg-zinc-950/50 rounded-2xl border border-zinc-800/50">
                                <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest leading-relaxed">
                                    💡 Tras agendar tu visita, recibirás el contacto directo de tu Asesor StarterKar por WhatsApp para resolver dudas y confirmar tu cita.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Lead Capture UI Wrapper */}
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-[2.5rem] blur-xl opacity-20 dark:opacity-40 pointer-events-none" />

                        <div className="relative z-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-10 rounded-[2.5rem] shadow-2xl space-y-8">
                            <div className="space-y-2">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    <Search className="h-3 w-3" />
                                    Valuación Profesional
                                </div>
                                <h3 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white leading-none">
                                    Agenda tu <br />
                                    <span className="text-zinc-400">Certificación.</span>
                                </h3>
                                <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                                    No usamos algoritmos genéricos. Determinamos el valor real de tu auto tras una revisión física de 150 puntos realizada por expertos.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                    <p className="text-[10px] font-black text-zinc-400 uppercase mb-3">¿Cómo funciona?</p>
                                    <ul className="space-y-3">
                                        <li className="flex items-start gap-3 text-[11px] font-bold text-zinc-600 dark:text-zinc-300">
                                            <div className="h-4 w-4 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[8px]">1</div>
                                            Agendas tu revisión en zona segura.
                                        </li>
                                        <li className="flex items-start gap-3 text-[11px] font-bold text-zinc-600 dark:text-zinc-300">
                                            <div className="h-4 w-4 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[8px]">2</div>
                                            Obtenemos el Score de Certificación.
                                        </li>
                                        <li className="flex items-start gap-3 text-[11px] font-bold text-zinc-600 dark:text-zinc-300">
                                            <div className="h-4 w-4 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[8px]">3</div>
                                            Negociamos el precio de salida y piso.
                                        </li>
                                    </ul>
                                </div>

                                <button 
                                    onClick={() => window.location.href = '/sell/onboarding'}
                                    className="w-full h-16 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl flex items-center justify-center gap-3"
                                >
                                    Iniciar Proceso de Valuación <ArrowRight className="h-4 w-4" />
                                </button>
                                
                                <p className="text-center text-[9px] text-zinc-400 font-medium italic">
                                    *Atención personalizada de tu Asesor StarterKar tras confirmar cita.
                                </p>
                            </div>
                        </div>
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

            </main>
        </div>
    );
}
