"use client";

import { ClinkarSeal } from "@/components/market/ClinkarSeal";

export default function Loading() {
    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col items-center justify-center p-6 bg-animate">
            <div className="relative">
                {/* Background Glow */}
                <div className="absolute inset-0 bg-indigo-500/20 blur-3xl animate-pulse" />

                {/* Brand Logo with Spin / Pulse */}
                <div className="relative animate-bounce duration-1000">
                    <ClinkarSeal variant="compact" className="scale-150 !bg-transparent border-none shadow-none" />
                </div>
            </div>

            <div className="mt-8 space-y-2 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 animate-pulse">
                    Enlazando Bóveda Digital
                </p>
                <div className="w-48 h-[1px] bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden">
                    <div className="absolute inset-0 bg-indigo-500 w-1/3 animate-shimmer" />
                </div>
            </div>
        </div>
    );
}
