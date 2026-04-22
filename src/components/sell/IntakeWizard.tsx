
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VehicleCategory, VEHICLE_CATEGORIES } from "@/lib/vehicle-intake-config";
import { VehicleTypeSelector } from "./VehicleTypeSelector";
import { VehicleDataForm, VehicleFormData } from "./VehicleDataForm";
import { DynamicDocumentList } from "./DynamicDocumentList";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
    isAdminMode?: boolean;
}

export function IntakeWizard({ isAdminMode = false }: Props) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Wizard State
    const [category, setCategory] = useState<VehicleCategory | null>(null);
    const [vehicleData, setVehicleData] = useState<VehicleFormData>({
        make: "",
        model: "",
        year: "",
        version: "Standard",
        km: "",
        color: "",
        transmission: "AUTOMATIC",
        fuel: "GASOLINE"
    });
    const [docs, setDocs] = useState<Record<string, string>>({});

    const steps = [
        { id: 1, title: "Clasificación" },
        { id: 2, title: "Detalles" },
        { id: 3, title: "Papelería" },
        { id: 4, title: "Revisión" }
    ];

    const canGoNext = () => {
        if (step === 1) return !!category;
        if (step === 2) return vehicleData.make && vehicleData.model && vehicleData.year && vehicleData.km;
        if (step === 3) {
            if (isAdminMode) return true; // Bypass for testing/admin
            const config = VEHICLE_CATEGORIES.find(c => c.id === category);
            if (!config) return false;
            return config.documents.every(docId => !!docs[docId]);
        }
        return true;
    };

    const handleNext = () => {
        if (canGoNext()) {
            if (step < 4) {
                setStep(step + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                handleComplete();
            }
        } else {
            toast.error("Por favor completa los campos requeridos");
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleComplete = async () => {
        setLoading(true);
        try {
            // Simulate API logic or Prepare data for Onboarding (Step 4)
            // Redirect to onboarding with the data
            const params = new URLSearchParams({
                category: category || '',
                make: vehicleData.make,
                model: vehicleData.model,
                year: vehicleData.year,
                km: vehicleData.km,
                admin: isAdminMode ? 'true' : 'false'
            });
            
            toast.success("Información guardada. Vamos a agendar tu revisión.");
            router.push(`/sell/onboarding?${params.toString()}`);
        } catch (e) {
            toast.error("Error al procesar la solicitud");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            {/* Multi-step indicator */}
            <div className="flex items-center justify-between mb-12 relative lg:px-20">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-zinc-200 dark:bg-zinc-800 -translate-y-1/2 z-0" />
                {steps.map((s) => (
                    <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
                        <div className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center font-black text-sm transition-all duration-500",
                            step >= s.id 
                                ? "bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-500/20" 
                                : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500"
                        )}>
                            {step > s.id ? <CheckCircle2 className="h-5 w-5" /> : s.id}
                        </div>
                        <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest hidden md:block",
                            step >= s.id ? "text-indigo-600" : "text-zinc-400"
                        )}>
                            {s.title}
                        </span>
                    </div>
                ))}
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                {step === 1 && (
                    <VehicleTypeSelector 
                        selected={category} 
                        onSelect={(cat) => {
                            setCategory(cat);
                            setTimeout(() => setStep(2), 600);
                        }} 
                    />
                )}
                {step === 2 && (
                    <VehicleDataForm 
                        data={vehicleData} 
                        onChange={setVehicleData} 
                    />
                )}
                {step === 3 && category && (
                    <DynamicDocumentList 
                        categoryId={category} 
                        uploadedDocs={docs} 
                        onUpload={(id, url) => setDocs(prev => ({ ...prev, [id]: url }))} 
                    />
                )}
                {step === 4 && (
                    <div className="text-center space-y-8 animate-in zoom-in-95 duration-500">
                        <div className="h-24 w-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShieldCheck className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black text-zinc-900 dark:text-white">¡Todo en Orden!</h2>
                            <p className="text-zinc-500 max-w-sm mx-auto">
                                Hemos validado los archivos. El siguiente paso es agendar la revisión física de 150 puntos en un Taller Aliado.
                            </p>
                        </div>
                        <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 text-left max-w-md mx-auto space-y-3">
                            <div className="flex justify-between">
                                <span className="text-xs text-zinc-500 font-bold uppercase">Vehículo:</span>
                                <span className="text-sm font-black italic">{vehicleData.make} {vehicleData.model} {vehicleData.year}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-xs text-zinc-500 font-bold uppercase">Categoría:</span>
                                <span className="text-sm font-black text-indigo-600">{VEHICLE_CATEGORIES.find(c => c.id === category)?.title}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-xs text-zinc-500 font-bold uppercase">Documentos:</span>
                                <span className="text-sm font-black text-emerald-600">Completo ({Object.keys(docs).length})</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation Buttons */}
            <div className="mt-16 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-8">
                <Button
                    variant="ghost"
                    onClick={handleBack}
                    disabled={step === 1 || loading}
                    className="rounded-xl font-bold gap-2 text-zinc-500"
                >
                    <ArrowLeft className="h-4 w-4" /> Atrás
                </Button>

                {(step > 1 || category) && (
                    <Button
                        onClick={handleNext}
                        disabled={loading || !canGoNext()}
                        className="rounded-2xl h-14 px-10 font-black text-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/20 group transition-all"
                    >
                        {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                            <>
                                {step === 4 ? "Agendar Inspección" : "Continuar"}
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </Button>
                )}
            </div>
            
            {isAdminMode && (
                <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-900/30">
                    <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase text-center tracking-widest">
                        ⚠️ MODO AGENTE ACTIVO: Saltando validaciones de usuario vendedor para alta directa.
                    </p>
                </div>
            )}
        </div>
    );
}
