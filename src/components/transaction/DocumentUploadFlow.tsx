"use client";

import { useState } from "react";
import { CameraUpload } from "../ui/CameraUpload";
import { FileText, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "../ui/button";

interface DocumentUploadFlowProps {
    transactionId: string;
    onComplete: () => void;
}

export function DocumentUploadFlow({ transactionId, onComplete }: DocumentUploadFlowProps) {
    const [docs, setDocs] = useState<{ id?: string; license?: string; info?: string }>({});

    const requiredDocs = [
        { id: 'id', label: 'Identificación Oficial', description: 'INE, Pasaporte o Cédula Profesional' },
        { id: 'license', label: 'Licencia de Conducir', description: 'Vigente y legible' },
        { id: 'info', label: 'Comprobante de Domicilio', description: 'No mayor a 3 meses' }
    ];

    const handleUpload = (type: string, url: string) => {
        setDocs(prev => ({ ...prev, [type]: url }));
    };

    const isComplete = Object.keys(docs).length === requiredDocs.length;

    return (
        <div className="bg-card border border-border rounded-[2rem] p-8 space-y-8">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-foreground">Verificación Legal</h2>
                    <p className="text-sm text-muted-foreground font-medium">Sube tus documentos para validar la transacción.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {requiredDocs.map((doc) => (
                    <CameraUpload
                        key={doc.id}
                        transactionId={transactionId}
                        label={doc.label}
                        description={doc.description}
                        category="DOCUMENT"
                        onUpload={(url) => handleUpload(doc.id, url)}
                    />
                ))}
            </div>

            <div className="flex flex-col items-center gap-4 pt-4 border-t border-border">
                {!isComplete ? (
                    <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 px-4 py-2 rounded-full">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Documentos pendientes</span>
                    </div>
                ) : (
                    <Button
                        onClick={onComplete}
                        className="w-full max-w-md h-14 rounded-2xl text-lg font-black"
                    >
                        Finalizar y Enviar a Revisión
                    </Button>
                )}
                <p className="text-[10px] text-muted-foreground text-center max-w-sm uppercase font-black tracking-widest">
                    Tus datos están protegidos por cifrado de extremo a extremo y solo serán usados para esta transacción.
                </p>
            </div>
        </div>
    );
}
