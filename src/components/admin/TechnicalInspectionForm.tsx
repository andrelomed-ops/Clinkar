
"use client";

import { useState } from "react";
import { 
    ShieldCheck, 
    Camera, 
    CheckCircle2, 
    XCircle, 
    AlertCircle, 
    ChevronDown, 
    ChevronUp,
    Save,
    Upload,
    Wrench,
    ClipboardList
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CAR_INSPECTION_SECTIONS } from "@/lib/inspection-data";
import { toast } from "sonner";
import { updateCarAction } from "@/app/actions/cars";

export function TechnicalInspectionForm({ carId, onSave }: { carId: string, onSave: (data: any) => void }) {
    const [activeSection, setActiveSection] = useState<string | null>("motor");
    const [results, setResults] = useState<Record<string, 'PASS' | 'FAIL' | 'NA'>>({});
    const [isPhotoMode, setIsPhotoMode] = useState(false);
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [reconditioningBudget, setReconditioningBudget] = useState<number>(0);
    const [integrityNotes, setIntegrityNotes] = useState<string>("");

    const handleCheck = (itemId: string, status: 'PASS' | 'FAIL' | 'NA') => {
        setResults(prev => ({ ...prev, [itemId]: status }));
    };

    const handleSave = async () => {
        if (isPhotoMode && !photoUrl) {
            toast.error("Debes subir la foto del reporte físico");
            return;
        }

        const loadingId = toast.loading("Guardando reporte de integridad...");

        try {
            await updateCarAction(carId, {
                reconditioning_budget: reconditioningBudget,
                reconditioning_notes: [{ note: integrityNotes, date: new Date().toISOString() }],
                digital_passport_data: results
            });

            onSave({ results, photoUrl, isPhotoMode, reconditioningBudget, integrityNotes });
            toast.success("Reporte de Justicia y Certeza Guardado", { id: loadingId });
        } catch (error) {
            toast.error("Error al guardar el reporte técnico", { id: loadingId });
        }
    };

    return (
        <div className="bg-zinc-950 border border-zinc-800 rounded-[2.5rem] overflow-hidden flex flex-col max-h-[80vh]">
            {/* Header / Mode Switch */}
            <div className="p-8 border-b border-zinc-800 bg-zinc-900/30 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Inspección de 150 Puntos</h3>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Unidad ID: {carId.slice(0,8)}</p>
                </div>
                <div className="flex bg-black p-1 rounded-xl border border-zinc-800">
                    <button 
                        onClick={() => setIsPhotoMode(false)}
                        className={cn(
                            "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                            !isPhotoMode ? "bg-indigo-600 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
                        )}
                    >
                        Digital
                    </button>
                    <button 
                        onClick={() => setIsPhotoMode(true)}
                        className={cn(
                            "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                            isPhotoMode ? "bg-indigo-600 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
                        )}
                    >
                        Foto Reporte
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
                {isPhotoMode ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-6 py-12">
                        <div className="h-32 w-32 bg-indigo-500/10 rounded-full flex items-center justify-center border-2 border-dashed border-indigo-500/30">
                            <Camera className="h-12 w-12 text-indigo-500" />
                        </div>
                        <div className="text-center max-w-sm">
                            <h4 className="text-lg font-black text-white uppercase italic">Modo Híbrido Activo</h4>
                            <p className="text-xs text-zinc-500 mt-2">Sube una fotografía clara de tu reporte físico. La administración de StarterKar se encargará de la digitalización.</p>
                        </div>
                        <button className="h-14 px-10 bg-zinc-900 border border-zinc-800 text-white text-xs font-black rounded-2xl hover:bg-zinc-800 transition-all flex items-center gap-3">
                            <Upload className="h-4 w-4" /> SELECCIONAR IMAGEN
                        </button>
                    </div>
                    ) : (
                    <div className="space-y-8">
                        {/* SECCIÓN DE REALIDAD: ¿Qué le falta al auto? */}
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-8 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                                    <Wrench className="h-6 w-6 text-indigo-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black uppercase italic tracking-tight text-white">Reporte de Realidad y Mejora</h3>
                                    <p className="text-xs text-zinc-500 font-medium">Detalla honestamente qué le falta a la unidad para estar al 100%.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Presupuesto de Puesta a Punto (MXN)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span>
                                        <input 
                                            type="number"
                                            value={reconditioningBudget}
                                            onChange={(e) => setReconditioningBudget(Number(e.target.value))}
                                            className="w-full h-14 bg-zinc-950 border border-zinc-800 rounded-2xl pl-8 pr-4 text-xs font-bold text-white focus:border-indigo-500/50 outline-none transition-all"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Notas de Integridad / Diagnóstico</label>
                                    <textarea 
                                        value={integrityNotes}
                                        onChange={(e) => setIntegrityNotes(e.target.value)}
                                        className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-xs font-bold text-white focus:border-indigo-500/50 outline-none transition-all resize-none"
                                        placeholder="Ej. Requiere cambio de balatas delanteras y rectificado de discos..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 py-4">
                            <div className="h-px flex-1 bg-zinc-800" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Checklist de 150 Puntos</span>
                            <div className="h-px flex-1 bg-zinc-800" />
                        </div>

                        {CAR_INSPECTION_SECTIONS.map(section => (
                            <div key={section.id} className="border border-zinc-800 rounded-3xl overflow-hidden bg-zinc-900/20">
                                <button 
                                    onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                                    className="w-full p-6 flex items-center justify-between hover:bg-zinc-900/40 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-zinc-950 rounded-xl flex items-center justify-center border border-zinc-800">
                                            <span className="text-[10px] font-black text-indigo-500">{section.items.length}</span>
                                        </div>
                                        <h4 className="text-sm font-black uppercase tracking-widest text-white">{section.label}</h4>
                                    </div>
                                    {activeSection === section.id ? <ChevronUp className="h-5 w-5 text-zinc-600" /> : <ChevronDown className="h-5 w-5 text-zinc-600" />}
                                </button>

                                {activeSection === section.id && (
                                    <div className="p-6 pt-0 space-y-1 divide-y divide-zinc-800/50">
                                        {section.items.map(item => (
                                            <div key={item.id} className="py-4 flex items-center justify-between gap-6 group">
                                                <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">{item.label}</span>
                                                <div className="flex bg-black/40 p-1 rounded-xl border border-zinc-800">
                                                    <button 
                                                        onClick={() => handleCheck(item.id, 'PASS')}
                                                        className={cn(
                                                            "w-10 h-8 rounded-lg flex items-center justify-center transition-all",
                                                            results[item.id] === 'PASS' ? "bg-emerald-500 text-white" : "text-zinc-600 hover:text-zinc-400"
                                                        )}
                                                    >
                                                        <CheckCircle2 className="h-4 w-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleCheck(item.id, 'FAIL')}
                                                        className={cn(
                                                            "w-10 h-8 rounded-lg flex items-center justify-center transition-all",
                                                            results[item.id] === 'FAIL' ? "bg-red-500 text-white" : "text-zinc-600 hover:text-zinc-400"
                                                        )}
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleCheck(item.id, 'NA')}
                                                        className={cn(
                                                            "w-10 h-8 rounded-lg flex items-center justify-center transition-all",
                                                            results[item.id] === 'NA' ? "bg-zinc-700 text-white" : "text-zinc-600 hover:text-zinc-400"
                                                        )}
                                                    >
                                                        <span className="text-[8px] font-black">N/A</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="p-8 border-t border-zinc-800 bg-zinc-900/30 flex items-center justify-between">
                <div className="flex items-center gap-4 text-zinc-500">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                        {Object.keys(results).length} de 150 puntos verificados
                    </span>
                </div>
                <button 
                    onClick={handleSave}
                    className="h-14 px-10 bg-white text-black text-xs font-black rounded-2xl hover:bg-zinc-200 transition-all uppercase tracking-widest shadow-xl flex items-center gap-3"
                >
                    <Save className="h-4 w-4" /> FINALIZAR REPORTE
                </button>
            </div>
        </div>
    );
}
