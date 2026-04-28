"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface StarterKarLogoProps {
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    className?: string;
    href?: string;
    showWordmark?: boolean;
    showMonogram?: boolean;
    orientation?: "horizontal" | "vertical";
    label?: string;
    hideSubmark?: boolean;
}

export function StarterKarLogo({
    size = "md",
    className,
    href = "/",
    showWordmark = true,
    showMonogram = true,
    orientation = "horizontal",
    label,
    hideSubmark = true,
}: StarterKarLogoProps) {
    const shieldSizes = {
        xs: "h-6 w-6",
        sm: "h-10 w-10",
        md: "h-14 w-14",
        lg: "h-20 w-20",
        xl: "h-28 w-28",
    };

    const wordmarkSizes = {
        xs: { title: "text-[11px]", sub: "text-[7px]"  },
        sm: { title: "text-lg",     sub: "text-[10px]" },
        md: { title: "text-2xl",    sub: "text-[12px]" },
        lg: { title: "text-4xl",    sub: "text-[14px]" },
        xl: { title: "text-6xl",    sub: "text-[18px]" },
    };

    const mark = (
        <div className={cn(
            "flex items-center gap-2", 
            orientation === "vertical" ? "flex-col gap-1" : "flex-row",
            className
        )}>
            {/* Blue Shield SVG Monogram */}
            {showMonogram && (
                <div className={cn(
                    "relative flex items-center justify-center select-none transition-all duration-300 group-hover:scale-105 group-active:scale-95",
                    shieldSizes[size]
                )}>
                    <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-xl">
                        <path 
                            d="M50 0 L100 20 V60 C100 85 80 105 50 120 C20 105 0 85 0 60 V20 L50 0 Z" 
                            fill="url(#shieldGradient)" 
                        />
                        <defs>
                            <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style={{ stopColor: '#4f46e5' }} />
                                <stop offset="100%" style={{ stopColor: '#312e81' }} />
                            </linearGradient>
                        </defs>
                        <text 
                            x="50" y="70" 
                            textAnchor="middle" 
                            fill="white" 
                            style={{ fontSize: '45px', fontWeight: '900', fontFamily: 'Arial, sans-serif' }}
                        >
                            S
                        </text>
                    </svg>
                </div>
            )}

            {/* Label for vertical orientation (e.g. "Inicio") */}
            {orientation === "vertical" && label && (
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 group-hover:text-indigo-600 transition-colors mt-2">
                    {label}
                </span>
            )}

            {/* Wordmark */}
            {showWordmark && (
                <div className={cn(
                    "flex flex-col justify-center leading-none",
                    orientation === "horizontal" ? "ml-1" : "items-center text-center"
                )}>
                    <span
                        className={cn(
                            "font-black tracking-tighter text-zinc-900 dark:text-white",
                            wordmarkSizes[size].title
                        )}
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                        Starter<span className="text-indigo-600">Kar</span>
                    </span>
                    {!hideSubmark && (
                        <span
                            className={cn(
                                "font-bold uppercase tracking-[0.3em] text-indigo-400 dark:text-indigo-500 mt-0.5",
                                wordmarkSizes[size].sub
                            )}
                            style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                            Bóveda Digital
                        </span>
                    )}
                </div>
            )}
        </div>
    );

    if (!href) return mark;

    return (
        <Link href={href} className="flex items-center group no-underline">
            {mark}
        </Link>
    );
}

/** Versión compacta — solo las letras SK sin wordmark */
export function StarterKarMonogram({
    size = "sm",
    className,
}: {
    size?: "xs" | "sm" | "md" | "lg";
    className?: string;
}) {
    return (
        <StarterKarLogo size={size} showWordmark={false} href="/" className={className} />
    );
}

