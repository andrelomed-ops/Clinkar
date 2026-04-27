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
                    onClick={() => setIsOpen(true)}
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
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-xl animate-in fade-in duration-500">
                    <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-[3rem] p-8 md:p-10 shadow-[0_0_50px_-12px_rgba(79,70,229,0.3)] space-y-8 animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-8 right-8 h-10 w-10 rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all flex items-center justify-center z-10 border border-zinc-700"
                        >
                            ✕
                        </button>

                        <div className="space-y-3">
                            <div className="inline-flex px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] italic">
                                Mesa de Control de Precios
                            </div>
                            <h2 className="text-4xl font-black tracking-tighter italic text-white uppercase">Negociar Oferta</h2>
                            <p className="text-zinc-400 font-medium text-sm">Estás ofertando por el <span className="text-white font-bold">{carName}</span></p>
                        </div>

                        {/* Reliability Score */}
                        <div className="bg-zinc-950/50 rounded-3xl border border-zinc-800 p-1">
                            <SellerReliabilityBadge
                                score={92}
                                acceptanceRate={85}
                                responseTime="< 12h"
                                isVerified={hasSeal}
                            />
                        </div>

                        <div className="bg-zinc-950 rounded-[2rem] p-8 border border-zinc-800 space-y-5">
                            <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                                <span className="text-zinc-500">Precio Base</span>
                                <span className="text-white">${carPrice.toLocaleString()} MXN</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-red-400">
                                <span className="flex items-center gap-2">
                                    <Calculator className="h-4 w-4" />
                                    Inversión Sugerida
                                </span>
                                <span>- ${repairCost.toLocaleString()} MXN</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 ml-1">Tu Monto de Oferta (MXN)</label>
                            <div className="relative group">
                                <span className="absolute left-8 top-1/2 -translate-y-1/2 text-3xl font-black text-zinc-700 group-focus-within:text-indigo-500 transition-colors">$</span>
                                <input
                                    type="number"
                                    value={offerAmount}
                                    onChange={(e) => setOfferAmount(Number(e.target.value))}
                                    className={cn(
                                        "w-full h-24 rounded-[2rem] bg-zinc-950 border-2 pl-16 pr-8 text-4xl font-black focus:ring-0 transition-all border-zinc-800 focus:border-indigo-600 text-white selection:bg-indigo-500/30"
                                    )}
                                />
                                <div className="absolute right-8 top-1/2 -translate-y-1/2 px-3 py-1 bg-zinc-800 rounded-lg text-[10px] font-black text-zinc-500">MXN</div>
                            </div>
                        </div>

                        {/* Cost Breakdown & Fee */}
                        <div className="bg-indigo-600/5 rounded-[2.5rem] p-8 space-y-4 border border-indigo-600/10">
                            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                                <span className="text-zinc-500">Oferta Directa</span>
                                <span className="text-zinc-300">${offerAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-emerald-500">
                                <span className="flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    Protección Comprador
                                </span>
                                <span>$0.00</span>
                            </div>
                            <div className="pt-5 border-t border-zinc-800 flex justify-between items-center">
                                <span className="text-xl font-black text-white italic uppercase tracking-tighter">Total a Pagar</span>
                                <span className="text-3xl font-black text-indigo-400 italic tracking-tighter">${offerAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-amber-500/80 bg-amber-500/5 rounded-xl py-3 justify-center border border-amber-500/10">
                                <Clock className="h-4 w-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Oferta válida por 24 horas</span>
                            </div>
                        </div>

                        <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-[2rem] space-y-3">
                            <div className="flex items-center gap-2 text-indigo-400">
                                <BadgeAlert className="h-4 w-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Aviso de Exclusividad</span>
                            </div>
                            <p className="text-[10px] text-zinc-500 leading-relaxed italic font-medium">
                                El Certificado de Inspección y la Garantía Mecánica **solo cobran validez** si la transacción se liquida vía Bóveda StarterKar.
                            </p>
                        </div>

                        <div className="bg-blue-600/5 border border-blue-600/10 rounded-[2rem] p-8 space-y-3">
                            <h4 className="text-blue-500 font-black text-xs flex items-center gap-2 uppercase tracking-[0.2em] italic">
                                <CheckCircle2 className="h-4 w-4" />
                                Justificación del Valor
                            </h4>
                            <p className="text-zinc-400 text-[11px] leading-relaxed font-medium">
                                El monto de <span className="text-white font-bold">${offerAmount.toLocaleString()} MXN</span> es coherente con el dictamen de 150 puntos, asegurando una transacción justa para ambas partes.
                            </p>
                        </div>

                        <button
                            onClick={handleOffer}
                            disabled={!isValid}
                            className="w-full h-20 rounded-[2rem] bg-indigo-600 text-white font-black text-xl shadow-2xl shadow-indigo-600/20 hover:bg-indigo-500 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale uppercase italic tracking-tighter"
                        >
                            Iniciar Compra Segura
                        </button>
                    </div>
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
