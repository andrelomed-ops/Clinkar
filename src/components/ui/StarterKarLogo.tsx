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
}

export function StarterKarLogo({
    size = "md",
    className,
    href = "/",
    showWordmark = true,
    showMonogram = true,
    orientation = "horizontal",
    label,
}: StarterKarLogoProps) {
    const imgSizes = {
        xs: "h-6",
        sm: "h-10",
        md: "h-14",
        lg: "h-18",
        xl: "h-24",
    };

    const wordmarkSizes = {
        xs: { title: "text-[9px]",  sub: "text-[6px]"  },
        sm: { title: "text-[11px]", sub: "text-[7px]"  },
        md: { title: "text-xs",     sub: "text-[8px]"  },
        lg: { title: "text-sm",     sub: "text-[9px]"  },
        xl: { title: "text-base",   sub: "text-[10px]" },
    };

    const mark = (
        <div className={cn(
            "flex items-center gap-1", 
            orientation === "vertical" ? "flex-col gap-0.5" : "flex-row",
            className
        )}>
            {/* SK Monogram */}
            {showMonogram && (
                <img
                    src="/logo_sk_transparent.png"
                    alt="SK"
                    className={cn(
                        "w-auto object-contain select-none transition-all duration-300 group-hover:scale-110 group-active:scale-95",
                        imgSizes[size]
                    )}
                    style={{
                        filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.2))",
                    }}
                    draggable={false}
                />
            )}

            {/* Label for vertical orientation (e.g. "Inicio") */}
            {orientation === "vertical" && label && (
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 group-hover:text-indigo-600 transition-colors">
                    {label}
                </span>
            )}

            {/* Wordmark */}
            {showWordmark && (
                <div className={cn(
                    "flex flex-col justify-center leading-tight",
                    orientation === "horizontal" ? "ml-1" : "items-center text-center mt-1"
                )}>
                    <span
                        className={cn(
                            "font-black uppercase tracking-[0.12em] text-zinc-900 dark:text-white",
                            wordmarkSizes[size].title
                        )}
                        style={{ fontFamily: "'Outfit', 'Geist', sans-serif" }}
                    >
                        Starter<span className="text-indigo-600 dark:text-indigo-400">Kar</span>
                    </span>
                    <span
                        className={cn(
                            "font-bold uppercase tracking-[0.25em] text-indigo-400 dark:text-indigo-500",
                            wordmarkSizes[size].sub
                        )}
                        style={{ fontFamily: "'Outfit', 'Geist', sans-serif" }}
                    >
                        Bóveda Digital
                    </span>
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
