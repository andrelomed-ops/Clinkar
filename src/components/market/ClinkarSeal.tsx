"use client";

import React from "react";
import { Check, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClinkarSealProps {
    variant?: "compact" | "full" | "holographic";
    className?: string;
    score?: number;
}

export function ClinkarSeal({ variant = "compact", className, score }: ClinkarSealProps) {
    // Unique Minimalist Logo: A stylized "C" that forms a Shield/Safety Ring
    const BrandMark = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
        const dims = size === "sm" ? "h-5 w-5" : size === "md" ? "h-8 w-8" : "h-12 w-12";
        const iconSize = size === "sm" ? "h-3 w-3" : size === "md" ? "h-5 w-5" : "h-7 w-7";

        return (
            <div className={cn("relative flex items-center justify-center shrink-0", dims)}>
                {/* Outer Shield Shape / Ring */}
                <div className="absolute inset-0 rounded-full border-[2px] border-indigo-500/10" />

                {/* Core Shield */}
                <div className="relative z-10 bg-indigo-600 rounded-lg p-1.5 shadow-lg shadow-indigo-600/30 group-hover:scale-110 transition-transform flex items-center justify-center rotate-3 group-hover:rotate-0">
                    <Shield className={cn("text-white fill-white/20", iconSize)} />
                    <Check className={cn("absolute text-white stroke-[4px]", size === "sm" ? "h-2 w-2" : size === "md" ? "h-3 w-3" : "h-4 w-4")} />
                </div>
            </div>
        );
    };

    if (variant === "compact") {
        return (
            <div className={cn(
                "group flex items-center gap-2 px-2 py-1 bg-white/95 dark:bg-zinc-900/90 backdrop-blur-md rounded-full border border-zinc-200 dark:border-zinc-800 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.1)] hover:border-indigo-500/30 transition-all duration-300",
                className
            )}>
                <BrandMark size="sm" />
                <span className="text-[9px] font-black text-zinc-900 dark:text-zinc-100 tracking-[0.1em] uppercase pr-1">Clinkar</span>
            </div>
        );
    }

    if (variant === "holographic") {
        return (
            <div className={cn(
                "relative group overflow-hidden rounded-3xl p-6 bg-zinc-950 border border-white/5 text-white shadow-2xl",
                className
            )}>
                {/* Advanced Holographic Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-transparent to-violet-500/20 opacity-30 group-hover:opacity-60 transition-opacity duration-1000" />
                <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0,transparent_50%)] animate-slow-spin" />

                <div className="relative flex items-center gap-6">
                    <BrandMark size="lg" />
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-lg font-black uppercase tracking-[0.2em] text-white">Sello Maestro</h4>
                            <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase">Activo</div>
                        </div>
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest leading-none">Integridad Técnica & Legal Blindada</p>
                    </div>
                    {score && (
                        <div className="text-right">
                            <span className="text-3xl font-black text-indigo-400 tabular-nums">{(score / 10).toFixed(1)}</span>
                            <span className="text-[10px] font-black text-zinc-600 block -mt-1 uppercase tracking-widest">Confianza</span>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={cn(
            "group flex items-center gap-4 px-6 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] shadow-xl hover:border-indigo-500/20 transition-all",
            className
        )}>
            <BrandMark size="md" />
            <div>
                <h4 className="text-base font-black uppercase tracking-widest text-zinc-900 dark:text-white">Sello Clinkar</h4>
                <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em]">Sello Único de Confianza Digital</p>
            </div>
        </div>
    );
}
