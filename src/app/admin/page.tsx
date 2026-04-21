"use client";

import { useState, useEffect } from "react";
import { Search, Filter, MoreHorizontal, CheckCircle2, AlertCircle, Clock, Ban, ShieldAlert, ExternalLink, Users, DollarSign, Loader2, CarFront } from "lucide-react";
import { getPendingReferralPayouts, processReferralPayout } from "@/app/actions/admin";
import { toast } from "sonner";

export default function AdminDashboard() {
    const [transactions, setTransactions] = useState([
        { id: "TX-9982", car: "Mazda CX-5 2022", seller: "Juan Pérez", buyer: "Carlos Demo", status: "PENDING", stage: "Verificación de Fondos", amount: 385000 },
        { id: "TX-9983", car: "Tesla Model 3 2021", seller: "Ana García", buyer: "N/A (Publicado)", status: "INSPECTION", stage: "Inspección Programada", amount: 550000 },
        { id: "TX-9984", car: "Toyota RAV4 2020", seller: "Pedro L.", buyer: "Roberto M.", status: "FUNDS_HELD", stage: "Liberación Pendiente", amount: 410000 },
    ]);

    const [inventory, setInventory] = useState([
        { id: "1", car: "BMW M4 2022", price: 1250000, offersEnabled: true, status: "PUBLICADO" },
        { id: "2", car: "Porsche 911 2021", price: 2100000, offersEnabled: false, status: "EN_REVISIÓN" },
    ]);

    const [view, setView] = useState<'OPERATIONS' | 'INVENTORY'>('OPERATIONS');

    const [referralPayouts, setReferralPayouts] = useState<any[]>([]);
    const [payoutLoading, setPayoutLoading] = useState<string | null>(null);

    useEffect(() => {
        async function loadPayouts() {
            try {
                const payouts = await getPendingReferralPayouts();
                setReferralPayouts(payouts || []);
            } catch (err) {
                console.error("Error loading payouts:", err);
            }
        }
        loadPayouts();
    }, []);

    const handlePayout = async (referralId: string, amount: number) => {
        setPayoutLoading(referralId);
        try {
            const result = await processReferralPayout(
                referralId,
                amount,
                `Pago de referido por operación completada`
            );
            toast.success("Link de pago generado - Envíalo al referidor");
            if (result?.paymentUrl) {
                await navigator.clipboard.writeText(result.paymentUrl);
                toast.info("Link copiado al portapapeles");
            }
            setReferralPayouts(prev => prev.filter(p => p.id !== referralId));
        } catch (err: any) {
            toast.error(err.message || "Error al generar link");
        } finally {
            setPayoutLoading(null);
        }
    };

    const cycleStatus = (id: string, currentStatus: string) => {
        let nextStatus = currentStatus;
        let nextStage = "";

        // Simple State Machine for Demo
        switch (currentStatus) {
            case "PENDING":
                nextStatus = "FUNDS_HELD";
                nextStage = "Fondos en Bóveda";
                break;
            case "FUNDS_HELD":
                nextStatus = "RELEASED";
                nextStage = "Operación Completada";
                break;
            case "INSPECTION":
                nextStatus = "PENDING"; // Assume listed -> pending sale
                nextStage = "En Negociación";
                break;
            case "RELEASED":
                nextStatus = "PENDING"; // Reset for demo
                nextStage = "Reinicio Demo";
                break;
            default:
                break;
        }

        setTransactions(prev => prev.map(tx =>
            tx.id === id ? { ...tx, status: nextStatus, stage: nextStage } : tx
        ));
    };

    return (
        <div className="max-w-[1600px] mx-auto p-8 bg-zinc-950 min-h-screen">
            <header className="flex justify-between items-center mb-10">
                <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">Panel de Control Maestro</h1>
                <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                    <button 
                        onClick={() => setView('OPERATIONS')}
                        className={cn("px-6 py-2 text-xs font-black uppercase rounded-lg transition-all", view === 'OPERATIONS' ? "bg-indigo-600 text-white" : "text-zinc-500")}
                    >
                        Operaciones
                    </button>
                    <button 
                        onClick={() => setView('INVENTORY')}
                        className={cn("px-6 py-2 text-xs font-black uppercase rounded-lg transition-all", view === 'INVENTORY' ? "bg-indigo-600 text-white" : "text-zinc-500")}
                    >
                        Inventario
                    </button>
                </div>
            </header>
            
            {/* KPI Header */}
            <div className="grid grid-cols-5 gap-4 mb-8">
                <KpiCard label="Volumen Activo" value="$1.2M" trend="+12%" />
                <KpiCard label="Riesgo PLD" value="2 ALERTAS" trend="CRÍTICO" active={false} alert={true} />
                <KpiCard label="Gestoría Pendiente" value="3 Tickets" trend="En Cola" />
                <KpiCard label="Referidos Pendientes" value="5" trend="Por Pagar" />
                <KpiCard label="Tiempo Promedio" value="48h" trend="Cierre" />
            </div>

            {view === 'OPERATIONS' ? (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        {/* COMPLIANCE CENTER */}
                        {/* ... existing code ... */}
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                        {/* ... existing table ... */}
                    </div>
                </>
            ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <CarFront className="h-5 w-5 text-indigo-400" />
                            Listado de Vehículos en Plataforma
                        </h2>
                        <button className="h-12 px-6 bg-white text-black font-black rounded-xl hover:scale-105 transition-all">
                            + ALTA DE VEHÍCULO
                        </button>
                    </div>

                    <div className="grid gap-4">
                        {inventory.map(car => (
                            <div key={car.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="h-16 w-24 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-center">
                                        <CarFront className="h-8 w-8 text-zinc-700" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-white">{car.car}</h4>
                                        <div className="flex gap-4 mt-1">
                                            <span className="text-xs text-zinc-500 font-bold tracking-widest">${car.price.toLocaleString()} MXN</span>
                                            <span className={cn("text-[10px] font-black px-2 py-0.5 rounded", car.status === 'PUBLICADO' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500")}>
                                                {car.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8">
                                    <div className="flex flex-col items-end gap-2">
                                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Ofertas Manuales</span>
                                        <button 
                                            onClick={() => setInventory(inventory.map(c => c.id === car.id ? {...c, offersEnabled: !c.offersEnabled} : c))}
                                            className={cn("h-8 w-14 rounded-full p-1 transition-all duration-300", car.offersEnabled ? "bg-indigo-600" : "bg-zinc-700")}
                                        >
                                            <div className={cn("h-6 w-6 bg-white rounded-full transition-transform duration-300", car.offersEnabled ? "translate-x-6" : "translate-x-0")} />
                                        </button>
                                    </div>
                                    <button className="h-10 w-10 flex items-center justify-center bg-zinc-800 rounded-xl hover:bg-zinc-700 transition-colors">
                                        <MoreHorizontal className="h-5 w-5 text-zinc-400" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function KpiCard({ label, value, trend, active = true, alert = false }: { label: string, value: string, trend: string, active?: boolean, alert?: boolean }) {
    return (
        <div className={`bg-zinc-900 border ${alert ? "border-red-900/50 bg-red-900/10" : "border-zinc-800"} p-4 rounded-lg`}>
            <p className={`text-xs font-bold ${alert ? "text-red-500" : "text-zinc-500"} uppercase mb-2`}>{label}</p>
            <div className="flex items-end justify-between">
                <h3 className={`text-2xl font-black ${alert ? "text-red-500" : active ? "text-zinc-100" : "text-zinc-600"}`}>{value}</h3>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${alert ? "bg-red-500 text-white border-red-600 animate-pulse" :
                    active ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-zinc-800 text-zinc-500 border-zinc-700"}`}>
                    {trend}
                </span>
            </div>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        PENDING: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        INSPECTION: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        FUNDS_HELD: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        RELEASED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    };

    const icons: Record<string, any> = {
        PENDING: Clock,
        INSPECTION: Search,
        FUNDS_HELD: ShieldAlert,
        RELEASED: CheckCircle2,
    };

    const Icon = icons[status] || AlertCircle;

    const labels: Record<string, string> = {
        PENDING: "PENDIENTE",
        INSPECTION: "INSPECCIÓN",
        FUNDS_HELD: "FONDOS EN BÓVEDA",
        RELEASED: "COMPLETADA",
    };

    return (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide ${styles[status] || "bg-zinc-800 text-zinc-400 border-zinc-700"}`}>
            <Icon className="h-3 w-3" />
            {labels[status] || status}
        </div>
    )
}
