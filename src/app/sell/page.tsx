"use client";

import { ShieldCheck, Camera, Banknote, Car, CheckCircle2, FileText, Calculator } from "lucide-react";
import { InstantQuote } from "@/components/sell/InstantQuote";
import { DocumentUploadView } from "@/components/sell/DocumentUploadView";
import { Navbar } from "@/components/ui/navbar";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function SellPage() {
    const [view, setView] = useState<'quote' | 'documents'>('quote');

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-500">

            <Navbar
                variant="sell"
                showBack={true}
                backHref="/"
                backLabel="Volver al Inicio"
            />

            <main className="pt-32 pb-20 px-6">
                <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-20 items-center">

                    {/* Left: Manifesto & Value Prop */}
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20">
                            <Banknote className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Pago Garantizado</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.95] text-zinc-900 dark:text-white">
                            Vende <br />
                            <span className="text-zinc-400 dark:text-zinc-600">Sin Miedo.</span>
                        </h1>

                        <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-lg leading-relaxed font-medium">
                            Olvídate de citas en lugares raros y transferencias fantasma. Con Clinkar, el dinero está en la Bóveda antes de que entregues las llaves.
                        </p>

                        <div className="space-y-4 pt-4">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                <span className="font-bold text-lg">Inspección Mecánica a Domicilio</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                <span className="font-bold text-lg">Gestión de Trámites Legales</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                <span className="font-bold text-lg">Depósito Directo a tu Cuenta</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Valuation UI Wrapper */}
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-[2.5rem] blur-xl opacity-20 dark:opacity-40" />

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
                            <DocumentUploadView onComplete={() => setView('quote')} />
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
                                <Camera className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h3 className="font-bold text-xl mb-3 text-foreground">1. Cotiza y Agenda</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">Sube fotos de tu auto y recibe un rango de precio. Si te gusta, agendamos la inspección a domicilio.</p>
                        </div>

                        <div className="p-8 glass-card rounded-premium border-border/40 hover:border-indigo-500/30 transition-all duration-500 group animate-reveal stagger-2">
                            <div className="h-12 w-12 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                <Car className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h3 className="font-bold text-xl mb-3 text-foreground">2. Certificación</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">Nuestro experto revisa 150 puntos mecánicos y valida que los papeles estén en regla. Gratis.</p>
                        </div>

                        <div className="p-8 glass-card rounded-premium border-border/40 hover:border-indigo-500/30 transition-all duration-500 group animate-reveal stagger-3">
                            <div className="h-12 w-12 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                <ShieldCheck className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h3 className="font-bold text-xl mb-3 text-foreground">3. Venta Segura</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">Publicamos tu auto. Cuando alguien compra, el dinero entra a la Bóveda. Entregas el auto y liberas el pago.</p>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}
