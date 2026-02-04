"use client";

import { useState } from "react";
import { AIDocumentAssistant } from "./AIDocumentAssistant";
import { LegalDocumentViewer } from "@/components/dashboard/LegalDocumentViewer";
import { PldMonitor } from "@/components/dashboard/PldMonitor";
import { createBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
    X,
    ShieldCheck,
    FileText,
    CheckCircle2,
    AlertTriangle,
    Save,
    UserCheck,
    Car
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationService } from "@/services/NotificationService";

interface LegalReviewDashboardProps {
    carId: string;
    carDetails: {
        make: string;
        model: string;
        year: number;
        vin: string;
    };
    seller: {
        id: string;
        full_name: string;
    };
    initialDocuments: any[];
    onClose: () => void;
    onStatusUpdate?: (newStatus: string) => void;
}

export function LegalReviewDashboard({
    carId,
    carDetails,
    seller,
    initialDocuments,
    onClose,
    onStatusUpdate
}: LegalReviewDashboardProps) {
    const [documents, setDocuments] = useState(initialDocuments);
    const [isSaving, setIsSaving] = useState(false);
    const supabase = createBrowserClient();

    const handleAction = async (docId: string, action: "APPROVE" | "REJECT", comment?: string) => {
        const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
        setDocuments(prev => prev.map(doc =>
            doc.id === docId ? { ...doc, status: newStatus } : doc
        ));

        if (comment) {
            toast.info(`AI Sugirió: ${comment}`);
        }
    };

    const handleSaveProgress = async () => {
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from("cars")
                .update({ documents })
                .eq("id", carId);

            if (error) throw error;
            toast.success("Progreso guardado correctamente");
        } catch (e) {
            console.error(e);
            toast.error("Error al guardar progreso");
        } finally {
            setIsSaving(false);
        }
    };

    const handleFinalCertification = async () => {
        const anyPending = documents.some(d => d.status === 'PENDING');
        const anyRejected = documents.some(d => d.status === 'REJECTED');

        if (anyPending || anyRejected) {
            toast.error("No se puede certificar: Existen documentos pendientes o rechazados.");
            return;
        }

        setIsSaving(true);
        try {
            const { error } = await supabase
                .from("cars")
                .update({
                    status: 'CERTIFIED',
                    documents
                })
                .eq("id", carId);

            if (error) throw error;

            await NotificationService.notify(supabase, {
                userId: seller.id,
                title: "¡Vehículo Certificado!",
                message: `Tu ${carDetails.make} ${carDetails.model} ha pasado la revisión legal y ya está disponible para venta final.`,
                type: "SUCCESS",
                link: "/dashboard"
            });

            toast.success("¡Vehículo Certificado Exitosamente!");
            if (onStatusUpdate) onStatusUpdate('CERTIFIED');
            onClose();
        } catch (e) {
            console.error(e);
            toast.error("Error al certificar vehículo");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md overflow-y-auto p-4 md:p-8 animate-in fade-in duration-300">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={onClose}
                            className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                        >
                            <X className="h-6 w-6 text-white" />
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">Centro de Certificación Legal</h1>
                                <span className="px-3 py-1 bg-indigo-500 text-white text-[10px] font-black uppercase rounded-full">Admin Only</span>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-slate-400">
                                <span className="flex items-center gap-1.5 text-xs font-bold font-mono">
                                    <Car className="h-3.5 w-3.5" /> {carDetails.make} {carDetails.model} ({carDetails.year})
                                </span>
                                <span className="flex items-center gap-1.5 text-xs font-bold font-mono border-l border-white/10 pl-4">
                                    <UserCheck className="h-3.5 w-3.5" /> {seller.full_name}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Button
                            variant="outline"
                            className="h-14 px-8 rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10 font-black uppercase text-xs tracking-widest"
                            onClick={handleSaveProgress}
                            disabled={isSaving}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            Guardar Avance
                        </Button>
                        <Button
                            className="h-14 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-600/20"
                            onClick={handleFinalCertification}
                            disabled={isSaving}
                        >
                            <ShieldCheck className="h-4 w-4 mr-2" />
                            Certificación Final
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: AI & PLD */}
                    <div className="lg:col-span-4 space-y-8">
                        <AIDocumentAssistant
                            documents={documents}
                            sellerName={seller.full_name}
                            onSuggestAction={(docType, action, comment) => {
                                const doc = documents.find(d => d.type === docType);
                                if (doc) handleAction(doc.id, action, comment);
                            }}
                        />
                        <div className="p-1 px-2">
                            <PldMonitor />
                        </div>
                    </div>

                    {/* Right Column: Document Viewer */}
                    <div className="lg:col-span-8 bg-white/5 border border-white/10 rounded-[3rem] p-8 shadow-2xl">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-indigo-400" />
                                </div>
                                <h2 className="text-xl font-bold text-white tracking-tight">Expediente Digital</h2>
                            </div>
                            <div className="flex gap-2">
                                <div className="px-4 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    {documents.filter(d => d.status === 'APPROVED').length} Aprobados
                                </div>
                                <div className="px-4 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                    <AlertTriangle className="h-3.5 w-3.5" />
                                    {documents.filter(d => d.status === 'PENDING').length} Pendientes
                                </div>
                            </div>
                        </div>

                        <LegalDocumentViewer
                            documents={documents}
                            onAction={handleAction}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
