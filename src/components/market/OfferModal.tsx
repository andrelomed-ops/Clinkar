"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Lock, AlertCircle, Info, Calculator, CheckCircle2, Shield, Clock, BadgeAlert, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { SellerReliabilityBadge } from "../dashboard/SellerReliabilityBadge";
import { BUSINESS_RULES } from "@/lib/fiscal-utils";

import { useRouter } from "next/navigation";

interface OfferModalProps {
    id: string; // Car ID for redirection
    carPrice: number;
    floorPrice: number;
    carName: string;
    hasSeal: boolean;
}

export function OfferModal({ id, carPrice, floorPrice, carName, hasSeal }: OfferModalProps) {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [negotiationResult, setNegotiationResult] = useState<'success' | 'reject' | null>(null);
    const [isNegotiating, setIsNegotiating] = useState(false);
    const [offerAmount, setOfferAmount] = useState<number>(carPrice);
    const offerFloor = floorPrice;
    const repairCost = carPrice - floorPrice;

    useEffect(() => {
        setMounted(true);
    }, []);

    const isValid = offerAmount >= offerFloor;

    const handleOffer = () => {
        setIsNegotiating(true);
        setTimeout(() => {
            setIsNegotiating(false);
            setNegotiationResult(isValid ? 'success' : 'reject');
        }, 2000);
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
            {isOpen && mounted && createPortal(
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-4 bg-background/95 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="bg-background border border-border w-full max-w-lg rounded-[2.5rem] p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-300 relative max-h-[95vh] overflow-y-auto custom-scrollbar">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-6 right-6 h-8 w-8 rounded-full bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all flex items-center justify-center z-10 border border-border"
                        >
                            ✕
                        </button>

                        <div className="space-y-1">
                            <h2 className="text-3xl font-black tracking-tight italic uppercase">Negociar Oferta</h2>
                            <p className="text-muted-foreground font-medium text-xs">Estás ofertando por el <span className="text-foreground font-bold">{carName}</span></p>
                        </div>

                        {/* Reliability Score */}
                        <div className="bg-secondary/30 rounded-2xl border border-border p-1">
                            <SellerReliabilityBadge
                                score={92}
                                acceptanceRate={85}
                                responseTime="< 12h"
                                isVerified={hasSeal}
                            />
                        </div>

                        <div className="bg-secondary/50 rounded-2xl p-4 border border-border space-y-3">
                            <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                                <span className="text-muted-foreground">Precio Base</span>
                                <span>${carPrice.toLocaleString()} MXN</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-red-500">
                                <span className="flex items-center gap-2">
                                    <Calculator className="h-3 w-3" />
                                    Inversión Sugerida
                                </span>
                                <span>- ${repairCost.toLocaleString()} MXN</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Tu Monto de Oferta (MXN)</label>
                            <div className="relative group">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-muted-foreground group-focus-within:text-amber-500 transition-colors">$</span>
                                <input
                                    type="number"
                                    value={offerAmount}
                                    onChange={(e) => setOfferAmount(Number(e.target.value))}
                                    className={cn(
                                        "w-full h-16 rounded-2xl bg-secondary/20 border-2 pl-12 pr-6 text-3xl font-black focus:ring-0 transition-all border-border focus:border-amber-500 text-foreground selection:bg-amber-500/30 shadow-inner"
                                    )}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-background rounded-md text-[10px] font-black text-muted-foreground border border-border/50">MXN</div>
                            </div>

                            {/* Dynamic Feedback Legend */}
                            {offerAmount >= carPrice ? (
                                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-500/10 p-2 rounded-xl text-xs font-bold border border-emerald-500/20">
                                    <CheckCircle2 className="h-4 w-4" /> Oferta Excelente: Alta probabilidad de aceptación.
                                </div>
                            ) : offerAmount >= offerFloor ? (
                                <div className="flex items-center gap-2 text-amber-600 bg-amber-500/10 p-2 rounded-xl text-xs font-bold border border-amber-500/20">
                                    <CheckCircle2 className="h-4 w-4" /> Oferta Justa: Dentro del rango pre-autorizado.
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-2 rounded-xl text-xs font-bold border border-red-500/20">
                                    <AlertCircle className="h-4 w-4" /> Oferta Muy Baja: El vendedor no la aceptará.
                                </div>
                            )}
                        </div>

                        {/* Cost Breakdown & Fee */}
                        <div className="bg-amber-500/5 rounded-2xl p-5 space-y-3 border border-amber-500/20 shadow-inner">
                            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                                <span className="text-muted-foreground">Oferta Directa</span>
                                <span>${offerAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-emerald-600">
                                <span className="flex items-center gap-2">
                                    <Shield className="h-3 w-3" />
                                    Protección Comprador
                                </span>
                                <span>$0.00</span>
                            </div>
                            <div className="pt-3 border-t border-border flex justify-between items-center">
                                <span className="text-lg font-black italic uppercase tracking-tighter">Total a Pagar</span>
                                <span className="text-2xl font-black italic tracking-tighter">${offerAmount.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="p-4 bg-secondary/30 border border-border rounded-xl space-y-2">
                            <div className="flex items-center gap-2 text-indigo-500">
                                <BadgeAlert className="h-4 w-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Aviso de Exclusividad</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground leading-relaxed italic font-medium">
                                El Certificado y Garantía **solo valen** si la transacción se liquida vía StarterKar.
                            </p>
                        </div>

                        <button
                            onClick={handleOffer}
                            disabled={isNegotiating}
                            className="w-full h-16 rounded-2xl bg-amber-500 text-black font-black text-lg shadow-xl shadow-amber-500/20 hover:bg-amber-400 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale uppercase italic tracking-tighter flex items-center justify-center gap-2"
                        >
                            {isNegotiating ? (
                                <>
                                    <div className="h-5 w-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                    Negociando en Vivo...
                                </>
                            ) : (
                                "Confirmar y Enviar Oferta"
                            )}
                        </button>
                    </div>
                </div>,
                document.body
            )}

            {negotiationResult === 'success' && mounted && createPortal(
                <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-background/95 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="bg-background border border-emerald-500/30 w-full max-w-sm rounded-[2rem] p-8 text-center space-y-6 shadow-2xl shadow-emerald-500/20 animate-in zoom-in-95 duration-500 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600" />
                        <div className="h-20 w-20 bg-emerald-500/10 text-emerald-500 mx-auto rounded-full flex items-center justify-center border-4 border-emerald-500/20">
                            <CheckCircle2 className="h-10 w-10" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black italic tracking-tighter uppercase text-emerald-600">¡Oferta Aprobada!</h3>
                            <div className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-lg text-xs font-black uppercase tracking-widest mb-2">
                                Automática • {new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                            La inteligencia de precios de StarterKar ha validado tu oferta de <strong className="text-foreground">${offerAmount.toLocaleString()} MXN</strong> contra el piso pre-autorizado por el vendedor.
                        </p>
                        <button
                            onClick={() => {
                                setNegotiationResult(null);
                                setIsOpen(false);
                            }}
                            className="w-full h-14 bg-emerald-500 text-white font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
                        >
                            Proceder al Pago Seguro
                        </button>
                    </div>
                </div>,
                document.body
            )}

            {negotiationResult === 'reject' && mounted && createPortal(
                <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-background/95 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="bg-background border border-red-500/30 w-full max-w-sm rounded-[2rem] p-8 text-center space-y-6 shadow-2xl shadow-red-500/20 animate-in zoom-in-95 duration-500 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 via-red-500 to-red-600" />
                        <div className="h-20 w-20 bg-red-500/10 text-red-500 mx-auto rounded-full flex items-center justify-center border-4 border-red-500/20">
                            <AlertCircle className="h-10 w-10" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black italic tracking-tighter uppercase text-red-500">Oferta Rechazada</h3>
                            <div className="inline-block px-3 py-1 bg-red-500/10 text-red-500 rounded-lg text-xs font-black uppercase tracking-widest mb-2">
                                Sistema Automatizado
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                            Lo sentimos, el vendedor no está dispuesto a aceptar un monto de <strong className="text-foreground">${offerAmount.toLocaleString()} MXN</strong>. Te invitamos a realizar una oferta más competitiva.
                        </p>
                        <button
                            onClick={() => setNegotiationResult(null)}
                            className="w-full h-14 bg-red-500 text-white font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-red-500/20"
                        >
                            Mejorar mi Oferta
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
