"use client";

import { CheckCircle2, Clock, Wallet, FileCheck, Loader2, Settings2, Unlock, AlertCircle, Gavel, ShieldCheck } from "lucide-react";
import LEGAL_TEXTS from "@/data/legal_texts.json";
import { useEffect, useState } from "react";
import { getTicketAction } from "@/app/actions_demo";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ClinkarEvolutionHub } from "./ClinkarEvolutionHub";
import { MediationHub } from "./MediationHub";
import { PostSaleEcosystem } from "./PostSaleEcosystem";
import { BadgeCheck, Lock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function SellerDashboardView() {
    const [ticket, setTicket] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Strategy State - Initialize from localStorage if available (client-side)
    const [allowOpenOffers, setAllowOpenOffers] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('clinkar_open_offers') === 'true';
        }
        return false;
    });

    // Pending Offers Mock
    const [pendingOffer, setPendingOffer] = useState<{ amount: number, bidder: string } | null>(null);

    useEffect(() => {
        getTicketAction('00000000-0000-0000-0000-000000000002')
            .then(data => {
                setTicket(data);
                setLoading(false);
            });

        // Check for pending offers from buyer flow
        const checkOffers = setInterval(() => {
            const offer = localStorage.getItem('clinkar_pending_offer');
            if (offer) {
                setPendingOffer(JSON.parse(offer));
            }
        }, 1000);

        return () => clearInterval(checkOffers);
    }, []);

    const toggleOpenOffers = (checked: boolean) => {
        setAllowOpenOffers(checked);
        localStorage.setItem('clinkar_open_offers', checked.toString());
    };

    const handleAuthorize = () => {
        localStorage.setItem('clinkar_offer_status', 'ACCEPTED');
        localStorage.removeItem('clinkar_pending_offer');
        setPendingOffer(null);
    };

    const handleReject = () => {
        localStorage.setItem('clinkar_offer_status', 'REJECTED');
        localStorage.removeItem('clinkar_pending_offer');
        setPendingOffer(null);
    };

    if (loading) return <div className="p-8 text-center text-zinc-500"><Loader2 className="animate-spin h-6 w-6 mx-auto mb-2" />Cargando datos...</div>;

    return (
        <div className="glass-card rounded-premium p-8 space-y-10 border-border/40">
            <header className="flex justify-between items-start">
                <div>
                    <h2 className="text-lg font-bold text-foreground">Centro de Comando de Venta</h2>
                    <p className="text-sm text-muted-foreground">Gestiona tu estrategia de precios y ofertas</p>
                </div>
                <Link href="/admin">
                    <Button variant="outline" size="sm" className="gap-2 border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-400">
                        <ShieldCheck className="h-4 w-4" />
                        Acceso Admin (Demo)
                    </Button>
                </Link>
            </header>

            {/* STRATEGY CARD */}
            <div className="bg-muted/30 dark:bg-zinc-900/40 rounded-2xl border border-border p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold mb-1">
                        <Settings2 className="h-4 w-4" />
                        Estrategia de Precio
                    </div>
                </div>

                <div className="flex items-center justify-between gap-4 p-4 bg-background dark:bg-zinc-950/50 rounded-xl border border-border">
                    <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center transition-all ${allowOpenOffers ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-muted text-muted-foreground/40'}`}>
                            <Unlock className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-bold text-foreground">Permitir Ofertas Libres</p>
                            <p className="text-xs text-muted-foreground">
                                {allowOpenOffers
                                    ? "Recibirás todas las ofertas para revisión manual."
                                    : "El sistema rechazará automáticamente ofertas bajas."}
                            </p>
                        </div>
                    </div>
                    <Switch checked={allowOpenOffers} onCheckedChange={toggleOpenOffers} />
                </div>
            </div>

            {/* PENDING OFFERS ALERT */}
            {pendingOffer && (
                <div className="bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/30 dark:border-amber-500/20 rounded-2xl p-6 animate-reveal hover:scale-[1.01] transition-transform shadow-lg shadow-amber-500/5">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-amber-500 text-black rounded-xl flex items-center justify-center animate-pulse shadow-lg shadow-amber-500/20">
                                <Gavel className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-black text-amber-600 dark:text-amber-500 tracking-tight">Nueva Oferta Recibida</h3>
                                <p className="text-sm font-bold text-foreground">
                                    Oferta de ${pendingOffer.amount.toLocaleString()} por tu vehículo.
                                </p>
                                <p className="text-[10px] text-amber-600/80 dark:text-amber-500/60 mt-1 uppercase font-black tracking-widest">Requiere autorización manual</p>
                            </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button variant="outline" onClick={handleReject} className="flex-1 sm:flex-none border-amber-500/30 text-amber-600 dark:text-amber-500 hover:bg-amber-500/10 font-bold">
                                Rechazar
                            </Button>
                            <Button onClick={handleAuthorize} className="flex-1 sm:flex-none bg-amber-500 hover:bg-amber-400 text-black font-black shadow-lg shadow-amber-500/20">
                                Autorizar
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid gap-4 opacity-50 pointer-events-none filter grayscale">
                {/* Inspección (Existing Logic Mocked for visual) */}
                <div className="p-4 rounded-2xl border bg-emerald-500/10 border-emerald-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        <div>
                            <p className="text-sm font-bold text-foreground">Costo de Inspección</p>
                            <p className="text-xs text-muted-foreground">Pagado anticipadamente</p>
                        </div>
                    </div>
                    <span className="font-bold text-foreground">$900.00</span>
                </div>

                {/* PLD / Compliance Status Widget */}
                <div className="p-4 rounded-2xl border bg-blue-500/10 border-blue-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="h-5 w-5 text-blue-600" />
                        <div>
                            <p className="text-sm font-bold text-foreground">Nivel de Verificación</p>
                            <p className="text-xs text-muted-foreground">Sube tu INE para blindar tu cuenta</p>
                        </div>
                    </div>
                    <Link href="/dashboard/verification">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white border-none font-bold text-xs h-8">
                            Verificar Ahora
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="bg-muted/50 rounded-xl p-4 space-y-2 border border-border">
                <p className="text-[10px] text-muted-foreground/60 leading-tight">
                    * {LEGAL_TEXTS.NON_CUSTODIAL_DISCLAIMER}
                </p>
            </div>

            <div className="pt-8 space-y-12">
                {/* Mediation & Protection Hub */}
                <MediationHub transactionId={ticket?.id || "N/A"} />

                {/* Post-Sale Ecosystem */}
                <div className="mt-12">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-600">
                                <Lock className="h-4 w-4" />
                            </div>
                            <h3 className="font-black text-lg tracking-tight uppercase italic text-foreground">Bóveda Documental</h3>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                            <BadgeCheck className="h-3 w-3 text-emerald-600" />
                            <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest leading-none">Resguardado 5 Años (SAT)</span>
                        </div>
                    </div>
                    <PostSaleEcosystem transactionId={ticket?.id || "demo-transaction"} />
                </div>

                <ClinkarEvolutionHub />
            </div>
        </div>
    );
}
