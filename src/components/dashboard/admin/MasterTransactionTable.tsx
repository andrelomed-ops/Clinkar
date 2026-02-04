"use client";

import { useState } from "react";
import { TransactionService } from "@/services/TransactionService";
import {
    Search,
    Filter,
    MoreVertical,
    Eye,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Loader2,
    ShieldAlert,
    Package,
    Brain
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { LegalReviewDashboard } from "./LegalReviewDashboard";

interface MasterTransactionTableProps {
    transactions: any[];
}

export function MasterTransactionTable({ transactions: initialTransactions }: MasterTransactionTableProps) {
    const [transactions, setTransactions] = useState(initialTransactions);
    const [searchTerm, setSearchTerm] = useState("");
    const [updating, setUpdating] = useState<string | null>(null);
    const [reviewingCar, setReviewingCar] = useState<any | null>(null);
    const router = useRouter();
    const supabase = createBrowserClient();

    const filteredTransactions = transactions.filter(t =>
        t.cars?.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.cars?.vin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.buyer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleForceStatus = async (id: string, newStatus: string) => {
        if (!confirm(`¿Estás SEGURO de forzar el estado a ${newStatus}? Esta acción es irreversible.`)) return;

        setUpdating(id);
        const res = await TransactionService.overrideTransactionStatus(supabase, id, newStatus);
        if (res.success) {
            setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
            router.refresh();
        }
        setUpdating(null);
    };

    return (
        <section className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-border shadow-sm overflow-hidden mt-8">
            <div className="p-8 border-b border-border bg-slate-50/50 dark:bg-zinc-800/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                        <ShieldAlert className="h-5 w-5 text-primary" />
                        Gestión Maestra de Transacciones
                    </h2>
                    <p className="text-xs text-muted-foreground">Supervisa y audita cada movimiento operativo.</p>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar por VIN, Auto o Cliente..."
                        className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                    <thead>
                        <tr className="bg-secondary/20 text-muted-foreground font-bold uppercase text-[10px] tracking-widest border-b border-border">
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">ID Transacción / Auto</th>
                            <th className="px-6 py-4">Participantes</th>
                            <th className="px-6 py-4">Monto</th>
                            <th className="px-6 py-4 text-right">Acciones de Control</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filteredTransactions.map(t => (
                            <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                                <td className="px-6 py-4">
                                    <StatusBadge status={t.status} />
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-foreground">
                                        {t.cars?.make} {t.cars?.model}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground font-mono uppercase">
                                        VIN: {t.cars?.vin?.slice(-6)} | ID: {t.id.slice(0, 8)}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-xs flex flex-col gap-1">
                                        <span className="font-medium text-foreground">B: {t.buyer?.full_name || 'N/A'}</span>
                                        <span className="text-muted-foreground">S: {t.seller?.full_name || 'N/A'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-black text-foreground">
                                        ${Number(t.car_price).toLocaleString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        {updating === t.id ? (
                                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                        ) : (
                                            <>
                                                {t.status === 'PENDING' && (
                                                    <button
                                                        onClick={() => handleForceStatus(t.id, 'IN_VAULT')}
                                                        className="p-2 hover:bg-green-100 text-green-600 rounded-lg transition-colors"
                                                        title="Forzar a Bóveda"
                                                    >
                                                        <CheckCircle2 className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {t.status === 'IN_VAULT' && (
                                                    <button
                                                        onClick={() => handleForceStatus(t.id, 'RELEASED')}
                                                        className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                                                        title="Forzar Liberación"
                                                    >
                                                        <Package className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {t.status !== 'CANCELLED' && t.status !== 'RELEASED' && (
                                                    <button
                                                        onClick={() => handleForceStatus(t.id, 'CANCELLED')}
                                                        className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                                                        title="Forzar Cancelación"
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setReviewingCar(t)}
                                                    className="p-2 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors"
                                                    title="Revisión Legal IA"
                                                >
                                                    <Brain className="h-4 w-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {reviewingCar && (
                <LegalReviewDashboard
                    carId={reviewingCar.cars?.id}
                    carDetails={reviewingCar.cars}
                    seller={reviewingCar.seller}
                    initialDocuments={reviewingCar.cars?.documents || []}
                    onClose={() => setReviewingCar(null)}
                    onStatusUpdate={(newStatus) => {
                        setTransactions(prev => prev.map(t =>
                            t.cars?.id === reviewingCar.cars?.id ? { ...t, cars: { ...t.cars, status: newStatus } } : t
                        ));
                        router.refresh();
                    }}
                />
            )}
        </section>
    );
}

function StatusBadge({ status }: { status: string }) {
    const config: any = {
        'PENDING': { color: 'bg-zinc-100 text-zinc-700', label: 'Iniciada' },
        'IN_VAULT': { color: 'bg-amber-100 text-amber-700', label: 'En Bóveda' },
        'RELEASED': { color: 'bg-green-100 text-green-700', label: 'Liberada' },
        'CANCELLED': { color: 'bg-red-100 text-red-700', label: 'Cancelada' },
    };

    const s = config[status] || { color: 'bg-secondary text-muted-foreground', label: status };

    return (
        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${s.color}`}>
            {s.label}
        </span>
    );
}
