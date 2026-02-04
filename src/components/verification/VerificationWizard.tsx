"use client";

import { useState } from "react";
import { ShieldCheck, Upload, Camera, CheckCircle2, ChevronRight, Lock, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";
import { createBrowserClient } from "@/lib/supabase/client";

export function VerificationWizard() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState<{ ineFront?: File, ineBack?: File, selfie?: File }>({});
    const supabase = createBrowserClient();

    const handleFileUpload = (type: 'ineFront' | 'ineBack' | 'selfie', event: any) => {
        const file = event.target.files[0];
        if (file) {
            setFiles(prev => ({ ...prev, [type]: file }));
            toast.success("Documento cargado correctamente");
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        // INFO: Here we would upload to storage bucket
        // For demo: Simulate delay and update profile
        await new Promise(resolve => setTimeout(resolve, 2000));

        toast.success("Identidad enviada a verificación. ¡Gracias!");
        setStep(4); // Success screen
        setLoading(false);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">

            {/* Progress Steps */}
            <div className="flex items-center justify-center space-x-4 mb-8">
                {[1, 2, 3].map((num) => (
                    <div key={num} className="flex items-center">
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors",
                            step >= num ? "bg-indigo-600 text-white" : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800"
                        )}>
                            {step > num ? <CheckCircle2 className="h-5 w-5" /> : num}
                        </div>
                        {num < 3 && <div className={cn("w-12 h-0.5 mx-2", step > num ? "bg-indigo-600" : "bg-zinc-100")} />}
                    </div>
                ))}
            </div>

            <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-card">
                <div className="p-8 md:p-12">

                    {/* STEP 1: EXPLANATION (The "Soft Touch") */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <div className="h-16 w-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-4">
                                <ShieldCheck className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h2 className="text-3xl font-black tracking-tight text-foreground">
                                Blindemos tu Transacción
                            </h2>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Para garantizar que cada peso esté protegido en nuestra Bóveda, necesitamos validar que eres realmente tú.
                                <br /><br />
                                <span className="font-bold text-foreground">¿Por qué hacemos esto?</span>
                                <ul className="list-disc pl-5 mt-2 space-y-1 text-base">
                                    <li>Evita suplantación de identidad (fraude).</li>
                                    <li>Cumple con normativas financieras para montos altos.</li>
                                    <li>Te otorga la insignia de <span className="text-indigo-500 font-bold">Vendedor Verificado</span>.</li>
                                </ul>
                            </p>
                            <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/20 flex items-start gap-3">
                                <Lock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-amber-800 dark:text-amber-200">
                                    Tus datos son encriptados nivel bancario (AES-256) y solo se usan para esta validación legal. Jamás se comparten con terceros ni con el comprador.
                                </p>
                            </div>
                            <Button
                                onClick={() => setStep(2)}
                                className="w-full h-14 text-lg font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 mt-4"
                            >
                                Entendido, Iniciemos
                                <ChevronRight className="ml-2 h-5 w-5" />
                            </Button>
                        </div>
                    )}

                    {/* STEP 2: DOCUMENTS */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <h2 className="text-2xl font-bold text-foreground">Identificación Oficial</h2>
                            <p className="text-muted-foreground">Sube una foto clara de tu INE o Pasaporte vigente.</p>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Front */}
                                <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-2xl p-6 text-center hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors relative">
                                    <input type="file" onChange={(e) => handleFileUpload('ineFront', e)} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*,.pdf" />
                                    {files.ineFront ? (
                                        <div className="flex flex-col items-center text-emerald-600">
                                            <CheckCircle2 className="h-10 w-10 mb-2" />
                                            <span className="font-bold text-sm">{files.ineFront.name}</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="h-12 w-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <Upload className="h-6 w-6 text-zinc-400" />
                                            </div>
                                            <p className="font-bold text-sm">Frente del INE</p>
                                            <p className="text-xs text-muted-foreground mt-1">Click para subir</p>
                                        </>
                                    )}
                                </div>
                                {/* Back */}
                                <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-2xl p-6 text-center hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors relative">
                                    <input type="file" onChange={(e) => handleFileUpload('ineBack', e)} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*,.pdf" />
                                    {files.ineBack ? (
                                        <div className="flex flex-col items-center text-emerald-600">
                                            <CheckCircle2 className="h-10 w-10 mb-2" />
                                            <span className="font-bold text-sm">{files.ineBack.name}</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="h-12 w-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <Upload className="h-6 w-6 text-zinc-400" />
                                            </div>
                                            <p className="font-bold text-sm">Reverso del INE</p>
                                            <p className="text-xs text-muted-foreground mt-1">Click para subir</p>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <Button variant="ghost" onClick={() => setStep(1)}>Atrás</Button>
                                <Button
                                    onClick={() => setStep(3)}
                                    disabled={!files.ineFront || !files.ineBack}
                                    className="flex-1 font-bold bg-indigo-600"
                                >
                                    Siguiente paso
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: LIVENESS */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <h2 className="text-2xl font-bold text-foreground">Confirmación de Identidad</h2>
                            <p className="text-muted-foreground">Tómate una selfie rápida para verificar que coincide con tu documento.</p>

                            <div className="bg-black/5 dark:bg-white/5 rounded-3xl aspect-video flex items-center justify-center relative overflow-hidden border border-border">
                                {files.selfie ? (
                                    <img src={URL.createObjectURL(files.selfie)} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center">
                                        <Camera className="h-12 w-12 text-zinc-300 mx-auto mb-2" />
                                        <p className="text-sm text-zinc-400">Cámara Inactiva (Demo)</p>
                                    </div>
                                )}
                                <input type="file" onChange={(e) => handleFileUpload('selfie', e)} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                            </div>

                            <p className="text-xs text-center text-muted-foreground">
                                Asegúrate de tener buena iluminación y no usar lentes oscuros.
                            </p>

                            <div className="flex gap-4 pt-4">
                                <Button variant="ghost" onClick={() => setStep(2)}>Atrás</Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!files.selfie || loading}
                                    className="flex-1 font-bold bg-emerald-600 hover:bg-emerald-500 h-12"
                                >
                                    {loading ? "Verificando..." : "Finalizar Verificación"}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* SUCCESS */}
                    {step === 4 && (
                        <div className="text-center space-y-6 animate-in zoom-in-50 duration-500">
                            <div className="h-24 w-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                <UserCheck className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h2 className="text-3xl font-black text-foreground">¡Documentos Recibidos!</h2>
                            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                                Nuestro sistema está validando tu identidad. Esto usualmente toma menos de 10 minutos.
                                <br />Te notificaremos en cuanto tu cuenta esté <span className="text-emerald-600 font-bold">100% Verificada</span>.
                            </p>
                            <Link href="/dashboard">
                                <Button className="mt-8 px-8 h-12 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-black font-bold">
                                    Volver al Dashboard
                                </Button>
                            </Link>
                        </div>
                    )}

                </div>
            </Card>
        </div>
    );
}
