"use client";

import { ShieldCheck, Star, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SellerReliabilityBadgeProps {
    score: number; // 0-100
    acceptanceRate: number; // 0-100
    responseTime: string;
    isVerified: boolean;
    className?: string;
}

export function SellerReliabilityBadge({
    score = 95,
    acceptanceRate = 88,
    responseTime = "< 2h",
    isVerified = true,
    className
}: SellerReliabilityBadgeProps) {
    return (
        <div className={cn("bg-zinc-50 dark:bg-zinc-900 border border-border rounded-3xl p-6 space-y-4", className)}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-indigo-600" />
                    <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest leading-none">Vendedor Verificado</span>
                </div>
                <div className="flex items-center gap-1 bg-indigo-50 px-3 py-1 rounded-full">
                    <Star className="h-3 w-3 text-indigo-600 fill-indigo-600" />
                    <span className="text-xs font-black text-indigo-600">{score / 10}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter uppercase leading-none">Tasa de Aceptación</p>
                    <p className="text-sm font-black text-foreground">{acceptanceRate}%</p>
                </div>
                <div className="space-y-1 text-right">
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter uppercase leading-none">Respuesta</p>
                    <p className="text-sm font-black text-foreground">{responseTime}</p>
                </div>
            </div>

            {acceptanceRate < 70 && (
                <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <p className="text-[10px] text-amber-800 leading-tight italic font-medium">
                        Vendedor con baja tasa de respuesta. Tus ofertas podrían tardar en procesarse.
                    </p>
                </div>
            )}

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <p className="text-[10px] text-zinc-500 leading-tight">
                    * Este vendedor ha completado su **Inspección Clinkar** y tiene fondos comprometidos en la plataforma.
                </p>
            </div>
        </div>
    );
}
