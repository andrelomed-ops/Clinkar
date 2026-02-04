"use client";

import { TrendingDown, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NegotiationViewProps {
    marketValue: number;
    initialPrice: number;
    offerAmount: string;
    setOfferAmount: (val: string) => void;
    negotiationStatus: 'IDLE' | 'ANALYZING' | 'ACCEPTED' | 'REJECTED' | 'WAITING_APPROVAL';
    handleMakeOffer: () => void;
    handleProceedToServices: () => void;
}

export const NegotiationView = ({
    marketValue,
    initialPrice,
    offerAmount,
    setOfferAmount,
    negotiationStatus,
    handleMakeOffer,
    handleProceedToServices
}: NegotiationViewProps) => {
    return (
        <div className="space-y-6">
            {/* Transparency Card */}
            <div className="bg-white dark:bg-zinc-900 border border-border rounded-3xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <TrendingDown className="text-emerald-500" />
                    Desglose de Transparencia
                </h2>

                <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-zinc-800 rounded-xl">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Valor Libro Negro (Mercado)</p>
                            <p className="text-xs text-slate-400">Promedio nacional estado excelente</p>
                        </div>
                        <span className="text-lg font-bold text-slate-500 line-through decoration-red-500/50">
                            ${marketValue.toLocaleString()}
                        </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-xl mt-4">
                        <div>
                            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Precio Justo Sugerido</p>
                            <p className="text-xs text-emerald-600/80">Basado en condición real</p>
                        </div>
                        <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                            ${initialPrice.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Offer Interface */}
            <div className="bg-card border border-border rounded-3xl p-6">
                <div className="mb-6">
                    <h3 className="text-lg font-bold mb-2">Haz tu Oferta</h3>
                    <p className="text-sm text-muted-foreground">
                        El vendedor ha activado "Flash Sale". Tienes alta probabilidad de aceptación si ofertas cerca del sugerido.
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">$</span>
                        <Input
                            value={offerAmount}
                            onChange={(e) => setOfferAmount(e.target.value)}
                            className="pl-8 h-14 text-lg font-bold bg-secondary"
                            placeholder={initialPrice.toString()}
                            disabled={negotiationStatus === 'ACCEPTED' || negotiationStatus === 'WAITING_APPROVAL'}
                        />
                    </div>
                    <Button
                        size="lg"
                        className="h-14 px-8 text-base"
                        onClick={handleMakeOffer}
                        disabled={!offerAmount || (negotiationStatus !== 'IDLE' && negotiationStatus !== 'REJECTED')}
                    >
                        {negotiationStatus === 'ANALYZING' ? 'Analizando...' : negotiationStatus === 'WAITING_APPROVAL' ? 'Enviando...' : 'Ofertar'}
                    </Button>
                </div>

                {negotiationStatus === 'ACCEPTED' && (
                    <div className="mt-10 p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl animate-in zoom-in duration-500">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-12 w-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="text-emerald-400 h-7 w-7" />
                            </div>
                            <div>
                                <h4 className="font-black text-xl text-emerald-400 tracking-tight">¡Trato Hecho!</h4>
                                <p className="text-xs text-emerald-400/60 uppercase font-black tracking-widest">Oferta aceptada</p>
                            </div>
                        </div>
                        <Button
                            onClick={handleProceedToServices}
                            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black h-14 rounded-2xl text-lg shadow-xl shadow-emerald-500/20 transition-all active:scale-95"
                        >
                            Configurar mi Entrega
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
