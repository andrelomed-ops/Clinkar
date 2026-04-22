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
 * StarterKarLogo — Letras SK efecto acrílico retroiluminado 3D (Opción C).
 *
 * Técnica: la imagen Option C (S negro mate + K azul retroiluminado) se renderiza
 * con mix-blend-mode: multiply.
 *
 * Matemática: pixel_blanco × fondo_navbar = fondo_navbar → desaparece.
 *             pixel_negro × fondo = negro → se mantiene.
 *             pixel_azul × fondo_claro = azul → se mantiene.
 *
 * Resultado: letras hiperrealistas flotando directamente sobre la superficie,
 * sin ningún marco, borde ni fondo visible. Idénticas a la imagen generada.
 */
export function StarterKarLogo({
    size = "md",
    className,
    href = "/",
    showWordmark = true,
}: StarterKarLogoProps) {
    const imgSizes = {
        xs: "h-8",
        sm: "h-12",
        md: "h-16",
        lg: "h-20",
        xl: "h-28",
    };

    const wordmarkSizes = {
        xs: { title: "text-[9px]",  sub: "text-[6px]"  },
        sm: { title: "text-[11px]", sub: "text-[7px]"  },
        md: { title: "text-xs",     sub: "text-[8px]"  },
        lg: { title: "text-sm",     sub: "text-[9px]"  },
        xl: { title: "text-base",   sub: "text-[10px]" },
    };

    const mark = (
        <div className={cn("flex items-center gap-1", className)}>
            {/* SK Monogram — imagen Option C con fondo eliminado via multiply */}
            <img
                src="/logo_sk_3d.png"
                alt="SK"
                className={cn(
                    "w-auto object-contain select-none",
                    imgSizes[size],
                    // Light mode: multiply elimina el blanco del fondo
                    "mix-blend-multiply",
                    // Dark mode: invert + screen para mantener visibilidad en fondos oscuros
                    "dark:invert dark:mix-blend-screen"
                )}
                draggable={false}
            />

            {/* Wordmark */}
            {showWordmark && (
                <div className="flex flex-col justify-center leading-tight ml-1">
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
        <Link href={href} className="flex items-center group transition-opacity hover:opacity-90">
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
