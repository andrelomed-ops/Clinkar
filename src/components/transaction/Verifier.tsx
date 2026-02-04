"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/client";

export function Verifier({ qrCode }: { qrCode: string }) {
    const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
    const [message, setMessage] = useState("Verificando código de seguridad...");

    useEffect(() => {
        async function verify() {
            // DEMO HANDLER
            if (qrCode === 'demo-secret-123') {
                setTimeout(() => {
                    setStatus("success");
                    setMessage("Transacción Demo Verificada Exitosamente");
                }, 1500);
                return;
            }

            const supabase = createBrowserClient();

            // 1. Find transaction by QR
            const { data: tx, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('qr_code', qrCode)
                .single();

            if (error || !tx) {
                setStatus("error");
                setMessage("Código QR inválido o expirado");
                return;
            }

            // 2. Update Status (In a real app, this should be a Server Action for security)
            const { error: updateError } = await supabase
                .from('transactions')
                .update({
                    status: 'COMPLETED',
                    updated_at: new Date().toISOString()
                } as any)
                .eq('id', tx.id);

            if (updateError) {
                setStatus("error");
                setMessage("Error al procesar la liberación de fondos");
            } else {
                setStatus("success");
                setMessage("Transacción verificada y fondos liberados");
            }
        }

        verify();
    }, [qrCode]);

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
            {status === "verifying" && (
                <>
                    <Loader2 className="h-16 w-16 text-indigo-500 animate-spin mb-6" />
                    <h1 className="text-2xl font-bold">Verificando...</h1>
                </>
            )}

            {status === "success" && (
                <>
                    <div className="h-24 w-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 className="h-12 w-12 text-green-500" />
                    </div>
                    <h1 className="text-3xl font-black mb-2">¡Verificación Exitosa!</h1>
                    <p className="text-zinc-400 mb-8">{message}</p>
                    <Link href="/dashboard" className="px-8 py-3 bg-primary text-primary-foreground font-black rounded-full hover:scale-105 transition-transform shadow-lg shadow-primary/20">
                        Ir al Tablero
                    </Link>
                </>
            )}

            {status === "error" && (
                <>
                    <div className="h-24 w-24 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                        <XCircle className="h-12 w-12 text-red-500" />
                    </div>
                    <h1 className="text-3xl font-black mb-2">Error de Verificación</h1>
                    <p className="text-zinc-400 mb-8">{message}</p>
                    <Link href="/dashboard" className="px-8 py-3 bg-zinc-800 text-white font-bold rounded-full">
                        Volver
                    </Link>
                </>
            )}
        </div>
    );
}
