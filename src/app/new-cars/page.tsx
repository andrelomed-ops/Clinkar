"use client";

import { useState, useMemo } from "react";
import { Sparkles, ArrowRight, Zap, ShieldCheck, ChevronRight, Star } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/ui/navbar";
import Image from "next/image";

const MOCK_NEW_CARS = [
    {
        id: "new-1",
        make: "Tesla",
        model: "Model 3 2026",
        price: 899900,
        agency: "Tesla México",
        image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=800",
        bonus: "Cargador Wallbox Incluido",
        tag: "100% Eléctrico"
    },
    {
        id: "new-2",
        make: "BMW",
        model: "Series 3 M Sport",
        price: 1150000,
        agency: "BMW Autowelt",
        image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800",
        bonus: "Mantenimiento 3 años inc.",
        tag: "Premium"
    },
    {
        id: "new-3",
        make: "Toyota",
        model: "Sienna Hybrid 2026",
        price: 920000,
        agency: "Toyota Polanco",
        image: "https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&q=80&w=800",
        bonus: "Seguro 1er año Gratis",
        tag: "Híbrido / Familiar"
    }
];

export default function NewCarsPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar variant="market" backHref="/" backLabel="Volver" />

            <main className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
                {/* Hero / Banner */}
                <div className="relative rounded-[3rem] overflow-hidden bg-zinc-950 p-12 mb-16 shadow-2xl">
                    <div className="absolute top-0 right-0 w-1/2 h-full opacity-30 select-none pointer-events-none">
                        <div className="absolute inset-0 bg-gradient-to-l from-indigo-500/20 to-transparent" />
                    </div>

                    <div className="relative z-10 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-6">
                            <Sparkles className="h-4 w-4 text-indigo-400" />
                            <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">Alianzas Estratégicas 2026</span>
                        </div>
                        <h1 className="text-5xl font-black tracking-tight text-white mb-6">
                            Estrena un Auto Nuevo con <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Clinkar Trade-in</span>
                        </h1>
                        <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
                            Maximiza el valor de tu auto actual. Véndelo en Clinkar al <span className="text-white font-bold">precio real de mercado</span> y usa el dinero como depósito para tu próximo 0km en nuestras agencias aliadas.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link href="/sell" className="h-14 px-8 bg-white text-zinc-950 rounded-2xl font-black flex items-center gap-2 hover:bg-zinc-200 transition-all">
                                Valuar mi auto actual <ArrowRight className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="mb-12">
                    <h2 className="text-3xl font-black tracking-tight mb-2">Inventario en Alianza</h2>
                    <p className="text-muted-foreground">Precios exclusivos y bonificaciones por vender tu usado con nosotros.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {MOCK_NEW_CARS.map((car) => (
                        <div key={car.id} className="group relative bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-border overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                            <div className="aspect-[16/10] relative">
                                <Image src={car.image} alt={car.model} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                                <div className="absolute top-4 left-4 flex gap-2">
                                    <span className="px-3 py-1 bg-black/50 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-full">{car.tag}</span>
                                    <span className="px-3 py-1 bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1">
                                        <Zap className="h-3 w-3 fill-current" /> Nuevo
                                    </span>
                                </div>
                            </div>

                            <div className="p-8 space-y-4">
                                <div className="space-y-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-xl font-black uppercase tracking-tighter">{car.make} {car.model}</h3>
                                        <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                                    </div>
                                    <p className="text-sm font-bold text-muted-foreground tracking-wide uppercase">{car.agency}</p>
                                </div>

                                <div className="py-4 border-y border-border/50">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Precio de Lista</span>
                                        <span className="text-2xl font-black">${car.price.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                        <ShieldCheck className="h-4 w-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{car.bonus}</span>
                                    </div>
                                </div>

                                <div className="bg-indigo-500/5 p-4 rounded-2xl border border-indigo-500/10">
                                    <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">Potencial Trade-in</p>
                                    <p className="text-xs font-medium text-muted-foreground leading-snug italic">
                                        "Vende tu usado por hasta <span className="font-bold">20% más</span> que en agencia y abona a este auto."
                                    </p>
                                </div>

                                <Link href={`/new-cars/${car.id}`} className="w-full h-14 bg-secondary hover:bg-primary hover:text-primary-foreground rounded-2xl font-black flex items-center justify-center gap-2 transition-all group/btn">
                                    Ver Detalles y Trade-in
                                    <ChevronRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
