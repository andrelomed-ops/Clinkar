
"use client";

import { useState, useEffect } from "react";
import { OperationTracker, TrackerStep } from "@/components/dashboard/OperationTracker";
import { ShieldCheck, CheckCircle2, FileCheck, Wrench } from "lucide-react";

export function HeroTrackerDemo() {
    const [activeStep, setActiveStep] = useState(0);

    const steps: TrackerStep[] = [
        { id: '1', label: 'Revisión Mecánica', status: 'PENDING', note: '150 Puntos de Inspección.' },
        { id: '2', label: 'Validación Legal', status: 'PENDING', note: 'Sin reporte de robo/multas.' },
        { id: '3', label: 'Contrato Blindado', status: 'PENDING', note: 'Firma digital certificada.' },
        { id: '4', label: 'Liberación de Fondos', status: 'PENDING' }
    ];


    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep((prev) => {
                const next = (prev + 1) % (steps.length + 3); // Longer pause
                return next;
            });
        }, 1500);

        return () => clearInterval(interval);
    }, []);

    const currentSteps = steps.map((step, index) => {
        if (index < activeStep) return { ...step, status: 'COMPLETED' as const };
        if (index === activeStep) return { ...step, status: 'CURRENT' as const };
        return { ...step, status: 'PENDING' as const };
    });

    return (
        <div className="relative group">
            {/* Card Container: Minimalist "Document" Look */}
            <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-2xl shadow-sm transition-all duration-500">

                {/* Header: Institutional & Clean */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-12 w-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-zinc-900 dark:text-white tracking-tight">Protocolo de Seguridad</h3>
                        <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">ID: CLK-SECURE-99</p>
                    </div>
                    <div className="ml-auto">
                        <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                    </div>
                </div>

                {/* The Tracker: Overriding styles for pure monochrome */}
                <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-[11px] before:w-[1px] before:bg-zinc-200 dark:before:bg-zinc-800 before:content-[''] pl-1">
                    {currentSteps.map((step, index) => (
                        <div key={step.id} className="relative pl-8">
                            {/* Dot */}
                            <div className={`absolute left-0 top-1 h-6 w-6 rounded-full border flex items-center justify-center z-10 bg-white dark:bg-zinc-900 transition-colors duration-300 ${step.status === 'COMPLETED' ? 'border-zinc-900 dark:border-white text-zinc-900 dark:text-white' :
                                step.status === 'CURRENT' ? 'border-zinc-900 dark:border-white text-zinc-900 dark:text-white' :
                                    'border-zinc-200 dark:border-zinc-800 text-zinc-200 dark:text-zinc-800'
                                }`}>
                                {step.status === 'COMPLETED' && <CheckCircle2 className="h-3 w-3" />}
                                {step.status === 'CURRENT' && <div className="h-2 w-2 bg-zinc-900 dark:bg-white rounded-full animate-pulse" />}
                            </div>

                            {/* Text */}
                            <div>
                                <p className={`text-sm font-bold transition-colors duration-300 ${step.status === 'PENDING' ? 'text-zinc-300 dark:text-zinc-700' : 'text-zinc-900 dark:text-white'
                                    }`}>
                                    {step.label}
                                </p>
                                {step.note && (
                                    <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1 font-medium">
                                        {step.note}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Status */}
                <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-zinc-400" />
                        <span className="text-xs font-semibold text-zinc-400">Taller Certificado</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FileCheck className="h-4 w-4 text-zinc-400" />
                        <span className="text-xs font-semibold text-zinc-400">Firma Certificada</span>
                    </div>
                </div>

            </div>

            {/* Minimal Shadow, no glow */}
            <div className="absolute inset-0 rounded-2xl shadow-2xl shadow-zinc-200/50 dark:shadow-zinc-950/50 -z-10 translate-y-4" />
        </div>
    );
}
