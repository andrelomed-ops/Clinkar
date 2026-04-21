
"use client";

import { ALL_DOCUMENTS, VehicleCategory, VEHICLE_CATEGORIES } from "@/lib/vehicle-intake-config";
import { CameraUpload } from "@/components/ui/CameraUpload";
import { Info, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
    categoryId: VehicleCategory;
    uploadedDocs: Record<string, string>;
    onUpload: (docId: string, url: string) => void;
}

export function DynamicDocumentList({ categoryId, uploadedDocs, onUpload }: Props) {
    const config = VEHICLE_CATEGORIES.find(c => c.id === categoryId);
    if (!config) return null;

    const requiredDocs = config.documents.map(id => ALL_DOCUMENTS[id]);
    const managedDocs = Object.values(ALL_DOCUMENTS).filter(d => d.managedByStarterKar);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
                    Documentación Requerida
                </h2>
                <p className="text-zinc-500 text-sm">
                    Sube las fotos de tus documentos para la validación legal.
                </p>
            </div>

            {/* Smart Banner: Things we do for them */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <Sparkles className="h-24 w-24" />
                </div>
                <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-amber-300" />
                        <h3 className="font-bold text-lg italic uppercase tracking-tighter">StarterKar Concierge Legal</h3>
                    </div>
                    <p className="text-indigo-100 text-sm leading-relaxed max-w-sm">
                        Para tu comodidad, nosotros realizamos las validaciones oficiales directamente con las autoridades. **Tú no necesitas subir nada de esto:**
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {managedDocs.map(doc => (
                            <div key={doc.id} className="bg-white/10 backdrop-blur-md rounded-xl p-3 flex items-center gap-2 border border-white/10">
                                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest">{doc.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* User Upload Section */}
            <div className="grid gap-6">
                {requiredDocs.map((doc) => (
                    <div key={doc.id} className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                                        <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h4 className="font-bold text-zinc-900 dark:text-white">{doc.label}</h4>
                                </div>
                                <p className="text-xs text-zinc-500 leading-relaxed">
                                    {doc.description}
                                </p>
                                {doc.helperText && (
                                    <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/20 mt-2">
                                        <Info className="h-3 w-3 text-amber-600 mt-0.5" />
                                        <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">{doc.helperText}</p>
                                    </div>
                                )}
                            </div>
                            <div className="w-full md:w-64">
                                <CameraUpload 
                                    onUpload={(url) => onUpload(doc.id, url)}
                                    category="DOCUMENT"
                                    label={uploadedDocs[doc.id] ? "Actualizar" : "Subir Foto"}
                                    className="scale-90 md:scale-100"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* CDMX Floating Tip */}
            {categoryId !== 'IMPORTED' && (
                <div className="bg-zinc-50 dark:bg-zinc-950 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
                    <div className="h-12 w-12 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center shadow-inner border border-zinc-100 dark:border-zinc-800 shrink-0">
                        🏙️
                    </div>
                    <div className="space-y-1">
                        <h4 className="font-bold text-sm">¿Vives en la Ciudad de México?</h4>
                        <p className="text-[10px] text-zinc-500 leading-tight">
                            Si tu Tarjeta de Circulación está vencida pero tienes un **documento de extensión de vigencia** vigente, puedes subirlo en lugar de la tarjeta original.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
