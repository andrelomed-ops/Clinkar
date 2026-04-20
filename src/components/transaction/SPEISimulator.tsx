"use client";

import { useState } from "react";
import { Copy, CreditCard, Check, QrCode, Smartphone, Info } from "lucide-react";
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
        <div className="bg-white dark:bg-zinc-950 rounded-[2.5rem] border border-border dark:border-zinc-800 shadow-2xl p-8 space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="flex items-center justify-between border-b border-border dark:border-zinc-800 pb-6">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Smartphone className="text-white h-7 w-7" />
                    </div>
                    <div>
                        <h3 className="font-black text-xl italic tracking-tight uppercase">Pago con CoDi / QR</h3>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-none">Transferencia Inmediata Segura</p>
                    </div>
                </div>
                <div className="px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                    Sin Comisiones
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* QR Placeholder Section */}
                <div className="relative group">
                    <div className="aspect-square bg-white dark:bg-zinc-900 rounded-[2rem] border-4 border-indigo-600/10 flex flex-col items-center justify-center p-8 shadow-inner overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <QrCode className="h-48 w-48 text-indigo-900 dark:text-white opacity-20 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" />
                        <div className="mt-4 text-center">
                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Escanea desde tu App Bancaria</p>
                            <p className="text-[8px] text-muted-foreground font-medium max-w-[120px] mx-auto italic uppercase leading-none">Compatible con CoDi y todas las apps bancarias de MǸxico</p>
                        </div>
                    </div>
                    {/* Badge over QR */}
                    <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black shadow-xl rotate-3">
                        VENCE EN 15:00
                    </div>
                </div>

                {/* Instructions & Data */}
                <div className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center shrink-0 font-black text-xs">1</div>
                            <p className="text-[11px] text-muted-foreground leading-tight">Abre tu aplicacin bancaria y selecciona <b>CoDi</b> o <b>Escanear QR</b>.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center shrink-0 font-black text-xs">2</div>
                            <p className="text-[11px] text-muted-foreground leading-tight">Escanea el código QR de esta pantalla u obtén los datos SPEI manuales.</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800/50 relative group cursor-pointer overflow-hidden" onClick={handleCopy}>
                            <div className="absolute inset-y-0 left-0 w-1 bg-indigo-600" />
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-1">CLABE INTERBANCARIA (SANTANDER)</span>
                            <div className="font-mono text-base font-black text-indigo-600 flex items-center justify-between">
                                <span>014 180 00284719284 2</span>
                                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 opacity-30 group-hover:opacity-100 transition-opacity" />}
                            </div>
                        </div>

                        <div className="bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800/50 flex justify-between items-center">
                            <div>
                                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-1">MONTO TOTAL</span>
                                <div className="font-black text-3xl text-zinc-900 dark:text-white tracking-tighter italic">
                                    ${amount.toLocaleString()} <span className="text-xs uppercase not-italic">MXN</span>
                                </div>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                <Info className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-dashed border-border dark:border-zinc-800">
                <button
                    onClick={handleSimulatePayment}
                    disabled={isProcessing}
                    className={cn(
                        "w-full h-16 rounded-[1.2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all",
                        isProcessing
                            ? "bg-zinc-100 dark:bg-zinc-900 text-muted-foreground cursor-wait"
                            : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-2xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98]"
                    )}
                >
                    {isProcessing ? (
                        <>
                            <div className="h-5 w-5 border-3 border-current border-t-transparent rounded-full animate-spin" />
                            Validando Depsito Federal...
                        </>
                    ) : (
                        <>
                            <CreditCard className="h-5 w-5" />
                            Ya realicǸ la transferencia
                        </>
                    )}
                </button>
                <div className="mt-4 flex items-center justify-center gap-2">
                    <LockIcon className="h-3 w-3 text-emerald-500" />
                    <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-[0.1em]">
                        Transaccin Blindada por <b>StarterKar Escrow System</b>
                    </p>
                </div>
            </div>
        </div>
    );
};

function LockIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    )
}
