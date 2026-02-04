"use client";

import { useState } from "react";
import { Shield, Send, CheckCircle2, AlertCircle, Info, Sparkles, Car } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReferralCertificate } from "./ReferralCertificate";

interface LeadCaptureModalProps {
    carName: string;
    agency: string;
    isOpen: boolean;
    onClose: () => void;
}

export function LeadCaptureModal({ carName, agency, isOpen, onClose }: LeadCaptureModalProps) {
    const [step, setStep] = useState(1);
    const [hasUsedCar, setHasUsedCar] = useState<boolean | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCertificate, setShowCertificate] = useState(false);
    const [folio] = useState(() => `CLK-${Math.random().toString(36).substring(7).toUpperCase()}`);

    const handleSubmit = () => {
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setStep(3);
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-background border border-border w-full max-w-xl rounded-[3rem] p-10 shadow-2xl relative animate-in zoom-in-95 duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 text-muted-foreground hover:text-foreground font-black text-xl"
                >
                    ✕
                </button>

                {step === 1 && (
                    <div className="space-y-8">
                        <div className="space-y-2">
                            <div className="h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4">
                                <Sparkles className="h-6 w-6 text-emerald-600" />
                            </div>
                            <h2 className="text-3xl font-black tracking-tight italic">Tu usado es tu enganche</h2>
                            <p className="text-muted-foreground font-medium">
                                En Clinkar, monetizamos tu auto actual al mejor precio para que estrenes tu <span className="text-foreground font-bold">{carName}</span> sin complicaciones.
                            </p>
                        </div>

                        <div className="bg-indigo-500/5 p-6 rounded-3xl border border-indigo-500/10 space-y-4">
                            <div className="flex items-center gap-2 text-indigo-600">
                                <Info className="h-4 w-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest italic">Puente Financiero Clinkar</span>
                            </div>
                            <p className="text-xs font-medium text-indigo-900/70 dark:text-indigo-300/70 leading-relaxed">
                                Nosotros gestionamos la venta de tu seminuevo. Mientras tanto, te vinculamos con <strong>{agency}</strong> como cliente VIP para que asegures el inventario de tu auto nuevo.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 gap-4">
                                <button
                                    onClick={() => { setHasUsedCar(true); setStep(2); }}
                                    className="h-20 rounded-2xl border-2 border-border hover:border-indigo-600 flex items-center px-6 gap-4 transition-all group"
                                >
                                    <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                                        <Car className="h-5 w-5 text-indigo-600 group-hover:text-white" />
                                    </div>
                                    <div className="text-left">
                                        <span className="block font-black text-sm uppercase leading-tight">Liquidar seminuevo para enganche</span>
                                        <span className="text-[10px] text-muted-foreground font-bold">Gestión de venta flash Clinkar</span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => { setHasUsedCar(false); setStep(2); }}
                                    className="h-20 rounded-2xl border-2 border-border hover:border-emerald-600 flex items-center px-6 gap-4 transition-all group"
                                >
                                    <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
                                        <Sparkles className="h-5 w-5 text-emerald-600 group-hover:text-white" />
                                    </div>
                                    <div className="text-left">
                                        <span className="block font-black text-sm uppercase leading-tight">Solicitar Financiamiento Flexible</span>
                                        <span className="text-[10px] text-muted-foreground font-bold">Sin enganche total de contado</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-8">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black tracking-tight italic">Referido VIP Clinkar</h2>
                            <p className="text-muted-foreground font-medium">
                                Generaremos un folio único para que <strong>{agency}</strong> te identifique como cliente de nuestra plataforma.
                            </p>
                        </div>

                        <div className="bg-secondary/30 rounded-3xl p-6 space-y-4 border border-border">
                            <div className="flex justify-between items-center text-sm font-bold">
                                <span className="text-muted-foreground">Tipo de Gestión</span>
                                <span className="text-indigo-600">{hasUsedCar ? "Bridge Trade-in" : "Partner Finance"}</span>
                            </div>
                            <div className="pt-4 border-t border-border">
                                <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                                    Al solicitar tu contacto VIP, Clinkar notificará a la agencia que eres un usuario verificado. Esto te da acceso a bonos exclusivos y atención prioritaria. Nosotros nos encargamos de vender tu auto actual sin que tengas que compartir reportes fuera de nuestra plataforma.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="w-full h-18 bg-indigo-600 text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                            >
                                {isSubmitting ? "Generando Folio..." : (
                                    <>
                                        Obtener mi Certificado VIP <Send className="h-5 w-5" />
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => setStep(1)}
                                className="w-full text-center text-sm font-bold text-muted-foreground hover:text-foreground"
                            >
                                Volver
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="py-8 text-center space-y-8 animate-in zoom-in-95 duration-500">
                        <div className="h-20 w-20 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 ring-4 ring-emerald-500/5">
                            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-3xl font-black tracking-tight italic uppercase">¡Folio Generado!</h2>
                            <p className="text-muted-foreground font-medium max-w-sm mx-auto">
                                Identifícate con este código en <strong>{agency}</strong> para activar tus beneficios.
                            </p>
                        </div>

                        <div className="relative group p-8 bg-zinc-950 rounded-[2.5rem] border border-zinc-800 shadow-2xl overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <Shield className="h-32 w-32" />
                            </div>
                            <div className="relative z-10 space-y-4">
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Referido Certificado</p>
                                <div className="text-5xl font-black text-white tracking-[0.1em] font-mono">
                                    {folio}
                                </div>
                                <p className="text-[10px] text-zinc-500 font-bold">VÁLIDO POR 72 HORAS EN AGENCIA</p>
                            </div>
                        </div>

                        <div className="p-5 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 text-left">
                            <p className="text-xs text-indigo-800 dark:text-indigo-300 leading-relaxed font-medium italic">
                                * Un asesor de Clinkar te llamará en breve para iniciar la valuación y venta flash de tu unidad actual, asegurando tu enganche.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setShowCertificate(true)}
                                className="h-16 bg-white text-zinc-950 border border-zinc-200 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-zinc-50 transition-all flex items-center justify-center gap-2"
                            >
                                <Shield className="h-4 w-4" /> Ver Certificado
                            </button>
                            <button
                                onClick={onClose}
                                className="h-16 bg-primary text-primary-foreground rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-center"
                            >
                                Volver al Catálogo
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showCertificate && (
                <ReferralCertificate
                    folio={folio}
                    customerName="Usuario Verificado"
                    targetCar={carName}
                    agency={agency}
                    onClose={() => setShowCertificate(false)}
                />
            )}
        </div>
    );
}
