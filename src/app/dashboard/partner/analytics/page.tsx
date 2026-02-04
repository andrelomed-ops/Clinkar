"use client";

import { motion } from "framer-motion";
import { StatsOverview } from "@/components/dashboard/partner/StatsOverview";
import { PerformanceCharts } from "@/components/dashboard/partner/PerformanceCharts";
import {
    LayoutDashboard,
    ArrowLeft,
    Calendar,
    Filter,
    Download,
    ChevronRight,
    Search
} from "lucide-react";
import Link from "next/link";

export default function PartnerAnalyticsPage() {
    return (
        <div className="min-h-screen bg-[#fafafa] pb-20">
            {/* Header Section */}
            <div className="bg-white border-b border-zinc-100 px-4 md:px-10 py-6 md:py-10">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-indigo-600 font-black uppercase text-[10px] tracking-widest mb-2">
                                <LayoutDashboard size={14} />
                                Panel de Socios
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-zinc-900">
                                Analítica <span className="text-indigo-600">Enterprise</span>
                            </h1>
                            <p className="text-muted-foreground text-sm md:text-base font-medium max-w-xl">
                                Monitorea el rendimiento de tus activos, tasas de certificación y el impacto del Sello Clinkar en tu inventario.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="h-12 px-6 rounded-2xl bg-white border border-zinc-200 text-zinc-600 font-bold text-sm flex items-center gap-2 hover:bg-zinc-50 transition-colors">
                                <Calendar size={18} />
                                Últimos 30 días
                            </button>
                            <button className="h-12 px-6 rounded-2xl bg-zinc-950 text-white font-black text-sm flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-zinc-950/20">
                                <Download size={18} />
                                Exportar Reporte
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 md:px-10 pt-10 space-y-10">
                {/* Stats Grid */}
                <StatsOverview />

                {/* Charts Section */}
                <PerformanceCharts />

                {/* Featured Inventory Status (Quick Access) */}
                <div className="rounded-[2.5rem] bg-white border border-zinc-100 p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black tracking-tight">Inventario Reciente</h3>
                            <p className="text-sm text-muted-foreground font-medium">Estado de las últimas inspecciones solicitadas.</p>
                        </div>
                        <div className="hidden md:flex items-center gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                <input
                                    type="text"
                                    placeholder="Buscar activo..."
                                    className="h-10 pl-10 pr-4 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-64"
                                />
                            </div>
                            <button className="p-2 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors">
                                <Filter size={20} className="text-zinc-600" />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-zinc-100">
                                    <th className="pb-4 px-2">Activo</th>
                                    <th className="pb-4 px-2">Categoría</th>
                                    <th className="pb-4 px-2">Estado</th>
                                    <th className="pb-4 px-2">Sello Clinkar</th>
                                    <th className="pb-4 px-2 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {[
                                    { name: "Kia Sorento 2025", type: "SUV / Car", status: "Completado", score: 98, color: "text-emerald-500" },
                                    { name: "Azimut Grande 26M", type: "Náutico", status: "En Proceso", score: null, color: "text-amber-500" },
                                    { name: "Cessna Citation", type: "Aviación", status: "Agendado", score: null, color: "text-blue-500" },
                                    { name: "Tesla Model 3", type: "Sedán / Car", status: "Correciones", score: 72, color: "text-rose-500" },
                                ].map((item, i) => (
                                    <tr key={i} className="group hover:bg-zinc-50/50 transition-colors">
                                        <td className="py-4 px-2">
                                            <span className="font-bold text-zinc-900">{item.name}</span>
                                        </td>
                                        <td className="py-4 px-2">
                                            <span className="text-xs font-medium text-muted-foreground">{item.type}</span>
                                        </td>
                                        <td className="py-4 px-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${item.color} bg-current`} />
                                                <span className="text-xs font-bold">{item.status}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-2">
                                            {item.score ? (
                                                <div className="flex items-center gap-1">
                                                    <span className="text-xs font-black text-indigo-600">{item.score}%</span>
                                                    <div className="w-16 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-indigo-600" style={{ width: `${item.score}%` }} />
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] font-black uppercase text-zinc-300">Pendiente</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-2 text-right">
                                            <button className="p-2 rounded-xl border border-zinc-200 hover:border-indigo-600 hover:text-indigo-600 transition-all">
                                                <ChevronRight size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Back Button Floating */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                <Link href="/dashboard" className="h-14 px-8 rounded-full bg-white border border-zinc-200 shadow-2xl flex items-center gap-3 font-bold group hover:scale-105 transition-all text-sm">
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    Volver al Dashboard
                </Link>
            </div>
        </div>
    );
}
