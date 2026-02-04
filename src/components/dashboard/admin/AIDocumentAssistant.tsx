"use client";

import { useState, useEffect } from "react";
import {
    Brain,
    CheckCircle2,
    AlertTriangle,
    Search,
    MessageSquare,
    ShieldCheck,
    ArrowRight,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AIInsight {
    documentType: string;
    status: "SAFE" | "WARNING" | "CRITICAL";
    reasoning: string;
    confidence: number;
}

interface AIDocumentAssistantProps {
    documents: any[];
    sellerName: string;
    onSuggestAction: (docId: string, action: "APPROVE" | "REJECT", comment: string) => void;
}

export function AIDocumentAssistant({ documents, sellerName, onSuggestAction }: AIDocumentAssistantProps) {
    const [isScanning, setIsScanning] = useState(true);
    const [progress, setProgress] = useState(0);
    const [insights, setInsights] = useState<AIInsight[]>([]);

    useEffect(() => {
        if (isScanning) {
            const timer = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(timer);
                        setIsScanning(false);
                        generateMockInsights();
                        return 100;
                    }
                    return prev + 5;
                });
            }, 100);
            return () => clearInterval(timer);
        }
    }, [isScanning]);

    const generateMockInsights = () => {
        const mockInsights: AIInsight[] = documents.map(doc => {
            if (doc.type === "Factura") {
                return {
                    documentType: "Factura",
                    status: "SAFE",
                    reasoning: "El VIN detectado en la factura coincide plenamente con los registros del vehículo. El sello digital es válido.",
                    confidence: 0.98
                };
            }
            if (doc.type === "Identificación") {
                return {
                    documentType: "Identificación",
                    status: "WARNING",
                    reasoning: "La identificación es válida, pero la fecha de vencimiento es en menos de 30 días. Se recomienda solicitar actualización pronto.",
                    confidence: 0.85
                };
            }
            return {
                documentType: doc.type,
                status: "SAFE",
                reasoning: `Documento de tipo ${doc.type} parece estar en orden. Sin anomalías detectadas.`,
                confidence: 0.92
            };
        });
        setInsights(mockInsights);
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full -mr-32 -mt-32" />

            <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-black italic uppercase tracking-tight flex items-center gap-3">
                            <Brain className="h-8 w-8 text-indigo-400 animate-pulse" />
                            Asistente de Revisión Legal IA
                        </h3>
                        <p className="text-sm text-zinc-400 mt-1">Análisis profundo de expediente para: <span className="text-white font-bold">{sellerName}</span></p>
                    </div>
                </div>

                {isScanning ? (
                    <div className="py-12 flex flex-col items-center justify-center space-y-6">
                        <div className="relative h-24 w-24">
                            <Loader2 className="h-24 w-24 text-indigo-500 animate-spin opacity-20" />
                            <Search className="h-10 w-10 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <div className="w-full max-w-md space-y-2">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-zinc-500">
                                <span>Escaneando Documentos...</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-500 transition-all duration-300 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                        <p className="text-xs text-zinc-500 italic">Verificando Sellos Digitales, Vigencia y Coincidencia de Datos...</p>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {insights.map((insight, idx) => (
                                <div key={idx} className="bg-zinc-800/50 border border-zinc-700/50 p-5 rounded-3xl space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2">
                                            {insight.status === 'SAFE' ? (
                                                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                            ) : (
                                                <AlertTriangle className="h-5 w-5 text-amber-400" />
                                            )}
                                            <span className="font-bold text-sm tracking-tight">{insight.documentType}</span>
                                        </div>
                                        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                                            Confianza: {(insight.confidence * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                    <p className="text-xs text-zinc-400 leading-relaxed italic">
                                        "{insight.reasoning}"
                                    </p>
                                    <div className="pt-2 flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 text-[10px] font-bold uppercase tracking-wider text-emerald-400 hover:bg-emerald-400/10"
                                            onClick={() => onSuggestAction(insight.documentType, "APPROVE", "Correcto según análisis de IA")}
                                        >
                                            <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
                                            Aprobar
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 text-[10px] font-bold uppercase tracking-wider text-amber-400 hover:bg-amber-400/10"
                                            onClick={() => onSuggestAction(insight.documentType, "REJECT", "IA detectó anomalías menores o vigencia próxima")}
                                        >
                                            <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                                            Pedir Corrección
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-indigo-600/20 border border-indigo-500/30 p-6 rounded-[2rem] flex items-center justify-between">
                            <div>
                                <h4 className="font-black text-indigo-300 uppercase tracking-tighter text-lg">Recomendación Final IA</h4>
                                <p className="text-sm text-zinc-300">Expediente con 85% de cumplimiento. El humano puede certificar con observaciones.</p>
                            </div>
                            <Button className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-2xl h-12 px-8 shadow-lg shadow-indigo-500/20">
                                Seguir Recomendación
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
