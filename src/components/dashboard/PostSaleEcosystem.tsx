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
import { LogisticsWidget } from "../checkout/LogisticsWidget";
import { WarrantySelector, WarrantyType } from "../checkout/WarrantySelector";
import { updateTransactionServicesAction } from "@/app/actions/transaction";
import { toast } from "sonner";
import { 
    Warehouse, 
    Home, 
    Smartphone, 
    Zap, 
    Truck, 
    ShieldAlert,
    Package
} from "lucide-react";

export function PostSaleEcosystem({ 
    transactionId, 
    carPrice = 350000, 
    carLocation = "Ciudad de México",
    state = "CDMX",
    initialGestoria = false,
    initialInsurance = false
}: { 
    transactionId: string, 
    carPrice?: number,
    carLocation?: string,
    state?: string,
    initialGestoria?: boolean,
    initialInsurance?: boolean
}) {
    const [remindersEnabled, setRemindersEnabled] = useState(false);
    const [requestedService, setRequestedService] = useState<string | null>(null);
    const [hasGestoria, setHasGestoria] = useState(initialGestoria);
    const [hasInsurance, setHasInsurance] = useState(initialInsurance);
    const [logistics, setLogistics] = useState<any>(null);
    const [warranty, setWarranty] = useState<{ type: WarrantyType, cost: number } | null>(null);
    const [deliveryType, setDeliveryType] = useState<'workshop' | 'home'>('workshop');
    const [remoteMode, setRemoteMode] = useState(false);

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
            id: "logistica",
            title: "Envío a Domicilio",
            desc: "Cotizar traslado en grúa",
            type: "Logistics",
            icon: <Truck className="h-5 w-5" />,
            monetization: "Varía por distancia",
            delivery: "Grúa Aliada"
        },
        {
            id: "garantia",
            title: "Protección Mecánica",
            desc: "90 días o 1 año de garantía",
            type: "Warranty",
            icon: <ShieldAlert className="h-5 w-5" />,
            monetization: "Desde $2,500 MXN",
            delivery: "Certificado"
        },
        {
            id: "entrega",
            title: "Método de Entrega",
            desc: "Taller vs Entrega en casa",
            type: "Logistics",
            icon: <Package className="h-5 w-5" />,
            monetization: "Seleccionable",
            delivery: "Personalizado"
        },
        {
            id: "operacion",
            title: "Modalidad",
            desc: "Presencial o Remota",
            type: "Process",
            icon: <Zap className="h-5 w-5" />,
            monetization: "Sin costo extra",
            delivery: "Híbrido"
        },
        {
            id: "cambio_propietario",
            title: "Gestoría Legal",
            desc: "Cambio de Propietario SCT",
            type: "Premium Service",
            icon: <UserCog className="h-5 w-5" />,
            monetization: "$1,250 MXN + Derechos",
            delivery: "Aliado Humano"
        },
        {
            id: "seguro_aliado",
            title: "Seguro Automotriz",
            desc: "Protección inmediata",
            type: "Insurance",
            icon: <Briefcase className="h-5 w-5" />,
            monetization: "Desde 2.9% valor auto",
            delivery: "Digital"
        },
        {
            id: "aviso_venta",
            title: "Aviso de Venta",
            desc: state === "CDMX" ? "Notificación SEMOVI CDMX" : "Notificación Estatal",
            type: "Automatic/PDF",
            icon: <FileText className="h-5 w-5" />,
            monetization: "Gratis",
            delivery: "IA"
        },
        {
            id: "carta_responsiva",
            title: "Carta Responsiva",
            desc: "Deslinde legal",
            type: "Legal Document",
            icon: <ShieldCheck className="h-5 w-5" />,
            monetization: "Incluido",
            delivery: "PDF"
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="relative bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl border border-indigo-100/50 dark:border-white/5 rounded-[3rem] p-10 shadow-[0_20px_50px_rgba(79,70,229,0.05)] overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px]" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px]" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-1 w-12 bg-indigo-600 rounded-full" />
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Servicios Elite</span>
                        </div>
                        <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter italic uppercase leading-none">
                            Ecosistema <span className="text-indigo-600">Post-Venta</span>
                        </h2>
                        <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mt-2">Personalización de logística y trámites • Ref: {transactionId.split('-')[0].toUpperCase()}</p>
                    </div>
                    <div className="flex items-center gap-4 bg-white dark:bg-zinc-950/50 p-3 rounded-2xl border border-zinc-100 dark:border-white/5 shadow-sm">
                        <div className="flex flex-col px-4 text-right">
                            <span className="text-[9px] font-black uppercase text-zinc-400 tracking-[0.2em] mb-1">Estatus Legal</span>
                            <div className="flex items-center gap-2 justify-end">
                                <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-xs font-black text-emerald-600 uppercase tracking-tighter">Bóveda Activa</span>
                            </div>
                        </div>
                    </div>
                </div>

                               <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                    {services.map((service) => (
                        <button
                            key={service.id}
                            onClick={() => setRequestedService(service.id)}
                            className={cn(
                                "group relative p-6 rounded-[2.5rem] border-2 text-left transition-all duration-500 overflow-hidden",
                                requestedService === service.id
                                    ? "border-indigo-600 bg-white dark:bg-zinc-800 shadow-2xl shadow-indigo-500/20 scale-[1.02]"
                                    : "border-zinc-100 dark:border-white/5 bg-zinc-50/30 dark:bg-white/5 hover:border-indigo-200 hover:scale-[1.01]"
                            )}
                        >
                            {/* Hover Background Glow */}
                            <div className={cn(
                                "absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                                requestedService === service.id && "opacity-100"
                            )} />

                            <div className="relative z-10 flex items-start justify-between mb-6">
                                <div className={cn(
                                    "p-4 rounded-2xl transition-all duration-500 transform group-hover:rotate-6",
                                    requestedService === service.id 
                                        ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/40" 
                                        : "bg-white dark:bg-zinc-800 text-zinc-400 group-hover:text-indigo-600 shadow-sm border border-zinc-100 dark:border-zinc-700"
                                )}>
                                    {service.icon}
                                </div>
                            </div>
                            <div className="relative z-10">
                                <h4 className={cn(
                                    "font-black text-[10px] uppercase tracking-[0.2em] mb-2 transition-colors",
                                    requestedService === service.id ? "text-indigo-700 dark:text-white" : "text-zinc-800 dark:text-zinc-300"
                                )}>{service.title}</h4>
                                <p className="text-[10px] text-zinc-400 leading-relaxed text-justify font-medium">
                                    {service.desc}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Detail Area */}
                <div className="space-y-6">
                    {requestedService === 'logistica' && (
                        <div className="bg-white dark:bg-zinc-950 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-top-4 duration-500">
                             <LogisticsWidget
                                carLocation={carLocation}
                                onQuote={(q) => {
                                    setLogistics(q);
                                    if(q) toast.success(`Cotización de traslado: $${q.cost.toLocaleString()}`);
                                }}
                            />
                        </div>
                    )}

                    {requestedService === 'garantia' && (
                        <div className="bg-white dark:bg-zinc-950 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-top-4 duration-500">
                            <WarrantySelector
                                carPrice={carPrice}
                                onSelect={(w) => {
                                    setWarranty(w);
                                    if(w) toast.success(`Garantía ${w.type} añadida`);
                                }}
                            />
                        </div>
                    )}

                    {requestedService === 'entrega' && (
                        <div className="bg-white dark:bg-zinc-950 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-top-4 duration-500">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => {setDeliveryType('workshop'); toast.info("Entrega en Taller Aliado seleccionada");}}
                                    className={cn(
                                        "p-6 rounded-3xl border-2 text-left transition-all",
                                        deliveryType === 'workshop' 
                                            ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/10" 
                                            : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 opacity-60"
                                    )}
                                >
                                    <Warehouse className={cn("h-6 w-6 mb-3", deliveryType === 'workshop' ? "text-indigo-600" : "text-zinc-400")} />
                                    <span className="font-bold text-sm block">Taller Aliado (Zona Segura)</span>
                                    <span className="text-xs text-zinc-500">Sin costo de envío local.</span>
                                </button>

                                <button
                                    onClick={() => {setDeliveryType('home'); toast.info("Envío a domicilio seleccionado");}}
                                    className={cn(
                                        "p-6 rounded-3xl border-2 text-left transition-all",
                                        deliveryType === 'home' 
                                            ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/10" 
                                            : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 opacity-60"
                                    )}
                                >
                                    <Home className={cn("h-6 w-6 mb-3", deliveryType === 'home' ? "text-indigo-600" : "text-zinc-400")} />
                                    <span className="font-bold text-sm block">Envío a Domicilio</span>
                                    <span className="text-xs text-zinc-500">Entrega en Grúa Especializada.</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {requestedService === 'operacion' && (
                        <div className="bg-white dark:bg-zinc-950 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-top-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => {setRemoteMode(false); toast.info("Cita Presencial confirmada");}}
                                    className={cn(
                                        "p-6 rounded-3xl border-2 text-left transition-all",
                                        !remoteMode 
                                            ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/10" 
                                            : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 opacity-60"
                                    )}
                                >
                                    <MapPin className={cn("h-6 w-6 mb-3", !remoteMode ? "text-indigo-600" : "text-zinc-400")} />
                                    <span className="font-bold text-sm block">Presencial</span>
                                    <span className="text-xs text-zinc-500">Cita en punto físico con inspector.</span>
                                </button>

                                <button
                                    onClick={() => {setRemoteMode(true); toast.info("Compra Remota activada");}}
                                    className={cn(
                                        "p-6 rounded-3xl border-2 text-left transition-all",
                                        remoteMode 
                                            ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/10" 
                                            : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 opacity-60"
                                    )}
                                >
                                    <Zap className={cn("h-6 w-6 mb-3", remoteMode ? "text-indigo-600" : "text-zinc-400")} />
                                    <span className="font-bold text-sm block">Remota</span>
                                    <span className="text-xs text-zinc-500">Videollamada HD & Entrega vía QR.</span>
                                </button>
                            </div>
                        </div>
                    )}

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
                <div className="mt-10 bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-[2.5rem] p-8 flex flex-col sm:flex-row items-center justify-between gap-8 group shadow-2xl shadow-indigo-600/30 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                    <div className="relative z-10 flex items-center gap-6">
                        <div className={cn(
                            "h-16 w-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-700 border-2",
                            remindersEnabled ? "bg-white text-indigo-600 border-white shadow-xl shadow-white/20 scale-110" : "bg-white/10 text-white border-white/20"
                        )}>
                            <BellRing className={cn("h-8 w-8", remindersEnabled && "animate-bounce")} />
                        </div>
                        <div>
                            <h3 className="font-black text-white text-lg italic uppercase tracking-tighter">Concierge Inteligente</h3>
                            <p className="text-indigo-100/70 text-[10px] font-bold uppercase tracking-[0.2em]">Mantenimiento • Tenencias • Notificaciones</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setRemindersEnabled(!remindersEnabled)}
                        className={cn(
                            "relative z-10 w-full sm:w-auto px-10 h-14 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl",
                            remindersEnabled 
                                ? "bg-white text-indigo-600 hover:bg-indigo-50" 
                                : "bg-indigo-500/20 text-white border-2 border-white/20 hover:bg-white/10"
                        )}
                    >
                        {remindersEnabled ? "Sincronizado" : "Activar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
