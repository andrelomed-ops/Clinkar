"use client";

import { useState } from "react";
import {
    FileText,
    MapPin,
    ArrowRight,
    UserCog,
    Download,
    BellRing,
    AlertTriangle,
    ShieldCheck,
    Briefcase,
    CheckCircle2,
    Truck,
    ShieldAlert,
    Zap,
    FileSearch,
    Gavel,
    ChevronRight,
    ExternalLink,
    Star
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
    initialInsurance = false,
    role = "buyer"
}: { 
    transactionId: string, 
    carPrice?: number,
    carLocation?: string,
    state?: string,
    initialGestoria?: boolean,
    initialInsurance?: boolean,
    role?: "buyer" | "seller"
}) {
    const [remindersEnabled, setRemindersEnabled] = useState(false);
    const [requestedService, setRequestedService] = useState<string | null>(null);
    const [hasGestoria, setHasGestoria] = useState(initialGestoria);
    const [hasInsurance, setHasInsurance] = useState(initialInsurance);
    const [logistics, setLogistics] = useState<any>(null);
    const [warranty, setWarranty] = useState<{ type: WarrantyType, cost: number } | null>(null);

    const handleGestoriaSelect = async (active: boolean) => {
        if (!active) return;
        try {
            await updateTransactionServicesAction(transactionId, { gestoriaCost: 1000 });
            setHasGestoria(true);
            toast.success("Gestoría de cambio de propietario añadida ($1,000 + derechos)");
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
            toast.success(`Seguro con ${provider} añadido satisfactoriamente`);
        } catch (e) {
            toast.error("Error al añadir seguro");
        }
    };

    const services = [
        {
            id: "seguro_aliado",
            title: "Seguro de Cobertura Amplia",
            desc: "Protección inmediata antes de salir a carretera. Pólizas certificadas con los mejores partners.",
            icon: <Briefcase className="h-5 w-5" />,
            priceLabel: "Cotización Real",
            status: hasInsurance ? "CONTRATADO" : "PENDIENTE",
            priority: 1
        },
        {
            id: "cambio_propietario",
            title: "Gestoría VIP (Cambio Placas/Propietario)",
            desc: "Nos encargamos del trámite ante SCT/SEMOVI para que tu auto esté a tu nombre sin filas.",
            icon: <UserCog className="h-5 w-5" />,
            priceLabel: "$1,000 + Derechos",
            status: hasGestoria ? "SOLICITADO" : "DISPONIBLE",
            priority: 2
        },
        {
            id: "garantia",
            title: "Póliza de Cobertura Mecánica",
            desc: "Extensión de garantía hasta por 12 meses. Protege motor, transmisión y sistema eléctrico.",
            icon: <ShieldAlert className="h-5 w-5" />,
            priceLabel: "Desde $2,500",
            status: "RECOMENDADO",
            priority: 3
        },
        {
            id: "logistica",
            title: "Entrega Virtual con Traslado",
            desc: "Traslado en grúa plataforma especializada. El costo se calcula basado en la distancia.",
            icon: <Truck className="h-5 w-5" />,
            priceLabel: "Costo variable",
            status: "OPCIONAL",
            priority: 4
        },
        {
            id: "aviso_venta",
            title: "Aviso de Enajenación (Legal)",
            desc: "Notificación oficial ante autoridades para deslindar responsabilidades fiscales y legales.",
            icon: <FileSearch className="h-5 w-5" />,
            priceLabel: "$300 pesos",
            status: "DISPONIBLE",
            priority: 5
        },
    ];

    const sellerServices = [
        {
            id: "aviso_venta",
            title: "Aviso de Enajenación (Legal)",
            desc: "Notificación oficial ante autoridades para deslindar responsabilidades fiscales y legales. Imprescindible para evitar multas de un auto que ya vendiste.",
            icon: <FileSearch className="h-5 w-5" />,
            priceLabel: "$300 pesos",
            status: "RECOMENDADO",
            priority: 1
        }
    ];

    const currentServices = role === 'buyer' ? services : sellerServices;

    return (
        <div className="space-y-12">
            {/* Minimalist Hero Section */}
            <div className="bg-white rounded-[2rem] border border-zinc-100 p-8 md:p-12 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50" />
                
                <div className="relative z-10 max-w-2xl">
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="h-4 w-4 text-indigo-600 fill-indigo-600" />
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">
                            {role === 'buyer' ? 'Servicios de Valor Agregado' : 'Cierre de Operación'}
                        </span>
                    </div>
                    <h2 className="text-4xl font-black text-zinc-900 tracking-tighter uppercase italic leading-[0.9]">
                        {role === 'buyer' ? 'Prepara tu entrega' : 'Finaliza tu venta'} <br />
                        <span className="text-indigo-600">StarterKar Premium</span>
                    </h2>
                    <p className="mt-6 text-zinc-500 text-sm font-medium leading-relaxed">
                        {role === 'buyer' 
                            ? 'Asegura tu inversión y circula tranquilo desde el primer kilómetro. Estos servicios son esenciales para una transición legal y física sin complicaciones.' 
                            : 'Asegúrate de tener todos los documentos legales en regla y deslindarte de responsabilidades futuras sobre el vehículo.'}
                    </p>
                </div>
            </div>

            {/* Main Services List */}
            <div className="grid grid-cols-1 gap-4">
                {currentServices.map((service) => (
                    <div 
                        key={service.id}
                        className={cn(
                            "group bg-white rounded-2xl border transition-all duration-300 overflow-hidden",
                            requestedService === service.id 
                                ? "border-indigo-600 ring-4 ring-indigo-50 shadow-lg" 
                                : "border-zinc-100 hover:border-zinc-200 hover:shadow-md"
                        )}
                    >
                        <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-start gap-6">
                                <div className={cn(
                                    "h-12 w-12 rounded-xl flex items-center justify-center transition-colors",
                                    requestedService === service.id ? "bg-indigo-600 text-white" : "bg-zinc-50 text-zinc-400 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                                )}>
                                    {service.icon}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h4 className="font-black text-sm uppercase tracking-tight text-zinc-900">{service.title}</h4>
                                        <span className={cn(
                                            "text-[8px] font-black px-2 py-0.5 rounded-full border",
                                            service.status === 'CONTRATADO' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-zinc-50 text-zinc-400 border-zinc-100"
                                        )}>
                                            {service.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-zinc-500 font-medium max-w-xl">{service.desc}</p>
                                </div>
                            </div>
                            
                            <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-zinc-50">
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Precio</p>
                                    <p className="text-sm font-black text-zinc-900 italic tracking-tight">{service.priceLabel}</p>
                                </div>
                                <button 
                                    onClick={() => setRequestedService(requestedService === service.id ? null : service.id)}
                                    className={cn(
                                        "h-10 px-6 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all",
                                        requestedService === service.id 
                                            ? "bg-zinc-900 text-white" 
                                            : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200"
                                    )}
                                >
                                    {requestedService === service.id ? "Cerrar Panel" : "Configurar"}
                                </button>
                            </div>
                        </div>

                        {/* Interactive Selection Area */}
                        {requestedService === service.id && (
                            <div className="px-8 pb-8 animate-in slide-in-from-top-4 duration-300">
                                <div className="p-8 bg-zinc-50 rounded-2xl border border-zinc-100">
                                    {service.id === 'seguro_aliado' && <InsuranceSelector carValue={carPrice} onSelectOption={handleInsuranceSelect} />}
                                    {service.id === 'cambio_propietario' && <GestoriaAdvisor onSelect={handleGestoriaSelect} />}
                                    {service.id === 'garantia' && (
                                        <WarrantySelector
                                            carPrice={carPrice}
                                            onSelect={(w) => {
                                                setWarranty(w);
                                                if(w) toast.success(`Garantía ${w.type} pre-seleccionada`);
                                            }}
                                        />
                                    )}
                                    {service.id === 'logistica' && (
                                        <LogisticsWidget
                                            carLocation={carLocation}
                                            onQuote={(q) => {
                                                if(q?.cost) toast.success(`Cotización de traslado: $${q.cost.toLocaleString()}`);
                                            }}
                                        />
                                    )}
                                    {service.id === 'aviso_venta' && (
                                        <div className="flex flex-col md:flex-row items-center gap-8">
                                            <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center text-amber-500 border border-zinc-100 shadow-sm">
                                                <AlertTriangle className="h-8 w-8" />
                                            </div>
                                            <div className="flex-1">
                                                <h5 className="font-black text-sm uppercase tracking-tight mb-1 text-zinc-900">Aviso de Enajenación SEMOVI</h5>
                                                <p className="text-xs text-zinc-500 font-medium mb-4">Evita problemas legales deslindándote de la unidad ante la autoridad estatal de {state}.</p>
                                                <button 
                                                    onClick={async () => {
                                                        await updateTransactionServicesAction(transactionId, { gestoriaCost: 300 });
                                                        toast.success("Aviso de enajenación solicitado ($300)");
                                                    }}
                                                    className="h-10 px-6 bg-white border border-zinc-200 text-zinc-900 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-zinc-50 transition-all"
                                                >
                                                    Solicitar Aviso ($300)
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Documents & Downloads Section */}
            <div className="bg-white rounded-[2rem] border border-zinc-100 p-8 md:p-12 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    <h3 className="text-xl font-black text-zinc-900 tracking-tighter uppercase italic">Documentación Legal</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DownloadCard 
                        title="Contrato de Compraventa" 
                        desc="Modelo oficial PROFECO para compraventa de autos usados entre particulares." 
                        icon={<Gavel className="h-5 w-5" />}
                        onDownload={() => window.open(`/api/documents/contract?id=${transactionId}`, '_blank')}
                    />
                    <DownloadCard 
                        title="Carta Responsiva" 
                        desc="Formato legal para el deslinde de responsabilidades al momento de la entrega física." 
                        icon={<ShieldCheck className="h-5 w-5" />}
                        onDownload={() => window.open(`/api/documents/responsiva?id=${transactionId}`, '_blank')}
                    />
                    {role === 'buyer' ? (
                        <DownloadCard 
                            title="Certificado StarterKar" 
                            desc="Resumen ejecutivo de los 150 puntos de inspección y validación legal." 
                            icon={<Star className="h-5 w-5" />}
                            onDownload={() => window.open(`/api/documents/certificate?id=${transactionId}`, '_blank')}
                        />
                    ) : (
                        <DownloadCard 
                            title="Recibo de Honorarios" 
                            desc="Factura y comprobante del pago de comisión del 3.5% a StarterKar." 
                            icon={<FileText className="h-5 w-5" />}
                            onDownload={() => toast.info("El recibo estará disponible una vez liquidada la comisión.")}
                        />
                    )}
                </div>
            </div>

            {/* Concierge Section - Only for buyers */}
            {role === 'buyer' && (
                <div className="bg-zinc-900 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 border border-zinc-800 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px]" />
                    
                    <div className="relative z-10 flex items-center gap-6">
                        <div className={cn(
                            "h-16 w-16 rounded-2xl flex items-center justify-center transition-all duration-500",
                            remindersEnabled ? "bg-white text-indigo-600" : "bg-white/5 text-zinc-400"
                        )}>
                            <BellRing className={cn("h-7 w-7", remindersEnabled && "animate-pulse")} />
                        </div>
                        <div>
                            <h3 className="font-black text-xl text-white italic uppercase tracking-tighter mb-1">Concierge <span className="text-indigo-500">Inteligente</span></h3>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Sincronización de trámites y mantenimiento</p>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            setRemindersEnabled(!remindersEnabled);
                            if (!remindersEnabled) toast.success("Concierge Activado: Recibirás recordatorios de tenencias y servicios.");
                        }}
                        className={cn(
                            "relative z-10 px-8 h-12 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                            remindersEnabled ? "bg-white text-indigo-600" : "bg-indigo-600 text-white hover:bg-indigo-500"
                        )}
                    >
                        {remindersEnabled ? "Sincronizado" : "Activar Ahora"}
                    </button>
                </div>
            )}
        </div>
    );
}
        </div>
    );
}

function DownloadCard({ title, desc, icon, onDownload }: { title: string, desc: string, icon: React.ReactNode, onDownload?: () => void }) {
    return (
        <div 
            onClick={onDownload}
            className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-start gap-4 group hover:bg-white hover:border-indigo-200 transition-all cursor-pointer"
        >
            <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center text-zinc-400 group-hover:text-indigo-600 shadow-sm transition-colors">
                {icon}
            </div>
            <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                    <h5 className="font-black text-xs uppercase tracking-tight text-zinc-900">{title}</h5>
                    <Download className="h-4 w-4 text-zinc-300 group-hover:text-indigo-600 transition-colors" />
                </div>
                <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}
