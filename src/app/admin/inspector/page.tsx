"use client";

import { useState } from "react";
import { Camera, CheckCircle2, AlertTriangle, FileText, Smartphone, UploadCloud, ChevronRight, Sparkles, Loader2 } from "lucide-react";
import { CameraUpload } from "@/components/ui/CameraUpload";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function InspectorTool() {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [vin, setVin] = useState("");
    const [isExtracting, setIsExtracting] = useState(false);
    const [aiSuggestedVin, setAiSuggestedVin] = useState<string | null>(null);

    const handleVinPhoto = (url: string) => {
        setIsExtracting(true);
        // Simulate AI Vision extracting VIN from photo
        setTimeout(() => {
            setAiSuggestedVin("1N4AL3AP5KC123456");
            setIsExtracting(false);
        }, 1500);
    };

    return (
        <div className="max-w-2xl mx-auto py-10 px-4">
            <header className="mb-8 text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                    <Smartphone className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-3xl font-black tracking-tight mb-2">Inspector App</h1>
                <p className="text-muted-foreground">Protocolo de Certificación Clinkar v2.4</p>
            </header>

            {/* Stepper */}
            <div className="flex items-center gap-2 mb-10">
                {[1, 2, 3].map((s) => (
                    <div key={s} className={cn("h-1.5 flex-1 rounded-full transition-all duration-500", step >= s ? "bg-primary" : "bg-muted")} />
                ))}
            </div>

            <div className="glass-card rounded-[2.5rem] p-8">
                {step === 1 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold">1. Identificación del Activo</h2>
                            <p className="text-sm text-muted-foreground">Captura el VIN y el kilometraje actual.</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-4">
                                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                                    VIN (Número de Serie)
                                </label>

                                {!aiSuggestedVin && !isExtracting ? (
                                    <CameraUpload
                                        onUpload={handleVinPhoto}
                                        label=""
                                        description="Toma una foto clara a la placa del VIN o al tablero"
                                    />
                                ) : isExtracting ? (
                                    <div className="h-[180px] rounded-3xl border-2 border-dashed border-primary/30 flex flex-col items-center justify-center gap-3 bg-primary/5">
                                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                                        <p className="text-sm font-bold text-primary animate-pulse">AI Extrayendo datos...</p>
                                    </div>
                                ) : (
                                    <div className="p-6 rounded-3xl bg-primary/5 border border-primary/20 space-y-4 animate-in zoom-in-95">
                                        <div className="flex items-center gap-3 text-primary">
                                            <Sparkles className="h-5 w-5" />
                                            <span className="text-sm font-black uppercase tracking-tight">Sugerencia AI</span>
                                        </div>
                                        <input
                                            type="text"
                                            value={vin || aiSuggestedVin || ""}
                                            onChange={(e) => setVin(e.target.value)}
                                            className="w-full bg-background border border-border rounded-xl px-4 h-14 text-xl font-mono font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                        />
                                        <p className="text-xs text-muted-foreground italic">
                                            * Por favor, verifica que el número coincida exactamente con la foto.
                                        </p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full text-xs font-bold"
                                            onClick={() => { setAiSuggestedVin(null); setVin(""); }}
                                        >
                                            Re-escanear
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                                    Odómetro (km)
                                </label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    className="w-full bg-secondary border border-border rounded-xl px-4 h-14 text-lg font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                            </div>
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            disabled={!vin && !aiSuggestedVin}
                            className="w-full h-14 bg-primary text-primary-foreground font-black rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                        >
                            Continuar al Checklist
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold">2. Checklist 150 Puntos</h2>
                            <p className="text-sm text-muted-foreground">Verifica cada sistema con rigor técnico.</p>
                        </div>

                        <div className="space-y-3">
                            {["Motor y Transmisión", "Sistema Eléctrico", "Suspensión y Frenos", "Interiores", "Carrocería"].map((cat) => (
                                <div key={cat} className="flex items-center justify-between p-5 bg-secondary/50 rounded-2xl border border-border group hover:border-primary/30 transition-all cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center border border-border group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <span className="font-bold">{cat}</span>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                </div>
                            ))}
                        </div>

                        <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />
                            <p className="text-xs font-bold text-yellow-700 dark:text-yellow-400">
                                Todas las categorías deben estar marcadas como "Aprobado" o "Con Observaciones" para proceder.
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-14 rounded-2xl font-bold">
                                Atrás
                            </Button>
                            <button onClick={() => setStep(3)} className="flex-[2] h-14 bg-primary text-primary-foreground font-black rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-primary/20">
                                Continuar a Fotos
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold">3. Evidencia Digital</h2>
                            <p className="text-sm text-muted-foreground">Sube fotos detalladas del estado general.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <CameraUpload onUpload={() => { }} label="Frente y Lado Izquierdo" />
                            <CameraUpload onUpload={() => { }} label="Atrás y Lado Derecho" />
                            <CameraUpload onUpload={() => { }} label="Interior y Tablero" />
                        </div>

                        <div className="flex gap-4">
                            <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-14 rounded-2xl font-bold">
                                Atrás
                            </Button>
                            <button
                                onClick={() => {
                                    setIsSubmitting(true);
                                    setTimeout(() => {
                                        setIsSubmitting(false);
                                        setStep(1);
                                        setAiSuggestedVin(null);
                                        setVin("");
                                    }, 2000);
                                }}
                                disabled={isSubmitting}
                                className="flex-[2] h-14 bg-green-600 text-white font-black rounded-2xl hover:bg-green-500 transition-all shadow-xl shadow-green-900/20 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle2 className="h-5 w-5" />
                                        Certificar Activo
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function AlertCircle(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
        </svg>
    )
}
