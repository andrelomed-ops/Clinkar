"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import { Shield, CheckCircle2, AlertTriangle, ArrowRight, Loader2, Star } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function InspectionReportPage() {
    const { carId } = useParams();
    const [loading, setLoading] = useState(false);
    const [rating, setRating] = useState(5);
    const [summary, setSummary] = useState("");
    const [checks, setChecks] = useState({
        engine: "good",
        transmission: "good",
        suspension: "good",
        brakes: "good",
        electronics: "good",
        tires: "good",
    });

    const supabase = createClient();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Create inspection record
        const { error: inspError } = await supabase
            .from("inspections")
            .insert({
                car_id: carId,
                inspector_id: user.id,
                summary: summary,
                rating: rating,
                status: "completed",
            });

        if (inspError) {
            alert("Error: " + inspError.message);
            setLoading(false);
            return;
        }

        // 2. Update car status to 'inspected'
        await supabase
            .from("cars")
            .update({ status: "inspected" })
            .eq("id", carId);

        router.push("/dashboard/inspector?message=Reporte enviado correctamente");
    };

    const categories = [
        { id: "engine", label: "Motor" },
        { id: "transmission", label: "Transmisión" },
        { id: "suspension", label: "Suspensión" },
        { id: "brakes", label: "Frenos" },
        { id: "electronics", label: "Electrónica" },
        { id: "tires", label: "Llantas/Neumáticos" },
    ];

    return (
        <div className="min-h-screen bg-secondary/30">
            <nav className="border-b bg-background px-6 h-16 flex items-center justify-between">
                <Link href="/dashboard/inspector" className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-primary" />
                    <span className="font-bold">Clinkar Inspect</span>
                </Link>
            </nav>

            <main className="p-6 md:p-12 max-w-4xl mx-auto">
                <div className="space-y-8">
                    <header>
                        <h1 className="text-3xl font-bold tracking-tight">Reporte Mecánico Certificado</h1>
                        <p className="text-muted-foreground mt-2">Evalúa los componentes clave del vehículo con precisión.</p>
                    </header>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Mechanical Checklist */}
                        <section className="bg-background rounded-3xl p-8 shadow-sm border border-border space-y-8">
                            <h2 className="text-xl font-bold">Checklist de Diagnóstico</h2>

                            <div className="grid gap-6">
                                {categories.map((cat) => (
                                    <div key={cat.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-secondary/20">
                                        <span className="font-semibold">{cat.label}</span>
                                        <div className="flex gap-2">
                                            {["good", "fair", "poor"].map((status) => (
                                                <button
                                                    key={status}
                                                    type="button"
                                                    onClick={() => setChecks({ ...checks, [cat.id]: status })}
                                                    className={cn(
                                                        "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                                                        (checks as any)[cat.id] === status
                                                            ? status === "good" ? "bg-green-500 text-white" : status === "fair" ? "bg-yellow-500 text-white" : "bg-red-500 text-white"
                                                            : "bg-background text-muted-foreground border border-border hover:bg-secondary"
                                                    )}
                                                >
                                                    {status === "good" ? "Óptimo" : status === "fair" ? "Regular" : "Crítico"}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Overall Health */}
                        <section className="bg-background rounded-3xl p-8 shadow-sm border border-border space-y-6">
                            <h2 className="text-xl font-bold">Dictamen Final</h2>

                            <div className="space-y-4">
                                <label className="text-sm font-medium">Calificación General</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setRating(s)}
                                            className={cn(
                                                "h-12 w-12 rounded-xl flex items-center justify-center transition-all",
                                                rating >= s ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
                                            )}
                                        >
                                            <Star className={cn("h-6 w-6", rating >= s ? "fill-current" : "")} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Resumen del Estado Mecánico</label>
                                <textarea
                                    required
                                    rows={4}
                                    className="flex w-full rounded-xl border border-input bg-background p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="Detalla cualquier observación relevante sobre el motor, fugas, ruidos o desgaste..."
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                />
                            </div>
                        </section>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 h-14 rounded-2xl bg-primary text-primary-foreground font-bold transition-all hover:bg-primary/90 flex items-center justify-center gap-2 group"
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                    <>
                                        Certificar Inspección
                                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                            </button>
                            <Link
                                href="/dashboard/inspector"
                                className="h-14 px-8 rounded-2xl border border-border bg-background flex items-center justify-center font-semibold text-muted-foreground hover:bg-secondary"
                            >
                                Cancelar
                            </Link>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
