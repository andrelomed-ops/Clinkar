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
    Briefcase,
    CheckCircle2,
    Truck,
    ShieldAlert,
    CreditCard,
    UserCheck,
    Warehouse,
    Home,
    Smartphone,
    Zap,
    Package
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { GestoriaAdvisor } from "../checkout/GestoriaAdvisor";
import { InsuranceSelector } from "./InsuranceSelector";
import { LogisticsWidget } from "../checkout/LogisticsWidget";
import { WarrantySelector, WarrantyType } from "../checkout/WarrantySelector";
import { updateTransactionServicesAction } from "@/app/actions/transaction";
import { toast } from "sonner";

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
            title: "Logística Élite",
            desc: "Cotización de traslado en grúa plataforma especializada.",
            icon: <Truck className="h-6 w-6" />,
            color: "from-blue-600 to-indigo-600",
            badge: "A DOMICILIO"
        },
        {
            id: "garantia",
            title: "Protección Total",
            desc: "Extensión de garantía mecánica hasta por 12 meses.",
            icon: <ShieldAlert className="h-6 w-6" />,
            color: "from-emerald-600 to-teal-600",
            badge: "CERTIFICADO"
        },
        {
            id: "entrega",
            title: "Protocolo Entrega",
            desc: "Gestión de cita en taller aliado o entrega VIP en casa.",
            icon: <Package className="h-6 w-6" />,
            color: "from-amber-500 to-orange-600",
            badge: "SEGURO"
        },
        {
            id: "operacion",
            title: "Modalidad Híbrida",
            desc: "Compra remota con videollamada HD o presencial.",
            icon: <Zap className="h-6 w-6" />,
            color: "from-purple-600 to-pink-600",
            badge: "REMOTA OK"
        },
        {
            id: "cambio_propietario",
            title: "Gestoría VIP",
            desc: "Trámites de cambio de propietario ante SCT/SEMOVI.",
            icon: <UserCog className="h-6 w-6" />,
            color: "from-zinc-800 to-zinc-950",
            badge: "SIN FILAS"
        },
        {
            id: "seguro_aliado",
            title: "Blindaje Seguro",
            desc: "Póliza de cobertura amplia con partners certificados.",
            icon: <Briefcase className="h-6 w-6" />,
            color: "from-red-600 to-rose-700",
            badge: "INMEDIATO"
        },
        {
            id: "aviso_venta",
            title: "Notificación IA",
            desc: "Aviso de enajenación automático ante autoridades.",
            icon: <FileText className="h-6 w-6" />,
            color: "from-indigo-400 to-blue-500",
            badge: "OBLIGATORIO"
        },
        {
            id: "carta_responsiva",
            title: "Blindaje Legal",
            desc: "Carta responsiva digital con validez jurídica.",
            icon: <ShieldCheck className="h-6 w-6" />,
            color: "from-slate-700 to-slate-900",
            badge: "PDF FIRMADO"
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <div className="relative bg-white/40 dark:bg-zinc-900/40 backdrop-blur-3xl border border-white/20 dark:border-white/5 rounded-[3.5rem] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden">
                {/* Premium Background Effects */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-1.5 w-16 bg-gradient-to-r from-indigo-600 to-transparent rounded-full" />
                            <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.4em]">Ecosistema StarterKar</span>
                        </div>
                        <h2 className="text-5xl font-black text-zinc-900 dark:text-white tracking-tighter italic uppercase leading-none">
                            Post-Venta <span className="text-indigo-600 underline decoration-indigo-600/20 underline-offset-8">Élite</span>
                        </h2>
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-6 max-w-sm">
                            Logística, trámites y servicios de valor agregado personalizados para tu nueva unidad.
                        </p>
                    </div>
                    
                    <div className="bg-zinc-900 dark:bg-zinc-950 px-8 py-6 rounded-[2rem] border border-white/10 shadow-2xl flex items-center gap-6">
                        <div className="h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                            <Zap className="h-6 w-6 animate-pulse" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] mb-1">Estatus Bóveda</p>
                            <p className="text-lg font-black text-white italic tracking-tight uppercase">Sincronizado</p>
                        </div>
                    </div>
                </div>

                {/* Service Grid - Premium Tiles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
                    {services.map((service) => (
                        <button
                            key={service.id}
                            onClick={() => setRequestedService(service.id)}
                            className={cn(
                                "group relative p-8 rounded-[2.5rem] border-2 text-left transition-all duration-700 overflow-hidden flex flex-col h-full",
                                requestedService === service.id
                                    ? "border-indigo-600 bg-white dark:bg-zinc-800 shadow-3xl shadow-indigo-500/30 scale-[1.02]"
                                    : "border-zinc-100 dark:border-white/5 bg-white/50 dark:bg-white/5 hover:border-indigo-300 hover:scale-[1.01] hover:shadow-xl"
                            )}
                        >
                            {/* Accent Glow */}
                            <div className={cn(
                                "absolute -top-12 -right-12 w-32 h-32 rounded-full blur-[40px] transition-opacity duration-700",
                                requestedService === service.id ? "bg-indigo-600/20 opacity-100" : "bg-indigo-600/5 opacity-0 group-hover:opacity-100"
                            )} />

                            <div className="mb-8 flex justify-between items-start relative z-10">
                                <div className={cn(
                                    "h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-700 shadow-lg",
                                    requestedService === service.id 
                                        ? "bg-indigo-600 text-white scale-110 rotate-6" 
                                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                                )}>
                                    {service.icon}
                                </div>
                                <span className={cn(
                                    "text-[8px] font-black px-3 py-1.5 rounded-full border transition-all",
                                    requestedService === service.id 
                                        ? "bg-indigo-50 text-indigo-600 border-indigo-100" 
                                        : "bg-zinc-50 dark:bg-zinc-900 text-zinc-400 border-zinc-100 dark:border-zinc-800"
                                )}>
                                    {service.badge}
                                </span>
                            </div>

                            <div className="relative z-10 mt-auto">
                                <h4 className={cn(
                                    "font-black text-sm uppercase tracking-tight mb-2 italic transition-colors",
                                    requestedService === service.id ? "text-indigo-900 dark:text-white" : "text-zinc-900 dark:text-zinc-200"
                                )}>{service.title}</h4>
                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-bold uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity">
                                    {service.desc}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Detailed Action Area - Focus on Content */}
                {requestedService && (
                    <div className="relative bg-zinc-900 dark:bg-black rounded-[3rem] p-10 border border-white/10 shadow-3xl animate-in slide-in-from-top-8 duration-700 mb-10 overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Zap className="h-64 w-64" />
                        </div>
                        <div className="relative z-10">
                            {requestedService === 'logistica' && (
                                <LogisticsWidget
                                    carLocation={carLocation}
                                    onQuote={(q) => {
                                        setLogistics(q);
                                        if(q) toast.success(`Cotización de traslado: $${q.cost.toLocaleString()}`);
                                    }}
                                />
                            )}
                            {requestedService === 'garantia' && (
                                <WarrantySelector
                                    carPrice={carPrice}
                                    onSelect={(w) => {
                                        setWarranty(w);
                                        if(w) toast.success(`Garantía ${w.type} añadida`);
                                    }}
                                />
                            )}
                            {requestedService === 'entrega' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <button
                                        onClick={() => {setDeliveryType('workshop'); toast.info("Protocolo Taller Aliado activado");}}
                                        className={cn(
                                            "group p-10 rounded-[2.5rem] border-2 text-left transition-all duration-500",
                                            deliveryType === 'workshop' 
                                                ? "border-indigo-600 bg-white/5 shadow-2xl" 
                                                : "border-zinc-800 bg-transparent opacity-40 hover:opacity-100"
                                        )}
                                    >
                                        <Warehouse className={cn("h-12 w-12 mb-6 transition-all", deliveryType === 'workshop' ? "text-indigo-500 scale-110" : "text-zinc-600")} />
                                        <h5 className="font-black text-xl text-white italic uppercase tracking-tighter mb-2">Taller Aliado</h5>
                                        <p className="text-xs text-zinc-500 font-medium">Recepción en Punto Seguro StarterKar. Sin costo de logística local.</p>
                                    </button>
                                    <button
                                        onClick={() => {setDeliveryType('home'); toast.info("Envío a Domicilio activado");}}
                                        className={cn(
                                            "group p-10 rounded-[2.5rem] border-2 text-left transition-all duration-500",
                                            deliveryType === 'home' 
                                                ? "border-indigo-600 bg-white/5 shadow-2xl" 
                                                : "border-zinc-800 bg-transparent opacity-40 hover:opacity-100"
                                        )}
                                    >
                                        <Home className={cn("h-12 w-12 mb-6 transition-all", deliveryType === 'home' ? "text-indigo-500 scale-110" : "text-zinc-600")} />
                                        <h5 className="font-black text-xl text-white italic uppercase tracking-tighter mb-2">Entrega VIP</h5>
                                        <p className="text-xs text-zinc-500 font-medium">Traslado en grúa plataforma hasta tu puerta. Protocolo de firma remoto.</p>
                                    </button>
                                </div>
                            )}
                            {requestedService === 'operacion' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <button
                                        onClick={() => {setRemoteMode(false); toast.info("Modalidad Presencial confirmada");}}
                                        className={cn(
                                            "group p-10 rounded-[2.5rem] border-2 text-left transition-all duration-500",
                                            !remoteMode 
                                                ? "border-indigo-600 bg-white/5 shadow-2xl" 
                                                : "border-zinc-800 bg-transparent opacity-40 hover:opacity-100"
                                        )}
                                    >
                                        <MapPin className={cn("h-12 w-12 mb-6 transition-all", !remoteMode ? "text-indigo-500 scale-110" : "text-zinc-600")} />
                                        <h5 className="font-black text-xl text-white italic uppercase tracking-tighter mb-2">Cita Física</h5>
                                        <p className="text-xs text-zinc-500 font-medium">Intercambio de llaves y documentos en presencia de inspector.</p>
                                    </button>
                                    <button
                                        onClick={() => {setRemoteMode(true); toast.info("Venta Remota 100% Digital activada");}}
                                        className={cn(
                                            "group p-10 rounded-[2.5rem] border-2 text-left transition-all duration-500",
                                            remoteMode 
                                                ? "border-indigo-600 bg-white/5 shadow-2xl" 
                                                : "border-zinc-800 bg-transparent opacity-40 hover:opacity-100"
                                        )}
                                    >
                                        <Smartphone className={cn("h-12 w-12 mb-6 transition-all", remoteMode ? "text-indigo-500 scale-110" : "text-zinc-600")} />
                                        <h5 className="font-black text-xl text-white italic uppercase tracking-tighter mb-2">Remoto IA</h5>
                                        <p className="text-xs text-zinc-500 font-medium">Validación vía videollamada HD y liberación de fondos con QR.</p>
                                    </button>
                                </div>
                            )}
                            {requestedService === 'cambio_propietario' && <GestoriaAdvisor onSelect={handleGestoriaSelect} />}
                            {requestedService === 'seguro_aliado' && <InsuranceSelector carValue={carPrice} onSelectOption={handleInsuranceSelect} />}
                            {requestedService === 'aviso_venta' && (
                                <div className="flex flex-col md:flex-row items-center gap-8">
                                    <div className="h-20 w-20 bg-amber-500/10 rounded-3xl flex items-center justify-center text-amber-500 border border-amber-500/20">
                                        <AlertTriangle className="h-10 w-10" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-white font-black text-xl italic uppercase tracking-tight mb-2">Aviso de Venta SEMOVI</h4>
                                        <p className="text-sm text-zinc-500 font-medium mb-6">Generamos tu notificación oficial para {state}. El documento está listo para descarga y firma digital.</p>
                                        <button onClick={() => toast.success("Documento generado satisfactoriamente")} className="h-14 px-8 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-3">
                                            <Download className="h-5 w-5" /> Descargar Formato Oficial
                                        </button>
                                    </div>
                                </div>
                            )}
                            {requestedService === 'carta_responsiva' && (
                                <div className="flex flex-col md:flex-row items-center gap-8">
                                    <div className="h-20 w-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                                        <ShieldCheck className="h-10 w-10" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-white font-black text-xl italic uppercase tracking-tight mb-2">Contrato de Deslinde Legal</h4>
                                        <p className="text-sm text-zinc-500 font-medium mb-6">Protección 360° ante multas o incidentes post-entrega. Validez jurídica ante notario.</p>
                                        <Link href={`/dashboard/release-letter/${transactionId}`} className="inline-flex h-14 px-8 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 hover:scale-105 transition-all items-center gap-3">
                                            <FileText className="h-5 w-5" /> Generar Carta Digital
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Concierge Inteligente - The Masterpiece */}
                <div className="relative group mt-8">
                    <div className={cn(
                        "absolute -inset-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 rounded-[3rem] blur-xl opacity-25 group-hover:opacity-50 transition-opacity duration-1000",
                        remindersEnabled && "opacity-60 blur-2xl"
                    )} />
                    
                    <div className="relative bg-zinc-900 dark:bg-black rounded-[2.5rem] p-10 flex flex-col xl:flex-row items-center justify-between gap-12 border border-white/10 shadow-3xl overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                        
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                            <div className={cn(
                                "h-24 w-24 rounded-[2rem] flex items-center justify-center transition-all duration-1000 border-2 relative",
                                remindersEnabled 
                                    ? "bg-white text-indigo-600 border-white shadow-[0_0_50px_rgba(255,255,255,0.3)] scale-110" 
                                    : "bg-white/5 text-white border-white/10"
                            )}>
                                <BellRing className={cn("h-10 w-10", remindersEnabled && "animate-bounce")} />
                                {remindersEnabled && (
                                    <div className="absolute -top-2 -right-2 h-6 w-6 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] font-black text-white animate-pulse">
                                        ON
                                    </div>
                                )}
                            </div>
                            <div className="text-center md:text-left">
                                <h3 className="font-black text-3xl text-white italic uppercase tracking-tighter mb-2">Concierge <span className="text-indigo-500">Inteligente</span></h3>
                                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                        <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Mantenimientos
                                    </span>
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                        <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Tenencias
                                    </span>
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                        <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Verificaciones
                                    </span>
                                </div>
                            </div>
                        </div>

                        {remindersEnabled && (
                            <div className="relative z-10 flex-1 max-w-md animate-in fade-in slide-in-from-right-8 duration-700">
                                <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-4">
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Próximas Alertas</p>
                                    <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
                                        <span className="uppercase">Cambio de Aceite (Est.)</span>
                                        <span className="text-white italic">En 4,200 km</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
                                        <span className="uppercase">Tenencia {new Date().getFullYear() + 1}</span>
                                        <span className="text-white italic">Enero 1st</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => {
                                const newStatus = !remindersEnabled;
                                setRemindersEnabled(newStatus);
                                if (newStatus) {
                                    toast.success("Concierge Élite Activado: Monitoreo 24/7 activo.");
                                }
                            }}
                            className={cn(
                                "relative z-10 w-full xl:w-auto px-12 h-16 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-3xl",
                                remindersEnabled 
                                    ? "bg-white text-indigo-600 hover:scale-105 active:scale-95" 
                                    : "bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-105 active:scale-95 shadow-xl shadow-indigo-600/20"
                            )}
                        >
                            {remindersEnabled ? "Sincronizado" : "Activar Ahora"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
