"use client";

import { useState } from "react";
import { CameraUpload } from "@/components/ui/CameraUpload";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, ShieldCheck, FileText } from "lucide-react";
import { toast } from "sonner";

export function DocumentUploadView({ onComplete }: { onComplete?: () => void }) {
    const [docs, setDocs] = useState<{
        ineFront: string | null;
        ineBack: string | null;
        circulation: string | null;
    }>({
        ineFront: null,
        ineBack: null,
        circulation: null
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleUpload = (key: keyof typeof docs, url: string) => {
        setDocs(prev => ({ ...prev, [key]: url }));
        toast.success("Documento cargado correctamente");
    };

    const handleSubmit = async () => {
        if (!docs.ineFront || !docs.ineBack || !docs.circulation) {
            toast.error("Por favor sube todos los documentos requeridos");
            return;
        }

        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSubmitting(false);
        toast.success("Documentos enviados a validación legal");
        onComplete?.();
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />

            <div className="mb-8 ">
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                        <ShieldCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">Validación Legal</h2>
                </div>
                <p className="text-zinc-500 text-sm">Sube tus documentos para pre-aprobar tu vehículo en la Bóveda Digital.</p>
            </div>

            <div className="space-y-6">
                <div className="grid gap-4">
                    <CameraUpload
                        label="INE / IFE (Frente)"
                        description="Captura el frente de tu identificación oficial."
                        onUpload={(url) => handleUpload('ineFront', url)}
                        category="DOCUMENT"
                    />
                    <CameraUpload
                        label="INE / IFE (Reverso)"
                        description="Captura el reverso de tu identificación."
                        onUpload={(url) => handleUpload('ineBack', url)}
                        category="DOCUMENT"
                    />
                    <CameraUpload
                        label="Tarjeta de Circulación"
                        description="Vigente y legible."
                        onUpload={(url) => handleUpload('circulation', url)}
                        category="DOCUMENT"
                    />
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800">
                    <div className="text-xs text-zinc-400 font-medium">
                        <p>100% Encriptado</p>
                        <p>Solo uso legal</p>
                    </div>
                    <Button
                        size="lg"
                        className="rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !docs.ineFront || !docs.ineBack || !docs.circulation}
                    >
                        {isSubmitting ? "Enviando..." : (
                            <>
                                Enviar a Revisión <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
