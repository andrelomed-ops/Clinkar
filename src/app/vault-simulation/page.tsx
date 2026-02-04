"use client";

import { useState, useEffect } from "react";
import { Shield, Lock, AlertTriangle, CheckCircle2, RefreshCcw, DollarSign, FileCheck, Search, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type TransactionStatus = 'CREATED' | 'FUNDS_HELD' | 'COMPLETED' | 'REFUNDED';
type CheckStatus = 'PENDING' | 'VERIFIED';

export default function VaultSimulationPage() {
    // State
    const [status, setStatus] = useState<TransactionStatus>('CREATED');
    const [legalStatus, setLegalStatus] = useState<CheckStatus>('PENDING');
    const [inspectionStatus, setInspectionStatus] = useState<CheckStatus>('PENDING');
    const [logs, setLogs] = useState<string[]>([]);
    const [selectedGateway, setSelectedGateway] = useState<'STP' | 'STRIPE'>('STP');
    const [isMounted, setIsMounted] = useState(false);

    // Effect to handle hydration
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMounted(true);
    }, []);

    // Constants
    const TOTAL_AMOUNT = 200000;
    const FEE_PERCENT = 0.05;
    const FEE_AMOUNT = TOTAL_AMOUNT * FEE_PERCENT;
    const SELLER_AMOUNT = TOTAL_AMOUNT - FEE_AMOUNT;

    // Actions
    const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

    const handleReceiveFunds = () => {
        addLog(`💰 Recibiendo fondos mockeados vía ${selectedGateway}...`);
        setTimeout(() => {
            setStatus('FUNDS_HELD');
            addLog(`✅ Fondos asegurados en Pasarela. Split Virtual calculado.`);
            addLog(`   -> Clinkar Fee: $${FEE_AMOUNT.toLocaleString()}`);
            addLog(`   -> Vendedor (Pendiente): $${SELLER_AMOUNT.toLocaleString()}`);
        }, 800);
    };

    const handleReleaseFunds = () => {
        addLog(`🚀 Iniciando protocolo de liberación...`);

        if (legalStatus !== 'VERIFIED') {
            addLog(`❌ BLOCK: Documentación Legal no verificada.`);
            return;
        }
        if (inspectionStatus !== 'VERIFIED') {
            addLog(`❌ BLOCK: Inspección Física no certificada.`);
            return;
        }

        addLog(`✅ CHECKS PASSED: Iniciando dispersión...`);
        setTimeout(() => {
            setStatus('COMPLETED');
            addLog(`💸 DISPERSIÓN EXITOSA: $${SELLER_AMOUNT.toLocaleString()} enviados al Vendedor.`);
            addLog(`🎉 Transacción Finalizada.`);
        }, 1000);
    };

    const resetSimulation = () => {
        setStatus('CREATED');
        setLegalStatus('PENDING');
        setInspectionStatus('PENDING');
        setLogs([]);
        addLog("🔄 Simulación reiniciada.");
    };

    // Helper to render currency safely
    const formatCurrency = (val: number) => isMounted ? val.toLocaleString() : "...";

    return (
        <div className="min-h-screen bg-neutral-50 p-8 space-y-12">
            <header className="max-w-5xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                        <Lock className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Transaction State Monitor</h1>
                        <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">Vault Simulator v2.0</p>
                    </div>
                </div>
                <button
                    onClick={resetSimulation}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                >
                    <RefreshCcw className="h-4 w-4" />
                    Reiniciar
                </button>
            </header>

            <main className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT COLUMN: Controls & Checks */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Step 1: Ingestion */}
                    <div className={cn(
                        "bg-white rounded-3xl p-6 border-2 transition-all shadow-sm",
                        status === 'CREATED' ? "border-blue-600 ring-4 ring-blue-50" : "border-slate-100 opacity-60"
                    )}>
                        <h3 className="text-xs font-bold uppercase text-slate-400 mb-4">1. Ingesta de Fondos</h3>
                        <div className="space-y-4">
                            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                                {(['STP', 'STRIPE'] as const).map(gw => (
                                    <button
                                        key={gw}
                                        onClick={() => setSelectedGateway(gw)}
                                        className={cn(
                                            "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                                            selectedGateway === gw ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                        )}
                                    >
                                        {gw}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={handleReceiveFunds}
                                disabled={status !== 'CREATED'}
                                className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
                            >
                                <DollarSign className="h-5 w-5" />
                                Simular Entrada ($200k)
                            </button>
                        </div>
                    </div>

                    {/* Step 2: Verification */}
                    <div className={cn(
                        "bg-white rounded-3xl p-6 border-2 transition-all shadow-sm",
                        status === 'FUNDS_HELD' ? "border-amber-400 ring-4 ring-amber-50" : "border-slate-100"
                    )}>
                        <h3 className="text-xs font-bold uppercase text-slate-400 mb-4">2. Verificación (Compliance)</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 border rounded-xl bg-slate-50">
                                <div className="flex items-center gap-3">
                                    <FileCheck className={cn("h-5 w-5", legalStatus === 'VERIFIED' ? "text-green-500" : "text-slate-400")} />
                                    <span className="text-sm font-medium">Documentación (Legal)</span>
                                </div>
                                <button
                                    onClick={() => setLegalStatus(s => s === 'PENDING' ? 'VERIFIED' : 'PENDING')}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                                        legalStatus === 'VERIFIED' ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-600"
                                    )}
                                >
                                    {legalStatus}
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-xl bg-slate-50">
                                <div className="flex items-center gap-3">
                                    <Search className={cn("h-5 w-5", inspectionStatus === 'VERIFIED' ? "text-green-500" : "text-slate-400")} />
                                    <span className="text-sm font-medium">Inspección Física</span>
                                </div>
                                <button
                                    onClick={() => setInspectionStatus(s => s === 'PENDING' ? 'VERIFIED' : 'PENDING')}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                                        inspectionStatus === 'VERIFIED' ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-600"
                                    )}
                                >
                                    {inspectionStatus}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Step 3: Release */}
                    <div className={cn(
                        "bg-white rounded-3xl p-6 border-2 transition-all shadow-sm",
                        status === 'FUNDS_HELD' ? "border-purple-600 ring-4 ring-purple-50" : "border-slate-100 opacity-60"
                    )}>
                        <h3 className="text-xs font-bold uppercase text-slate-400 mb-4">3. Dispersión (Safe Release)</h3>
                        <button
                            onClick={handleReleaseFunds}
                            disabled={status !== 'FUNDS_HELD'}
                            className="w-full h-14 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-purple-600/20"
                        >
                            <Shield className="h-6 w-6" />
                            LIBERAR FONDOS
                        </button>
                    </div>
                </div>

                {/* RIGHT COLUMN: Visualizer */}
                <div className="lg:col-span-8 flex flex-col gap-6">

                    {/* Visual Ledger Graph */}
                    <div className="flex-1 bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                        <h2 className="text-lg font-bold flex items-center gap-2 mb-8">
                            <ArrowRight className="h-5 w-5 text-slate-400" />
                            Flujo de Fondos (Visual Split)
                        </h2>

                        {/* Pipe Diagram */}
                        <div className="relative h-64 flex items-center justify-center">

                            {/* Input Source */}
                            <div className={cn(
                                "absolute left-0 top-1/2 -translate-y-1/2 w-32 h-12 rounded-r-2xl flex items-center justify-center font-bold text-sm transition-all duration-700",
                                status !== 'CREATED' ? "bg-green-500 text-white translate-x-0" : "bg-slate-200 text-slate-400 -translate-x-full"
                            )}>
                                +$200,000
                            </div>

                            {/* Center Hub (The Vault) */}
                            <div className={cn(
                                "z-10 w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center bg-white shadow-2xl transition-all duration-500",
                                status === 'FUNDS_HELD' ? "border-amber-400 scale-110" :
                                    status === 'COMPLETED' ? "border-green-500 scale-100" :
                                        "border-slate-200"
                            )}>
                                <Shield className={cn(
                                    "h-10 w-10 mb-2 transition-colors",
                                    status === 'FUNDS_HELD' ? "text-amber-500" :
                                        status === 'COMPLETED' ? "text-green-500" : "text-slate-300"
                                )} />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Gateway</span>
                            </div>

                            {/* Output Pipes - Animated Lines */}
                            {/* Seller Pipe */}
                            <div className="absolute top-1/2 left-1/2 w-48 h-1 bg-slate-100 -translate-y-8 origin-left -rotate-[20deg]" />
                            <div className={cn(
                                "absolute top-1/2 left-1/2 h-1 bg-purple-500 -translate-y-8 origin-left -rotate-[20deg] transition-all duration-1000",
                                status === 'COMPLETED' ? "w-48" : "w-0"
                            )} />

                            {/* Fee Pipe */}
                            <div className="absolute top-1/2 left-1/2 w-48 h-1 bg-slate-100 translate-y-8 origin-left rotate-[20deg]" />
                            <div className={cn(
                                "absolute top-1/2 left-1/2 h-1 bg-blue-500 translate-y-8 origin-left rotate-[20deg] transition-all duration-1000",
                                status === 'FUNDS_HELD' || status === 'COMPLETED' ? "w-48" : "w-0"
                            )} />

                            {/* Recipients */}
                            <div className="absolute right-0 top-8 flex items-center gap-3">
                                <span className={cn(
                                    "text-right transition-opacity duration-700",
                                    status === 'COMPLETED' ? "opacity-100" : "opacity-30"
                                )}>
                                    <p className="text-xs font-bold text-slate-400 uppercase">Vendedor</p>
                                    <p className="text-xl font-black text-purple-600">${formatCurrency(SELLER_AMOUNT)}</p>
                                </span>
                                <div className={cn("h-12 w-12 rounded-full flex items-center justify-center transition-colors", status === 'COMPLETED' ? "bg-purple-100 text-purple-600" : "bg-slate-100")}>
                                    <CheckCircle2 className="h-6 w-6" />
                                </div>
                            </div>

                            <div className="absolute right-0 bottom-8 flex items-center gap-3">
                                <span className={cn(
                                    "text-right transition-opacity duration-700",
                                    (status === 'FUNDS_HELD' || status === 'COMPLETED') ? "opacity-100" : "opacity-30"
                                )}>
                                    <p className="text-xs font-bold text-slate-400 uppercase">Clinkar Fee</p>
                                    <p className="text-xl font-black text-blue-600">${formatCurrency(FEE_AMOUNT)}</p>
                                </span>
                                <div className={cn("h-12 w-12 rounded-full flex items-center justify-center transition-colors", (status === 'FUNDS_HELD' || status === 'COMPLETED') ? "bg-blue-100 text-blue-600" : "bg-slate-100")}>
                                    <Shield className="h-6 w-6" />
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Console Output */}
                    <div className="bg-slate-900 rounded-3xl p-6 h-64 overflow-y-auto font-mono text-xs">
                        <div className="flex items-center gap-2 text-slate-400 border-b border-slate-800 pb-2 mb-2 sticky top-0 bg-slate-900">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            System Logs
                        </div>
                        <div className="space-y-1">
                            {logs.length === 0 && <span className="text-slate-600 italic">Esperando eventos...</span>}
                            {logs.map((log, i) => (
                                <div key={i} className={cn(
                                    "break-words",
                                    log.includes("❌") ? "text-red-400" :
                                        log.includes("✅") ? "text-green-400" :
                                            log.includes("💰") || log.includes("🚀") ? "text-amber-300" :
                                                "text-slate-300"
                                )}>
                                    {log}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
