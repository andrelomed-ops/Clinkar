"use client";

import { useState } from "react";
import {
    ChevronLeft,
    ShieldCheck,
    Zap,
    Info,
    ArrowRight,
    Calculator,
    Gauge,
    BatteryCharging,
    Cpu,
    CheckCircle2,
    Sparkles,
    Building2
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/ui/navbar";
import { LeadCaptureModal } from "@/components/leads/LeadCaptureModal";

// Simplified lookup for MVP
const NEW_CARS_DATA: Record<string, any> = {
    "new-1": {
        make: "Tesla",
        model: "Model 3 2026",
        price: 899900,
        agency: "Tesla México",
        image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=1200",
        tag: "100% Eléctrico",
        specs: [
            { label: "Autonomía", value: "629 km", icon: BatteryCharging },
            { label: "0-100 km/h", value: "4.4s", icon: Gauge },
            { label: "Hardware", value: "HW4 AI", icon: Cpu }
        ],
        benefits: [
            "Cargador Wallbox Clinkar de Regalo",
            "Mantenimiento Incluido 3 Años",
            "Referral Credit $10,000 MXN"
        ]
    }
};

export default function NewCarDetailPage({ params }: { params: { id: string } }) {
    const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
    const car = NEW_CARS_DATA[params.id] || NEW_CARS_DATA["new-1"];

    return (
        <div className="min-h-screen bg-background">
            <Navbar variant="market" />

            <main className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
                <Link href="/new-cars" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 font-bold transition-colors">
                    <ChevronLeft className="h-4 w-4" /> Volver a Inventario Nuevo
                </Link>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Visual Section */}
                    <div className="flex-1 space-y-8">
                        <div className="relative aspect-[16/10] rounded-[3rem] overflow-hidden shadow-2xl border border-border">
                            <Image src={car.image} alt={car.model} fill className="object-cover" />
                            <div className="absolute top-8 left-8 flex gap-3">
                                <span className="px-4 py-2 bg-black/60 backdrop-blur-md text-white text-xs font-black uppercase tracking-widest rounded-full">{car.tag}</span>
                                <span className="px-4 py-2 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-full flex items-center gap-2">
                                    <Zap className="h-4 w-4 fill-current" /> Alliance Partner
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                            {car.specs.map((spec: any, idx: number) => (
                                <div key={idx} className="bg-secondary/30 rounded-3xl p-6 border border-border flex flex-col items-center justify-center text-center gap-2 group hover:bg-white dark:hover:bg-zinc-800 transition-all">
                                    <spec.icon className="h-6 w-6 text-indigo-600 mb-1" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{spec.label}</span>
                                    <span className="text-sm font-black italic">{spec.value}</span>
                                </div>
                            ))}
                        </div>

                        <div className="bg-zinc-950 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px]" />
                            <h3 className="text-2xl font-black mb-6 flex items-center gap-3 italic uppercase tracking-tighter">
                                <ShieldCheck className="h-6 w-6 text-indigo-400" />
                                Beneficios Clinkar Trade-in
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                {car.benefits.map((benefit: string, idx: number) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-indigo-400 mt-0.5 shrink-0" />
                                        <span className="text-sm font-bold text-zinc-300">{benefit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Interaction Card */}
                    <aside className="w-full lg:w-[450px] space-y-6">
                        <div className="bg-card border border-border rounded-[3rem] p-10 shadow-xl sticky top-24">
                            <div className="space-y-1 mb-8">
                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                    <Building2 className="h-4 w-4" />
                                    <span className="text-xs font-bold uppercase tracking-widest">{car.agency}</span>
                                </div>
                                <h1 className="text-4xl font-black tracking-tighter italic uppercase">{car.make} {car.model}</h1>
                            </div>

                            <div className="space-y-6 mb-10">
                                <div className="flex justify-between items-end">
                                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Precio de Lista</span>
                                    <span className="text-4xl font-black italic">${car.price.toLocaleString()}</span>
                                </div>

                                {/* Comparison Logic - The Hook */}
                                <div className="bg-emerald-500/5 rounded-3xl p-6 border border-emerald-500/10 space-y-4">
                                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                        <Sparkles className="h-4 w-4" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Clinkar Advantage</span>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-muted-foreground uppercase">Toma en Agencia Tradicional</span>
                                            <span className="font-bold line-through text-red-500/50">$450,000*</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-foreground uppercase tracking-tighter italic">Venta P2P Clinkar</span>
                                            <span className="font-black text-emerald-600 text-lg">$515,000*</span>
                                        </div>
                                    </div>
                                    <p className="text-[9px] text-emerald-700/70 dark:text-emerald-300/50 italic leading-tight">
                                        * Estimación basada en precios de mercado 2026. Al vender por Clinkar obtienes un promedio de 15% más valor por tu usado.
                                    </p>
                                </div>

                                {/* New Component: Financial Bridge Explanation */}
                                <div className="bg-secondary/50 rounded-3xl p-6 border border-border space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <Building2 className="h-3 w-3" /> Puente de Capital Clinkar
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <div className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">1</div>
                                            <p className="text-[11px] font-medium leading-tight">Publicamos tu seminuevo en el marketplace líder.</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">2</div>
                                            <p className="text-[11px] font-medium leading-tight">Nosotros gestionamos la venta flash para monetizar tu enganche.</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">3</div>
                                            <p className="text-[11px] font-medium leading-tight">Trasladamos el capital directamente a <strong>{car.agency}</strong> como parte de tu pago.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Autofinanciamiento Banner */}
                                <div className="bg-indigo-900 rounded-3xl p-6 text-white relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[40px] translate-x-12 -translate-y-12" />
                                    <div className="flex items-center gap-2 text-indigo-300 mb-2">
                                        <Calculator className="h-4 w-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Financiamiento Flexible</span>
                                    </div>
                                    <p className="text-xs font-bold leading-snug mb-3">¿Tu usado no cubre el enganche total?</p>
                                    <p className="text-[10px] text-indigo-200/70 leading-relaxed mb-4">Pregunta por nuestro programa de autofinanciamiento aliado que acepta mensualidades para completar tu inicio.</p>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-1 group-hover:translate-x-1 transition-transform cursor-pointer">
                                        Ver requisitos <ArrowRight className="h-3 w-3" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={() => setIsLeadModalOpen(true)}
                                    className="w-full h-18 bg-primary text-primary-foreground rounded-[2rem] font-black text-xl shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                                >
                                    Solicitar Trade-in <ArrowRight className="h-6 w-6" />
                                </button>

                                <div className="flex items-center gap-2 justify-center py-2">
                                    <Calculator className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Ver Planes de Financiamiento</span>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-border space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="h-8 w-8 bg-indigo-500/10 rounded-xl flex items-center justify-center shrink-0">
                                        <Info className="h-4 w-4 text-indigo-600" />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
                                        Clinkar actúa como mediador certificado. Tu pago se resguarda en nuestra Bóveda hasta que recibas el auto nuevo y el contrato sea ratificado.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            <LeadCaptureModal
                isOpen={isLeadModalOpen}
                onClose={() => setIsLeadModalOpen(false)}
                carName={car.model}
                agency={car.agency}
            />
        </div>
    );
}
