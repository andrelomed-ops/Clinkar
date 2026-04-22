"use client";

import { useState, useEffect } from "react";
import { Search, Filter, MoreHorizontal, CheckCircle2, AlertCircle, Clock, Ban, ShieldAlert, ExternalLink, Users, DollarSign, Loader2, CarFront } from "lucide-react";
import { getPendingReferralPayouts, processReferralPayout } from "@/app/actions/admin";
import { createCarAction, getAdminInventoryAction } from "@/app/actions/cars";
import { getLegalTransactionsAction, overrideTransactionStatusAction } from "@/app/actions/transaction";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
    const [transactions, setTransactions] = useState<any[]>([]);

    const [inventory, setInventory] = useState<any[]>([]);
    const [view, setView] = useState<'OPERATIONS' | 'INVENTORY'>('OPERATIONS');
    const [loadingInventory, setLoadingInventory] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newCar, setNewCar] = useState({
        make: "",
        model: "",
        year: 2024,
        price: 0,
        mileage: 0,
        transmission: "Automatic",
        fuel_type: "Gasoline",
        location: "CDMX"
    });

    const [referralPayouts, setReferralPayouts] = useState<any[]>([]);
    const [payoutLoading, setPayoutLoading] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
            try {
                const payouts = await getPendingReferralPayouts();
                setReferralPayouts(payouts || []);
                
                setLoadingInventory(true);
                const cars = await getAdminInventoryAction();
                setInventory(cars || []);

                const txs = await getLegalTransactionsAction();
                setTransactions(txs || []);
            } catch (err) {
                console.error("Error loading admin data:", err);
            } finally {
                setLoadingInventory(false);
            }
        }
        loadData();
    }, []);

    const handleCreateCar = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createCarAction(newCar);
            toast.success("Vehículo publicado con éxito");
            setIsCreateModalOpen(false);
            // Reload inventory
            const cars = await getAdminInventoryAction();
            setInventory(cars || []);
        } catch (err: any) {
            toast.error(err.message || "Error al crear vehículo");
        }
    };

    const cycleStatus = async (id: string, currentStatus: string) => {
        let nextStatus = currentStatus;

        switch (currentStatus) {
            case "PENDING": nextStatus = "IN_VAULT"; break;
            case "IN_VAULT": nextStatus = "RELEASED"; break;
            case "RELEASED": nextStatus = "PENDING"; break;
            default: nextStatus = "PENDING"; break;
        }

        try {
            await overrideTransactionStatusAction(id, nextStatus);
            toast.success("Estado actualizado");
            const txs = await getLegalTransactionsAction();
            setTransactions(txs || []);
        } catch (err) {
            toast.error("Error al actualizar");
        }
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
                        <button 
                            onClick={() => setIsCreateModalOpen(true)}
                            className="h-12 px-6 bg-white text-black font-black rounded-xl hover:scale-105 transition-all"
                        >
                            + ALTA DE VEHÍCULO
                        </button>
                    </div>

                    {isCreateModalOpen && (
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] w-full max-w-2xl animate-in zoom-in-95 duration-200">
                                <h3 className="text-2xl font-black text-white mb-6 uppercase italic">Nuevo Vehículo en Inventario</h3>
                                <form onSubmit={handleCreateCar} className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Marca</label>
                                        <input required className="w-full h-12 bg-zinc-950 border border-zinc-800 rounded-xl px-4 text-white" placeholder="Toyota" onChange={e => setNewCar({...newCar, make: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Modelo</label>
                                        <input required className="w-full h-12 bg-zinc-950 border border-zinc-800 rounded-xl px-4 text-white" placeholder="Corolla" onChange={e => setNewCar({...newCar, model: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Año</label>
                                        <input required type="number" className="w-full h-12 bg-zinc-950 border border-zinc-800 rounded-xl px-4 text-white" placeholder="2022" onChange={e => setNewCar({...newCar, year: parseInt(e.target.value)})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Precio (MXN)</label>
                                        <input required type="number" className="w-full h-12 bg-zinc-950 border border-zinc-800 rounded-xl px-4 text-white" placeholder="350000" onChange={e => setNewCar({...newCar, price: parseFloat(e.target.value)})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Kilometraje</label>
                                        <input required type="number" className="w-full h-12 bg-zinc-950 border border-zinc-800 rounded-xl px-4 text-white" placeholder="15000" onChange={e => setNewCar({...newCar, mileage: parseInt(e.target.value)})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Ubicación</label>
                                        <input required className="w-full h-12 bg-zinc-950 border border-zinc-800 rounded-xl px-4 text-white" placeholder="Ciudad de México" onChange={e => setNewCar({...newCar, location: e.target.value})} />
                                    </div>
                                    <div className="col-span-2 pt-4 flex gap-4">
                                        <button type="submit" className="flex-1 h-14 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-500 transition-all uppercase tracking-widest">Publicar Ahora</button>
                                        <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-8 h-14 bg-zinc-800 text-zinc-400 font-black rounded-2xl hover:bg-zinc-700 transition-all uppercase tracking-widest">Cancelar</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    <div className="grid gap-4">
                        {inventory.map(car => (
                            <div key={car.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="h-16 w-24 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-center">
                                        <CarFront className="h-8 w-8 text-zinc-700" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-white">{car.make} {car.model} {car.year}</h4>
                                        <div className="flex gap-4 mt-1">
                                            <span className="text-xs text-zinc-500 font-bold tracking-widest">${car.price?.toLocaleString()} MXN</span>
                                            <span className={cn("text-[10px] font-black px-2 py-0.5 rounded", car.status === 'published' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500")}>
                                                {car.status?.toUpperCase()}
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
