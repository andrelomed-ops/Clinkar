"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import {
    Truck,
    Calendar,
    MapPin,
    CheckCircle2,
    Clock,
    Search,
    Filter,
    Loader2,
    ChevronRight,
    Smartphone,
    Navigation,
    Package
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function AdminLogisticsHubPage() {
    const [logisticsJobs, setLogisticsJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const supabase = createBrowserClient();

    useEffect(() => {
        async function fetchLogisticsData() {
            setLoading(true);
            try {
                // In a real scenario, this would fetch from a 'logistics' or 'movements' table
                // For now, let's mock some data to avoid the 404 and provide a working UI
                setTimeout(() => {
                    setLogisticsJobs([
                        {
                            id: "LOG-101",
                            car: "BMW X1 2024",
                            origin: "Santa Fe, CDMX",
                            destination: "Bóveda Clinkar Norte",
                            status: "IN_TRANSIT",
                            type: "PICKUP",
                            priority: "HIGH",
                            eta: "14:30 PM",
                            towingCompany: "Grúas Express"
                        },
                        {
                            id: "LOG-102",
                            car: "Mazda CX-30 2022",
                            origin: "Bóveda Clinkar Sur",
                            destination: "Polanco, CDMX",
                            status: "SCHEDULED",
                            type: "DELIVERY",
                            priority: "NORMAL",
                            eta: "Mañana 10:00 AM",
                            driver: "Roberto Sánchez"
                        },
                        {
                            id: "LOG-103",
                            car: "Nissan March 2021",
                            origin: "Coyoacán, CDMX",
                            destination: "Talleres Aliados",
                            status: "COMPLETED",
                            type: "INTERNAL_MOVE",
                            priority: "LOW",
                            eta: "Completado",
                            driver: "Ana Martínez"
                        }
                    ]);
                    setLoading(false);
                }, 1000);
            } catch (err) {
                console.error("Error fetching logistics data:", err);
                setLoading(false);
            }
        }

        fetchLogisticsData();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "IN_TRANSIT": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            case "SCHEDULED": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
            case "COMPLETED": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
            default: return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
    );

    return (
        <div className="min-h-screen bg-background p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-10">

                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px]">
                            <Truck className="h-4 w-4" /> Gestión de Movilidad Clinkar
                        </div>
                        <h1 className="text-4xl font-black tracking-tight italic uppercase italic">
                            Logística & <span className="text-primary italic">Entregas</span>
                        </h1>
                    </div>
                </header>

                {/* Logistics Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="rounded-[2rem] border-none shadow-sm bg-indigo-600 text-white p-6 flex flex-col justify-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/70 mb-2">En Tránsito</p>
                        <h3 className="text-3xl font-black italic tracking-tighter text-white">4</h3>
                    </Card>
                    <Card className="rounded-[2rem] border border-border/50 shadow-sm bg-card p-6 flex flex-col justify-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Programadas Hoy</p>
                        <h3 className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-slate-100">12</h3>
                    </Card>
                    <Card className="rounded-[2rem] border border-border/50 shadow-sm bg-card p-6 flex flex-col justify-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Entregas Exitosas</p>
                        <h3 className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-slate-100">89%</h3>
                    </Card>
                    <Card className="rounded-[2rem] border border-border/50 shadow-sm bg-card p-6 flex flex-col justify-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Flota Activa</p>
                        <h3 className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-slate-100">6</h3>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-3xl shadow-sm border border-border/50">
                    <div className="relative flex-1 w-full text-foreground">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por ID, vehículo o conductor..."
                            className="pl-11 h-12 rounded-2xl border-none bg-secondary/50 font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="h-12 rounded-2xl px-6 font-bold flex items-center gap-2">
                        <Filter className="h-4 w-4" /> Filtros Avanzados
                    </Button>
                </div>

                {/* Jobs List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-black italic uppercase tracking-tight flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" /> Operaciones en Tiempo Real
                    </h2>
                    <div className="grid gap-4">
                        {logisticsJobs.map((job) => (
                            <div key={job.id} className="bg-card border border-border/50 rounded-[2.5rem] p-6 hover:border-primary/30 transition-all group overflow-hidden relative">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                    <div className="flex items-center gap-6">
                                        <div className={cn(
                                            "h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 border",
                                            job.status === 'IN_TRANSIT' ? "bg-blue-500/10 text-blue-600 border-blue-200" :
                                                job.status === 'SCHEDULED' ? "bg-amber-500/10 text-amber-600 border-amber-200" :
                                                    "bg-emerald-500/10 text-emerald-600 border-emerald-200"
                                        )}>
                                            <Navigation className="h-8 w-8" />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-black text-xl italic uppercase tracking-tight text-slate-900 dark:text-slate-100">{job.car}</h3>
                                                <Badge variant="outline" className={cn("rounded-full font-black text-[10px] uppercase italic tracking-widest px-4 border-none py-1.5", getStatusColor(job.status))}>
                                                    {job.status.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                                                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                                                    <MapPin className="h-3.5 w-3.5 text-primary" />
                                                    {job.origin}
                                                    <ChevronRight className="h-3 w-3" />
                                                    {job.destination}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                                                    <Smartphone className="h-3.5 w-3.5 text-blue-500" />
                                                    Ref: {job.id}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right hidden md:block">
                                            <p className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">Llegada Estimada</p>
                                            <p className="font-black text-lg italic text-slate-900 dark:text-slate-100">{job.eta}</p>
                                        </div>
                                        <Button className="rounded-2xl h-12 px-6 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold hover:scale-105 transition-transform">
                                            Detalles
                                        </Button>
                                    </div>
                                </div>
                                {/* Background design element */}
                                <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
                            </div>
                        ))}
                    </div>
                </div>

                <footer className="pt-10 border-t border-dashed border-border text-center">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">Clinkar Global Logistics Master Panel • Secure Access Only</p>
                </footer>
            </div>
        </div>
    );
}
