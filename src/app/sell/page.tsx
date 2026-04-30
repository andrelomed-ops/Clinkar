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
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-900/20">
                            <Zap className="h-4 w-4 text-indigo-600 dark:text-indigo-400 fill-current" />
                            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">Acompañamiento 360°</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.95] text-zinc-900 dark:text-white">
                            Tu Auto <br />
                            <span className="text-zinc-400 dark:text-zinc-600 italic">Tiene Valor.</span>
                        </h1>

                        <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-lg leading-relaxed font-medium">
                            En StarterKar creemos que cada vehículo tiene su dueño ideal. **Aceptamos cualquier tipo de factura y condición.** Desde unidades de agencia hasta proyectos por recuperar; nosotros nos encargamos de la magia.
                        </p>

                        <div className="p-6 bg-zinc-100 dark:bg-zinc-900/50 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-4">
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed italic">
                                "Nuestra misión es proteger tu patrimonio. La validación mecánica y legal no es un gasto, es el seguro para vender al **precio justo** sin regalar tu auto a una agencia ni arriesgarte en la calle."
                            </p>
                            <div className="flex items-center gap-4 pt-2">
                                <div className="flex -space-x-2">
                                    {[1,2,3].map(i => (
                                        <div key={i} className="h-8 w-8 rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                                            <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" />
                                        </div>
                                    ))}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">+1,200 Vendedores Protegidos</span>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                <span className="font-bold text-lg">Cualquier Factura es Bienvenida</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                <span className="font-bold text-lg">Justicia Mecánica y Legal</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                <span className="font-bold text-lg">Venta Directa sin Malbaratar</span>
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
                        <h2 className="text-3xl font-black mb-4">El Proceso de Venta</h2>
                        <p className="text-zinc-500 dark:text-zinc-400">Más simple que pedir comida a domicilio.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-8 glass-card rounded-premium border-border/40 hover:border-indigo-500/30 transition-all duration-500 group animate-reveal stagger-1">
                            <div className="h-12 w-12 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                <Search className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h3 className="font-bold text-xl mb-3 text-foreground">1. Cotización Instantánea</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">Paso 1: Clasifica tu auto y recibe una cotización base del Libro Negro. Si te gusta, seguimos adelante.</p>
                        </div>

                        <div className="p-8 glass-card rounded-premium border-border/40 hover:border-indigo-500/30 transition-all duration-500 group animate-reveal stagger-2">
                            <div className="h-12 w-12 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h3 className="font-bold text-xl mb-3 text-foreground">2. Validación Legal</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">Sube tus papeles. Nosotros validamos REPUVE, tenencias e infracciones directamente por ti.</p>
                        </div>

                        <div className="p-8 glass-card rounded-premium border-border/40 hover:border-indigo-500/30 transition-all duration-500 group animate-reveal stagger-3">
                            <div className="h-12 w-12 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                <Car className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h3 className="font-bold text-xl mb-3 text-foreground">3. Certificación en Taller</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">Nuestro experto revisa 150 puntos mecánicos en una zona segura (Taller Aliado). ¡Listo para vender!</p>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}
