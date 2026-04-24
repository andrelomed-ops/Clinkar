"use client";

import { Shield, Clock, Lock, CheckCircle2, Info, ArrowRight, FileText, AlertTriangle, Search, Activity, CornerDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import Link from "next/link";
import LEGAL_TEXTS from "@/data/legal_texts.json";

interface VaultStatusProps {
    carPrice: number;
    carYear: number;
    status: "PENDING" | "FUNDS_HELD" | "RELEASED" | "CANCELLED";
    legalStatus?: "PENDING" | "VERIFIED" | "ISSUE";
    mechanicalStatus?: "PENDING" | "VERIFIED" | "ISSUE";
    contractStatus?: "PENDING" | "SIGNED";
    currency?: string;
    role?: 'buyer' | 'seller';
}

export function VaultStatus({
    carPrice,
    carYear,
    status,
    legalStatus = "PENDING",
    mechanicalStatus = "PENDING",
    contractStatus = "SIGNED", // Default verified for now or passed from parent
    currency = "MXN",
    role = "buyer"
}: VaultStatusProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMounted(true);
    }, []);

    // Constants provided by user logic
    const SELLER_COMMISSION_RATE = 0.035; // 3.5%
    const BUYER_LOGISTICS_FEE = 2500;
    const BUYER_PROMO_DISCOUNT = -2500;
    
    const SELLER_COMMISSION = carPrice * SELLER_COMMISSION_RATE;
    const BUYER_NET_COMMISSION = BUYER_LOGISTICS_FEE + BUYER_PROMO_DISCOUNT;
    
    const SELLER_RECEIVES = carPrice; // Gross before commission payment
    const TOTAL_DEPOSITED = role === 'buyer' ? carPrice : carPrice; // For now total in vault is car price

    const formatCurrency = (val: number) => {
        if (!isMounted || val === undefined || val === null) return "...";
        try {
            return val.toLocaleString();
        } catch {
            return "...";
        }
    };

    return (
        <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* STATUS HEADER - Simplified Language */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-6">
                <div className="flex items-center gap-3">
                    <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-500")}>
                        <Activity className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-foreground">Monitor de Compra Segura</h2>
                        <p className="text-xs text-muted-foreground">Estado en tiempo real de la operación</p>
                    </div>
                </div>

                <div className={cn(
                    "px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2",
                    status === 'PENDING' ? "bg-muted text-muted-foreground" :
                        status === 'FUNDS_HELD' ? "bg-amber-500/10 text-amber-500 ring-4 ring-amber-500/5" :
                            status === 'RELEASED' ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"
                )}>
                    {status === 'FUNDS_HELD' && <Lock className="h-3 w-3" />}
                    {status === 'RELEASED' && <CheckCircle2 className="h-3 w-3" />}
                    {status === 'PENDING' ? 'Esperando Comprobante' :
                        status === 'FUNDS_HELD' ? 'Validando Pago' :
                            status === 'RELEASED' ? 'Operación Exitosa' : 'Cancelado'}
                </div>
            </div>

            <div className="grid grid-cols-1 2xl:grid-cols-12 gap-8">

                {/* LEFT: VISUAL PIPELINE */}
                <div className="2xl:col-span-7 space-y-6">

                    {/* 1. INGESTION NODE -> Tu Pago */}
                    <div className={cn(
                        "relative p-6 rounded-2xl border-2 transition-all",
                        status !== 'PENDING' ? "border-blue-500 bg-blue-500/10" : "border-border bg-muted/50 opacity-60"
                    )}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase text-muted-foreground/60">1. Tu Pago</span>
                            {status !== 'PENDING' && <CheckCircle2 className="h-5 w-5 text-blue-500" />}
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <Clock className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="font-bold text-foreground text-lg">
                                    ${formatCurrency(carPrice)} {currency}
                                </p>
                                <p className="text-xs text-muted-foreground">Fondos resguardados en Bóveda Digital</p>
                            </div>
                        </div>
                    </div>

                    {/* CONNECTOR ARROW */}
                    <div className="flex justify-center -my-3 relative z-10">
                        <div className="bg-white rounded-full p-1 shadow-sm border border-slate-100">
                            <CornerDownRight className="h-5 w-5 text-slate-300" />
                        </div>
                    </div>

                    {/* 2. VERIFICATION NODE -> Seguridad */}
                    <div className={cn(
                        "relative p-6 rounded-2xl border-2 transition-all",
                        status === 'FUNDS_HELD' ? "border-amber-500 bg-amber-500/10 ring-4 ring-amber-500/5" :
                            status === 'RELEASED' ? "border-blue-500/30 opacity-60" : "border-border opacity-40"
                    )}>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold uppercase text-muted-foreground/60">2. Verificación de Seguridad</span>
                            {status === 'FUNDS_HELD' && <span className="animate-pulse text-xs font-bold text-amber-500">● VALIDANDO RECEPCIÓN</span>}
                        </div>

                        <div className="bg-card rounded-xl p-4 border border-border space-y-3">
                            <p className="text-xs text-muted-foreground mb-2">Desglose de la operación:</p>
                            
                            {role === 'buyer' ? (
                                <>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-purple-500" />
                                            <span className="text-sm font-medium text-slate-600">Valor de la Unidad</span>
                                        </div>
                                        <span className="font-mono font-bold text-slate-700">${formatCurrency(carPrice)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                                            <span className="text-sm font-medium text-muted-foreground">Logística de Compra</span>
                                        </div>
                                        <span className="font-mono font-bold text-foreground/80">${formatCurrency(BUYER_LOGISTICS_FEE)}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                            <span className="text-[10px] font-black uppercase text-emerald-700 tracking-tight">Descuento StarterKar (Promoción)</span>
                                        </div>
                                        <span className="font-mono font-bold text-emerald-600">-${formatCurrency(Math.abs(BUYER_PROMO_DISCOUNT))}</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-purple-500" />
                                            <span className="text-sm font-medium text-slate-600">Precio de Venta</span>
                                        </div>
                                        <span className="font-mono font-bold text-slate-700">${formatCurrency(carPrice)}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-amber-50 p-2 rounded-lg border border-amber-100">
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle className="h-3 w-3 text-amber-600" />
                                            <span className="text-[10px] font-black uppercase text-amber-700 tracking-tight">Comisión StarterKar (3.5%)</span>
                                        </div>
                                        <span className="font-mono font-bold text-amber-600">${formatCurrency(SELLER_COMMISSION)}</span>
                                    </div>
                                </>
                            )}
                        </div>
                        
                        {role === 'seller' && (
                            <div className="mt-4 p-4 bg-zinc-900 rounded-xl border border-zinc-800 text-white space-y-3">
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Liquidación de Comisión</p>
                                <p className="text-[10px] text-zinc-300 leading-relaxed">
                                    Una vez liberados los fondos del auto, el pago de la comisión (${formatCurrency(SELLER_COMMISSION)} MXN) debe realizarse vía transferencia a:
                                </p>
                                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-800">
                                    <div>
                                        <p className="text-[8px] font-bold text-zinc-500 uppercase">Banco</p>
                                        <p className="text-[10px] font-black">BBVA MÉXICO</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-bold text-zinc-500 uppercase">CLABE</p>
                                        <p className="text-[10px] font-black">0121 8000 1234 5678 90</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        <p className="mt-3 text-[10px] text-muted-foreground/60 leading-tight">
                            * {LEGAL_TEXTS.NON_CUSTODIAL_DISCLAIMER}
                        </p>
                    </div>

                    {/* CONNECTOR ARROW */}
                    <div className="flex justify-center -my-3 relative z-10">
                        <div className="bg-white rounded-full p-1 shadow-sm border border-slate-100">
                            <CornerDownRight className="h-5 w-5 text-slate-300" />
                        </div>
                    </div>

                    {/* 3. RELEASE NODE -> Pago Entregado */}
                    <div className={cn(
                        "relative p-6 rounded-2xl border-2 transition-all",
                        status === 'RELEASED' ? "border-emerald-500 bg-emerald-500/10" : "border-border opacity-40"
                    )}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase text-muted-foreground/60">3. Pago Entregado</span>
                            {status === 'RELEASED' && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            ¡Listo! El vendedor ya recibió su dinero y tú tienes tu auto.
                        </p>
                    </div>

                </div>

                {/* RIGHT: BLOCKERS / CHECKS -> Lo que falta para liberar */}
                <div className="2xl:col-span-5 space-y-4">
                    <h3 className="text-xs font-bold uppercase text-slate-400 mb-2">¿Qué falta para liberar el pago?</h3>

                    {/* MECHANICAL CHECK - CERTIFICADO CLINKAR */}
                    <div className={cn(
                        "p-4 rounded-xl border flex items-center justify-between transition-colors",
                        mechanicalStatus === 'VERIFIED' ? "bg-emerald-500/10 border-emerald-500/20" : "bg-card border-border"
                    )}>
                        <div className="flex items-center gap-3">
                            <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", mechanicalStatus === 'VERIFIED' ? "bg-emerald-500/20 text-emerald-500" : "bg-muted text-muted-foreground/40")}>
                                <Search className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="font-bold text-sm text-foreground">Certificado Mecánico</p>
                                <div className="flex items-center gap-1">
                                    <p className="text-xs text-muted-foreground">Avalado por Sello StarterKar</p>
                                    <Shield className="h-3 w-3 text-blue-500 fill-blue-500/20" />
                                </div>
                            </div>
                        </div>
                        {mechanicalStatus === 'VERIFIED' ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <span className="text-xs font-bold text-muted-foreground/40">PENDIENTE</span>}
                    </div>

                    {/* LEGAL CHECK - CERTIFICADO CLINKAR */}
                    <div className={cn(
                        "p-4 rounded-xl border flex items-center justify-between transition-colors",
                        legalStatus === 'VERIFIED' ? "bg-emerald-500/10 border-emerald-500/20" : "bg-card border-border"
                    )}>
                        <div className="flex items-center gap-3">
                            <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", legalStatus === 'VERIFIED' ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400")}>
                                <FileText className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="font-bold text-sm text-slate-900">Certificado Legal</p>
                                <div className="flex items-center gap-1">
                                    <p className="text-xs text-slate-500">Avalado por Sello StarterKar</p>
                                    <Shield className="h-3 w-3 text-purple-600 fill-purple-600/20" />
                                </div>
                            </div>
                        </div>
                        {legalStatus === 'VERIFIED' ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <span className="text-xs font-bold text-slate-400">REVISANDO</span>}
                    </div>

                    {/* CONTRACT CHECK */}
                    <div className={cn(
                        "p-4 rounded-xl border flex items-center justify-between transition-colors",
                        contractStatus === 'SIGNED' ? "bg-green-50 border-green-200" : "bg-white border-slate-200"
                    )}>
                        <div className="flex items-center gap-3">
                            <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", contractStatus === 'SIGNED' ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400")}>
                                <FileText className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="font-bold text-sm text-slate-900">Contrato Digital</p>
                                <div className="flex items-center gap-1">
                                    <p className="text-xs text-slate-500">Firmas Seguras StarterKar</p>
                                    <Shield className="h-3 w-3 text-slate-600 fill-slate-600/20" />
                                </div>
                            </div>
                        </div>
                        {contractStatus === 'SIGNED' ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <span className="text-xs font-bold text-slate-400">PENDIENTE</span>}
                    </div>

                    {/* INFO BOX */}
                    <div className="bg-muted/30 rounded-2xl p-6 mt-6 border border-border animate-reveal stagger-3">
                        <div className="flex items-start gap-3">
                            <Shield className="h-5 w-5 text-muted-foreground/40 shrink-0 mt-0.5" />
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                <strong>Tu compra está segura:</strong> StarterKar no autoriza la entrega del vehículo hasta que estos dos puntos estén en verde y el contrato esté firmado.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div >
    );
}
