"use client";

import React from 'react';
import {
    CheckCircle2,
    Database,
    Link as LinkIcon,
    ShieldCheck,
    Calendar,
    ArrowRight,
    Hexagon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ClinkarSeal } from '../ClinkarSeal';

interface PassportEvent {
    date: string;
    type: string;
    verifiedBy: string;
    icon?: string;
}

interface PassportData {
    blockchainHash: string;
    events: PassportEvent[];
    score?: number;
}

export const DigitalPassport = ({ data }: { data: PassportData }) => {
    return (
        <div className="relative group overflow-hidden rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-8 md:p-12 shadow-2xl transition-all hover:border-indigo-500/30">
            {/* Holographic Background Effect */}
            <div className="absolute -top-24 -right-24 h-64 w-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-700" />

            <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 md:h-12 md:w-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                                <Database className="h-5 w-5 md:h-6 md:w-6" />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-black tracking-tighter">Pasaporte Digital</h3>
                        </div>
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Historial Inmutable Clinkar v2.0</p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <ClinkarSeal variant="holographic" score={data.score} className="!p-3 border-none shadow-none" />
                    </div>

                    <div className="flex items-center gap-3 px-4 py-2 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 md:max-w-md">
                        <Hexagon className="h-4 w-4 text-indigo-500 shrink-0" />
                        <span className="text-[10px] font-mono text-zinc-500 truncate uppercase">Hash: {data.blockchainHash}</span>
                    </div>
                </div>

                <div className="relative space-y-12 before:absolute before:left-[1.2rem] md:before:left-[1.45rem] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-indigo-600 before:via-indigo-400 before:to-zinc-200 dark:before:to-zinc-800">
                    {data.events.map((event, i) => (
                        <div key={i} className="flex gap-6 relative animate-reveal" style={{ animationDelay: `${i * 100}ms` }}>
                            <div className="relative z-10 h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-indigo-500 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/10 group/node hover:scale-110 transition-transform">
                                <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-indigo-500" />
                            </div>

                            <div className="flex-1 space-y-2 pb-2">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                    <h4 className="text-lg md:text-xl font-black tracking-tight leading-none">{event.type}</h4>
                                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest bg-zinc-100 dark:bg-zinc-900 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800">
                                        <Calendar className="h-3 w-3" />
                                        {event.date}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-sm font-bold text-indigo-600/80 dark:text-indigo-400/80">
                                    <ShieldCheck className="h-4 w-4" />
                                    <span>Verificado por: {event.verifiedBy}</span>
                                </div>

                                <div className="pt-2">
                                    <button className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-indigo-500 flex items-center gap-1 group/btn transition-colors">
                                        Ver Certificado en Blockchain
                                        <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 p-8 bg-indigo-50 dark:bg-indigo-900/10 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-500/20 text-center space-y-4">
                    <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-2">
                        <LinkIcon className="h-4 w-4" />
                        Toda la información ha sido encriptada y distribuida en la red Clinkar.
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">
                        Integridad Garantizada • Prueba de Conocimiento Cero
                    </p>
                </div>
            </div>
        </div>
    );
};
