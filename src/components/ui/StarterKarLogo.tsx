"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface StarterKarLogoProps {
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    className?: string;
    href?: string;
    showWordmark?: boolean;
}

/**
 * StarterKarLogo — Letras SK efecto acrílico retroiluminado 3D.
 * 
 * S = acrílico negro mate sólido con extrusion depth
 * K = acrílico índigo retroiluminado (luz azul interna filtrándose)
 * 
 * 100% CSS — sin imagen, sin fondo — flota sobre cualquier superficie.
 */
export function StarterKarLogo({
    size = "md",
    className,
    href = "/",
    showWordmark = true,
}: StarterKarLogoProps) {
    const sizes = {
        xs: { letter: "text-xl",   wordmark: "text-[10px]", gap: "gap-1.5" },
        sm: { letter: "text-3xl",  wordmark: "text-[11px]", gap: "gap-2"   },
        md: { letter: "text-4xl",  wordmark: "text-xs",     gap: "gap-2.5" },
        lg: { letter: "text-6xl",  wordmark: "text-sm",     gap: "gap-3"   },
        xl: { letter: "text-8xl",  wordmark: "text-base",   gap: "gap-4"   },
    };

    const s = sizes[size];

    const mark = (
        <div className={cn("flex items-center", s.gap, className)}>
            {/* === SK Monogram — Efecto Acrílico 3D === */}
            <div className="relative flex items-baseline leading-none select-none">
                {/* Letra S — Acrílico negro mate, extrusión profunda */}
                <span
                    className={cn("font-black tracking-tighter", s.letter)}
                    style={{
                        fontFamily: "'Outfit', 'Geist', sans-serif",
                        color: "#0f0f0f",
                        /* Extrusion negra: capas escalonadas simulando profundidad */
                        textShadow: [
                            /* Face highlight — borde superior levemente más claro */
                            "0 -1px 0 rgba(255,255,255,0.08)",
                            /* Extrusion layers — las "paredes" de la letra */
                            "0 1px 0 #080808",
                            "0 2px 0 #060606",
                            "0 3px 0 #040404",
                            "0 4px 0 #020202",
                            /* Shadow ambiental en el suelo */
                            "0 6px 8px rgba(0,0,0,0.5)",
                            "0 12px 24px rgba(0,0,0,0.2)",
                        ].join(", "),
                        WebkitFontSmoothing: "antialiased",
                    }}
                >
                    S
                </span>

                {/* Letra K — Acrílico índigo retroiluminado */}
                <span
                    className={cn("font-black tracking-tighter", s.letter)}
                    style={{
                        fontFamily: "'Outfit', 'Geist', sans-serif",
                        /* El color de la cara frontal del acrílico azul */
                        color: "#4f46e5",
                        textShadow: [
                            /* Glow interno — luz filtrándose desde atrás */
                            "0 0 6px rgba(129,140,248,0.9)",
                            "0 0 12px rgba(99,102,241,0.8)",
                            "0 0 24px rgba(79,70,229,0.6)",
                            "0 0 48px rgba(79,70,229,0.3)",
                            /* Extrusion layers en tono azul profundo */
                            "0 1px 0 #3730a3",
                            "0 2px 0 #312e81",
                            "0 3px 0 #2d2a78",
                            "0 4px 0 #29266f",
                            /* Shadow ambiental + glow azul en el suelo */
                            "0 6px 10px rgba(79,70,229,0.4)",
                            "0 12px 28px rgba(79,70,229,0.2)",
                            "0 20px 40px rgba(0,0,0,0.15)",
                        ].join(", "),
                        WebkitFontSmoothing: "antialiased",
                    }}
                >
                    K
                </span>
            </div>

            {/* Wordmark "StarterKar" */}
            {showWordmark && (
                <div className="flex flex-col justify-center leading-tight">
                    <span
                        className={cn("font-black uppercase tracking-[0.15em]", s.wordmark)}
                        style={{
                            fontFamily: "'Outfit', 'Geist', sans-serif",
                            color: "#0f0f0f",
                            textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                        }}
                    >
                        Starter<span style={{ color: "#4f46e5" }}>Kar</span>
                    </span>
                    <span
                        className="text-[7px] uppercase tracking-[0.3em] font-bold"
                        style={{ color: "rgba(79,70,229,0.6)" }}
                    >
                        Bóveda Digital
                    </span>
                </div>
            )}
        </div>
    );

    if (!href) return mark;

    return (
        <Link href={href} className="flex items-center group">
            {mark}
        </Link>
    );
}

/** Versión compacta — solo las letras SK sin wordmark */
export function StarterKarMonogram({ size = "sm", className }: { size?: "xs" | "sm" | "md" | "lg", className?: string }) {
    return <StarterKarLogo size={size} showWordmark={false} href="/" className={className} />;
}
