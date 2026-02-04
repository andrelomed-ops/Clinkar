"use client";

import { useState } from "react";
import {
    FileText,
    MapPin,
    History,
    Settings2,
    ArrowRight,
    Sparkles,
    UserCog,
    Download,
    BellRing,
    AlertTriangle,
    ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function PostSaleEcosystem({ transactionId, state = "CDMX" }: { transactionId: string, state?: string }) {
    const [remindersEnabled, setRemindersEnabled] = useState(false);
    const [requestedService, setRequestedService] = useState<string | null>(null);

    const services = [
        {
            id: "aviso_venta",
            title: "Aviso de Venta",
            desc: state === "CDMX" ? "Notificación SEMOVI CDMX" : "Notificación Estatal",
            type: "Automatic/PDF",
            icon: <FileText className="h-5 w-5" />,
            monetization: "Gratis con Clinkar",
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
            id: "endoso_guia",
            title: "Guía de Endoso Legal",
            desc: "Instrucciones para factura física",
            type: "Instructional",
            icon: <History className="h-5 w-5" />,
            monetization: "Incluido",
            delivery: "IA"
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight">Ecosistema Post-Venta</h2>
                        <p className="text-zinc-400 text-sm">Trámites y resguardo de la operación #{transactionId.split('-')[0].toUpperCase()}</p>
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

                {/* Notificaciones Avanzadas */}
                <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-3xl p-6 mb-8 flex items-center justify-between gap-6 group">
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                            remindersEnabled ? "bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]" : "bg-zinc-800 text-zinc-500"
                        )}>
                            <BellRing className={cn("h-6 w-6", remindersEnabled && "animate-bounce")} />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm">Recordatorios Inteligentes</h3>
                            <p className="text-xs text-zinc-500">Cambio de propietario, tenencias y verificaciones.</p>
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

                {/* Grid de Servicios */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {services.map((service) => (
                        <button
                            key={service.id}
                            onClick={() => setRequestedService(service.id)}
                            className={cn(
                                "group relative p-6 rounded-3xl border-2 text-left transition-all duration-300",
                                requestedService === service.id
                                    ? "border-emerald-500 bg-emerald-500/5 shadow-lg"
                                    : "border-zinc-800 bg-zinc-950/50 hover:border-zinc-700"
                            )}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={cn(
                                    "p-3 rounded-2xl transition-colors",
                                    requestedService === service.id ? "bg-emerald-500 text-black" : "bg-zinc-800 text-zinc-400 group-hover:text-white"
                                )}>
                                    {service.icon}
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">{service.delivery}</span>
                                    <p className="text-[9px] font-bold text-emerald-500 mt-0.5">{service.monetization}</p>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-sm mb-1">{service.title}</h4>
                                <p className="text-xs text-zinc-500 leading-tight">{service.desc}</p>
                            </div>
                            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowRight className="h-4 w-4 text-emerald-500" />
                            </div>
                        </button>
                    ))}
                </div>

                {/* Modal-like Detail Area (Conditioned explicitly) */}
                {requestedService === 'aviso_venta' && (
                    <div className="mt-8 p-6 bg-zinc-950 border border-amber-500/20 rounded-3xl animate-in slide-in-from-top-4">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            <h4 className="font-bold text-white text-sm uppercase tracking-widest">Atención: Aviso de Venta Obligatorio</h4>
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                            Tu estado (<span className="text-white font-bold">{state}</span>) requiere un aviso de venta manual.
                            Hemos pre-llenado el formato oficial con los datos de tu contrato para ahorrarte tiempo.
                        </p>
                        <button className="flex items-center gap-2 bg-white text-black h-11 px-6 rounded-full font-bold text-xs transition-transform hover:scale-105">
                            <Download className="h-4 w-4" />
                            Descargar Formato SEMOVI
                        </button>
                    </div>
                )}

                {requestedService === 'endoso_guia' && (
                    <div className="mt-8 p-8 bg-zinc-950 border border-indigo-500/20 rounded-3xl animate-in slide-in-from-top-4">
                        <div className="flex items-center gap-3 mb-6">
                            <Sparkles className="h-5 w-5 text-indigo-400" />
                            <h4 className="font-bold text-white uppercase tracking-widest text-sm">Guía de Endoso Sugerida (IA)</h4>
                        </div>
                        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl font-cursive text-zinc-300 italic leading-relaxed text-sm shadow-inner">
                            "Por medio del presente, endoso la propiedad del vehículo descrito al calce a favor del C. [Nombre del Comprador], por valor recibido el día [Fecha] conforme al Art. 391 del Código de Comercio."
                        </div>
                        <p className="text-[10px] text-zinc-500 mt-4 leading-relaxed italic">
                            Copia este párrafo al reverso de tu factura original y asegúrate de que la firma coincida con tu identificación oficial para evitar rechazos en el cambio de propietario.
                        </p>
                    </div>
                )}

                {requestedService === 'carta_responsiva' && (
                    <div className="mt-8 p-6 bg-zinc-950 border border-indigo-500/20 rounded-3xl animate-in slide-in-from-top-4">
                        <div className="flex items-center gap-3 mb-4">
                            <ShieldCheck className="h-5 w-5 text-indigo-400" />
                            <h4 className="font-bold text-white text-sm uppercase tracking-widest">Generar Carta Responsiva</h4>
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                            Obtén el documento legal que te protege de cualquier incidente ocurrido después de la entrega de la unidad.
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
        </div>
    );
}
