"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, ShieldCheck, Sparkles, ArrowRight, Wallet, CheckCircle2, MessageCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreditBrokerModuleProps {
    carPrice: number;
    carName: string;
    carId: string;
}

export function CreditBrokerModule({ carPrice, carName, carId }: CreditBrokerModuleProps) {
    const [step, setStep] = useState<number>(0);

    const steps = [
        { title: "Pre-Calificación", desc: "Análisis rápido de tu perfil crediticio.", icon: <Sparkles className="h-4 w-4" /> },
        { title: "Documentación", desc: "Envío seguro de INE y comprobantes.", icon: <ShieldCheck className="h-4 w-4" /> },
        { title: "Subasta de Tasa", desc: "Peleamos tu crédito con 5+ bancos.", icon: <Wallet className="h-4 w-4" /> },
        { title: "Aprobación", desc: "Firma y estrena tu nuevo vehículo.", icon: <CheckCircle2 className="h-4 w-4" /> }
    ];

    const handleStart = () => {
        const phone = "525522120249";
        const text = `Hola, me interesa solicitar una pre-calificación de crédito para el ${carName} (ID: ${carId}). ¿Qué documentos necesito enviar?`;
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
    };

    return (
        <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-8 shadow-xl relative overflow-hidden group">
            <div className="absolute -right-16 -top-16 h-48 w-48 bg-blue-600/5 blur-[80px] rounded-full group-hover:bg-blue-600/10 transition-all duration-700" />
            
            <div className="relative z-10 space-y-6">
                <header className="space-y-2">
                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-fit">
                        <CreditCard className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Servicio de Broker Elite</span>
                    </div>
                    <h3 className="text-2xl font-black italic tracking-tighter uppercase text-zinc-900 dark:text-white leading-tight">
                        Tú eliges el auto,<br /> nosotros buscamos la mejor tasa.
                    </h3>
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        No somos un banco. Somos tu enlace estratégico con las mejores financieras de México para conseguirte la mensualidad más baja.
                    </p>
                </header>

                <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">¿Cómo conseguimos tu crédito?</p>
                    
                    <div className="grid grid-cols-1 gap-3">
                        {steps.map((s, idx) => (
                            <div key={idx} className="flex gap-4 p-3 rounded-2xl hover:bg-white dark:hover:bg-zinc-900 transition-colors border border-transparent hover:border-zinc-100 dark:hover:border-zinc-800 group/item">
                                <div className="h-8 w-8 rounded-xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0 group-hover/item:bg-blue-600 group-hover/item:text-white transition-all">
                                    <span className="text-xs font-black italic">{idx + 1}</span>
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[11px] font-black uppercase tracking-tight text-zinc-800 dark:text-zinc-200">{s.title}</p>
                                    <p className="text-[10px] text-zinc-500 font-medium">{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-4">
                    <button 
                        onClick={handleStart}
                        className="w-full h-14 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                    >
                        Solicitar Pre-Calificación
                        <ArrowRight className="h-4 w-4" />
                    </button>
                    
                    <div className="mt-4 flex items-center justify-center gap-2 text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                        <MessageCircle className="h-3.5 w-3.5 text-emerald-500" />
                        Respuesta humana en menos de 2h
                    </div>
                </div>

                <div className="p-3 bg-zinc-100 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 flex gap-3">
                    <Info className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                    <p className="text-[9px] text-zinc-500 leading-relaxed font-medium">
                        *Aplica para modelos 2018+. El enganche mínimo sugerido es del 20%. Sujeto a aprobación según historial crediticio.
                    </p>
                </div>
            </div>
        </div>
    );
}
