"use client";

import React, { useState } from 'react';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/layout/Footer';
import {
    Check,
    X,
    Camera,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
    Flag,
    ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { QuotationBuilder } from '@/components/dashboard/QuotationBuilder';

// Definición ultra-simplificada de puntos de control
const PUNTOS_REVISION = [
    { id: '1', label: '¿El motor suena bien? (Sin ruidos extraños)', category: 'MOTOR' },
    { id: '2', label: '¿Nivel de aceite está correcto?', category: 'MOTOR' },
    { id: '3', label: '¿Hay fugas de líquidos visibles?', category: 'MOTOR' },
    { id: '4', label: '¿Frenos responden con firmeza?', category: 'FRENOS' },
    { id: '5', label: '¿Llantas tienen buena vida?', category: 'LLANTAS' },
    { id: '6', label: '¿Luces y faros funcionan?', category: 'ELÉCTRICO' },
    { id: '7', label: '¿Aire acondicionado enfría?', category: 'INTERIOR' },
    { id: '8', label: '¿Pintura sin golpes graves?', category: 'EXTERIOR' }
];

export default function SimpleInspectionPage({ params }: { params: { carId: string } }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, { status: 'pass' | 'fail', photo?: boolean }>>({});
    const [isFinished, setIsFinished] = useState(false);
    const [showQuotation, setShowQuotation] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const step = PUNTOS_REVISION[currentStep];
    const totalSteps = PUNTOS_REVISION.length;

    const handleAnswer = (status: 'pass' | 'fail') => {
        setAnswers(prev => ({
            ...prev,
            [step.id]: { status }
        }));

        if (currentStep < totalSteps - 1) {
            setTimeout(() => setCurrentStep(currentStep + 1), 300);
        } else {
            // Revisar si hubo fallas al terminar
            const hasFailures = [...Object.values(answers), { status }].some(a => a.status === 'fail');
            if (hasFailures) {
                setShowQuotation(true);
            } else {
                setIsFinished(true);
            }
        }
    };

    const goBack = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    const handleFinalSubmit = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            toast.success("¡Revisión enviada con éxito!");
            window.location.href = '/inspector'; // Redirección simple
        }, 2000);
    };

    if (showQuotation) {
        const failedForQuote = Object.entries(answers)
            .filter(([_, val]) => val.status === 'fail')
            .map(([id, _]) => {
                const item = PUNTOS_REVISION.find(p => p.id === id);
                return { id, label: item?.label || id };
            });

        return (
            <div className="min-h-screen bg-[#F8FAFC] dark:bg-zinc-950 flex flex-col p-6">
                <Navbar variant="default" />
                <main className="max-w-xl mx-auto w-full pt-10">
                    <QuotationBuilder
                        failedItems={failedForQuote}
                        onSave={(items) => {
                            setShowQuotation(false);
                            setIsFinished(true);
                        }}
                        onCancel={() => setShowQuotation(false)}
                    />
                </main>
            </div>
        );
    }

    if (isFinished) {
        const fallas = Object.values(answers).filter(a => a.status === 'fail').length;

        return (
            <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col items-center justify-center p-6">
                <div className="max-w-xl w-full text-center space-y-10 animate-reveal">
                    <div className="h-32 w-32 bg-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                        <Check className="h-16 w-16 text-white" />
                    </div>

                    <div>
                        <h1 className="text-5xl font-black tracking-tighter mb-4">REVISIÓN LISTA</h1>
                        <p className="text-2xl font-bold text-muted-foreground italic">
                            {fallas === 0
                                ? "¡Todo salió perfecto! El auto está aprobado."
                                : `Encontramos ${fallas} cosas por arreglar.`}
                        </p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Button
                            onClick={handleFinalSubmit}
                            disabled={isSaving}
                            className="h-24 w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] text-2xl font-black uppercase tracking-widest shadow-xl"
                        >
                            {isSaving ? "GUARDANDO..." : "ENVIAR REVISIÓN"}
                        </Button>
                        <button
                            onClick={() => setIsFinished(false)}
                            className="text-lg font-bold text-muted-foreground uppercase tracking-widest hover:text-foreground"
                        >
                            REVISAR RESPUESTAS
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-zinc-950 flex flex-col">
            <Navbar variant="default" />

            <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-4xl mx-auto w-full">

                {/* Indicador de categoría */}
                <div className="mb-4">
                    <span className="bg-zinc-200 dark:bg-zinc-800 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest">
                        {step.category}
                    </span>
                </div>

                {/* Pregunta Gigante */}
                <div className="w-full text-center mb-16 animate-reveal" key={step.id}>
                    <p className="text-sm font-black text-indigo-500 uppercase tracking-widest mb-4">
                        PASO {currentStep + 1} DE {totalSteps}
                    </p>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight balance">
                        {step.label}
                    </h2>
                </div>

                {/* Botones de Acción Gigantes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl px-4">
                    <button
                        onClick={() => handleAnswer('pass')}
                        className="h-40 md:h-56 bg-emerald-500 hover:bg-emerald-400 text-white rounded-[3rem] flex flex-col items-center justify-center gap-4 shadow-2xl shadow-emerald-500/20 transition-all active:scale-90 group"
                    >
                        <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-125 transition-transform">
                            <Check className="h-10 w-10 text-white" />
                        </div>
                        <span className="text-3xl font-black uppercase tracking-widest">SÍ / BIEN</span>
                    </button>

                    <button
                        onClick={() => handleAnswer('fail')}
                        className="h-40 md:h-56 bg-rose-500 hover:bg-rose-400 text-white rounded-[3rem] flex flex-col items-center justify-center gap-4 shadow-2xl shadow-rose-500/20 transition-all active:scale-90 group"
                    >
                        <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-125 transition-transform">
                            <X className="h-10 w-10 text-white" />
                        </div>
                        <span className="text-3xl font-black uppercase tracking-widest">NO / FALLA</span>
                    </button>
                </div>

                {/* Botón Cámara (Solo si se necesita evidencia opcional) */}
                <button className="mt-12 flex items-center gap-3 text-muted-foreground hover:text-indigo-500 font-black uppercase tracking-widest text-sm transition-colors border-2 border-dashed border-zinc-300 dark:border-zinc-800 px-8 py-4 rounded-2xl">
                    <Camera className="h-5 w-5" />
                    TOMAR FOTO (OPCIONAL)
                </button>

                {/* Navegación Inferior */}
                <div className="mt-20 flex items-center gap-8">
                    <button
                        onClick={goBack}
                        disabled={currentStep === 0}
                        className="disabled:opacity-0 p-4 rounded-full bg-white dark:bg-zinc-900 border-2 border-border shadow-lg transition-all active:scale-75"
                    >
                        <ChevronLeft className="h-8 w-8 text-foreground" />
                    </button>

                    <div className="flex gap-2">
                        {PUNTOS_REVISION.map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "h-3 transition-all duration-300 rounded-full",
                                    i === currentStep ? "w-10 bg-indigo-500" : "w-3 bg-zinc-300 dark:bg-zinc-800"
                                )}
                            />
                        ))}
                    </div>

                    <button
                        onClick={() => handleAnswer(answers[step.id]?.status || 'pass')}
                        className="p-4 rounded-full bg-white dark:bg-zinc-900 border-2 border-border shadow-lg transition-all active:scale-75"
                    >
                        <ChevronRight className="h-8 w-8 text-foreground" />
                    </button>
                </div>
            </main>
        </div>
    );
}
