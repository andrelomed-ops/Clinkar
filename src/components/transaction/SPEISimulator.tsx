"use client";

import { useState } from "react";
import { Copy, CreditCard, Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SPEISimulatorProps {
    amount: number;
    onPaymentComplete: () => void;
}

export const SPEISimulator = ({ amount, onPaymentComplete }: SPEISimulatorProps) => {
    const [copied, setCopied] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText("012918002847192842");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSimulatePayment = () => {
        setIsProcessing(true);
        // Simulate network delay
        setTimeout(() => {
            onPaymentComplete();
        }, 3000);
    };

    return (
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
                <div className="h-10 w-10 bg-[#1a237e] rounded-lg flex items-center justify-center">
                    <span className="text-white font-black text-xs">SPEI</span>
                </div>
                <div>
                    <h3 className="font-bold text-foreground">Transferencia Interbancaria</h3>
                    <p className="text-xs text-muted-foreground">Sistema de Pagos Electrónicos (Banxico)</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="bg-secondary/50 rounded-xl p-4 space-y-1">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Beneficiario</span>
                    <div className="font-semibold text-foreground">Clinkar Escrow S.A.P.I. de C.V.</div>
                </div>

                <div className="bg-secondary/50 rounded-xl p-4 space-y-1 relative group cursor-pointer" onClick={handleCopy}>
                    <span className="text-xs font-bold text-muted-foreground uppercase">CLABE (BBVA)</span>
                    <div className="font-mono text-lg font-bold text-primary flex items-center gap-2">
                        012 918 00284719284 2
                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 opacity-50 group-hover:opacity-100" />}
                    </div>
                </div>

                <div className="bg-secondary/50 rounded-xl p-4 space-y-1">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Monto Exacto</span>
                    <div className="font-black text-xl text-foreground">${amount.toLocaleString()} MXN</div>
                </div>
            </div>

            <div className="pt-2">
                <button
                    onClick={handleSimulatePayment}
                    disabled={isProcessing}
                    className={cn(
                        "w-full h-12 rounded-xl font-bold flex items-center justify-center gap-2 transition-all",
                        isProcessing
                            ? "bg-secondary text-muted-foreground cursor-wait"
                            : "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 hover:scale-[1.02]"
                    )}
                >
                    {isProcessing ? (
                        <>
                            <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            Verificando depósito...
                        </>
                    ) : (
                        <>
                            <CreditCard className="h-4 w-4" />
                            Simular Transferencia
                        </>
                    )}
                </button>
                <div className="text-center mt-3">
                    <p className="text-[10px] text-muted-foreground">
                        Al realizar el pago, aceptas los Términos y Condiciones del contrato de compraventa digital.
                    </p>
                </div>
            </div>
        </div>
    );
};
