"use client";

import { useState, useEffect, use } from "react";
import {
    Car as CarIcon,
    ShieldCheck,
    Clock,
    FileText,
    TrendingUp,
    ChevronRight,
    AlertCircle,
    CheckCircle2,
    Loader2,
    Smartphone,
    Sparkles,
    ArrowLeft
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AdminDocumentManager } from "@/components/dashboard/admin/AdminDocumentManager";
import { cn } from "@/lib/utils";
import { createBrowserClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SellerCarDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: carId } = use(params);
    const [car, setCar] = useState<any>(null);
    const [activeTransaction, setActiveTransaction] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createBrowserClient();
    const router = useRouter();

    useEffect(() => {
        async function loadCarData() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    router.push("/auth/login");
                    return;
                }

                // 1. Fetch specific car
                const { data: carData, error: carError } = await supabase
                    .from("cars")
                    .select("*")
                    .eq("id", carId)
                    .eq("seller_id", user.id)
                    .single();

                if (carError || !carData) {
                    console.error("Error fetching car:", carError);
                    router.push("/dashboard");
                    return;
                }

                // 2. Fetch active transaction for this car
                const { data: txs } = await supabase
                    .from("transactions")
                    .select("*")
                    .eq("car_id", carId)
                    .neq("status", "CANCELLED")
                    .order("created_at", { ascending: false })
                    .limit(1);

                const tx = txs && txs.length > 0 ? txs[0] : null;
                setActiveTransaction(tx);

                // Map status to progress
                let progress = 20;
                if (carData.status === 'CERTIFIED') progress = 60;
                if (tx && tx.status === 'IN_VAULT') progress = 85;
                if (tx && tx.status === 'RELEASED') progress = 100;

                setCar({
                    ...carData,
                    progress,
                    documents: carData.documents || []
                });
            } catch (error) {
                console.error("Error loading car data:", error);
            } finally {
                setLoading(false);
            }
        }

        loadCarData();

        const channel = supabase
            .channel(`car-detail-${carId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'cars', filter: `id=eq.${carId}` }, () => loadCarData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `car_id=eq.${carId}` }, () => loadCarData())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [carId, supabase, router]);

    const getStatusInfo = (status: string, txStatus?: string) => {
        if (txStatus === 'IN_VAULT') {
            return {
                label: "Pago en Bóveda",
                color: "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20",
                desc: "¡El comprador ya depositó! Procede a la entrega del vehículo.",
                icon: <ShieldCheck className="h-5 w-5" />
            };
        }
        if (txStatus === 'RELEASED') {
            return {
                label: "Venta Exitosa",
                color: "bg-emerald-500 text-white",
                desc: "La transacción se ha completado. Los fondos están en tu cuenta.",
                icon: <CheckCircle2 className="h-5 w-5" />
            };
        }

        switch (status) {
            case "LEGAL_REVIEW":
                return {
                    label: "Revisión Legal",
                    color: "bg-blue-500/10 text-blue-500",
                    desc: "Estamos validando tus documentos ante las autoridades.",
                    icon: <FileText className="h-5 w-5" />
                };
            case "INSPECTION_SCHEDULED":
                return {
                    label: "Inspección Programada",
                    color: "bg-amber-500/10 text-amber-500",
                    desc: "Un inspector de Clinkar visitará tu domicilio pronto.",
                    icon: <Clock className="h-5 w-5" />
                };
            case "CERTIFIED":
                return {
                    label: "Certificado & Publicado",
                    color: "bg-emerald-500/10 text-emerald-500",
                    desc: "Tu auto ya está visible para miles de compradores.",
                    icon: <CheckCircle2 className="h-5 w-5" />
                };
            case "sold":
                return {
                    label: "Vendido",
                    color: "bg-zinc-500/10 text-zinc-500",
                    desc: "Este vehículo ya fue entregado.",
                    icon: <CheckCircle2 className="h-5 w-5" />
                };
            default:
                return {
                    label: "En Proceso",
                    color: "bg-zinc-500/10 text-zinc-500",
                    desc: "Estamos preparando tu publicación.",
                    icon: <AlertCircle className="h-5 w-5" />
                };
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
    );

    if (!car) return null;

    const statusInfo = getStatusInfo(car.status, activeTransaction?.status);

    return (
        <div className="min-h-screen bg-background p-6 md:p-10">
            <div className="max-w-7xl mx-auto space-y-10">

                {/* Breadcrumbs / Back */}
                <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group">
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest">Volver al Dashboard</span>
                </Link>

                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3 italic uppercase">
                            <CarIcon className="h-8 w-8 text-primary" />
                            Gestión de Vehículo
                        </h1>
                        <p className="text-muted-foreground font-medium uppercase tracking-tight text-xs">{car.make} {car.model} {car.year} • ID: {carId.slice(0, 8)}</p>
                    </div>
                    <div className="flex gap-3">
                        {activeTransaction?.status === 'IN_VAULT' && (
                            <Link href={`/dashboard/handover/${activeTransaction.id}`}>
                                <Button className="rounded-2xl h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-black px-8 shadow-xl shadow-indigo-500/20 animate-pulse">
                                    <Smartphone className="mr-2 h-5 w-5" />
                                    Entregar Vehículo
                                </Button>
                            </Link>
                        )}
                        <Button variant="outline" asChild className="rounded-2xl h-12 font-bold group px-6">
                            <Link href={`/car/${car.id}`}>
                                Ver Publicación <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                    </div>
                </header>

                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Left & Center: Progress and Document Manager */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Progress Tracker Card */}
                        <Card className="rounded-[2.5rem] overflow-hidden border-border/50 shadow-2xl shadow-primary/5 bg-card">
                            <CardHeader className="bg-secondary/20 pb-8 border-b border-border/50">
                                <div className="flex items-center justify-between mb-4">
                                    <CardTitle className="text-2xl font-black italic uppercase tracking-tighter mb-0">Ruta de Venta</CardTitle>
                                    <Badge className={cn("px-5 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest border-none italic ml-2", statusInfo.color)}>
                                        {statusInfo.label}
                                    </Badge>
                                </div>
                                <CardDescription className="text-sm font-medium text-muted-foreground">{statusInfo.desc}</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-10 space-y-8">
                                <div className="space-y-6">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                        <span>Onboarding</span>
                                        <span>Bóveda Activa</span>
                                        <span>Venta Completada</span>
                                    </div>
                                    <div className="relative pt-1">
                                        <Progress value={car.progress} className="h-4 rounded-full bg-secondary" />
                                        <div className="absolute top-0 left-0 h-4 bg-gradient-to-r from-primary to-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${car.progress}%` }} />
                                    </div>
                                    <div className="grid grid-cols-4 gap-4">
                                        {[25, 50, 75, 100].map((step, i) => (
                                            <div key={i} className={cn(
                                                "h-1.5 rounded-full transition-colors duration-500",
                                                car.progress >= step ? "bg-indigo-500 shadow-sm" : "bg-secondary"
                                            )} />
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Document Manager (Shared Component) */}
                        <div className="bg-card rounded-[2.5rem] border border-border p-10 shadow-sm hover:shadow-md transition-shadow">
                            <div className="mb-8 border-b border-border/50 pb-6">
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter italic mb-1">Centro Documental</h3>
                                <p className="text-xs text-muted-foreground font-medium">Sube tus archivos para la certificación legal de Clinkar.</p>
                            </div>
                            <AdminDocumentManager initialDocuments={car.documents as any} />
                            <div className="mt-10 p-6 bg-blue-500/5 border border-blue-500/10 rounded-[2rem] flex items-start gap-4">
                                <AlertCircle className="h-6 w-6 text-blue-500 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest">Protocolo de Privacidad Clinkar</p>
                                    <p className="text-xs text-blue-600/80 dark:text-blue-400/80 font-medium leading-relaxed">
                                        Tus documentos son revisados por nuestra IA y un experto legal humano. Esto garantiza que el vehículo sea 100% legal y acelera tu venta.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Quick Stats & AI Advice */}
                    <div className="space-y-8">

                        <Card className="rounded-[2.5rem] border-border/50 bg-secondary/30 overflow-hidden border-none shadow-inner">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-xl font-black italic uppercase tracking-tighter">Resumen del Activo</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="aspect-[4/3] relative rounded-3xl overflow-hidden bg-zinc-100 shadow-2xl">
                                    <img
                                        src={car.images?.[0] || "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=1000"}
                                        alt={car.make}
                                        className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-700"
                                    />
                                    <div className="absolute top-4 left-4 px-3 py-1 bg-black/80 text-white text-[10px] font-black rounded-full backdrop-blur-md uppercase tracking-widest border border-white/10">
                                        STOCK: {car.id.slice(0, 8)}
                                    </div>
                                </div>
                                <div className="space-y-4 pt-4">
                                    <div className="flex justify-between items-center py-4 border-y border-border/50">
                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Valor de Activo</span>
                                        <span className="font-black italic text-2xl text-primary">${Number(car.price).toLocaleString()} <span className="text-xs">MXN</span></span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm pt-2">
                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Demanda Regional</span>
                                        <div className="flex items-center gap-1 text-emerald-500 font-bold group">
                                            <TrendingUp className="h-4 w-4 group-hover:translate-y-[-2px] transition-transform" />
                                            Alta (9.4/10)
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Clinkar AI Insight */}
                        <div className="p-10 rounded-[3rem] bg-zinc-950 text-white shadow-2xl shadow-indigo-500/10 relative overflow-hidden group border border-zinc-800">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-150 transition-transform duration-1000">
                                <ShieldCheck className="h-32 w-32" />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-xl font-black mb-6 flex items-center gap-2 italic uppercase tracking-tighter">
                                    <Sparkles className="h-5 w-5 text-indigo-400" />
                                    AI Matrix Insight
                                </h3>
                                <p className="text-sm text-zinc-400 leading-relaxed font-bold italic mb-8">
                                    "Basado en micro-tendencias de mercado, tu {car.make} {car.model} está posicionado en el top 5% de autos similares en CDMX. Mantener tus documentos al día incrementa la velocidad de cierre en un 40%."
                                </p>
                                <Button className="w-full h-12 rounded-xl bg-white text-zinc-950 font-black uppercase text-[10px] tracking-widest">
                                    Ver Análisis Completo
                                </Button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
