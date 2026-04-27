"use client";

import { useState } from "react";
import { Lock, AlertCircle, Info, Calculator, CheckCircle2, Shield, Clock, BadgeAlert, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { SellerReliabilityBadge } from "../dashboard/SellerReliabilityBadge";
import { BUSINESS_RULES } from "@/lib/fiscal-utils";

import { useRouter } from "next/navigation";

interface OfferModalProps {
    id: string; // Car ID for redirection
    carPrice: number;
    repairCost: number;
    carName: string;
    hasSeal: boolean;
}

export function OfferModal({ id, carPrice, repairCost, carName, hasSeal }: OfferModalProps) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [showReservePopup, setShowReservePopup] = useState(false);
    const [offerAmount, setOfferAmount] = useState<number>(carPrice - repairCost);
    const offerFloor = carPrice - repairCost;

    const isValid = offerAmount >= offerFloor;

    const handleOffer = () => {
        if (!isValid) return;
        setShowReservePopup(true);
    };

    return (
        <>
            <div className="space-y-4">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    disabled={!hasSeal}
                    className={cn(
                        "w-full h-16 rounded-2xl font-black text-base transition-all flex items-center justify-center gap-3 shadow-xl",
                        hasSeal
                            ? "bg-amber-500 text-black hover:bg-amber-400 hover:scale-[1.02] active:scale-95 shadow-amber-500/20"
                            : "bg-zinc-100 dark:bg-zinc-800/50 text-zinc-400 cursor-not-allowed border border-zinc-200 dark:border-zinc-700"
                    )}
                >
                    {hasSeal ? (
                        <>
                            <Zap className="h-5 w-5 fill-black" />
                            NEGOCIAR PRECIO AHORA
                        </>
                    ) : (
                        <>
                            <AlertCircle className="h-5 w-5" />
                            CERTIFICACIÓN EN PROCESO
                        </>
                    )}
                </button>

            </div>
            {isOpen && (
                <div className="mt-4 bg-background/50 backdrop-blur-xl border border-border w-full rounded-[2.5rem] p-6 md:p-8 shadow-2xl space-y-6 animate-in slide-in-from-top-4 fade-in duration-300 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-transparent" />
                    
                    <div className="space-y-2">
                        <div className="inline-flex px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] italic">
                            Mesa de Control de Precios
                        </div>
                        <h2 className="text-3xl font-black tracking-tight italic text-foreground uppercase">Negociar Oferta</h2>
                        <p className="text-muted-foreground font-medium text-sm">Estás ofertando por el <span className="text-foreground font-bold">{carName}</span></p>
                    </div>

                    {/* Reliability Score */}
                    <div className="bg-secondary/20 rounded-3xl border border-border p-1">
                        <SellerReliabilityBadge
                            score={92}
                            acceptanceRate={85}
                            responseTime="< 12h"
                            isVerified={hasSeal}
                        />
                    </div>

                    <div className="bg-secondary/50 rounded-[2rem] p-6 border border-border space-y-4">
                        <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                            <span className="text-muted-foreground">Precio Base</span>
                            <span className="text-foreground">${carPrice.toLocaleString()} MXN</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-red-500">
                            <span className="flex items-center gap-2">
                                <Calculator className="h-4 w-4" />
                                Inversión Sugerida
                            </span>
                            <span>- ${repairCost.toLocaleString()} MXN</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Tu Monto de Oferta (MXN)</label>
                        <div className="relative group">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-muted-foreground group-focus-within:text-amber-500 transition-colors">$</span>
                            <input
                                type="number"
                                value={offerAmount}
                                onChange={(e) => setOfferAmount(Number(e.target.value))}
                                className={cn(
                                    "w-full h-20 rounded-[2rem] bg-background border-2 pl-14 pr-6 text-3xl font-black focus:ring-0 transition-all border-border focus:border-amber-500 text-foreground selection:bg-amber-500/30 shadow-inner"
                                )}
                            />
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 px-3 py-1 bg-secondary rounded-lg text-[10px] font-black text-muted-foreground">MXN</div>
                        </div>
                    </div>

                    {/* Cost Breakdown & Fee */}
                    <div className="bg-amber-500/5 rounded-[2rem] p-6 space-y-4 border border-amber-500/20 shadow-inner">
                        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                            <span className="text-muted-foreground">Oferta Directa</span>
                            <span className="text-foreground">${offerAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                            <span className="flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                Protección Comprador
                            </span>
                            <span>$0.00</span>
                        </div>
                        <div className="pt-4 border-t border-border flex justify-between items-center">
                            <span className="text-lg font-black text-foreground italic uppercase tracking-tighter">Total a Pagar</span>
                            <span className="text-2xl font-black text-foreground italic tracking-tighter">${offerAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 bg-amber-500/10 rounded-xl py-2 justify-center">
                            <Clock className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Oferta válida por 24 horas</span>
                        </div>
                    </div>

                    <div className="p-5 bg-background border border-border rounded-[1.5rem] space-y-2">
                        <div className="flex items-center gap-2 text-indigo-500">
                            <BadgeAlert className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Aviso de Exclusividad</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed italic font-medium">
                            El Certificado de Inspección y la Garantía Mecánica **solo cobran validez** si la transacción se liquida vía Bóveda StarterKar.
                        </p>
                    </div>

                    <div className="bg-blue-500/5 border border-blue-500/10 rounded-[1.5rem] p-6 space-y-2">
                        <h4 className="text-blue-600 dark:text-blue-400 font-black text-xs flex items-center gap-2 uppercase tracking-[0.2em] italic">
                            <CheckCircle2 className="h-4 w-4" />
                            Justificación del Valor
                        </h4>
                        <p className="text-blue-900/70 dark:text-blue-200/70 text-[11px] leading-relaxed font-medium">
                            El monto de <span className="text-foreground font-bold">${offerAmount.toLocaleString()} MXN</span> es coherente con el dictamen de 150 puntos, asegurando una transacción justa.
                        </p>
                    </div>

                    <button
                        onClick={handleOffer}
                        disabled={!isValid}
                        className="w-full h-16 rounded-[1.5rem] bg-amber-500 text-black font-black text-lg shadow-xl shadow-amber-500/20 hover:bg-amber-400 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale uppercase italic tracking-tighter"
                    >
                        Iniciar Compra Segura
                    </button>
                </div>
            )}

            {showReservePopup && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-background border border-border max-w-sm rounded-[2rem] p-8 text-center space-y-6 shadow-2xl">
                        <div className="h-16 w-16 bg-primary/10 text-primary mx-auto rounded-full flex items-center justify-center">
                            <Info className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-black">Operación en Espera</h3>
                        <p className="text-sm text-muted-foreground font-medium">Un asesor especializado se pondrá en contacto contigo a la brevedad para reservar la cita de confirmación en el Taller Aliado.</p>
                        <button
                            onClick={() => setShowReservePopup(false)}
                            className="w-full h-12 bg-primary text-primary-foreground font-bold rounded-xl hover:scale-105 transition-all"
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
