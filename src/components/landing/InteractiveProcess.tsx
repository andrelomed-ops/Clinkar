"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Wrench, ShieldCheck, FileCheck, ChevronRight, UserPlus, Search, CheckCircle2, ShieldAlert } from "lucide-react";

const STEPS = [
    {
        id: "01",
        title: "EL PRECIO JUSTO",
        description: "Revisamos el valor de mercado para que vendas o compres al mejor precio, sin regateos innecesarios. Tú eliges el monto final de publicación.",
        icon: Search,
        color: "bg-blue-600",
        shadow: "shadow-blue-600/20",
        details: [
            "Valuación sugerida profesional",
            "Tú decides el precio final",
            "Publicación en StarterKar"
        ]
    },
    {
        id: "02",
        title: "CHEQUEO MAESTRO",
        description: "Nuestros mecánicos revisan 150 puntos clave de pies a cabeza. Solo publicamos autos que pasan la prueba con su certificado de confianza.",
        icon: Wrench,
        color: "bg-indigo-600",
        shadow: "shadow-indigo-600/20",
        details: [
            "Visita de mecánico experto",
            "Revisión de 150 puntos críticos",
            "Certificado de confianza StarterKar"
        ]
    },
    {
        id: "03",
        title: "TRATO SEGURO",
        description: "Validamos que los pagos se realicen correctamente (SPEI, CoDi o Conekta). Tu dinero no se mueve hasta que confirmas que el auto está en tus manos.",
        icon: FileCheck,
        color: "bg-emerald-600",
        shadow: "shadow-emerald-600/20",
        details: [
            "Validación de pago garantizada",
            "Acompañamiento en todo el proceso",
            "Entrega y firma digital segura"
        ]
    }
];

export function InteractiveProcess() {
    const [activeStep, setActiveStep] = useState(0);

    return (
        <section id="how-it-works" className="py-32 bg-background relative overflow-hidden border-t border-border">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

            <div className="mx-auto max-w-7xl px-6 relative z-10">
                <div className="text-center space-y-4 mb-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Protocolo de Seguridad
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic">
                        EL PROCESO <span className="text-indigo-600">STARTERKAR</span>
                    </h2>
                    <p className="text-muted-foreground font-medium max-w-xl mx-auto text-lg leading-relaxed">
                        Entiende cómo protegemos cada peso y cada tornillo en tu transacción.
                    </p>
                </div>

                <div className="grid lg:grid-cols-12 gap-12 items-start">
                    {/* Navigation Steps */}
                    <div className="lg:col-span-5 space-y-4">
                        {STEPS.map((step, idx) => (
                            <button
                                key={step.id}
                                onClick={() => setActiveStep(idx)}
                                className={cn(
                                    "w-full text-left p-8 rounded-[2.5rem] border-2 transition-all duration-500 group relative overflow-hidden",
                                    activeStep === idx 
                                        ? "bg-white dark:bg-zinc-900 border-indigo-600 shadow-2xl shadow-indigo-600/10" 
                                        : "bg-transparent border-transparent hover:bg-secondary/50 opacity-60 hover:opacity-100"
                                )}
                            >
                                {activeStep === idx && (
                                    <div className="absolute top-0 right-0 p-4">
                                        <div className="h-2 w-2 rounded-full bg-indigo-600 animate-ping" />
                                    </div>
                                )}
                                <div className="flex items-center gap-6">
                                    <span className={cn(
                                        "text-4xl font-black italic tracking-tighter",
                                        activeStep === idx ? "text-indigo-600" : "text-muted-foreground/30"
                                    )}>
                                        {step.id}
                                    </span>
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black tracking-tight uppercase group-hover:translate-x-1 transition-transform">
                                            {step.title}
                                        </h3>
                                        {activeStep === idx && (
                                            <p className="text-sm font-medium text-muted-foreground animate-in fade-in slide-in-from-left-4 duration-500">
                                                Seleccionado para inspección
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Active Step Detail */}
                    <div className="lg:col-span-7 h-full">
                        <div className="glass-card h-full min-h-[500px] rounded-[3rem] p-10 md:p-16 border-indigo-500/10 shadow-2xl relative overflow-hidden flex flex-col justify-center animate-in fade-in zoom-in duration-700">
                            {/* Decorative background for card */}
                            <div className={cn(
                                "absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[100px] opacity-20 transition-colors duration-1000",
                                STEPS[activeStep].color
                            )} />

                            <div className="relative z-10 space-y-8">
                                <div className={cn(
                                    "h-20 w-20 rounded-3xl flex items-center justify-center text-white shadow-2xl transition-all duration-500",
                                    STEPS[activeStep].color,
                                    STEPS[activeStep].shadow
                                )}>
                                    {(() => {
                                        const Icon = STEPS[activeStep].icon;
                                        return <Icon className="h-10 w-10" />;
                                    })()}
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-4xl md:text-5xl font-black tracking-tighter leading-none uppercase italic">
                                        {STEPS[activeStep].title}
                                    </h3>
                                    <p className="text-xl text-muted-foreground font-medium leading-relaxed">
                                        {STEPS[activeStep].description}
                                    </p>
                                </div>

                                <div className="grid sm:grid-cols-1 gap-4 pt-8">
                                    {STEPS[activeStep].details.map((detail, i) => (
                                        <div 
                                            key={i} 
                                            className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/50 border border-border/50 animate-in fade-in slide-in-from-bottom-4 duration-500"
                                            style={{ animationDelay: `${i * 100}ms` }}
                                        >
                                            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                                            <span className="font-bold text-zinc-700 dark:text-zinc-300">{detail}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-8">
                                    <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-indigo-500 group cursor-pointer">
                                        Saber más sobre este paso
                                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
