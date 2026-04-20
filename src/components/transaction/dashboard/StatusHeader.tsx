"use client";

import React from 'react';
import { CheckCircle2, Shield, Gavel, Settings2, FileText, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export type TransactionStep = 
    | 'NEGOTIATION' 
    | 'SERVICES_SELECTION' 
    | 'DOCUMENT_UPLOAD' 
    | 'AWAITING_PAYMENT' 
    | 'FUNDS_SECURED' 
    | 'IN_TRANSIT' 
    | 'VALIDATION' 
    | 'DELIVERED';

// 1. STATUS HEADER
export const StatusHeader = ({ step, trxId }: { step: TransactionStep, trxId: string | null }) => {
    const steps = [
        { id: 'NEGOTIATION', label: 'Oferta' },
        { id: 'SERVICES_SELECTION', label: 'Servicios' },
        { id: 'AWAITING_PAYMENT', label: 'Pago' },
        { id: 'VALIDATION', label: 'Entrega' }
    ];

    const currentIdx = steps.findIndex(s => s.id === step) !== -1 
        ? steps.findIndex(s => s.id === step)
        : steps.findIndex(s => ['FUNDS_SECURED', 'IN_TRANSIT'].includes(step)) !== -1 ? 2 : 3;

    return (
        <div className="bg-white dark:bg-zinc-900 border-b p-6 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Shield className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black tracking-tight">Bóveda Digital StarterKar</h1>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Transacción #{trxId?.split('-')[0] || 'DEMO'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-1 md:gap-4 overflow-x-auto pb-2 md:pb-0">
                    {steps.map((s, idx) => (
                        <React.Fragment key={s.id}>
                            <div className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter whitespace-nowrap",
                                idx <= currentIdx ? "bg-indigo-600 text-white" : "bg-muted text-muted-foreground opacity-50"
                            )}>
                                <span className={cn(
                                    "w-4 h-4 rounded-full flex items-center justify-center text-[8px]",
                                    idx <= currentIdx ? "bg-white text-indigo-600" : "bg-zinc-200"
                                )}>{idx + 1}</span>
                                {s.label}
                            </div>
                            {idx < steps.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground/30 shrink-0" />}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
};

// 2. NEGOTIATION VIEW
export const NegotiationView = ({ 
    marketValue, initialPrice, offerAmount, setOfferAmount, negotiationStatus, handleMakeOffer, handleProceedToServices 
}: any) => {
    return (
        <div className="bg-white dark:bg-zinc-900 border border-border rounded-[2.5rem] p-10 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl -translate-y-32 translate-x-32" />
            
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                    <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
                        <Gavel className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black tracking-tight">Panel de Negociación</h2>
                        <p className="text-sm text-muted-foreground">La IA de StarterKar analiza la viabilidad de tu oferta</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                        <div className="p-6 bg-muted/40 rounded-3xl border border-dashed">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Precio de Lista</p>
                            <p className="text-3xl font-black">${initialPrice.toLocaleString()}</p>
                        </div>
                        <div className="p-6 bg-indigo-600 text-white rounded-3xl shadow-xl">
                            <p className="text-xs font-bold uppercase tracking-widest mb-2 opacity-80">Valor de Mercado Sugerido</p>
                            <p className="text-3xl font-black">${marketValue.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 block">Haz una oferta</label>
                            <div className="flex gap-2">
                                <input 
                                    type="number"
                                    value={offerAmount}
                                    onChange={(e) => setOfferAmount(e.target.value)}
                                    placeholder="Ej: 215000"
                                    className="flex-1 bg-white dark:bg-zinc-800 border-2 border-indigo-100 dark:border-zinc-700 h-14 rounded-2xl px-6 font-bold text-lg focus:border-indigo-600 outline-none transition-all"
                                />
                                <Button 
                                    onClick={handleMakeOffer}
                                    disabled={negotiationStatus === 'ANALYZING' || !offerAmount}
                                    className="h-14 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-lg shadow-indigo-600/20"
                                >
                                    Enviar
                                </Button>
                            </div>
                        </div>

                        {negotiationStatus === 'ACCEPTED' && (
                            <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-3xl animate-in zoom-in duration-300">
                                <div className="flex items-center gap-3 text-emerald-600 mb-3">
                                    <CheckCircle2 className="h-5 w-5" />
                                    <span className="font-black uppercase text-xs tracking-widest">¡Oferta Aceptada!</span>
                                </div>
                                <p className="text-xs text-emerald-800 dark:text-emerald-400 font-medium mb-4">El precio final se ha actualizado. Ya puedes proceder a configurar tus servicios.</p>
                                <Button onClick={handleProceedToServices} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold">
                                    Configurar Servicios y Entrega
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// 3. SERVICES ORCHESTRATOR
export const ServicesOrchestrator = ({ handleSaveServices, savingServices }: any) => {
    return (
        <div className="bg-white dark:bg-zinc-900 border border-border rounded-[2.5rem] p-10 shadow-xl">
             <div className="flex items-center gap-3 mb-8">
                <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
                    <Settings2 className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-2xl font-black tracking-tight">Servicios y Logística</h2>
                    <p className="text-sm text-muted-foreground">Personaliza tu experiencia de compra</p>
                </div>
            </div>

            <div className="space-y-6">
                <p className="text-sm text-muted-foreground italic">
                    En esta etapa puedes seleccionar seguros, garantías extendidas y servicios de gestoría para tu nueva unidad.
                </p>
                
                <div className="p-8 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-3xl text-center">
                    <p className="text-zinc-400 font-medium mb-4">Los servicios predeterminados (Inspección 150 pts y Bóveda Digital) ya están incluidos.</p>
                    <Button 
                        onClick={handleSaveServices} 
                        disabled={savingServices}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-14 px-12 font-black shadow-xl"
                    >
                        {savingServices ? "Guardando..." : "Confirmar y Continuar"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

// 4. SUMMARY SIDEBAR
export const SummarySidebar = ({ totalToPay, finalPrice }: any) => {
    return (
        <div className="bg-white dark:bg-zinc-900 border border-border rounded-[2.5rem] p-8 shadow-xl sticky top-24">
            <div className="flex items-center gap-2 mb-6">
                <FileText className="h-5 w-5 text-indigo-600" />
                <h3 className="font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground">Resumen de Operación</h3>
            </div>

            <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-muted-foreground">Precio del Auto</span>
                    <span className="font-bold">${finalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-muted-foreground">Comisión StarterKar (5%)</span>
                    <span className="font-bold">${(finalPrice * 0.05).toLocaleString()}</span>
                </div>
                <div className="pt-4 border-t border-dashed">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-black uppercase tracking-widest text-indigo-600">Total a Depositar</span>
                        <span className="text-2xl font-black text-foreground">${totalToPay.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-2xl flex items-start gap-3">
                <Shield className="h-4 w-4 text-indigo-600 mt-0.5" />
                <p className="text-[10px] text-indigo-700 dark:text-indigo-400 leading-relaxed font-medium">
                    Tus fondos están protegidos por el protocolo de Bóveda Digital. El vendedor solo recibirá el pago cuando tú confirmes la entrega física.
                </p>
            </div>
        </div>
    );
};
