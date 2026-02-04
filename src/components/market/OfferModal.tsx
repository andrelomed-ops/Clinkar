"use client";

import { useState } from "react";
import { Lock, AlertCircle, Info, Calculator, CheckCircle2, Shield, Clock, BadgeAlert } from "lucide-react";
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
    const [offerAmount, setOfferAmount] = useState<number>(carPrice - repairCost);
    const offerFloor = carPrice - repairCost;

    const isValid = offerAmount >= offerFloor;

    const handleOffer = () => {
        if (!isValid) return;
        // In a real app, we would make an API call to create the transaction record here
        // For now, satisfy the mock requirement by redirecting
        setIsOpen(false);
        router.push(`/transaction/${id}?offer=${offerAmount}`);
    };

    return (
        <>
            <div className="space-y-4">
                <button
                    onClick={() => setIsOpen(true)}
                    disabled={!hasSeal}
                    className={cn(
                        "w-full h-16 rounded-[2rem] font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl",
                        hasSeal
                            ? "bg-primary text-primary-foreground hover:scale-[1.02] shadow-primary/20"
                            : "bg-secondary text-muted-foreground cursor-not-allowed border border-border"
                    )}
                >
                    {hasSeal ? (
                        <>
                            <Lock className="h-6 w-6" />
                            Realizar Oferta Segura
                        </>
                    ) : (
                        <>
                            <AlertCircle className="h-6 w-6" />
                            Pendiente de Certificación
                        </>
                    )}
                </button>
            </div>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-background border border-border w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-300 relative max-h-[85vh] overflow-y-auto">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-6 right-6 text-muted-foreground hover:text-foreground font-black text-xl z-10"
                        >
                            ✕
                        </button>

                        <div className="space-y-2">
                            <h2 className="text-3xl font-black tracking-tight italic">Negociar Oferta</h2>
                            <p className="text-muted-foreground font-medium">Estás ofertando por el <span className="text-foreground">{carName}</span></p>
                        </div>

                        {/* Reliability Score */}
                        <SellerReliabilityBadge
                            score={92}
                            acceptanceRate={85}
                            responseTime="< 12h"
                            isVerified={hasSeal}
                        />

                        <div className="bg-secondary/30 rounded-3xl p-6 space-y-4">
                            <div className="flex justify-between items-center text-sm font-bold">
                                <span className="text-muted-foreground">Precio Base</span>
                                <span>${carPrice.toLocaleString()} MXN</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold text-red-500">
                                <span className="flex items-center gap-2">
                                    <Calculator className="h-4 w-4" />
                                    Descuento por Reparaciones
                                </span>
                                <span>- ${repairCost.toLocaleString()} MXN</span>
                            </div>
                            <div className="pt-4 border-t border-border flex justify-between items-center">
                                <span className="text-lg font-black text-primary">Piso de Oferta</span>
                                <span className="text-lg font-black text-primary">${offerFloor.toLocaleString()} MXN</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Tu Monto de Oferta (MXN)</label>
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-muted-foreground">$</span>
                                <input
                                    type="number"
                                    value={offerAmount}
                                    onChange={(e) => setOfferAmount(Number(e.target.value))}
                                    className={cn(
                                        "w-full h-20 rounded-2xl bg-secondary/50 border-4 pl-12 pr-6 text-3xl font-black focus:ring-0 transition-all",
                                        isValid ? "border-primary/20 focus:border-primary" : "border-red-500 focus:border-red-600"
                                    )}
                                />
                            </div>
                            {!isValid && (
                                <p className="text-red-500 text-xs font-bold flex items-center gap-2 animate-pulse">
                                    <AlertCircle className="h-4 w-4" />
                                    Tu oferta no puede ser inferior al piso calculado por reparaciones.
                                </p>
                            )}
                        </div>

                        {/* Cost Breakdown & Fee */}
                        <div className="bg-emerald-500/5 rounded-2xl p-4 space-y-3 border border-emerald-500/10">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Tu Oferta al Vendedor</span>
                                <span className="font-bold">${offerAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                                    <Shield className="h-3 w-3" />
                                    Protección Comprador (IVA incluido)
                                </span>
                                <span className="font-bold text-emerald-600">$0.00</span>
                            </div>
                            <div className="pt-3 border-t border-emerald-500/10 flex justify-between items-center">
                                <span className="text-lg font-black text-foreground">Total a Pagar</span>
                                <span className="text-xl font-black text-foreground">${offerAmount.toLocaleString()}</span>
                            </div>
                            <p className="text-[10px] text-center text-muted-foreground font-medium">
                                * Operación segura mediante Bóveda Digital (SPEI/STP).
                                <br />
                                ** El costo total de inspección ($1,500.00 MXN) es acreditable a la comisión en autos {`<`} $120k.
                            </p>
                        </div>

                        <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 rounded-lg py-2">
                            <Clock className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-wide">Oferta válida por 24 horas</span>
                        </div>

                        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl">
                            <div className="flex items-center gap-2 text-indigo-400 mb-2">
                                <BadgeAlert className="h-4 w-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Aviso de Exclusividad Clinkar</span>
                            </div>
                            <p className="text-[10px] text-zinc-400 leading-relaxed italic">
                                El Certificado de Inspección (Vigencia 30 días) y el acceso a Garantía Mecánica de 90 días **solo cobran validez** si la transacción se liquida vía Clinkar.
                            </p>
                        </div>

                        <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-6 space-y-2">
                            <h4 className="text-blue-600 font-black text-sm flex items-center gap-2 uppercase tracking-wide">
                                <CheckCircle2 className="h-4 w-4" />
                                Justificación Automática
                            </h4>
                            <p className="text-blue-900/70 text-sm leading-relaxed font-medium">
                                El monto de <span className="font-bold">${offerAmount.toLocaleString()} MXN</span> es coherente con el estado real del vehículo, considerando los gastos de reparación detallados en el dictamen de 150 puntos. Esto asegura una transacción justa para ambas partes.
                            </p>
                        </div>

                        <button
                            onClick={handleOffer}
                            disabled={!isValid}
                            className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                        >
                            Iniciar Compra Segura
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
