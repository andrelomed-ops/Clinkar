"use client";

import { Calendar, CheckCircle2, DollarSign, MapPin, Wrench, Loader2, Truck, Scale, Shield, TrendingUp, Info } from "lucide-react";
import { useState } from "react";
import { PartnerService, ServiceTicket } from "@/services/PartnerService";
import { useRouter } from "next/navigation";
import { ReferralEngine } from "../ReferralEngine";
import { ClinkarPartsMarketplace } from "./ClinkarPartsMarketplace";
import { PartnerVettingStatus } from "./PartnerVettingStatus";
import { PartnerFinanceWidget } from "./PartnerFinanceWidget";
import { ClinkarEvolutionHub } from "../ClinkarEvolutionHub";
import { createBrowserClient } from "@/lib/supabase/client";

interface PartnersViewProps {
    initialTickets: any[];
    feeConfig: any;
    currentRole?: string;
}

export function PartnersView({ initialTickets, feeConfig, currentRole = 'INSPECTION' }: PartnersViewProps) {
    const [tickets, setTickets] = useState(initialTickets);
    const [updating, setUpdating] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createBrowserClient();

    const handleComplete = async (ticketId: string) => {
        setUpdating(ticketId);
        const res = await PartnerService.updateTicketStatus(supabase, ticketId, 'COMPLETED');
        if (res.success) {
            router.refresh();
            // In a real app, we would re-fetch or rely on refresh
            setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'COMPLETED' } : t));
        }
        setUpdating(null);
    };

    const activeCount = tickets.filter(t => t.status !== 'COMPLETED' && t.status !== 'REJECTED').length;
    const totalEarnings = tickets
        .filter(t => t.payout_status === 'PAID_TO_PARTNER')
        .reduce((sum, t) => sum + Number(t.payout_amount || 0), 0);

    const platformRevenue = tickets
        .filter(t => t.status === 'COMPLETED')
        .reduce((sum, t) => sum + (Number(t.total_amount || 0) - Number(t.payout_amount || 0)), 0);

    const getRoleTitle = () => {
        switch (currentRole) {
            case 'LOGISTICS': return 'Centro de Logística';
            case 'LEGAL': return 'Despacho Legal';
            default: return 'Centro de Inspección';
        }
    };

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Tablero de Aliado</h1>
                    <p className="text-muted-foreground">Gestiona tus citas de {currentRole === 'LOGISTICS' ? 'traslado' : currentRole === 'LEGAL' ? 'trámite' : 'inspección'} y pagos en tiempo real.</p>
                </div>
                <div className="bg-primary/10 text-primary px-4 py-2 rounded-xl font-bold text-sm border border-primary/20">
                    Socio Verificado: {getRoleTitle()} Clinkar
                </div>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-border shadow-sm space-y-2 group hover:border-indigo-500/50 transition-colors">
                    <span className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                        <TrendingUp className="h-3 w-3 text-indigo-500" /> Revenue Clinkar (Est.)
                    </span>
                    <div className="text-2xl font-black text-indigo-600 flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        {platformRevenue.toLocaleString()} <span className="text-xs text-muted-foreground">MXN</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-border shadow-sm space-y-2 border-l-4 border-l-green-500">
                    <span className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                        <DollarSign className="h-3 w-3 text-green-500" /> Mis Ganancias
                    </span>
                    <div className="text-2xl font-black text-green-600 flex items-center gap-2">
                        {totalEarnings.toLocaleString()} <span className="text-xs text-muted-foreground font-mono">MXN</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-border shadow-sm space-y-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                        <Wrench className="h-3 w-3 text-blue-500" /> Tickets Activos
                    </span>
                    <div className="text-2xl font-black text-blue-600 flex items-center gap-2">
                        {activeCount}
                    </div>
                </div>
            </div>

            {/* Service Tickets List */}
            <section className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-border overflow-hidden">
                <div className="p-6 border-b border-border bg-slate-50/50 dark:bg-zinc-800/50">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Agenda de Servicios
                    </h2>
                </div>

                <div className="divide-y divide-border">
                    {tickets.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground">
                            <p>No hay tickets de servicio asignados.</p>
                        </div>
                    ) : (
                        tickets.map(ticket => {
                            const car = ticket.cars;
                            const scheduledDate = new Date(ticket.scheduled_date);
                            return (
                                <div key={ticket.id} className="p-6 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors flex flex-col md:flex-row gap-6 items-start md:items-center">
                                    {/* Date Badge */}
                                    <div className="flex flex-col items-center bg-secondary dark:bg-zinc-800 rounded-xl p-3 min-w-[80px]">
                                        <span className="text-xs font-bold text-muted-foreground uppercase">
                                            {scheduledDate.toLocaleDateString('es-MX', { month: 'short' }).toUpperCase()}
                                        </span>
                                        <span className="text-2xl font-black text-foreground">{scheduledDate.getDate()}</span>
                                        <span className="text-xs font-medium text-muted-foreground">
                                            {scheduledDate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                        </span>
                                    </div>

                                    {/* Car Info */}
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            {ticket.type === 'TOWING' ? (
                                                <div className="p-1 px-2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-black text-zinc-500 border border-zinc-200 dark:border-zinc-700 flex items-center gap-1">
                                                    <Truck className="h-3 w-3" /> LOGÍSTICA
                                                </div>
                                            ) : ticket.type === 'LEGAL' ? (
                                                <div className="p-1 px-2 rounded-md bg-indigo-50 dark:bg-indigo-950/30 text-[10px] font-black text-indigo-600 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                                                    <Scale className="h-3 w-3" /> GESTORÍA
                                                </div>
                                            ) : (
                                                <div className="p-1 px-2 rounded-md bg-blue-50 dark:bg-blue-950/30 text-[10px] font-black text-blue-600 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                                                    <Wrench className="h-3 w-3" /> INSPECCIÓN
                                                </div>
                                            )}

                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${ticket.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                ticket.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                {ticket.status.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold">{car?.make} {car?.model} {car?.year}</h3>
                                        <div className="text-sm text-muted-foreground flex items-center gap-4">
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {car?.location || 'Ubicación no especificada'}
                                            </div>
                                            {ticket.total_amount && (
                                                <div className="flex items-center gap-1 text-zinc-400">
                                                    <Info className="h-3 w-3 cursor-help text-indigo-500" />
                                                    <span className="text-[10px] font-mono">Commission Share Active</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Financial Status */}
                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        <div className="text-right">
                                            <span className="text-xs font-bold text-muted-foreground block">Estado de Pago</span>
                                            <span className={`font-bold text-sm ${ticket.payout_status === 'PAID_TO_PARTNER' ? 'text-green-600' : 'text-amber-500'}`}>
                                                {ticket.payout_status === 'PAID_TO_PARTNER' ? 'DISPERSADO' : 'PENDIENTE'}
                                            </span>
                                        </div>
                                        {((ticket.status === 'IN_PROGRESS' || ticket.status === 'PAID_PENDING_VISIT') && currentRole !== 'LEGAL') && (
                                            <button
                                                onClick={() => handleComplete(ticket.id)}
                                                disabled={updating === ticket.id}
                                                className="flex items-center gap-2 bg-primary text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
                                            >
                                                {updating === ticket.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                                {currentRole === 'LOGISTICS' ? 'Confirmar Entrega' : 'Completar Inspección'}
                                            </button>
                                        )}
                                        {(currentRole === 'LEGAL' && ticket.status !== 'COMPLETED') && (
                                            <button className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all">
                                                Subir Dictamen
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Role Specific Modules */}
                    {currentRole === 'INSPECTION' && <ClinkarPartsMarketplace />}

                    {currentRole === 'LOGISTICS' && (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Truck className="h-5 w-5 text-blue-500" /> Fleet Management
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-zinc-800 p-4 rounded-xl">
                                    <p className="text-xs text-zinc-400 uppercase font-bold">Unidades Activas</p>
                                    <p className="text-2xl font-black text-white">4</p>
                                </div>
                                <div className="bg-zinc-800 p-4 rounded-xl">
                                    <p className="text-xs text-zinc-400 uppercase font-bold">Eficiencia Combustible</p>
                                    <p className="text-2xl font-black text-emerald-400">92%</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <ReferralEngine />

                    {currentRole === 'INSPECTION' && (
                        <div className="mt-8 shadow-2xl">
                            <ClinkarEvolutionHub />
                        </div>
                    )}
                </div>
                <div className="space-y-8">
                    <PartnerVettingStatus />
                    <PartnerFinanceWidget />

                    <div className="bg-white dark:bg-zinc-900 border border-border rounded-[2rem] p-6 space-y-4">
                        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Info className="h-4 w-4 text-indigo-500" /> Protocolos de Seguridad
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Recuerda que todos los servicios deben seguir el **Protocolo Clinkar Standard**. La omisión de puntos críticos afecta tu Quality Score.
                        </p>
                        <button className="w-full py-3 bg-secondary rounded-xl text-xs font-bold hover:bg-secondary/80 transition-all">
                            Ver Manual de Protocolo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
