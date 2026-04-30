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
    const [stats, setStats] = useState<any>(null);
    const supabase = useMemo(() => createBrowserClient(), []);
    const router = useRouter();

    useEffect(() => {
        async function init() {
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

            if (profile?.role?.toLowerCase() === "admin" || user.email === 'starterkar@hotmail.com') {
                setIsAdmin(true);
                const { getAnnualBusinessStatsAction } = await import("@/app/actions/analytics");
                const data = await getAnnualBusinessStatsAction();
                setStats(data);
            } else {
                router.push("/dashboard");
            }
            setIsLoading(false);
        }
        init();
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
        <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30">
            <main className="max-w-7xl mx-auto px-8 py-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div className="animate-in fade-in slide-in-from-left-8 duration-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-1 w-12 bg-indigo-600 rounded-full" />
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em]">Business Intelligence</span>
                        </div>
                        <h1 className="text-6xl font-black text-white tracking-tighter italic uppercase leading-none">
                            Informe <span className="text-indigo-600">Anual</span>
                        </h1>
                        <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-6 flex items-center gap-2">
                            <Activity className="h-3 w-3" /> Resumen Ejecutivo de Operaciones • Periodo 2025-2026
                        </p>
                    </div>

                    <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-8 duration-700">
                        <button className="h-14 px-8 bg-zinc-900 border border-zinc-800 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-zinc-800 transition-all">
                            <Calendar className="h-4 w-4 text-zinc-500" />
                            Filtrar Año
                        </button>
                        <button className="h-14 px-10 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-2xl shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all">
                            <Download className="h-4 w-4" />
                            Exportar PDF
                        </button>
                    </div>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    <KpiCard 
                        title="GMV Total" 
                        value={`$${((stats?.total_gmv || 0) / 1000000).toFixed(1)}M`} 
                        trend="+18.4%" 
                        positive={true} 
                        icon={<DollarSign className="h-6 w-6" />}
                        delay="delay-100"
                    />
                    <KpiCard 
                        title="Operaciones" 
                        value={stats?.total_sales || 0} 
                        trend="+12.5%" 
                        positive={true} 
                        icon={<Car className="h-6 w-6" />}
                        delay="delay-200"
                    />
                    <KpiCard 
                        title="Ventas Completadas" 
                        value={stats?.completed_sales || 0} 
                        trend="+5.2%" 
                        positive={true} 
                        icon={<ShieldCheck className="h-6 w-6" />}
                        delay="delay-300"
                    />
                    <KpiCard 
                        title="Comisiones Estimadas" 
                        value={`$${((stats?.total_commissions || 0) / 1000).toFixed(1)}K`} 
                        trend="+4.8%" 
                        positive={true} 
                        icon={<Activity className="h-6 w-6" />}
                        delay="delay-400"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Brand Performance */}
                    <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
                        <div className="bg-zinc-900 rounded-[3rem] p-12 border border-zinc-800 shadow-2xl">
                            <div className="flex items-center justify-between mb-10">
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-indigo-500">Top 5 Marcas más Vendidas</h3>
                                <BarChart3 className="h-6 w-6 text-zinc-700" />
                            </div>
                            <div className="space-y-8">
                                <BrandProgress brand="BMW" percentage={24} color="bg-indigo-600" count={104} />
                                <BrandProgress brand="Tesla" percentage={18} color="bg-red-600" count={78} />
                                <BrandProgress brand="Mercedes-Benz" percentage={15} color="bg-zinc-700" count={65} />
                                <BrandProgress brand="Audi" percentage={12} color="bg-zinc-600" count={52} />
                                <BrandProgress brand="BYD" percentage={10} color="bg-emerald-600" count={43} />
                            </div>
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-12 duration-1000 delay-700">
                        <div className="bg-zinc-900 rounded-[3rem] p-12 text-white border border-zinc-800 shadow-2xl relative overflow-hidden group">
                            <div className="absolute -top-10 -right-10 p-8 opacity-[0.03] group-hover:scale-110 group-hover:opacity-[0.05] transition-all duration-1000">
                                <PieChart className="h-64 w-64" />
                            </div>
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-12 relative z-10 text-indigo-500">Revenue Mix</h3>
                            <div className="space-y-10 relative z-10">
                                <RevenueItem label="Comisiones de Venta" value="$4.36M" color="bg-indigo-600" />
                                <RevenueItem label="Servicios Elite" value="$1.82M" color="bg-emerald-600" />
                                <RevenueItem label="Suscripciones" value="$0.54M" color="bg-amber-600" />
                            </div>
                            <div className="mt-16 pt-10 border-t border-zinc-800">
                                <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] mb-2">Ingreso Total Proyectado</p>
                                <p className="text-5xl font-black tracking-tighter italic text-white">$6.72M</p>
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
            "bg-zinc-900 rounded-[2rem] p-8 border border-zinc-800 shadow-2xl group hover:border-indigo-500/50 transition-all animate-in fade-in slide-in-from-bottom-8 duration-700",
            delay
        )}>
            <div className="flex items-center justify-between mb-6">
                <div className="h-14 w-14 bg-black rounded-2xl flex items-center justify-center text-zinc-500 group-hover:text-indigo-500 group-hover:bg-indigo-500/10 transition-all duration-500">
                    {icon}
                </div>
                <div className={cn(
                    "flex items-center gap-1 text-[10px] font-black px-3 py-1.5 rounded-xl border",
                    positive ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : "text-rose-500 bg-rose-500/10 border-rose-500/20"
                )}>
                    {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {trend}
                </div>
            </div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2">{title}</p>
            <p className="text-4xl font-black tracking-tighter italic text-white">{value}</p>
        </div>
    );
}

function BrandProgress({ brand, percentage, color, count }: any) {
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-end">
                <span className="text-sm font-black text-white uppercase italic">{brand}</span>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{count} unidades • {percentage}%</span>
            </div>
            <div className="h-2.5 bg-black rounded-full overflow-hidden border border-zinc-800/50">
                <div className={cn("h-full rounded-full transition-all duration-1000", color)} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    );
}

function RevenueItem({ label, value, color }: any) {
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{label}</span>
                <span className="text-lg font-black italic text-white">{value}</span>
            </div>
            <div className="h-2 bg-black rounded-full overflow-hidden border border-zinc-800/50">
                <div className={cn("h-full rounded-full", color)} style={{ width: '70%' }} />
            </div>
        </div>
    );
}
