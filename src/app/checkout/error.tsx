"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw, ShoppingCart } from "lucide-react";
import Link from "next/link";

export default function CheckoutError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Checkout Error:", error);
    }, [error]);

    return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl inline-flex">
                    <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-xl font-bold">Error en Pago</h2>
                    <p className="text-sm text-muted-foreground">
                        No pudimos procesar tu pago. Tu dinero está seguro en la bóveda.
                    </p>
                </div>

                <div className="flex gap-3 justify-center">
                    <button
                        onClick={reset}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium flex items-center gap-2 hover:opacity-90"
                    >
                        <RefreshCcw className="h-4 w-4" />
                        Reintentar
                    </button>
                    <Link
                        href="/buy"
                        className="px-4 py-2 border rounded-lg font-medium flex items-center gap-2 hover:bg-secondary"
                    >
                        <ShoppingCart className="h-4 w-4" />
                        Ver Autos
                    </Link>
                </div>
            </div>
        </div>
    );
}
