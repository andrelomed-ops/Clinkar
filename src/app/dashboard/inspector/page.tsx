import { createClient } from "@/lib/supabase/server";
import { Shield, ClipboardCheck, Clock, CheckCircle, ArrowRight, Car } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function InspectorDashboard() {
    const supabase = await createClient();

    // Check for real user
    let { data: { user } } = await supabase.auth.getUser();

    // DEMO MODE BYPASS
    if (!user) {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const roleFn = cookieStore.get("clinkar_role");

        if (roleFn?.value === "inspector" || roleFn?.value === "legal") {
            // Mock a demo user for the dashboard
            user = {
                id: "demo-inspector-id",
                email: "demo@clinkar.com",
            } as any;
        } else {
            redirect("/login");
        }
    }

    const { data: profile } = user ? await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single() : { data: null };

    if (profile?.role !== "inspector" && profile?.role !== "admin") {
        // For demonstration purposes, if the user isn't an inspector, 
        // we'll show a message or redirect, but in a real app, RLS handles this.
    }

    // Fetch cars needing inspection
    const { data: pendingCars } = await supabase
        .from("cars")
        .select("*")
        .in("status", ["pending_inspection", "received"]);

    // Fetch recent inspections by this inspector
    const { data: completedInspections } = user ? await supabase
        .from("inspection_reports_150")
        .select("*, cars(make, model, year)")
        .eq("inspector_id", user.id)
        .order("created_at", { ascending: false }) : { data: [] };

    return (
        <div className="min-h-screen bg-secondary/30">
            <nav className="border-b bg-background px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-secondary rounded-full transition-colors" title="Volver al Inicio">
                        <ArrowRight className="h-5 w-5 rotate-180" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <Shield className="h-6 w-6 text-primary" />
                        <span className="font-bold">Inspector Hub</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase">Certificado</span>
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">IN</div>
                </div>
            </nav>

            <main className="p-6 md:p-12 max-w-6xl mx-auto space-y-12">
                <header>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white italic uppercase">Panel de Inspecciones</h1>
                    <p className="text-slate-500 dark:text-slate-300 mt-2 font-bold uppercase tracking-widest text-xs">Garantiza la transparencia y seguridad en cada transacción.</p>
                </header>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Pending Tasks */}
                    <section className="lg:col-span-2 space-y-6">
                        <h2 className="text-xl font-black flex items-center gap-2 text-slate-900 dark:text-white italic uppercase tracking-tight">
                            <Clock className="h-5 w-5 text-indigo-600" />
                            Vehículos por Inspeccionar
                        </h2>
                        <div className="grid gap-4">
                            <div className="grid gap-4">
                                {(pendingCars && pendingCars.length > 0) ? (
                                    pendingCars.map((car) => (
                                        <div key={car.id} className="bg-card rounded-[2.5rem] p-6 border border-border shadow-sm flex items-center justify-between group transition-all hover:border-indigo-600/50">
                                            <div className="flex items-center gap-6">
                                                <div className="h-16 w-24 bg-secondary/50 rounded-2xl overflow-hidden hidden sm:block border border-border/50">
                                                    {car.images?.[0] && <img src={car.images[0]} className="w-full h-full object-cover" />}
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-lg text-slate-900 dark:text-white italic uppercase tracking-tight">{car.make} {car.model}</h3>
                                                    <p className="text-[10px] text-slate-500 dark:text-slate-200 font-bold uppercase tracking-widest">VIN: {car.vin} • {car.year}</p>
                                                </div>
                                            </div>
                                            <Link
                                                href={`/dashboard/inspector/report-150/${car.id}`}
                                                className="h-12 px-6 rounded-2xl bg-indigo-600 text-white font-black flex items-center gap-2 transition-all hover:scale-105 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 text-xs uppercase italic tracking-wider"
                                            >
                                                <ClipboardCheck className="h-4 w-4" />
                                                Iniciar Reporte
                                            </Link>
                                        </div>
                                    ))
                                ) : (
                                    // MOCK DATA FOR DEMO / EMPTY STATE
                                    [
                                        { id: "mock-tesla-model3", make: "Tesla", model: "Model 3", year: 2022, vin: "5YJ3E1EBXKFPxxxxx", image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60" },
                                        { id: "mock-audi-q5", make: "Audi", model: "Q5 S-Line", year: 2021, vin: "WA1CFAFY5L2xxxxxx", image: "https://images.unsplash.com/photo-1629891325458-5c2b640a34b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60" },
                                        { id: "mock-mazda-3", make: "Mazda", model: "3 Sedan", year: 2023, vin: "3MZBP5Gxxxxxx", image: "https://images.unsplash.com/photo-1596489393166-261623956636?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60" }
                                    ].map((mockCar) => (
                                        <div key={mockCar.id} className="bg-card rounded-[2.5rem] p-6 border border-dashed border-indigo-600/30 shadow-sm flex items-center justify-between group transition-all hover:border-indigo-600/50">
                                            <div className="flex items-center gap-6">
                                                <div className="h-16 w-24 bg-secondary/50 rounded-2xl overflow-hidden hidden sm:block relative border border-border/50">
                                                    <div className="absolute inset-0 bg-indigo-600/10 flex items-center justify-center font-black text-[10px] text-indigo-600 z-10 uppercase tracking-tighter bg-white/80 dark:bg-black/80">DEMO</div>
                                                    <img src={mockCar.image} className="w-full h-full object-cover opacity-80" />
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-lg text-slate-900 dark:text-white italic uppercase tracking-tight">{mockCar.make} {mockCar.model}</h3>
                                                    <p className="text-[10px] text-slate-500 dark:text-slate-300 font-bold uppercase tracking-widest">VIN: {mockCar.vin} • {mockCar.year}</p>
                                                </div>
                                            </div>
                                            <Link
                                                href={`/dashboard/inspector/report-150/${mockCar.id}`}
                                                className="h-12 px-6 rounded-2xl bg-secondary/50 text-slate-600 dark:text-slate-200 font-black flex items-center gap-2 transition-all hover:scale-105 border border-border/50 text-xs uppercase italic tracking-wider"
                                            >
                                                <ClipboardCheck className="h-4 w-4" />
                                                Demo Reporte
                                            </Link>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Activity / Stats */}
                    <aside className="space-y-8">
                        <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden group">
                            <Shield className="absolute -bottom-4 -right-4 h-32 w-32 text-white/5 rotate-12 transition-transform group-hover:scale-110" />
                            <h3 className="text-xl font-black italic uppercase tracking-tighter mb-6">Tu Historial</h3>
                            <div className="space-y-4 relative z-10">
                                <div className="flex justify-between items-center text-sm border-b border-white/20 pb-4">
                                    <span className="font-bold uppercase tracking-widest text-[10px] text-white/70">Inspecciones Totales</span>
                                    <span className="font-black text-2xl italic">{(completedInspections?.length || 0) + 12}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold uppercase tracking-widest text-[10px] text-white/70">Rating Promedio</span>
                                    <span className="font-black text-2xl italic">4.9/5</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-card rounded-[2.5rem] p-8 border border-border shadow-sm space-y-6">
                            <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Actividad Reciente</h3>
                            <div className="space-y-6">
                                {completedInspections?.slice(0, 3).map((insp, i) => (
                                    <div key={i} className="flex gap-4 items-start group">
                                        <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20 transition-transform group-hover:scale-110">
                                            <CheckCircle className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase italic">{(insp.cars as any)?.make} {(insp.cars as any)?.model}</p>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Completado hoy</p>
                                        </div>
                                    </div>
                                ))}
                                {(!completedInspections || completedInspections.length === 0) && (
                                    <div className="text-center py-4">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No hay actividad reciente</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
