"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { LegalReviewDashboard } from "@/components/admin/LegalReviewDashboard";
import { Loader2, ShieldCheck, Search, Filter, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminLegalHubPage() {
    const [riskStats, setRiskStats] = useState({ blocked: 1, warnings: 2 });
    const [expedientes, setExpedientes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const supabase = createBrowserClient();

    useEffect(() => {
        async function fetchData() {
            setLoading(false);

            // Reemplazamos temporalmente con datos demo robustos para mostrar el flujo incremental
            setExpedientes([
                {
                    id: "EXP-2024-001",
                    carMake: "Porsche",
                    carModel: "911 Carrera",
                    carYear: 2023,
                    sellerName: "Roberto Gómez Bolaños",
                    pldStatus: "APPROVED",
                    status: "PARTIAL",
                    documents: [
                        { id: "d1", type: "Factura", status: "APPROVED", url: "#", updatedAt: "2024-02-01" },
                        { id: "d2", type: "Identificación", status: "PENDING", url: "#", updatedAt: "2024-02-01" },
                        { id: "d3", type: "Contrato", status: "PENDING", url: "#", updatedAt: "2024-02-01" },
                    ]
                },
                {
                    id: "EXP-2024-002",
                    carMake: "Tesla",
                    carModel: "Model 3",
                    carYear: 2021,
                    sellerName: "Elon Musk (Demo)",
                    pldStatus: "BLOCKED_RISK",
                    status: "PENDING_DOCS",
                    documents: [
                        { id: "d4", type: "Factura", status: "PENDING", url: "#", updatedAt: "2024-02-01" },
                        { id: "d5", type: "Identificación", status: "REJECTED", url: "#", updatedAt: "2024-02-01" },
                    ]
                },
                {
                    id: "EXP-2024-003",
                    carMake: "Mazda",
                    carModel: "CX-5",
                    carYear: 2022,
                    sellerName: "Juan Pérez",
                    pldStatus: "PENDING",
                    status: "FINAL_REVIEW",
                    documents: [
                        { id: "d6", type: "Factura", status: "APPROVED", url: "#", updatedAt: "2024-02-01" },
                        { id: "d7", type: "Identificación", status: "APPROVED", url: "#", updatedAt: "2024-02-01" },
                        { id: "d8", type: "Contrato", status: "APPROVED", url: "#", updatedAt: "2024-02-01" },
                    ]
                }
            ]);
        }

        fetchData();
    }, [supabase]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
    );

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-12">
            <div className="max-w-[1600px] mx-auto space-y-10">

                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px]">
                            <ShieldCheck className="h-4 w-4" /> Centro de Operaciones Legales
                        </div>
                        <h1 className="text-4xl font-black tracking-tight italic uppercase italic">
                            Validación de <span className="text-primary italic">Expedientes</span>
                        </h1>
                    </div>
                </header>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="rounded-[2rem] border-none shadow-sm bg-indigo-600 text-white p-6 flex flex-col justify-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-zinc-100">Expedientes Hoy</p>
                        <h3 className="text-4xl font-black italic tracking-tighter text-white">42</h3>
                    </Card>

                    <Card className="rounded-[2rem] border border-border/50 shadow-sm bg-card p-6 flex flex-col justify-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">SLA de Respuesta</p>
                        <h3 className="text-4xl font-black italic tracking-tighter text-zinc-900 dark:text-zinc-100">1.2h</h3>
                    </Card>

                    <Card className={`rounded-[2rem] border-none shadow-sm p-6 flex flex-col justify-center ${riskStats.blocked > 0 ? 'bg-red-600' : 'bg-card'}`}>
                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${riskStats.blocked > 0 ? 'text-red-100' : 'text-zinc-500'}`}>
                            Alertas Críticas PLD
                        </p>
                        <h3 className={`text-4xl font-black italic tracking-tighter ${riskStats.blocked > 0 ? 'text-white' : 'text-zinc-900'}`}>
                            {riskStats.blocked}
                        </h3>
                    </Card>

                    <Card className="rounded-[2rem] border border-border/50 shadow-sm bg-card p-6 flex flex-col justify-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Faltan Documentos</p>
                        <h3 className="text-4xl font-black italic tracking-tighter text-amber-500">12</h3>
                    </Card>
                </div>

                {/* Main Legal Review Area */}
                <div className="space-y-8">
                    <LegalReviewDashboard initialExpedientes={expedientes} />
                </div>

                <footer className="pt-10 border-t border-dashed border-zinc-200 dark:border-zinc-800 text-center">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">Clinkar Verification System v2.5 • Operaciones Seguras</p>
                </footer>
            </div>
        </div>
    );
}
