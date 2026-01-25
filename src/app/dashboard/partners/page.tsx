"use client";

import { useState } from "react";
import { MOCK_SERVICE_TICKETS, MOCK_FEE_CONFIG } from "@/data/serviceTickets";
import { ALL_CARS } from "@/data/cars";
import { Calendar, CheckCircle2, Clock, DollarSign, MapPin, Wrench } from "lucide-react";

export default function PartnerDashboardPage() {
    return (
        <div className="space-y-8 p-8">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black tracking-tight" >Tablero de Aliado</h1>
                    <p className="text-muted-foreground">Gestiona tus citas de inspección y pagos.</p>
                </div>
                <div className="bg-primary/10 text-primary px-4 py-2 rounded-xl font-bold text-sm">
                    Taller Verificado: Mecánica Tek Satélite
                </div>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Ingresos Totales</span>
                    <div className="text-2xl font-black text-green-600 flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        7,500.00 <span className="text-xs text-muted-foreground">MXN</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Tarifa por Servicio</span>
                    <div className="text-2xl font-black text-foreground flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        {MOCK_FEE_CONFIG.mechanicPayoutAmount} <span className="text-xs text-muted-foreground">MXN</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Tickets Activos</span>
                    <div className="text-2xl font-black text-blue-600 flex items-center gap-2">
                        <Wrench className="h-5 w-5" />
                        3
                    </div>
                </div>
            </div>

            {/* Service Tickets List */}
            <section className="bg-white rounded-[2rem] border border-border overflow-hidden">
                <div className="p-6 border-b border-border bg-slate-50/50">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Agenda de Servicios
                    </h2>
                </div>

                <div className="divide-y divide-border">
                    {MOCK_SERVICE_TICKETS.map(ticket => {
                        const car = ALL_CARS.find(c => c.id === ticket.carId);
                        return (
                            <div key={ticket.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row gap-6 items-start md:items-center">
                                {/* Date Badge */}
                                <div className="flex flex-col items-center bg-secondary rounded-xl p-3 min-w-[80px]">
                                    <span className="text-xs font-bold text-muted-foreground uppercase">FEB</span>
                                    <span className="text-2xl font-black text-foreground">{new Date(ticket.scheduledDate).getDate()}</span>
                                    <span className="text-xs font-medium text-muted-foreground">14:00</span>
                                </div>

                                {/* Car Info */}
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${ticket.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                ticket.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-amber-100 text-amber-700'
                                            }`}>
                                            {ticket.status.replace(/_/g, ' ')}
                                        </span>
                                        <span className="text-xs text-muted-foreground font-mono">{ticket.id}</span>
                                    </div>
                                    <h3 className="text-lg font-bold">{car?.make} {car?.model} {car?.year}</h3>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            {car?.location}
                                        </div>
                                    </div>
                                </div>

                                {/* Financial Status */}
                                <div className="flex flex-col items-end gap-2">
                                    <div className="text-right">
                                        <span className="text-xs font-bold text-muted-foreground block">Estado de Pago</span>
                                        <span className={`font-bold text-sm ${ticket.payoutStatus === 'PAID_TO_PARTNER' ? 'text-green-600' : 'text-amber-500'}`}>
                                            {ticket.payoutStatus === 'PAID_TO_PARTNER' ? 'DISPERSADO' : 'PENDIENTE'}
                                        </span>
                                    </div>
                                    {ticket.status === 'IN_PROGRESS' && (
                                        <button className="flex items-center gap-2 bg-primary text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                                            <CheckCircle2 className="h-4 w-4" />
                                            Completar Inspección
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
