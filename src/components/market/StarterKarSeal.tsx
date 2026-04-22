"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface StarterKarSealProps {
    variant?: "compact" | "full" | "holographic";
    className?: string;
    score?: number;
}

/**
 * BrandMark — the StarterKar icon mark.
 * Uses an inline SVG inspired by the chosen Logo B: geometric SK monogram
 * with a shield+arrow motif in solid indigo. Works on any background in light/dark mode.
 */
const BrandMark = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
    const dims = size === "sm" ? "h-7 w-7" : size === "md" ? "h-10 w-10" : "h-14 w-14";

    return (
        <div className={cn("relative flex items-center justify-center shrink-0", dims)}>
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* Shield background */}
                <path
                    d="M20 3L5 9v10c0 9.39 6.4 18.17 15 20.37C29.6 37.17 35 28.39 35 19V9L20 3z"
                    fill="#4F46E5"
                />
                {/* Inner shield highlight */}
                <path
                    d="M20 7L9 12v9c0 7.5 5 14.3 11 16.3C26 35.3 31 28.5 31 21v-9L20 7z"
                    fill="#4338CA"
                />
                {/* S letterform */}
                <path
                    d="M14.5 16.5c0-1.38 1.12-2.5 2.5-2.5h4a1.5 1.5 0 010 3H17a2.5 2.5 0 000 5h4a1.5 1.5 0 010 3h-4a2.5 2.5 0 01-2.5-2.5"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    fill="none"
                />
                {/* K letterform */}
                <path
                    d="M22.5 14v12M22.5 20l4.5-6M22.5 20l4.5 6"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {/* Bottom star/dot accent */}
                <circle cx="20" cy="33.5" r="1.2" fill="white" fillOpacity="0.6" />
            </svg>
        </div>
    );
};

export function StarterKarSeal({ variant = "compact", className, score }: StarterKarSealProps) {

    if (variant === "compact") {
        return (
            <div className={cn(
                "group flex items-center gap-2.5 px-3 py-1.5 bg-white/95 dark:bg-zinc-900/90 backdrop-blur-md rounded-full border border-zinc-200 dark:border-zinc-800 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.1)] hover:border-indigo-500/30 transition-all duration-300",
                className
            )}>
                <BrandMark size="sm" />
                <span className="text-sm font-black tracking-tighter text-zinc-900 dark:text-white">
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
