
"use client";

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, MapPin, Calendar, User, Truck, ShieldCheck } from 'lucide-react';
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const OnboardingContent = () => {
    const searchParams = useSearchParams();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Data from Query
    const carData = {
        year: searchParams.get('year') || '2022',
        make: searchParams.get('make') || 'Vehículo',
        model: searchParams.get('model') || '',
        priceMin: parseInt(searchParams.get('min') || '0'),
        priceMax: parseInt(searchParams.get('max') || '0'),
    };

    const handleNext = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setStep(s => s + 1);
        }, 800);
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans selection:bg-indigo-500/30">
            {/* Navbar */}
            <nav className="fixed top-0 z-50 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
                <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
                    <Link href="/sell" className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="font-semibold text-sm">Atrás</span>
                    </Link>
                    <span className="font-bold text-lg tracking-tight">Registro de Venta</span>
                    <ThemeToggle />
                </div>
            </nav>

            <main className="pt-24 pb-20 px-6">
                <div className="mx-auto max-w-2xl">

                    {/* Progress Bar */}
                    <div className="flex items-center justify-between mb-8 px-2 relative">
                        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-zinc-200 dark:bg-zinc-800 -z-10" />
                        {[1, 2, 3].map((s) => (
                            <div key={s} className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-500 ${step >= s ? 'bg-indigo-600 text-white scale-110' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400'}`}>
                                {step > s ? <CheckCircle2 className="h-5 w-5" /> : s}
                            </div>
                        ))}
                    </div>

                    {/* Summary Card */}
                    {step < 4 && (
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 mb-8 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Tu Vehículo</p>
                                <h3 className="font-bold text-lg">{carData.year} {carData.make} {carData.model}</h3>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Oferta Preliminar</p>
                                <div className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-lg">
                                    ${carData.priceMin.toLocaleString('es-MX')} - ${carData.priceMax.toLocaleString('es-MX')}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Steps */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xl transition-all">

                        {step === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                                <div className="text-center mb-8">
                                    <div className="h-14 w-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
                                        <User className="h-7 w-7" />
                                    </div>
                                    <h2 className="text-2xl font-black">¿A quién contactamos?</h2>
                                    <p className="text-zinc-500">Para enviarte la oferta formal.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-zinc-500 uppercase">Nombre</label>
                                            <input type="text" className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl h-12 px-4 font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-zinc-500 uppercase">Apellido</label>
                                            <input type="text" className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl h-12 px-4 font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase">Whatsapp / Teléfono</label>
                                        <input type="tel" className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl h-12 px-4 font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase">Correo Electrónico</label>
                                        <input type="email" className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl h-12 px-4 font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                                    </div>
                                </div>

                                <button onClick={handleNext} className="w-full h-14 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold text-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors mt-4">
                                    {isLoading ? "Guardando..." : "Siguiente"}
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                                <div className="text-center mb-8">
                                    <div className="h-14 w-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
                                        <MapPin className="h-7 w-7" />
                                    </div>
                                    <h2 className="text-2xl font-black">¿Dónde está el auto?</h2>
                                    <p className="text-zinc-500">Agenda tu cita en nuestros centros certificados.</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-zinc-500 uppercase">Selecciona un Taller Clinkar</label>
                                        <div className="grid gap-3">
                                            {["Clinkar Center - Polanco", "Clinkar Center - Santa Fe", "Clinkar Center - Del Valle"].map((shop) => (
                                                <div key={shop} className="flex items-center gap-3 p-4 rounded-xl border-2 border-zinc-100 dark:border-zinc-800 hover:border-indigo-500 cursor-pointer transition-colors group">
                                                    <div className="h-4 w-4 rounded-full border-2 border-zinc-300 dark:border-zinc-600 group-hover:border-indigo-500" />
                                                    <span className="font-bold">{shop}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                        <div className="flex items-start gap-3">
                                            <input type="checkbox" className="mt-1 h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500" id="cantMove" />
                                            <div>
                                                <label htmlFor="cantMove" className="font-bold text-sm block cursor-pointer">Mi auto no puede circular</label>
                                                <p className="text-xs text-zinc-500">Solicitar inspección a domicilio (Costo adicional puede aplicar).</p>
                                            </div>
                                        </div>

                                        {/* Optional Address Fields could go here if state was managed, 
                                            but for V1 visual mock, we keep it simple or expand if checked. 
                                            For now, we assume workshop choice is the primary flow. */}
                                    </div>
                                </div>

                                <button onClick={handleNext} className="w-full h-14 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold text-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors mt-4">
                                    {isLoading ? "Validando Disponibilidad..." : "Siguiente"}
                                </button>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                                <div className="text-center mb-8">
                                    <div className="h-14 w-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
                                        <Calendar className="h-7 w-7" />
                                    </div>
                                    <h2 className="text-2xl font-black">Agenda tu Cita</h2>
                                    <p className="text-zinc-500">Elige fecha y hora para la inspección mecánica.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    {[0, 1, 2, 3].map((d) => {
                                        const date = new Date();
                                        date.setDate(date.getDate() + d + 1);
                                        return (
                                            <button key={d} className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-zinc-100 dark:border-zinc-800 hover:border-indigo-500 focus:border-indigo-600 focus:bg-indigo-50 dark:focus:bg-indigo-950 transition-all">
                                                <span className="text-xs font-bold uppercase text-zinc-500">{date.toLocaleDateString('es-MX', { weekday: 'short' })}</span>
                                                <span className="text-xl font-black">{date.getDate()}</span>
                                            </button>
                                        )
                                    })}
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-bold text-zinc-500 uppercase">Horario Preferido</label>
                                    <select className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl h-12 px-4 font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                                        <option>09:00 AM - 11:00 AM</option>
                                        <option>11:00 AM - 01:00 PM</option>
                                        <option>03:00 PM - 05:00 PM</option>
                                    </select>
                                </div>

                                <button onClick={handleNext} className="w-full h-14 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30 mt-4">
                                    {isLoading ? "Agendando..." : "Confirmar Cita"}
                                </button>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="text-center space-y-8 animate-in zoom-in duration-500 py-8">
                                <div className="inline-flex items-center justify-center p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-600 mb-2">
                                    <ShieldCheck className="h-12 w-12" />
                                </div>

                                <div>
                                    <h2 className="text-4xl font-black mb-4">¡Cita Confirmada!</h2>
                                    <p className="text-lg text-zinc-500 max-w-sm mx-auto leading-relaxed">
                                        Te esperamos en el Taller Clinkar seleccionado.
                                    </p>
                                </div>

                                <div className="bg-zinc-50 dark:bg-zinc-800 p-6 rounded-2xl max-w-sm mx-auto text-left space-y-4 border border-zinc-200 dark:border-zinc-700">
                                    <div className="flex items-start gap-4">
                                        <Truck className="h-6 w-6 text-indigo-500 mt-1" />
                                        <div>
                                            <p className="font-bold text-sm">Clinkar Center - Polanco</p>
                                            <p className="text-zinc-500 text-sm">Av. Horacio 1500, Polanco III Secc</p>
                                        </div>
                                    </div>
                                    <div className="h-px bg-zinc-200 dark:bg-zinc-700" />
                                    <p className="text-xs text-center text-zinc-400">
                                        Recibirás un WhatsApp con la ubicación exacta.
                                    </p>
                                </div>

                                <Link href="/dashboard/sell" className="inline-block mt-8 text-indigo-600 hover:text-indigo-400 font-bold">
                                    Ir a mi Bóveda de Venta
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default function SellOnboardingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen grid place-items-center">Cargando...</div>}>
            <OnboardingContent />
        </Suspense>
    )
}
