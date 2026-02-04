"use client";

import { useState } from "react";
import {
    ShieldCheck,
    AlertCircle,
    CheckCircle2,
    Clock,
    FileText,
    UserCheck,
    AlertTriangle,
    Check,
    X,
    ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Document {
    id: string;
    type: "Factura" | "Identificación" | "Contrato" | "Tenencia";
    status: "PENDING" | "APPROVED" | "REJECTED";
    url: string;
    updatedAt: string;
}

interface Expediente {
    id: string;
    carMake: string;
    carModel: string;
    carYear: number;
    sellerName: string;
    pldStatus: "PENDING" | "APPROVED" | "BLOCKED_RISK";
    documents: Document[];
    status: "PENDING_DOCS" | "PARTIAL" | "FINAL_REVIEW" | "CERTIFIED";
}

export function LegalReviewDashboard({ initialExpedientes }: { initialExpedientes: Expediente[] }) {
    const [expedientes, setExpedientes] = useState<Expediente[]>(initialExpedientes);
    const [selectedId, setSelectedId] = useState<string | null>(initialExpedientes[0]?.id || null);

    const activeExpediente = expedientes.find(e => e.id === selectedId);

    const handleAction = (docId: string, action: "APPROVE" | "REJECT") => {
        if (!activeExpediente) return;

        const updatedDocs = activeExpediente.documents.map(d =>
            d.id === docId ? { ...d, status: (action === 'APPROVE' ? 'APPROVED' : 'REJECTED') as any } : d
        );

        // Calculate overarching status based on user's request for "Partial progress"
        const approvedCount = updatedDocs.filter(d => d.status === 'APPROVED').length;
        const totalDocs = updatedDocs.length;

        let newStatus = activeExpediente.status;
        if (approvedCount === totalDocs) {
            newStatus = "FINAL_REVIEW";
        } else if (approvedCount > 0) {
            newStatus = "PARTIAL";
        }

        setExpedientes(prev => prev.map(e =>
            e.id === activeExpediente.id ? { ...e, documents: updatedDocs, status: newStatus as any } : e
        ));

        toast.success(`Documento ${action === 'APPROVE' ? 'Aprobado' : 'Rechazado'} (Guardado Parcial)`);
    };

    const handleFinalCertify = () => {
        if (!activeExpediente) return;

        if (activeExpediente.pldStatus === 'BLOCKED_RISK') {
            toast.error("ERROR CRÍTICO: El candado PLD bloquea esta certificación.");
            return;
        }

        if (activeExpediente.status !== 'FINAL_REVIEW') {
            toast.error("Expediente incompleto para certificación final.");
            return;
        }

        setExpedientes(prev => prev.map(e =>
            e.id === activeExpediente.id ? { ...e, status: "CERTIFIED" } : e
        ));
        toast.success("Vehículo Certificado Correctamente");
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[600px]">
            {/* Sidebar: Lista de Expedientes */}
            <div className="lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col">
                <div className="p-4 border-b border-zinc-800 bg-zinc-950/50">
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                        <Clock className="h-4 w-4" /> Bandeja de Entrada
                    </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {expedientes.map(exp => (
                        <button
                            key={exp.id}
                            onClick={() => setSelectedId(exp.id)}
                            className={cn(
                                "w-full text-left p-4 rounded-xl transition-all border",
                                selectedId === exp.id
                                    ? "bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/20"
                                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-600"
                            )}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-[10px] font-mono opacity-60">#{exp.id}</span>
                                <StatusBadge status={exp.status} />
                            </div>
                            <h4 className="font-bold text-sm truncate">{exp.carMake} {exp.carModel}</h4>
                            <p className="text-[10px] uppercase font-bold opacity-60 mt-1">{exp.sellerName}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Area: Detalle y Revisión */}
            <div className="lg:col-span-3 space-y-6">
                {activeExpediente ? (
                    <>
                        {/* Header del Expediente */}
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-500">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black uppercase italic tracking-tight">
                                        {activeExpediente.carMake} {activeExpediente.carModel} <span className="text-zinc-400 font-normal">({activeExpediente.carYear})</span>
                                    </h2>
                                    <p className="text-xs font-bold text-zinc-500">Vendedor: {activeExpediente.sellerName}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* PLD Logic Status */}
                                <div className={cn(
                                    "px-4 py-2 rounded-xl border flex items-center gap-2",
                                    activeExpediente.pldStatus === 'APPROVED' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                                        activeExpediente.pldStatus === 'BLOCKED_RISK' ? "bg-red-500/10 border-red-500/20 text-red-500 animate-pulse" :
                                            "bg-amber-500/10 border-amber-500/20 text-amber-500"
                                )}>
                                    <ShieldCheck className="h-4 w-4" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase">Status PLD</span>
                                        <span className="text-xs font-bold">{activeExpediente.pldStatus}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Document List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activeExpediente.documents.map(doc => (
                                <div key={doc.id} className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm group">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-500">
                                                <FileText className="h-4 w-4" />
                                            </div>
                                            <h4 className="font-bold text-sm">{doc.type}</h4>
                                        </div>
                                        <DocStatusBadge status={doc.status} />
                                    </div>

                                    <div className="aspect-[4/3] bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden relative mb-4 border border-zinc-200 dark:border-zinc-800">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Previsualización de Documento</span>
                                        </div>
                                        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="text-white text-[10px] font-bold flex items-center gap-1">
                                                <ExternalLink className="h-3 w-3" /> Abrir en pantalla completa
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAction(doc.id, "REJECT")}
                                            className="flex-1 h-10 rounded-xl border border-red-200 dark:border-red-900/30 text-red-500 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <X className="h-4 w-4" /> Rechazar
                                        </button>
                                        <button
                                            onClick={() => handleAction(doc.id, "APPROVE")}
                                            className="flex-1 h-10 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                                        >
                                            <Check className="h-4 w-4" /> Aprobar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Final Actions Footer */}
                        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm text-center">
                            <h3 className="text-lg font-black uppercase italic italic mb-2 tracking-tight">Acción Final de Certificación</h3>
                            <p className="text-xs text-zinc-500 max-w-md mx-auto mb-6">
                                Una vez que todos los documentos sean aprobados y el estado PLD sea verde, se podrá emitir el Pasaporte Digital Clinkar.
                            </p>

                            <button
                                disabled={activeExpediente.status !== 'FINAL_REVIEW'}
                                onClick={handleFinalCertify}
                                className={cn(
                                    "h-16 px-12 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl",
                                    activeExpediente.status === 'FINAL_REVIEW'
                                        ? "bg-indigo-600 text-white hover:scale-105 active:scale-95"
                                        : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                                )}
                            >
                                Emitir Reporte y Certificar
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="h-full bg-zinc-50 dark:bg-zinc-900/20 rounded-[3rem] border border-dashed border-zinc-300 dark:border-zinc-800 flex flex-col items-center justify-center p-12 text-center">
                        <AlertTriangle className="h-16 w-16 text-zinc-400 mb-6" />
                        <h2 className="text-2xl font-black uppercase italic tracking-tight">Bandeja Vacía</h2>
                        <p className="text-sm text-zinc-500 mt-2">No hay expedientes seleccionados para revisión técnica.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: Expediente["status"] }) {
    const labels = {
        PENDING_DOCS: "Esperando Docs",
        PARTIAL: "Avance Parcial",
        FINAL_REVIEW: "Listo p/ Cierre",
        CERTIFIED: "Certificado"
    };

    const colors = {
        PENDING_DOCS: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
        PARTIAL: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        FINAL_REVIEW: "bg-indigo-500/10 text-indigo-500 border-indigo-400/30",
        CERTIFIED: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
    };

    return (
        <span className={cn("px-2 py-0.5 rounded text-[8px] font-black uppercase border tracking-widest", colors[status])}>
            {labels[status]}
        </span>
    );
}

function DocStatusBadge({ status }: { status: Document["status"] }) {
    const styles = {
        PENDING: "text-zinc-400",
        APPROVED: "text-emerald-500 flex items-center gap-1",
        REJECTED: "text-red-500 flex items-center gap-1"
    };

    return (
        <span className={cn("text-[10px] font-black uppercase", styles[status])}>
            {status === 'APPROVED' && <CheckCircle2 className="h-3 w-3" />}
            {status === 'REJECTED' && <AlertCircle className="h-3 w-3" />}
            {status}
        </span>
    );
}
