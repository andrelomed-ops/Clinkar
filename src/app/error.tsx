"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Enviar error a servicio de monitoreo si existiera
        console.error("Critical Application Error:", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center space-y-8">
                <div className="relative inline-flex items-center justify-center">
                    <div className="absolute inset-0 bg-red-500/10 blur-3xl rounded-full" />
                    <div className="relative p-6 bg-red-50 dark:bg-red-900/20 rounded-3xl border border-red-200 dark:border-red-900/30">
                        <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
                    </div>
                </div>

                <div className="space-y-3">
                    <h1 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase leading-none">
                        Algo no salió bien
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">
                        Hemos detectado una intermitencia técnica. No te preocupes, tu sesión está segura.
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={reset}
                        className="h-14 w-full rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                    >
                        <RefreshCcw className="h-5 w-5" />
                        Reintentar cargar página
                    </button>

                    <Link
                        href="/"
                        className="h-14 w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold flex items-center justify-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
                    >
                        <Home className="h-5 w-5" />
                        Volver al inicio
                    </Link>
                </div>

                <div className="pt-8 border-t border-zinc-100 dark:border-zinc-900">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Protocolo de Estabilidad Clinkar v1.0
                    </p>
                </div>
            </div>
        </div>
    );
}
