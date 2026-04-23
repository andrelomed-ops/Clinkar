"use client";

import { createBrowserClient } from "@/lib/supabase/client";
import { InspectorService } from "@/services/InspectorService";
import { DocumentAnalysisService } from "@/services/DocumentAnalysisService";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Camera, CheckCircle2, ChevronRight, Save, XCircle } from "lucide-react";
import { ProcessingOverlay } from "@/components/ui/ProcessingOverlay";
import { CameraUpload } from "@/components/ui/CameraUpload";
import { getInspectionSectionsByCategory } from "@/lib/inspection-data";
import { CarService } from "@/services/CarService";
import { cn } from "@/lib/utils";

// We now use the list from INSPECTION_SECTIONS

export default function ChecklistPage({ params }: { params: Promise<{ id: string }> }) {
    const [carId, setCarId] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [vehicle, setVehicle] = useState<any>(null);
    const searchParams = useSearchParams();
    const roleParam = searchParams.get('role') as 'MECHANIC' | 'LEGAL' | null;
    const [role, setRole] = useState<'MECHANIC' | 'LEGAL'>(roleParam || 'MECHANIC');
    const [overallResult, setOverallResult] = useState<'APROBADO' | 'RECHAZADO'>('APROBADO');
    const [checklist, setChecklist] = useState<Record<string, { pass: boolean; note?: string; photos?: string[] }>>({});

    // AI State
    const [analyzing, setAnalyzing] = useState(false);
    const [showScanner, setShowScanner] = useState(false);

    const supabase = createBrowserClient();
    const router = useRouter();

    // Unwrap params and fetch vehicle
    useEffect(() => {
        const init = async () => {
            const p = await params;
            setCarId(p.id);
            
            const data = await CarService.getCarById(supabase, p.id);
            if (data) setVehicle(data);
        };
        init();
    }, [params, supabase]);

    const handleToggle = (item: string, pass: boolean) => {
        setChecklist(prev => ({
            ...prev,
            [item]: { ...prev[item], pass }
        }));
    };

    const handleNote = (item: string, note: string) => {
        setChecklist(prev => ({
            ...prev,
            [item]: { ...prev[item], pass: prev[item]?.pass ?? false, note }
        }));
    };

    const handleAIScan = async (url: string) => {
        setShowScanner(false);
        setAnalyzing(true);

        try {
            // Call AI Service
            const result = await DocumentAnalysisService.analyzeDocument(url, 'CIRCULATION_CARD');

            if (result.type === 'CIRCULATION_CARD') {
                // Auto-check Verification items
                handleToggle("VIN Visible y Coincide", true);
                handleToggle("Tarjeta de Circulación Vigente", true);
                handleToggle("Placas Coinciden", true);

                // Show Magic Result
                alert(`✅ IA: Documento Validado\nVIN: ${result.data.vin}\nPropietario: ${result.data.owner}\nConfianza: ${result.confidence * 100}%`);
            }
        } catch (e) {
            console.error(e);
            alert("Error en análisis IA");
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No autenticado");

            await InspectorService.createReport(
                supabase,
                carId,
                user.id,
                checklist,
                overallResult
            );

            router.refresh();
            router.push("/dashboard/inspector");

        } catch (error) {
            console.error(error);
            alert("Error guardando reporte");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-20 relative">
            {/* AI Processing Overlay */}
            <ProcessingOverlay isVisible={analyzing} message="Analizando Tarjeta de Circulación..." />

            {/* Scanner Modal */}
            {showScanner && (
                <div className="fixed inset-0 z-40 bg-black/90 flex flex-col p-4 animate-in fade-in">
                    <button
                        onClick={() => setShowScanner(false)}
                        className="self-end text-white p-2"
                    >
                        <XCircle className="h-8 w-8" />
                    </button>
                    <div className="flex-1 flex flex-col justify-center">
                        <CameraUpload
                            onUpload={handleAIScan}
                            label="Escanea la Tarjeta de Circulación"
                            category="DOCUMENT"
                            className="bg-zinc-900 border-zinc-800"
                        />
                    </div>
                </div>
            )}

            <header className="fixed top-0 inset-x-0 bg-white dark:bg-zinc-900 border-b z-20 h-16 flex items-center px-4 justify-between">
                <button onClick={() => router.back()} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full">
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
                    <button 
                        onClick={() => setRole('MECHANIC')}
                        className={cn("px-4 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all", role === 'MECHANIC' ? "bg-white dark:bg-zinc-700 shadow-sm" : "opacity-50")}
                    >
                        Mecánica
                    </button>
                    <button 
                        onClick={() => setRole('LEGAL')}
                        className={cn("px-4 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all", role === 'LEGAL' ? "bg-white dark:bg-zinc-700 shadow-sm" : "opacity-50")}
                    >
                        Legal
                    </button>
                </div>
                <div className="w-8" />
            </header>

            <main className="pt-20 px-4 max-w-2xl mx-auto space-y-8">

                {/* AI Quick Action */}
                {role === 'LEGAL' && (
                    <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-600/20 flex items-center justify-between">
                        <div>
                            <h3 className="font-black italic uppercase text-lg">Validación IA</h3>
                            <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider">Lectura de Tarjeta de Circulación</p>
                        </div>
                        <button
                            onClick={() => setShowScanner(true)}
                            className="h-12 w-12 bg-white text-indigo-600 rounded-2xl flex items-center justify-center hover:scale-110 transition-transform"
                        >
                            <Camera className="h-6 w-6" />
                        </button>
                    </div>
                )}

                {getInspectionSectionsByCategory(vehicle?.category || 'car')
                    .filter(sec => role === 'MECHANIC' ? sec.id !== 'legal' : sec.id === 'legal')
                    .map(cat => (
                    <section key={cat.id} className="bg-white dark:bg-zinc-900 rounded-3xl border p-6 shadow-sm">
                        <h2 className="font-black text-xl italic mb-6 flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-blue-600 block" />
                            {cat.label}
                        </h2>

                        <div className="space-y-6">
                            {cat.items.map((item: any) => {
                                const state = checklist[item.label];
                                return (
                                    <div key={item.id} className="pb-6 border-b border-zinc-100 dark:border-zinc-800 last:border-0 last:pb-0">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="font-medium text-sm text-zinc-700 dark:text-zinc-300 pr-4">{item.label}</span>
                                            <div className="flex gap-2 shrink-0">
                                                <button
                                                    onClick={() => handleToggle(item.label, true)}
                                                    className={`p-2 rounded-xl transition-all ${state?.pass === true ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}
                                                >
                                                    <CheckCircle2 className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggle(item.label, false)}
                                                    className={`p-2 rounded-xl transition-all ${state?.pass === false ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}
                                                >
                                                    <XCircle className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {/* Optional Evidence Section per Item */}
                                        <div className="flex gap-3">
                                            {state?.pass === false && (
                                                <input
                                                    type="text"
                                                    placeholder="Razón del fallo..."
                                                    className="flex-1 text-xs p-2.5 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg text-red-900 dark:text-red-200 outline-none focus:ring-1 focus:ring-red-500"
                                                    onChange={(e) => handleNote(item.label, e.target.value)}
                                                />
                                            )}
                                            <CameraUpload 
                                                onUpload={(url) => {
                                                    const current = checklist[item.label] || { pass: false };
                                                    setChecklist({
                                                        ...checklist,
                                                        [item.label]: { ...current, photos: [...(current.photos || []), url] }
                                                    });
                                                }}
                                                className="w-auto h-auto scale-75 origin-right"
                                                category={role === 'LEGAL' ? 'DOCUMENT' : 'PHOTO'}
                                                transactionId={carId}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </section>
                ))}

                <section className="bg-white dark:bg-zinc-900 rounded-3xl border p-6 shadow-xl space-y-6 sticky bottom-6">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setOverallResult('APROBADO')}
                            className={`flex-1 py-4 rounded-xl font-black uppercase text-sm flex flex-col items-center gap-1 border-2 transition-all ${overallResult === 'APROBADO' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-zinc-100 text-zinc-400'}`}
                        >
                            <CheckCircle2 className={`h-6 w-6 ${overallResult === 'APROBADO' && 'text-emerald-600'}`} />
                            Aprobar Auto
                        </button>
                        <button
                            onClick={() => setOverallResult('RECHAZADO')}
                            className={`flex-1 py-4 rounded-xl font-black uppercase text-sm flex flex-col items-center gap-1 border-2 transition-all ${overallResult === 'RECHAZADO' ? 'border-red-500 bg-red-50 text-red-700' : 'border-zinc-100 text-zinc-400'}`}
                        >
                            <XCircle className={`h-6 w-6 ${overallResult === 'RECHAZADO' && 'text-red-600'}`} />
                            Rechazar
                        </button>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl shadow-slate-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Guardando...' : 'Finalizar Inspección'}
                        <Save className="h-5 w-5" />
                    </button>
                </section>

            </main>
        </div>
    );
}
