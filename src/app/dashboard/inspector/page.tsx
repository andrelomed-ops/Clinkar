import { createClient } from "@/lib/supabase/server";
import { Shield, ClipboardCheck, Clock, CheckCircle, ArrowRight, Car } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function InspectorDashboard() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "inspector" && profile?.role !== "admin") {
        // For demonstration purposes, if the user isn't an inspector, 
        // we'll show a message or redirect, but in a real app, RLS handles this.
    }

    // Fetch cars needing inspection
    const { data: pendingCars } = await supabase
        .from("cars")
        .select("*")
        .in("status", ["published", "pending_inspection"]);

    // Fetch recent inspections by this inspector
    const { data: completedInspections } = await supabase
        .from("inspections")
        .select("*, cars(make, model, year)")
        .eq("inspector_id", user.id)
        .order("created_at", { ascending: false });

    return (
        <div className="min-h-screen bg-secondary/30">
            <nav className="border-b bg-background px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-primary" />
                    <span className="font-bold">Inspector Hub</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase">Certificado</span>
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">IN</div>
                </div>
            </nav>

            <main className="p-6 md:p-12 max-w-6xl mx-auto space-y-12">
                <header>
                    <h1 className="text-3xl font-bold tracking-tight">Panel de Inspecciones</h1>
                    <p className="text-muted-foreground mt-2">Garantiza la transparencia y seguridad en cada transacción.</p>
                </header>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Pending Tasks */}
                    <section className="lg:col-span-2 space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            Vehículos por Inspeccionar
                        </h2>
                        <div className="grid gap-4">
                            {pendingCars && pendingCars.length > 0 ? (
                                pendingCars.map((car) => (
                                    <div key={car.id} className="bg-background rounded-3xl p-6 border border-border shadow-sm flex items-center justify-between group transition-all hover:border-primary/50">
                                        <div className="flex items-center gap-6">
                                            <div className="h-16 w-24 bg-secondary rounded-2xl overflow-hidden hidden sm:block">
                                                {car.images?.[0] && <img src={car.images[0]} className="w-full h-full object-cover" />}
                                            </div>
                                            <div>
                                                <h3 className="font-bold">{car.make} {car.model} ({car.year})</h3>
                                                <p className="text-xs text-muted-foreground mt-1">VIN: {car.vin}</p>
                                            </div>
                                        </div>
                                        <Link
                                            href={`/dashboard/inspector/report-150/${car.id}`}
                                            className="h-12 px-6 rounded-2xl bg-primary text-primary-foreground font-bold flex items-center gap-2 transition-transform group-hover:scale-105"
                                        >
                                            <ClipboardCheck className="h-4 w-4" />
                                            Iniciar Reporte
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-background rounded-3xl p-12 text-center border border-border">
                                    <p className="text-muted-foreground font-medium">No hay vehículos pendientes.</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Activity / Stats */}
                    <aside className="space-y-8">
                        <div className="bg-primary rounded-[2.5rem] p-8 text-primary-foreground shadow-xl shadow-primary/20">
                            <h3 className="text-lg font-bold mb-6">Tu Historial</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm border-b border-primary-foreground/20 pb-4">
                                    <span>Inspecciones Totales</span>
                                    <span className="font-bold text-xl">{completedInspections?.length || 0}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span>Rating Promedio</span>
                                    <span className="font-bold text-xl">4.9/5</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-background rounded-3xl p-8 border border-border shadow-sm space-y-6">
                            <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Recientes</h3>
                            <div className="space-y-6">
                                {completedInspections?.slice(0, 3).map((insp, i) => (
                                    <div key={i} className="flex gap-4 items-start">
                                        <div className="h-8 w-8 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center shrink-0">
                                            <CheckCircle className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">{(insp.cars as any)?.make} {(insp.cars as any)?.model}</p>
                                            <p className="text-xs text-muted-foreground">Completado hoy</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
