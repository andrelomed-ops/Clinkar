"use client";

import { useState } from "react";
import { 
    CreditCard, 
    AlertTriangle, 
    CheckCircle2, 
    ArrowRight, 
    QrCode, 
    Copy, 
    Check,
    Download,
    DollarSign,
    Zap,
    Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription 
} from "@/components/ui/dialog";

interface BillingSemaphoreProps {
    transactionId: string;
    carName: string;
    price: number;
    commissionAmount: number;
    isPaid: boolean;
    status: string;
}

export function BillingSemaphore({ 
    transactionId, 
    carName, 
    price, 
    commissionAmount, 
    isPaid,
    status 
}: BillingSemaphoreProps) {
    const [showInstructions, setShowInstructions] = useState(false);
    const [copied, setCopied] = useState(false);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Copiado al portapapeles");
        setTimeout(() => setCopied(false), 2000);
    };

    const isReleased = status === 'RELEASED';
    const isPending = isReleased && !isPaid;

    if (!isReleased && status !== 'HANDOVER_SCHEDULED' && !isPaid) return null;

    return (
        <>
            <div className={cn(
                "p-6 rounded-[2rem] border transition-all duration-500 relative overflow-hidden group",
                isPaid 
                    ? "bg-emerald-500/5 border-emerald-500/20" 
                    : isPending 
                        ? "bg-amber-500/5 border-amber-500/20 animate-pulse-subtle" 
                        : "bg-zinc-500/5 border-zinc-200"
            )}>
                {/* Background Decorations */}
                <div className={cn(
                    "absolute -right-8 -top-8 h-32 w-32 blur-3xl opacity-20 transition-all duration-1000",
                    isPaid ? "bg-emerald-500" : isPending ? "bg-amber-500" : "bg-zinc-500"
                )} />

                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className={cn(
                            "h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
                            isPaid 
                                ? "bg-emerald-500 text-white shadow-emerald-500/20" 
                                : isPending 
                                    ? "bg-amber-500 text-white shadow-amber-500/20" 
                                    : "bg-zinc-200 text-zinc-500"
                        )}>
                            {isPaid ? <CheckCircle2 className="h-7 w-7" /> : <CreditCard className="h-7 w-7" />}
                        </div>

                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <span className={cn(
                                    "text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full border",
                                    isPaid 
                                        ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
                                        : isPending 
                                            ? "bg-amber-100 text-amber-700 border-amber-200" 
                                            : "bg-zinc-100 text-zinc-500 border-zinc-200"
                                )}>
                                    {isPaid ? "Comisión Recaudada" : isPending ? "Pago Pendiente (3.5%)" : "Próximo Vencimiento"}
                                </span>
                                <span className="text-[10px] font-bold text-zinc-400">REF: {transactionId.slice(0, 8)}</span>
                            </div>
                            <h4 className="text-lg font-black text-zinc-900 dark:text-white italic uppercase tracking-tighter">
                                {isPaid ? "Facturación Completada" : "Gestión de Success Fee"}
                            </h4>
                            <p className="text-xs text-zinc-500 font-medium">
                                {isPaid 
                                    ? `Se ha registrado el pago de $${commissionAmount.toLocaleString()} por la venta de ${carName}.`
                                    : `Comisión de éxito StarterKar por la venta: $${commissionAmount.toLocaleString()} MXN.`}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        {!isPaid && (
                            <button 
                                onClick={() => setShowInstructions(true)}
                                className={cn(
                                    "flex-1 md:flex-none h-12 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3 shadow-xl",
                                    isPending 
                                        ? "bg-amber-500 text-white hover:bg-amber-400 shadow-amber-500/20" 
                                        : "bg-zinc-900 text-white hover:bg-zinc-800 shadow-zinc-900/20"
                                )}
                            >
                                <Zap className="h-4 w-4" />
                                Pagar Comisión
                            </button>
                        )}
                        {isPaid && (
                            <button className="h-12 px-6 bg-zinc-100 text-zinc-900 text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center gap-2">
                                <Download className="h-4 w-4" />
                                Factura
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Payment Instructions Dialog */}
            <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
                <DialogContent className="max-w-md bg-white rounded-[2.5rem] border-none p-10 gap-8 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600" />
                    
                    <DialogHeader className="text-center space-y-4">
                        <div className="h-20 w-20 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
                            <DollarSign className="h-10 w-10" />
                        </div>
                        <DialogTitle className="text-3xl font-black italic tracking-tighter uppercase leading-none">Pago de Comisión</DialogTitle>
                        <DialogDescription className="text-sm font-medium text-zinc-500 px-4">
                            Transfiere la comisión de éxito para liberar tu factura y mantener tu reputación como vendedor StarterKar Elite.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Amount Card */}
                        <div className="bg-zinc-900 rounded-3xl p-6 text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
                                <Zap className="h-16 w-16" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-1">Monto Exacto a Transferir</p>
                            <div className="flex items-end gap-2">
                                <h3 className="text-4xl font-black italic tracking-tighter">${commissionAmount.toLocaleString()}</h3>
                                <span className="text-xs font-bold text-zinc-500 mb-1.5 uppercase">MXN</span>
                            </div>
                        </div>

                        {/* SPEI Details */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 px-2">Datos de Transferencia SPEI</p>
                            <div className="space-y-2">
                                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center justify-between group hover:border-indigo-200 transition-colors">
                                    <div>
                                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Banco</p>
                                        <p className="text-sm font-black text-zinc-900">STP (StarterKar Bóveda)</p>
                                    </div>
                                    <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center text-zinc-300">
                                        <Info className="h-4 w-4" />
                                    </div>
                                </div>
                                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center justify-between group hover:border-indigo-200 transition-colors">
                                    <div>
                                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">CLABE Interbancaria</p>
                                        <p className="text-sm font-black text-zinc-900">6461 8012 3456 7890 12</p>
                                    </div>
                                    <button 
                                        onClick={() => copyToClipboard("646180123456789012")}
                                        className="h-10 w-10 bg-white rounded-xl shadow-sm border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-indigo-600 transition-all active:scale-90"
                                    >
                                        {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                                    </button>
                                </div>
                                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center justify-between group hover:border-indigo-200 transition-colors">
                                    <div>
                                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Concepto / Referencia</p>
                                        <p className="text-sm font-black text-zinc-900">COM-{transactionId.slice(0, 8).toUpperCase()}</p>
                                    </div>
                                    <button 
                                        onClick={() => copyToClipboard(`COM-${transactionId.slice(0, 8).toUpperCase()}`)}
                                        className="h-10 w-10 bg-white rounded-xl shadow-sm border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-indigo-600 transition-all active:scale-90"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Note */}
                        <div className="flex gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-[10px] font-bold text-amber-900 leading-relaxed uppercase tracking-tight">
                                Envía tu comprobante a <span className="underline">pagos@starterkar.com</span> o por WhatsApp para validación inmediata.
                            </p>
                        </div>

                        <Button 
                            className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-600/20 active:scale-95"
                            onClick={() => setShowInstructions(false)}
                        >
                            He Realizado el Pago
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
