"use client";

import { useState } from "react";
import { FileText, Download, CheckCircle2, XCircle, Eye, Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { DocumentAnalysisService, DocumentAnalysisResult } from "@/services/DocumentAnalysisService";

interface Document {
    id: string;
    type: "Factura" | "Identificación" | "Contrato" | "Tenencia";
    status: "PENDING" | "APPROVED" | "REJECTED";
    url: string;
    updatedAt: string;
}

interface LegalDocumentViewerProps {
    documents: Document[];
    onAction: (docId: string, action: "APPROVE" | "REJECT") => void;
}

export function LegalDocumentViewer({ documents, onAction }: LegalDocumentViewerProps) {
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    // AI Analysis State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<DocumentAnalysisResult | null>(null);

    const runAnalysis = async (doc: Document) => {
        setIsAnalyzing(true);
        try {
            // Map Spanish types to Service types
            let type: any = 'INVOICE';
            if (doc.type === 'Identificación') type = 'INE';
            if (doc.type === 'Factura') type = 'INVOICE';

            const result = await DocumentAnalysisService.analyzeDocument(doc.url, type);
            setAnalysisResult(result);
        } catch (error) {
            console.error(error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleAction = async (docId: string, action: "APPROVE" | "REJECT") => {
        setIsProcessing(docId);
        await new Promise(resolve => setTimeout(resolve, 1000));
        onAction(docId, action);
        setIsProcessing(null);
        if (selectedDoc?.id === docId) setSelectedDoc(null);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {documents.map((doc) => (
                    <div
                        key={doc.id}
                        className={cn(
                            "group relative overflow-hidden rounded-[2.5rem] border p-6 transition-all duration-300",
                            doc.status === 'PENDING' ? "bg-card border-border hover:border-primary/50" :
                                doc.status === 'APPROVED' ? "bg-green-50/50 dark:bg-green-950/10 border-green-200 dark:border-green-800" :
                                    "bg-red-50/50 dark:bg-red-950/10 border-red-200 dark:border-red-800"
                        )}
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div className={cn(
                                "h-12 w-12 rounded-2xl flex items-center justify-center shadow-inner",
                                doc.status === 'PENDING' ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400" :
                                    doc.status === 'APPROVED' ? "bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400" :
                                        "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400"
                            )}>
                                <FileText className="h-6 w-6" />
                            </div>
                            <div className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                doc.status === 'PENDING' ? "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900" :
                                    doc.status === 'APPROVED' ? "bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900" :
                                        "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900"
                            )}>
                                {doc.status}
                            </div>
                        </div>

                        <div className="space-y-1 mb-6">
                            <h3 className="font-black text-xl tracking-tight italic uppercase text-zinc-900 dark:text-zinc-100">{doc.type}</h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-tighter">ID: {doc.id}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">Actualizado: {doc.updatedAt}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-xl font-bold text-xs h-10 border-border/50 text-zinc-700 dark:text-zinc-300"
                                onClick={() => setSelectedDoc(doc)}
                            >
                                <Eye className="h-3.5 w-3.5 mr-2" /> Visualizar
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-xl font-bold text-xs h-10 border-border/50 text-zinc-700 dark:text-zinc-300"
                                asChild
                            >
                                <a href={doc.url} download>
                                    <Download className="h-3.5 w-3.5 mr-2" /> Bajar
                                </a>
                            </Button>
                        </div>

                        {doc.status === 'PENDING' && (
                            <div className="mt-4 flex gap-2">
                                <Button
                                    className="flex-1 rounded-xl bg-green-600 hover:bg-green-500 text-white font-black h-10 text-xs shadow-lg shadow-green-900/10"
                                    onClick={() => handleAction(doc.id, "APPROVE")}
                                    disabled={!!isProcessing}
                                >
                                    {isProcessing === doc.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Aprobar"}
                                </Button>
                                <Button
                                    className="flex-1 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black h-10 text-xs shadow-lg shadow-red-900/10"
                                    onClick={() => handleAction(doc.id, "REJECT")}
                                    disabled={!!isProcessing}
                                >
                                    Rechazar
                                </Button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Preview Modal */}
            {selectedDoc && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="bg-card border border-border w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-8 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center">
                                    <ShieldCheck className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black italic uppercase tracking-tight text-slate-900 dark:text-slate-100">{selectedDoc.type}</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">{selectedDoc.id}</p>
                                </div>
                            </div>
                            <Button variant="ghost" className="rounded-2xl h-12 w-12 p-0" onClick={() => { setSelectedDoc(null); setAnalysisResult(null); }}>
                                <XCircle className="h-6 w-6 text-slate-400" />
                            </Button>
                        </div>

                        <div className="flex-1 overflow-auto p-12 bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center gap-8">
                            <div className="w-full max-w-2xl aspect-[1/1.4] bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-border flex items-center justify-center p-12 text-center relative overflow-hidden group">
                                {/* Simulated Document Preview */}
                                <div className="space-y-6 relative z-10">
                                    <FileText className="h-24 w-24 text-slate-200 dark:text-slate-700 mx-auto" />
                                    <div className="space-y-2">
                                        <p className="font-black text-xl italic uppercase text-slate-900 dark:text-slate-100">Vista Previa del Documento</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto font-medium">
                                            Este documento ha sido cargado al expediente digital del vehículo.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* AI Analysis Section */}
                            <div className="w-full max-w-2xl space-y-4">
                                {analysisResult ? (
                                    <div className={cn(
                                        "p-6 rounded-3xl border animate-in slide-in-from-bottom-4",
                                        analysisResult.isValid ? "bg-green-50/50 dark:bg-green-950/10 border-green-200 dark:border-green-800" :
                                            "bg-red-50/50 dark:bg-red-950/10 border-red-200 dark:border-red-800"
                                    )}>
                                        <div className="flex items-center gap-3 mb-4">
                                            {analysisResult.isValid ? (
                                                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                                            ) : (
                                                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                            )}
                                            <h4 className={cn(
                                                "font-black text-lg uppercase",
                                                analysisResult.isValid ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
                                            )}>
                                                {analysisResult.isValid ? "Validación IA Aprobada" : "Problemas Detectados por IA"}
                                            </h4>
                                            <span className="ml-auto text-xs font-bold bg-white dark:bg-black/20 px-3 py-1 rounded-full text-slate-600 dark:text-slate-300">
                                                Confianza: {(analysisResult.confidence * 100).toFixed(0)}%
                                            </span>
                                        </div>

                                        {!analysisResult.isValid && (
                                            <ul className="space-y-2 mb-4">
                                                {analysisResult.issues?.map((issue, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 text-sm text-red-700 dark:text-red-300 font-medium">
                                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                                        {issue}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        {analysisResult.extractedData && (
                                            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-black/5 dark:border-white/5">
                                                {Object.entries(analysisResult.extractedData).map(([key, value]) => (
                                                    <div key={key}>
                                                        <span className="text-[10px] uppercase text-slate-500 font-bold">{key}</span>
                                                        <p className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">{String(value)}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <Button
                                        onClick={() => runAnalysis(selectedDoc)}
                                        disabled={isAnalyzing}
                                        className="w-full h-14 rounded-3xl bg-indigo-600 hover:bg-indigo-500 text-white font-black shadow-xl shadow-indigo-500/20"
                                    >
                                        {isAnalyzing ? (
                                            <>
                                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                                Escaneando Documento con IA...
                                            </>
                                        ) : (
                                            <>
                                                <ShieldCheck className="h-5 w-5 mr-2" />
                                                Ejecutar Auditoría IA Preliminar
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="p-8 border-t border-border flex justify-end gap-4 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
                            <Button variant="outline" className="rounded-2xl h-14 px-8 font-black border-border/50 text-slate-700 dark:text-slate-300" onClick={() => { setSelectedDoc(null); setAnalysisResult(null); }}>
                                Cerrar
                            </Button>
                            {selectedDoc.status === 'PENDING' && (
                                <>
                                    <Button
                                        className="rounded-2xl h-14 px-8 bg-red-600 text-white font-black hover:bg-red-500 shadow-xl shadow-red-500/10"
                                        onClick={() => handleAction(selectedDoc.id, "REJECT")}
                                    >
                                        Rechazar
                                    </Button>
                                    <Button
                                        className="rounded-2xl h-14 px-10 bg-green-600 text-white font-black hover:bg-green-500 shadow-xl shadow-green-500/10"
                                        onClick={() => handleAction(selectedDoc.id, "APPROVE")}
                                        disabled={!analysisResult?.isValid}
                                    >
                                        Aprobar Verificación
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
