"use client";

import { useState } from "react";
import { FileText, Upload, CheckCircle2, AlertCircle, ShieldCheck, Clock, Download, Eye, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface LegalDoc {
    id: string;
    name: string;
    status: 'PENDING' | 'VALIDATING' | 'APPROVED' | 'REJECTED';
    type: string;
    url?: string;
}

export function LegalVault({ transactionId, role = 'buyer' }: { transactionId: string, role?: 'buyer' | 'seller' }) {
    const [docs, setDocs] = useState<LegalDoc[]>([
        { id: 'id_official', name: 'Identificación Oficial (INE/Pasaporte)', status: 'PENDING', type: 'IDENTITY' },
        { id: 'address_proof', name: 'Comprobante de Domicilio', status: 'PENDING', type: 'ADDRESS' },
        { id: 'tax_id', name: 'Constancia de Situación Fiscal', status: 'PENDING', type: 'TAX' },
    ]);

    const handleUpload = (docId: string) => {
        // Simulation of upload
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 2000)),
            {
                loading: 'Subiendo documento...',
                success: () => {
                    setDocs(prev => prev.map(d => d.id === docId ? { ...d, status: 'VALIDATING' } : d));
                    return 'Documento enviado a revisión';
                },
                error: 'Error al subir documento'
            }
        );
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-8 md:p-12 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck className="h-4 w-4 text-indigo-600" />
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Expediente Digital Seguro</span>
                    </div>
                    <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase italic">Bóveda de Documentos</h3>
                    <p className="text-xs text-zinc-500 font-medium mt-1">Sube tus documentos para la validación de PLD y cumplimiento legal.</p>
                </div>
                <div className="px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                    Encriptación Bancaria AES-256
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {docs.map((doc) => (
                    <div 
                        key={doc.id}
                        className={cn(
                            "group p-6 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-6",
                            doc.status === 'APPROVED' ? "bg-emerald-50/30 border-emerald-100" : 
                            doc.status === 'VALIDATING' ? "bg-amber-50/30 border-amber-100" :
                            "bg-zinc-50/50 border-zinc-100 hover:border-zinc-200"
                        )}
                    >
                        <div className="flex items-center gap-5">
                            <div className={cn(
                                "h-12 w-12 rounded-xl flex items-center justify-center transition-colors",
                                doc.status === 'APPROVED' ? "bg-emerald-500 text-white" : 
                                doc.status === 'VALIDATING' ? "bg-amber-500 text-white" :
                                "bg-white dark:bg-zinc-800 text-zinc-400 group-hover:text-indigo-600 shadow-sm"
                            )}>
                                <FileText className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-black text-sm uppercase tracking-tight text-zinc-900 dark:text-white">{doc.name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={cn(
                                        "text-[8px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest",
                                        doc.status === 'APPROVED' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                                        doc.status === 'VALIDATING' ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                                        "bg-zinc-100 text-zinc-400 border-zinc-200"
                                    )}>
                                        {doc.status === 'PENDING' ? 'Pendiente' : 
                                         doc.status === 'VALIDATING' ? 'En Revisión' : 
                                         doc.status === 'APPROVED' ? 'Validado' : 'Rechazado'}
                                    </span>
                                    {doc.status === 'VALIDATING' && <Clock className="h-3 w-3 text-amber-500 animate-pulse" />}
                                    {doc.status === 'APPROVED' && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {doc.status === 'PENDING' ? (
                                <button 
                                    onClick={() => handleUpload(doc.id)}
                                    className="h-10 px-6 bg-indigo-600 text-white rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-600/10 transition-all flex items-center gap-2"
                                >
                                    <Upload className="h-3.5 w-3.5" />
                                    Subir Archivo
                                </button>
                            ) : (
                                <>
                                    <button className="h-10 w-10 flex items-center justify-center bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-500 hover:text-indigo-600 transition-colors">
                                        <Eye className="h-4 w-4" />
                                    </button>
                                    <button className="h-10 w-10 flex items-center justify-center bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-500 hover:text-indigo-600 transition-colors">
                                        <Download className="h-4 w-4" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-10 p-6 bg-zinc-900 rounded-[1.5rem] border border-zinc-800 flex items-start gap-4">
                <div className="h-10 w-10 bg-indigo-600/20 rounded-xl flex items-center justify-center shrink-0">
                    <AlertCircle className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                    <p className="text-[11px] font-black text-white uppercase tracking-widest mb-1">Nota de Seguridad</p>
                    <p className="text-[10px] text-zinc-400 leading-relaxed font-medium">
                        Tus documentos son procesados bajo protocolos de privacidad estrictos. Solo el departamento legal de StarterKar tiene acceso para validar tu identidad y deslindar responsabilidades fiscales.
                    </p>
                </div>
            </div>
        </div>
    );
}
