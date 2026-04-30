
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

export function TechnicalInspectionForm({ carId, userRole = 'admin', onSave }: { carId: string, userRole?: string, onSave: (data: any) => void }) {
    const [activeSection, setActiveSection] = useState<string | null>("motor");
    const [results, setResults] = useState<Record<string, 'PASS' | 'FAIL' | 'NA'>>({});
    const [isPhotoMode, setIsPhotoMode] = useState(false);
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [reconditioningBudget, setReconditioningBudget] = useState<number>(0);
    const [integrityNotes, setIntegrityNotes] = useState<string>("");

    // Filter sections based on role
    // Mechanics (inspectors) only see categories 1-4. Admins see all 5.
    const visibleSections = userRole === 'admin' 
        ? CAR_INSPECTION_SECTIONS 
        : CAR_INSPECTION_SECTIONS.filter(s => s.id !== 'legal');

    const calculateScore = () => {
        let totalWeightedPoints = 0;
        let earnedWeightedPoints = 0;

        CAR_INSPECTION_SECTIONS.forEach(section => {
            // Weights: Motor(20), Trans(20), Susp(15), Carrocería(10), Legal(35)
            let weight = 0.66; // default
            if (section.id === 'motor') weight = 20 / 30;
            if (section.id === 'transmision') weight = 20 / 30;
            if (section.id === 'suspension') weight = 15 / 30;
            if (section.id === 'carroceria') weight = 10 / 30;
            if (section.id === 'legal') weight = 35 / 30;

            section.items.forEach(item => {
                totalWeightedPoints += weight;
                if (results[item.id] === 'PASS') {
                    earnedWeightedPoints += weight;
                } else if (results[item.id] === 'NA') {
                    totalWeightedPoints -= weight; // Don't penalize N/A
                }
            });
        });

        return totalWeightedPoints > 0 ? Math.round((earnedWeightedPoints / totalWeightedPoints) * 100) : 0;
    };

    const finalScore = calculateScore();

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
                digital_passport_data: results,
                performance_score: finalScore // This is the 0-100 score
            });

            onSave({ results, photoUrl, isPhotoMode, reconditioningBudget, integrityNotes, finalScore });
            toast.success(`Reporte Guardado - Score: ${finalScore}/100`, { id: loadingId });
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
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                        Unidad ID: {carId.slice(0,8)} | MODO: {userRole === 'admin' ? 'CERTIFICACIÓN' : 'TÉCNICO'}
                    </p>
                </div>
                
                <div className="flex items-center gap-6">
                    {userRole === 'admin' && (
                        <div className="text-right pr-6 border-r border-zinc-800">
                            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Score Actual</p>
                            <p className={cn(
                                "text-2xl font-black italic",
                                finalScore >= 90 ? "text-emerald-500" : finalScore >= 70 ? "text-amber-500" : "text-red-500"
                            )}>{finalScore}<span className="text-xs ml-1">/100</span></p>
                        </div>
                    )}

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
                            Foto
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
                {isPhotoMode ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-6 py-12">
                        <div className="h-32 w-32 bg-indigo-500/10 rounded-full flex items-center justify-center border-2 border-dashed border-indigo-500/30">
                            <Camera className="h-12 w-12 text-indigo-500" />
                        </div>
                        <div className="text-center max-w-sm">
                            <h4 className="text-lg font-black text-white uppercase italic">Subir Reporte Físico</h4>
                            <p className="text-xs text-zinc-500 mt-2">
                                {userRole === 'admin' 
                                    ? 'Sube la foto enviada por el mecánico para digitalizar sus resultados.'
                                    : 'Si no puedes llenar el formato digital, sube una foto de tu reporte en papel.'}
                            </p>
                        </div>
                        <button className="h-14 px-10 bg-zinc-900 border border-zinc-800 text-white text-xs font-black rounded-2xl hover:bg-zinc-800 transition-all flex items-center gap-3">
                            <Upload className="h-4 w-4" /> SELECCIONAR IMAGEN
                        </button>
                    </div>
                    ) : (
                    <div className="space-y-8">
                        {/* SECCIÓN DE REALIDAD: Solo para el mecánico o admin llenando lo técnico */}
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-8 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                                    <Wrench className="h-6 w-6 text-indigo-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black uppercase italic tracking-tight text-white">Reporte de Realidad y Mejora</h3>
                                    <p className="text-xs text-zinc-500 font-medium">Estado físico y presupuesto estimado de puesta a punto.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Presupuesto Estimado (MXN)</label>
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
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Diagnóstico General</label>
                                    <textarea 
                                        value={integrityNotes}
                                        onChange={(e) => setIntegrityNotes(e.target.value)}
                                        className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-xs font-bold text-white focus:border-indigo-500/50 outline-none transition-all resize-none"
                                        placeholder="Detalles sobre el estado actual de la unidad..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 py-4">
                            <div className="h-px flex-1 bg-zinc-800" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Puntos de Verificación</span>
                            <div className="h-px flex-1 bg-zinc-800" />
                        </div>

                        {visibleSections.map(section => (
                            <div key={section.id} className={cn(
                                "border rounded-3xl overflow-hidden transition-all",
                                section.id === 'legal' ? "border-amber-500/30 bg-amber-500/5" : "border-zinc-800 bg-zinc-900/20"
                            )}>
                                <button 
                                    onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                                    className="w-full p-6 flex items-center justify-between hover:bg-zinc-900/40 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-zinc-950 rounded-xl flex items-center justify-center border border-zinc-800">
                                            <span className={cn("text-[10px] font-black", section.id === 'legal' ? "text-amber-500" : "text-indigo-500")}>
                                                {section.items.length}
                                            </span>
                                        </div>
                                        <h4 className="text-sm font-black uppercase tracking-widest text-white">
                                            {section.label}
                                            {section.id === 'legal' && <span className="ml-3 text-[8px] bg-amber-500 text-black px-2 py-0.5 rounded-full">ADMIN EXCLUSIVO</span>}
                                        </h4>
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
                    <ClipboardList className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                        {Object.keys(results).length} de {userRole === 'admin' ? '150' : '120'} puntos | {userRole === 'admin' ? 'Certificación Final' : 'Reporte Técnico'}
                    </span>
                </div>
                <button 
                    onClick={handleSave}
                    className="h-14 px-10 bg-white text-black text-xs font-black rounded-2xl hover:bg-zinc-200 transition-all uppercase tracking-widest shadow-xl flex items-center gap-3"
                >
                    <Save className="h-4 w-4" /> 
                    {userRole === 'admin' ? 'CERTIFICAR UNIDAD' : 'ENVIAR REVISIÓN'}
                </button>
            </div>
        </div>
    );
}
