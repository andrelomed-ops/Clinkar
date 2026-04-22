"use client";

import React from "react";
import { Check, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarterKarSealProps {
    variant?: "compact" | "full" | "holographic";
    className?: string;
    score?: number;
}

const BrandMark = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
    const dims = size === "sm" ? "h-6 w-6" : size === "md" ? "h-9 w-9" : "h-14 w-14";
    const padding = size === "sm" ? "p-1" : size === "md" ? "p-1.5" : "p-2.5";

    return (
        <div className={cn(
            "relative flex items-center justify-center shrink-0 rounded-xl bg-indigo-600 shadow-lg shadow-indigo-600/40 group-hover:scale-110 transition-transform rotate-3 group-hover:rotate-0",
            dims,
            padding
        )}>
            {/* Inline SVG: Shield with car silhouette */}
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* Shield path */}
                <path d="M12 2L3 6v6c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V6L12 2z" fill="white" fillOpacity="0.9"/>
                {/* Car silhouette inside shield */}
                <path d="M8 14.5h8M9.5 14.5l1-2.5h3l1 2.5M9 14.5v1h1.5v-1M13.5 14.5v1H15v-1" stroke="#4F46E5" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10.5 12h3l-.5-1.5h-2L10.5 12z" fill="#4F46E5" fillOpacity="0.6"/>
            </svg>
        </div>
    );
};

export function StarterKarSeal({ variant = "compact", className, score }: StarterKarSealProps) {

    if (variant === "compact") {
        return (
            <div className={cn(
                "group flex items-center gap-2 px-3 py-1.5 bg-white/95 dark:bg-zinc-900/90 backdrop-blur-md rounded-full border border-zinc-200 dark:border-zinc-800 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.1)] hover:border-indigo-500/30 transition-all duration-300",
                className
            )}>
                <BrandMark size="sm" />
                <span className="text-sm font-black tracking-tighter text-zinc-900 dark:text-white uppercase italic">
                    Starter<span className="text-indigo-600">Kar</span>
                </span>
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
                <h4 className="text-base font-black uppercase tracking-widest text-zinc-900 dark:text-white">Sello StarterKar</h4>
                <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em]">Sello Único de Confianza Digital</p>
            </div>
        </div>
    );
}
