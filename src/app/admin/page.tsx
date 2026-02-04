"use client";

import { useState } from "react";
import { Search, Filter, MoreHorizontal, CheckCircle2, AlertCircle, Clock, Ban, ShieldAlert, ExternalLink } from "lucide-react";

export default function AdminDashboard() {
    // Mock Data mimicking the Supabase structure
    const [transactions, setTransactions] = useState([
        { id: "TX-9982", car: "Mazda CX-5 2022", seller: "Juan Pérez", buyer: "Carlos Demo", status: "PENDING", stage: "Verificación de Fondos", amount: 385000 },
        { id: "TX-9983", car: "Tesla Model 3 2021", seller: "Ana García", buyer: "N/A (Listing)", status: "INSPECTION", stage: "Inspección Programada", amount: 550000 },
        { id: "TX-9984", car: "Toyota RAV4 2020", seller: "Pedro L.", buyer: "Roberto M.", status: "FUNDS_HELD", stage: "Liberación Pendiente", amount: 410000 },
    ]);

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
        <div className="max-w-[1600px] mx-auto">
            {/* KPI Header */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                <KpiCard label="Volumen Activo" value="$1.2M" trend="+12%" />
                <KpiCard label="Riesgo PLD" value="2 ALERTAS" trend="CRÍTICO" active={false} alert={true} />
                <KpiCard label="Gestoría Pendiente" value="3 Tickets" trend="En Cola" />
                <KpiCard label="Tiempo Promedio" value="48h" trend="Cierre" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* COMPLIANCE CENTER */}
                <div className="lg:col-span-2 bg-zinc-900 border border-red-900/30 rounded-2xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <ShieldAlert className="h-32 w-32 text-red-600" />
                    </div>
                    <div className="p-6 border-b border-zinc-800 flex items-center justify-between relative z-10">
                        <div>
                            <h2 className="font-bold text-lg text-red-500 flex items-center gap-2">
                                <ShieldAlert className="h-5 w-5" />
                                Centro de Riesgo & Compliance (PLD)
                            </h2>
                            <p className="text-xs text-zinc-500 mt-1">Monitoreo en tiempo real de listas negras (OFAC, 69-B, UIF)</p>
                        </div>
                        <span className="px-3 py-1 bg-red-500/10 text-red-500 text-xs font-bold uppercase rounded-full border border-red-500/20 animate-pulse">
                            2 Acciones Requeridas
                        </span>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {/* Mock Alert 1 */}
                            <div className="bg-zinc-950/50 border border-red-500/20 rounded-xl p-4 flex items-start justify-between">
                                <div className="flex gap-4">
                                    <div className="h-10 w-10 bg-red-500/10 rounded-lg flex items-center justify-center text-red-500">
                                        <Ban className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-zinc-200">Pablo Escobar</h4>
                                        <p className="text-xs text-red-400 font-bold uppercase mt-1">Coincidencia OFAC (Narcotráfico)</p>
                                        <p className="text-xs text-zinc-500 mt-2">Detectado hace 5 min • Ticket #PLD-9921</p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors">
                                        Bloquear Usuario
                                    </button>
                                    <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-lg transition-colors">
                                        Ver Expediente
                                    </button>
                                </div>
                            </div>
                            {/* Mock Alert 2 */}
                            <div className="bg-zinc-950/50 border border-amber-500/20 rounded-xl p-4 flex items-start justify-between">
                                <div className="flex gap-4">
                                    <div className="h-10 w-10 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-500">
                                        <AlertCircle className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-zinc-200">Facturera del Norte S.A.</h4>
                                        <p className="text-xs text-amber-500 font-bold uppercase mt-1">Posible 69-B (Facturera)</p>
                                        <p className="text-xs text-zinc-500 mt-2">Detectado hace 12 min • Ticket #PLD-9920</p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => window.location.href = '/admin/legal'}
                                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        Ir a Centro de Validación <ExternalLink className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SERVICE DESK */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-zinc-800">
                        <h2 className="font-bold text-lg text-indigo-400 flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Mesa de Gestoría
                        </h2>
                        <p className="text-xs text-zinc-500 mt-1">Solicitudes de trámites vehiculares</p>
                    </div>
                    <div className="p-4 flex-1 overflow-y-auto space-y-3">
                        {/* Ticket 1 */}
                        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 hover:border-indigo-500/30 transition-colors cursor-pointer">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-mono text-zinc-500">TICKET-8821</span>
                                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20">NUEVO</span>
                            </div>
                            <h4 className="font-bold text-sm text-zinc-200">Pago de Tenencia 2025</h4>
                            <p className="text-xs text-zinc-400 mt-1">Mazda CX-5 • Juan Pérez</p>
                        </div>
                        {/* Ticket 2 */}
                        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 hover:border-indigo-500/30 transition-colors cursor-pointer">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-mono text-zinc-500">TICKET-8819</span>
                                <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">EN PROCESO</span>
                            </div>
                            <h4 className="font-bold text-sm text-zinc-200">Baja de Placas (EdoMex)</h4>
                            <p className="text-xs text-zinc-400 mt-1">BMW X3 • Cliente VIP</p>
                        </div>
                    </div>
                    <div className="p-4 bg-zinc-950 border-t border-zinc-800 text-center">
                        <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300">Ver Todos los Tickets →</button>
                    </div>
                </div>
            </div>

            {/* Main Control Table (Existing) */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                    <h2 className="font-bold text-lg flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        Live Operations
                    </h2>
                    {/* ... Rest of existing table header ... */}
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Buscar Folio, VIN o Cliente..."
                                className="h-9 w-64 bg-zinc-950 border border-zinc-800 rounded text-xs pl-9 focus:ring-1 focus:ring-zinc-700 outline-none"
                            />
                        </div>
                        <button className="h-9 w-9 flex items-center justify-center border border-zinc-800 rounded hover:bg-zinc-800 transition-colors">
                            <Filter className="h-4 w-4 text-zinc-400" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-zinc-500 uppercase bg-zinc-950/50">
                            <tr>
                                <th className="px-6 py-3 font-medium">Folio</th>
                                <th className="px-6 py-3 font-medium">Vehículo / Activo</th>
                                <th className="px-6 py-3 font-medium">Actores</th>
                                <th className="px-6 py-3 font-medium">Estado</th>
                                <th className="px-6 py-3 font-medium">Etapa Actual</th>
                                <th className="px-6 py-3 font-medium text-right">Monto</th>
                                <th className="px-6 py-3 font-medium text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-zinc-800/30 transition-colors group">
                                    <td className="px-6 py-4 font-mono text-zinc-400">{tx.id}</td>
                                    <td className="px-6 py-4 font-bold">{tx.car}</td>
                                    <td className="px-6 py-4 text-zinc-400">
                                        <div className="flex flex-col">
                                            <span className="text-zinc-300">{tx.seller}</span>
                                            <span className="text-[10px] uppercase text-zinc-600">Vendedor</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={tx.status} />
                                    </td>
                                    <td className="px-6 py-4 text-zinc-400">{tx.stage}</td>
                                    <td className="px-6 py-4 text-right font-mono text-zinc-300">
                                        ${tx.amount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => cycleStatus(tx.id, tx.status)}
                                            className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded text-xs font-bold text-zinc-300 transition-colors"
                                        >
                                            Avanzar Estado
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
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

    return (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide ${styles[status] || "bg-zinc-800 text-zinc-400 border-zinc-700"}`}>
            <Icon className="h-3 w-3" />
            {status}
        </div>
    )
}
