"use client";

import React from 'react';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/layout/Footer';
import {
    Car,
    ChevronRight,
    MapPin,
    Clock,
    User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Datos simplificados para el tablero
const LISTA_HOY = [
    {
        id: '1',
        auto: 'BMW M4 2022',
        vendedor: 'Carlos Pérez',
        hora: '10:00 AM',
        lugar: 'Santa Fe, CDMX',
        urgente: true
    },
    {
        id: '2',
        auto: 'Porsche 911 2021',
        vendedor: 'Ana García',
        hora: '02:30 PM',
        lugar: 'Interlomas, Edomex',
        urgente: false
    }
];

export default function InspectorDashboardPage() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-zinc-950 text-foreground flex flex-col">
            <Navbar variant="default" />

            <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-10">
                {/* Saludo y Fecha */}
                <div className="mb-10 text-center md:text-left">
                    <h1 className="text-4xl font-black tracking-tighter mb-2">
                        ¡Hola, <span className="text-indigo-600">Inspector!</span>
                    </h1>
                    <p className="text-xl font-bold text-muted-foreground italic">
                        Hoy tienes {LISTA_HOY.length} autos por revisar.
                    </p>
                </div>

                {/* Lista de Trabajo Gigante */}
                <div className="space-y-6">
                    <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-2">Mi Trabajo de Hoy</h2>

                    {LISTA_HOY.map((item, idx) => (
                        <div
                            key={item.id}
                            className={cn(
                                "group bg-white dark:bg-zinc-900 rounded-[2.5rem] border-4 p-8 shadow-2xl transition-all active:scale-95 animate-reveal",
                                item.urgente ? "border-indigo-500/20" : "border-transparent",
                                `stagger-${idx + 1}`
                            )}
                        >
                            <div className="flex flex-col md:flex-row items-center gap-8">
                                {/* Icono o Foto Gigante */}
                                <div className="h-40 w-full md:w-56 bg-zinc-100 dark:bg-zinc-800 rounded-[2rem] flex items-center justify-center border-2 border-dashed border-zinc-300 dark:border-zinc-700">
                                    <Car className="h-16 w-16 text-zinc-400 group-hover:scale-110 transition-transform duration-500" />
                                </div>

                                {/* Información Directa */}
                                <div className="flex-1 text-center md:text-left space-y-4">
                                    <div>
                                        {item.urgente && (
                                            <span className="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3 inline-block">
                                                🚨 Cita Prioritaria
                                            </span>
                                        )}
                                        <h3 className="text-3xl font-black tracking-tighter leading-tight">{item.auto}</h3>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-center md:justify-start gap-2 text-lg font-bold">
                                            <Clock className="h-5 w-5 text-indigo-500" />
                                            <span>{item.hora}</span>
                                        </div>
                                        <div className="flex items-center justify-center md:justify-start gap-2 text-lg font-bold text-muted-foreground">
                                            <User className="h-5 w-5" />
                                            <span>{item.vendedor}</span>
                                        </div>
                                        <div className="flex items-center justify-center md:justify-start gap-2 text-lg font-bold text-muted-foreground">
                                            <MapPin className="h-5 w-5" />
                                            <span>{item.lugar}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Botón Gigante */}
                                <Link
                                    href={`/inspector/report/${item.id}`}
                                    className="w-full md:w-auto h-24 px-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] flex items-center justify-center gap-4 text-xl font-black uppercase tracking-widest shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-90"
                                >
                                    EMPEZAR
                                    <ChevronRight className="h-8 w-8" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Ayuda Rápida */}
                <div className="mt-20 p-10 bg-indigo-50 dark:bg-indigo-900/10 rounded-[3rem] border-2 border-indigo-200 dark:border-indigo-500/20 text-center">
                    <p className="text-xl font-bold mb-4">¿Necesitas ayuda con la app?</p>
                    <button className="px-8 py-4 bg-white dark:bg-zinc-900 border-2 border-indigo-500 text-indigo-500 font-black rounded-2xl hover:scale-105 transition-all">
                        LLAMAR A SOPORTE
                    </button>
                    <p className="mt-4 text-sm font-bold text-muted-foreground uppercase tracking-widest">Atención 24/7 para mecánicos</p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
