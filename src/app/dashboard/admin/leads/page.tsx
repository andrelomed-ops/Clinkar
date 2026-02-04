"use client";

import { useState } from "react";
import {
    Search,
    Filter,
    ArrowUpDown,
    MoreHorizontal,
    Building2,
    User,
    Calendar,
    ChevronRight,
    MessageSquare,
    CheckCircle2,
    Clock,
    XCircle,
    BadgeAlert
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/ui/navbar";

const MOCK_LEADS = [
    {
        id: "L-9012",
        customer: "Andrés García",
        interest: "Tesla Model 3 2026",
        agency: "Tesla México",
        tradeIn: "Mazda CX-5 2022",
        status: "NEW",
        date: "2026-01-29T10:30:00",
        value: 899900
    },
    {
        id: "L-9013",
        customer: "Mariana Sosa",
        interest: "BMW Series 3",
        agency: "BMW Autowelt",
        tradeIn: "Audi A3 2020",
        status: "CONTACTED",
        date: "2026-01-29T09:15:00",
        value: 1150000
    },
    {
        id: "L-9014",
        customer: "Roberto Lima",
        interest: "Toyota Sienna",
        agency: "Toyota Polanco",
        tradeIn: "Sienna 2018",
        status: "CONVERTED",
        date: "2026-01-28T16:45:00",
        value: 920000
    }
];

export default function AdminLeadsPage() {
    return (
        <div className="min-h-screen bg-background p-8 space-y-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-2 text-indigo-600 font-black uppercase tracking-widest text-[10px] mb-2">
                        <BadgeAlert className="h-3 w-3" /> Clinkar CRM Lead Management
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter italic uppercase">Gestión de Leads Trade-in</h1>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            placeholder="Buscar prospecto..."
                            className="h-12 pl-10 pr-4 bg-secondary/50 border border-border rounded-xl text-sm font-bold min-w-[300px]"
                        />
                    </div>
                    <button className="h-12 px-6 bg-primary text-primary-foreground rounded-xl font-black text-xs uppercase tracking-widest">Descargar Reporte</button>
                </div>
            </header>

            <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-secondary/30 border-b border-border">
                        <tr>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Prospecto</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Auto Interés / Agencia</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Unidad Usada</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Estado</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Valor Operación</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {MOCK_LEADS.map((lead) => (
                            <tr key={lead.id} className="hover:bg-secondary/10 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-950 rounded-full flex items-center justify-center font-black text-indigo-600 text-xs">
                                            {lead.customer[0]}
                                        </div>
                                        <div>
                                            <p className="font-black text-sm">{lead.customer}</p>
                                            <p className="text-[10px] text-muted-foreground font-bold">ID: {lead.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div>
                                        <p className="font-black text-sm">{lead.interest}</p>
                                        <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-tighter">{lead.agency}</p>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                        <span className="text-xs font-bold">{lead.tradeIn}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <StatusBadge status={lead.status} />
                                </td>
                                <td className="px-8 py-6">
                                    <p className="font-black text-sm italic">${lead.value.toLocaleString()}</p>
                                </td>
                                <td className="px-8 py-6">
                                    <button className="h-10 w-10 rounded-xl hover:bg-white dark:hover:bg-zinc-800 border border-transparent hover:border-border transition-all flex items-center justify-center">
                                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <SummaryCard
                    title="Conversión Promedio"
                    value="12.5%"
                    subtext="Lead a Venta"
                    color="text-indigo-600"
                />
                <SummaryCard
                    title="Comisión Est. Referidos"
                    value="$145,200"
                    subtext="Por canalización a Agencia"
                    color="text-emerald-600"
                />
                <SummaryCard
                    title="Enganches Gestionados"
                    value="$2.4M"
                    subtext="Capital Puente Clinkar"
                    color="text-blue-600"
                />
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case "NEW":
            return <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-blue-100">Nuevo</span>;
        case "CONTACTED":
            return <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-amber-100">Contactado</span>;
        case "CONVERTED":
            return <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-emerald-100">Convertido</span>;
        default:
            return <span className="px-3 py-1 bg-zinc-50 text-zinc-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-zinc-100 italic">Descartado</span>;
    }
}

function SummaryCard({ title, value, subtext, color }: any) {
    return (
        <div className="bg-card border border-border rounded-[2rem] p-8 shadow-sm space-y-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{title}</h3>
            <div className={cn("text-3xl font-black italic tracking-tighter", color)}>{value}</div>
            <p className="text-xs font-bold text-muted-foreground">{subtext}</p>
        </div>
    );
}
