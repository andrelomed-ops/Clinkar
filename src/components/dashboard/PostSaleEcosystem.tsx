"use client";

import { useState } from "react";
import {
    FileText,
    MapPin,
    History,
    Settings2,
    ArrowRight,
    CarFront,
    UserCog,
    Download,
    BellRing,
    AlertTriangle,
    ShieldCheck,
    Briefcase
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { GestoriaAdvisor } from "../checkout/GestoriaAdvisor";
import { InsuranceSelector } from "./InsuranceSelector";
import { updateTransactionServicesAction } from "@/app/actions/transaction";
import { toast } from "sonner";

export function PostSaleEcosystem({ 
    transactionId, 
    carPrice = 350000, 
    state = "CDMX",
    initialGestoria = false,
    initialInsurance = false
}: { 
    transactionId: string, 
    carPrice?: number,
    state?: string,
    initialGestoria?: boolean,
    initialInsurance?: boolean
}) {
    const [remindersEnabled, setRemindersEnabled] = useState(false);
    const [requestedService, setRequestedService] = useState<string | null>(null);
    const [hasGestoria, setHasGestoria] = useState(initialGestoria);
    const [hasInsurance, setHasInsurance] = useState(initialInsurance);

    const handleGestoriaSelect = async (active: boolean) => {
        if (!active) return;
        try {
            await updateTransactionServicesAction(transactionId, { gestoriaCost: 1250 });
            setHasGestoria(true);
            toast.success("Gestoría añadida a tu orden");
        } catch (e) {
            toast.error("Error al añadir gestoría");
        }
    };

    const handleInsuranceSelect = async (provider: string, cost: number) => {
        if (provider === 'declined') return;
        try {
            await updateTransactionServicesAction(transactionId, { 
                insuranceId: provider, 
                insuranceCost: cost 
            });
            setHasInsurance(true);
            toast.success(`Seguro con ${provider} añadido`);
        } catch (e) {
            toast.error("Error al añadir seguro");
        }
    };

    const services = [
        {
            id: "aviso_venta",
            title: "Aviso de Venta",
            desc: state === "CDMX" ? "Notificación SEMOVI CDMX" : "Notificación Estatal",
            type: "Automatic/PDF",
            icon: <FileText className="h-5 w-5" />,
            monetization: "Gratis con StarterKar",
            delivery: "IA"
        },
        {
            id: "carta_responsiva",
            title: "Carta Responsiva",
            desc: "Deslinde de responsabilidad civil",
            type: "Legal Document",
            icon: <ShieldCheck className="h-5 w-5" />,
            monetization: "Incluido",
            delivery: "Digital PDF"
        },
        {
            id: "cambio_propietario",
            title: "Cambio de Propietario",
            desc: "Gestoría completa ante SEMOVI/SCT",
            type: "Premium Service",
            icon: <UserCog className="h-5 w-5" />,
            monetization: "$1,250 MXN + Derechos",
            delivery: "Aliado Humano"
        },
        {
            id: "seguro_aliado",
            title: "Seguro Automotriz",
            desc: "Protección inmediata con aliados",
            type: "Insurance",
            icon: <Briefcase className="h-5 w-5" />,
            monetization: "Desde 2.9% valor auto",
            delivery: "Digital"
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight italic">Ecosistema Post-Venta</h2>
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Trámites y resguardo • Ref: {transactionId.split('-')[0].toUpperCase()}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-zinc-950 p-2 rounded-2xl border border-zinc-800">
                        <div className="flex flex-col px-4">
                            <span className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Resguardo Legal</span>
                            <span className="text-xs font-bold text-emerald-500">Activo (5 Años SAT)</span>
                        </div>
                        <button className="h-10 w-10 bg-zinc-800 rounded-xl flex items-center justify-center text-white hover:bg-zinc-700 transition-colors">
                            <Download className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Grid de Servicios */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {services.map((service) => (
                        <button
                            key={service.id}
                            onClick={() => setRequestedService(service.id)}
                            className={cn(
                                "group relative p-6 rounded-3xl border-2 text-left transition-all duration-300",
                                requestedService === service.id
                                    ? "border-indigo-500 bg-indigo-500/5 shadow-lg shadow-indigo-500/10"
                                    : "border-zinc-800 bg-zinc-950/50 hover:border-zinc-700"
                            )}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={cn(
                                    "p-3 rounded-2xl transition-colors",
                                    requestedService === service.id ? "bg-indigo-500 text-white" : "bg-zinc-800 text-zinc-400 group-hover:text-white"
                                )}>
                                    {service.icon}
                                </div>
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-sm mb-1">{service.title}</h4>
                                <p className="text-[10px] text-zinc-500 leading-tight">{service.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Detail Area */}
                <div className="space-y-6">
                    {requestedService === 'cambio_propietario' && (
                        <div className="animate-in slide-in-from-top-4 duration-500">
                            <GestoriaAdvisor onSelect={handleGestoriaSelect} />
                        </div>
                    )}

                    {requestedService === 'seguro_aliado' && (
                        <div className="bg-white dark:bg-zinc-950 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-top-4 duration-500">
                            <InsuranceSelector carValue={carPrice} onSelectOption={handleInsuranceSelect} />
                        </div>
                    )}

                    {requestedService === 'aviso_venta' && (
                        <div className="p-6 bg-zinc-950 border border-amber-500/20 rounded-3xl animate-in slide-in-from-top-4">
                            <div className="flex items-center gap-3 mb-4">
                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                                <h4 className="font-bold text-white text-sm uppercase tracking-widest">Aviso de Venta Obligatorio</h4>
                            </div>
                            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                                Tu estado (<span className="text-white font-bold">{state}</span>) requiere un aviso de venta manual.
                                Hemos pre-llenado el formato oficial para ti.
                            </p>
                            <button className="flex items-center gap-2 bg-white text-black h-11 px-6 rounded-full font-bold text-xs transition-transform hover:scale-105">
                                <Download className="h-4 w-4" />
                                Descargar Formato SEMOVI
                            </button>
                        </div>
                    )}

                    {requestedService === 'carta_responsiva' && (
                        <div className="p-6 bg-zinc-950 border border-indigo-500/20 rounded-3xl animate-in slide-in-from-top-4">
                            <div className="flex items-center gap-3 mb-4">
                                <ShieldCheck className="h-5 w-5 text-indigo-400" />
                                <h4 className="font-bold text-white text-sm uppercase tracking-widest">Generar Carta Responsiva</h4>
                            </div>
                            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                                Documento legal que te protege de cualquier incidente ocurrido después de la entrega.
                            </p>
                            <Link
                                href={`/dashboard/release-letter/${transactionId}`}
                                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white h-11 px-6 rounded-full font-bold text-xs transition-transform hover:scale-105"
                            >
                                <Download className="h-4 w-4" />
                                Generar PDF Oficial
                            </Link>
                        </div>
                    )}
                </div>

                {/* Notificaciones Avanzadas */}
                <div className="mt-8 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl p-6 flex items-center justify-between gap-6 group">
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                            remindersEnabled ? "bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]" : "bg-zinc-800 text-zinc-500"
                        )}>
                            <BellRing className={cn("h-6 w-6", remindersEnabled && "animate-bounce")} />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm">Recordatorios Inteligentes</h3>
                            <p className="text-xs text-zinc-500">Tenencias, verificaciones y servicios preventivos.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setRemindersEnabled(!remindersEnabled)}
                        className={cn(
                            "px-6 h-11 rounded-full font-bold text-xs transition-all",
                            remindersEnabled ? "bg-indigo-500 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"
                        )}
                    >
                        {remindersEnabled ? "Activados" : "Activar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
