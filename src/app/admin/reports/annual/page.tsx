"use client";

import React from "react";
import { Navbar } from "@/components/ui/navbar";
import { 
    TrendingUp, 
    TrendingDown, 
    BarChart3, 
    PieChart, 
    Activity, 
    DollarSign, 
    Car, 
    ShieldCheck, 
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Filter,
    Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnnualReportPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const supabase = useMemo(() => createBrowserClient(), []);
    const router = useRouter();

    useEffect(() => {
        async function checkAdmin() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }

            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();

            if (profile?.role?.toLowerCase() === "admin") {
                setIsAdmin(true);
            } else {
                router.push("/dashboard");
            }
            setIsLoading(false);
        }
        checkAdmin();
    }, [supabase, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center space-y-4">
                <Skeleton className="h-12 w-64 rounded-xl" />
                <Skeleton className="h-4 w-48" />
            </div>
        );
    }

    if (!isAdmin) return null;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <Navbar variant="market" />

            <main className="max-w-7xl mx-auto px-6 pt-28 pb-20">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="animate-in fade-in slide-in-from-left-8 duration-700">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-1 w-12 bg-indigo-600 rounded-full" />
                            <span className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em]">Business Intelligence</span>
                        </div>
                        <h1 className="text-5xl font-black text-zinc-900 dark:text-white tracking-tighter italic uppercase leading-none">
                            Informe Anual <span className="text-indigo-600">StarterKar</span>
                        </h1>
                        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mt-4">Resumen Ejecutivo de Operaciones • Periodo 2025-2026</p>
                    </div>

                    <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-8 duration-700">
                        <button className="h-12 px-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-zinc-50 transition-colors">
                            <Calendar className="h-4 w-4" />
                            Filtrar Año
                        </button>
                        <button className="h-12 px-8 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-indigo-600/20 hover:scale-105 transition-all">
                            <Download className="h-4 w-4" />
                            Exportar PDF
                        </button>
                    </div>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <KpiCard 
                        title="GMV Total" 
                        value="$124.5M" 
                        trend="+18.4%" 
                        positive={true} 
                        icon={<DollarSign className="h-6 w-6" />}
                        delay="delay-100"
                    />
                    <KpiCard 
                        title="Operaciones" 
                        value="432" 
                        trend="+12.5%" 
                        positive={true} 
                        icon={<Car className="h-6 w-6" />}
                        delay="delay-200"
                    />
                    <KpiCard 
                        title="Tasa de Cierre" 
                        value="94.2%" 
                        trend="-2.1%" 
                        positive={false} 
                        icon={<ShieldCheck className="h-6 w-6" />}
                        delay="delay-300"
                    />
                    <KpiCard 
                        title="Ticket Promedio" 
                        value="$288.2K" 
                        trend="+4.8%" 
                        positive={true} 
                        icon={<Activity className="h-6 w-6" />}
                        delay="delay-400"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Brand Performance */}
                    <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
                        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-10 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black italic uppercase tracking-tight">Top 5 Marcas más Vendidas</h3>
                                <BarChart3 className="h-5 w-5 text-zinc-400" />
                            </div>
                            <div className="space-y-6">
                                <BrandProgress brand="BMW" percentage={24} color="bg-blue-500" count={104} />
                                <BrandProgress brand="Tesla" percentage={18} color="bg-red-600" count={78} />
                                <BrandProgress brand="Mercedes-Benz" percentage={15} color="bg-zinc-800" count={65} />
                                <BrandProgress brand="Audi" percentage={12} color="bg-zinc-400" count={52} />
                                <BrandProgress brand="BYD" percentage={10} color="bg-emerald-500" count={43} />
                            </div>
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-12 duration-1000 delay-700">
                        <div className="bg-zinc-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-zinc-900/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                <PieChart className="h-32 w-32" />
                            </div>
                            <h3 className="text-xl font-black italic uppercase tracking-tight mb-8 relative z-10">Revenue Mix</h3>
                            <div className="space-y-8 relative z-10">
                                <RevenueItem label="Comisiones de Venta" value="$4.36M" color="bg-indigo-500" />
                                <RevenueItem label="Servicios Elite" value="$1.82M" color="bg-emerald-500" />
                                <RevenueItem label="Suscripciones" value="$0.54M" color="bg-amber-500" />
                            </div>
                            <div className="mt-12 pt-8 border-t border-white/10">
                                <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Ingreso Total Proyectado</p>
                                <p className="text-4xl font-black tracking-tighter italic">$6.72M</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function KpiCard({ title, value, trend, positive, icon, delay }: any) {
    return (
        <div className={cn(
            "bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm group hover:scale-[1.02] transition-all animate-in fade-in slide-in-from-bottom-8 duration-700",
            delay
        )}>
            <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:text-indigo-600 transition-colors">
                    {icon}
                </div>
                <div className={cn(
                    "flex items-center gap-1 text-xs font-black px-2 py-1 rounded-lg",
                    positive ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10" : "text-red-600 bg-red-50 dark:bg-red-500/10"
                )}>
                    {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {trend}
                </div>
            </div>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">{title}</p>
            <p className="text-3xl font-black tracking-tighter italic">{value}</p>
        </div>
    );
}

function BrandProgress({ brand, percentage, color, count }: any) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <span className="text-sm font-black text-zinc-700 dark:text-zinc-200 uppercase">{brand}</span>
                <span className="text-xs font-bold text-zinc-400">{count} unidades • {percentage}%</span>
            </div>
            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all duration-1000", color)} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    );
}

function RevenueItem({ label, value, color }: any) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{label}</span>
                <span className="text-sm font-black italic">{value}</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full", color)} style={{ width: '70%' }} />
            </div>
        </div>
    );
}
