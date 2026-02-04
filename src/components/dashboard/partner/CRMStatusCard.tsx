"use client";

import { motion } from "framer-motion";
import { CheckCircle, Database, AlertCircle, RefreshCw } from "lucide-react";
import { CRMProvider } from "@/lib/crm-adapter";

interface CRMStatusCardProps {
    crm: CRMProvider;
    onConnect: (id: string) => void;
    onDisconnect: (id: string) => void;
}

export function CRMStatusCard({ crm, onConnect, onDisconnect }: CRMStatusCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-[2rem] bg-white border border-zinc-100 shadow-sm relative overflow-hidden flex flex-col justify-between h-full group hover:shadow-md transition-shadow"
        >
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${crm.status === 'connected' ? 'bg-indigo-50 text-indigo-600' : 'bg-zinc-50 text-zinc-400'}`}>
                        <Database size={24} />
                    </div>
                    <div>
                        <h3 className="font-black text-zinc-900 tracking-tight">{crm.name}</h3>
                        <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 mt-1">
                            {crm.status === 'connected' ? (
                                <><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Sincronizado</>
                            ) : (
                                <><span className="w-1.5 h-1.5 bg-zinc-300 rounded-full" /> Desconectado</>
                            )}
                        </p>
                    </div>
                </div>
                {crm.status === 'connected' && (
                    <div className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                        Activo
                    </div>
                )}
            </div>

            <div className="space-y-4">
                {crm.status === 'connected' ? (
                    <>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium bg-zinc-50 p-3 rounded-xl">
                            <RefreshCw size={14} className="text-indigo-500" />
                            Última sinc: {crm.lastSync || 'Justo ahora'}
                        </div>
                        <button
                            onClick={() => onDisconnect(crm.id)}
                            className="w-full h-10 rounded-xl border border-zinc-200 text-zinc-500 text-xs font-bold hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-colors"
                        >
                            Desconectar
                        </button>
                    </>
                ) : (
                    <>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Conecta tu cuenta de {crm.name} para sincronizar automáticamente los leads certificados.
                        </p>
                        <button
                            onClick={() => onConnect(crm.id)}
                            className="w-full h-10 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-zinc-900/10"
                        >
                            Conectar
                        </button>
                    </>
                )}
            </div>

            {/* Decorative background blur */}
            {crm.status === 'connected' && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-transparent blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
            )}
        </motion.div>
    );
}
