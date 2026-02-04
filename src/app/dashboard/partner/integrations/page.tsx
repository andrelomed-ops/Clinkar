"use client";

import { useState } from "react";
import { CRMStatusCard } from "@/components/dashboard/partner/CRMStatusCard";
import { SUPPORTED_CRMS, CRMProvider, SyncLog, syncLeadToCRM } from "@/lib/crm-adapter";
import { Link2, ArrowLeft, Terminal, Activity } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function IntegrationsPage() {
    const [crms, setCrms] = useState<CRMProvider[]>(SUPPORTED_CRMS);
    const [logs, setLogs] = useState<SyncLog[]>([]);

    const handleConnect = (id: string) => {
        // Simulamos auth flow
        const loadingToast = toast.loading(`Conectando con ${crms.find(c => c.id === id)?.name}...`);

        setTimeout(() => {
            setCrms(prev => prev.map(crm =>
                crm.id === id ? { ...crm, status: 'connected', lastSync: new Date().toLocaleTimeString() } : crm
            ));
            toast.dismiss(loadingToast);
            toast.success("Integración activada correctamente");

            // Generate a fake initial sync log
            addLog(id, "Initial Handshake", "success");
        }, 1500);
    };

    const handleDisconnect = (id: string) => {
        setCrms(prev => prev.map(crm =>
            crm.id === id ? { ...crm, status: 'disconnected', lastSync: undefined } : crm
        ));
        toast.info("Integración desactivada");
    };

    const addLog = (crmId: string, event: string, status: 'success' | 'failed') => {
        const crmName = crms.find(c => c.id === crmId)?.name || crmId;
        const newLog: SyncLog = {
            id: Math.random().toString(36).substr(2, 9),
            asset: "Sistema",
            event,
            time: new Date().toLocaleTimeString(),
            status,
            crm: crmName
        };
        setLogs(prev => [newLog, ...prev].slice(0, 10));
    };

    // Test Sync Function
    const handleTestSync = async () => {
        const connectedCrms = crms.filter(c => c.status === 'connected');
        if (connectedCrms.length === 0) {
            toast.error("Conecta al menos un CRM primero");
            return;
        }

        const activeCrm = connectedCrms[0];
        const toastId = toast.loading("Enviando lead de prueba...");

        const success = await syncLeadToCRM({ id: 'test-123', make: 'Audi' }, activeCrm.id);

        toast.dismiss(toastId);
        if (success) {
            toast.success(`Lead sincronizado con ${activeCrm.name}`);
            addLog(activeCrm.id, "Test Lead Sync", "success");
        } else {
            toast.error("Error de sincronización (Simulado)");
            addLog(activeCrm.id, "Test Lead Sync", "failed");
        }
    };

    return (
        <div className="min-h-screen bg-[#fafafa] pb-20">
            {/* Header */}
            <div className="bg-white border-b border-zinc-100 px-4 md:px-10 py-6 md:py-10">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-2 text-indigo-600 font-black uppercase text-[10px] tracking-widest mb-2">
                        <Link2 size={14} />
                        Conectividad Enterprise
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight text-zinc-900">
                        Integraciones <span className="text-indigo-600">CRM</span>
                    </h1>
                    <p className="text-muted-foreground text-sm md:text-base font-medium max-w-xl mt-2">
                        Automatiza tu flujo de ventas. Sincroniza inspecciones aprobadas directamente con tu Salesforce, HubSpot o Webhook personalizado.
                    </p>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 md:px-10 pt-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Providers Grid */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {crms.map((crm) => (
                            <CRMStatusCard
                                key={crm.id}
                                crm={crm}
                                onConnect={handleConnect}
                                onDisconnect={handleDisconnect}
                            />
                        ))}
                    </div>
                </div>

                {/* Live Logs & Testing */}
                <div className="space-y-6">
                    <div className="p-6 rounded-[2rem] bg-zinc-900 text-white shadow-2xl overflow-hidden relative">
                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <div>
                                <h3 className="font-black tracking-tight flex items-center gap-2"><Terminal size={18} /> Live Logs</h3>
                                <p className="text-xs text-zinc-400 mt-1">Actividad de sincronización en tiempo real.</p>
                            </div>
                            <button
                                onClick={handleTestSync}
                                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-colors"
                                title="Probar Sincronización"
                            >
                                <Activity size={18} />
                            </button>
                        </div>

                        <div className="space-y-3 relative z-10 min-h-[300px]">
                            <AnimatePresence initial={false}>
                                {logs.length === 0 ? (
                                    <div className="text-zinc-600 text-xs text-center py-10 font-mono">Esperando eventos...</div>
                                ) : (
                                    logs.map((log) => (
                                        <motion.div
                                            key={log.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="flex items-start gap-3 text-xs font-mono p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50"
                                        >
                                            <div className={`w-2 h-2 rounded-full mt-1.5 ${log.status === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                            <div className="flex-1">
                                                <div className="flex justify-between text-zinc-300">
                                                    <span className="font-bold">{log.event}</span>
                                                    <span className="opacity-50">{log.time}</span>
                                                </div>
                                                <div className="text-zinc-500 mt-1 flex justify-between">
                                                    <span>{log.crm}</span>
                                                    <span className={`${log.status === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>{log.status.toUpperCase()}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Background code decoration */}
                        <div className="absolute inset-0 opacity-5 pointer-events-none font-mono text-[10px] p-4 overflow-hidden leading-relaxed">
                            {Array(20).fill("connecting to socket... handshake_success... syncing_packet_v2...").map((l, i) => <div key={i}>{l}</div>)}
                        </div>
                    </div>
                </div>
            </main>

            {/* Back Button Floating */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                <Link href="/dashboard" className="h-14 px-8 rounded-full bg-white border border-zinc-200 shadow-2xl flex items-center gap-3 font-bold group hover:scale-105 transition-all text-sm">
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    Volver al Dashboard
                </Link>
            </div>
        </div>
    );
}
