"use client";

import { useState, useEffect } from "react";
import { 
    Search, Filter, MoreHorizontal, CheckCircle2, Clock, 
    Ban, ShieldAlert, ExternalLink, Users, DollarSign, Loader2, 
    CarFront, LayoutDashboard, Zap, FileText, CreditCard, 
    ArrowUpRight, AlertTriangle, ShieldCheck, Download, 
    ChevronRight, Calendar, UserCheck, LogOut, Gift, Activity, MessageSquare,
    Trash2, Lock
} from "lucide-react";
import { getLegalTransactionsAction, overrideTransactionStatusAction, validateCEPAction, registerCommissionPaymentAction, updateTransactionServicesAction } from "@/app/actions/transaction";
import { createCarAction, getAdminInventoryAction, deleteCarAction, updateCarAction, updateCarStatusAction } from "@/app/actions/cars";
import { 
    approveInvestorApplicationAction, rejectInvestorApplicationAction, 
    getInvestorApplicationsAction, getPendingReferralPayouts, 
    processReferralPayout, updateUserRole, searchUsersAction,
    matchDemandAction, getGlobalConcurrencyStatsAction
} from "@/app/actions/admin";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createBrowserClient } from "@/lib/supabase/client";
import { CarFormModal } from "@/components/admin/CarFormModal";



// Admin Dashboard v4.7 - Nuclear Deletion & Emergency Debugging
if (typeof window !== 'undefined') {
    (window as any).AlertCircle = (window as any).AlertCircle || (() => null);
    console.log("StarterKar Ops: Dashboard v4.7 Loaded");
}
type AdminView = 'CONTROL' | 'INVENTORY' | 'INVESTORS' | 'USERS' | 'BILLING' | 'UPSELLS' | 'REFERRALS' | 'DEMANDS';

const STATUS_MAP: Record<string, { label: string, color: string }> = {
    // Car Statuses (Normalized to lowercase keys)
    'published': { label: 'PUBLICADO', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
    'certified': { label: 'CERTIFICADO', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
    'reserved': { label: 'RESERVADO', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
    'sold': { label: 'VENDIDO', color: 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20' },
    'archived': { label: 'ARCHIVADO', color: 'text-red-500 bg-red-500/10 border-red-500/20' },
    'draft': { label: 'BORRADOR', color: 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20' },
    'legal_review': { label: 'REVISIÓN LEGAL', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
    'inspection_scheduled': { label: 'INSPECCIÓN PROG.', color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
    'pending_inspection': { label: 'EN REVISIÓN', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
    
    // Transaction Statuses (Uppercase as they are mostly standardized)
    'PENDING': { label: 'PENDIENTE', color: 'text-amber-500' },
    'P2P_WAITING_PROOF': { label: 'ESPERANDO PAGO', color: 'text-amber-500' },
    'P2P_VALIDATED': { label: 'PAGO VALIDADO', color: 'text-emerald-500' },
    'HANDOVER_SCHEDULED': { label: 'ENTREGA PROG.', color: 'text-emerald-500' },
    'RELEASED': { label: 'FINALIZADO', color: 'text-zinc-400' },
    'CANCELLED': { label: 'CANCELADO', color: 'text-red-500' },
    'DISPUTED': { label: 'DISPUTA', color: 'text-red-500' }
};

export default function AdminDashboard() {
    const supabase = createBrowserClient();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [inventory, setInventory] = useState<any[]>([]);
    const [investorApps, setInvestorApps] = useState<any[]>([]);
    const [view, setView] = useState<AdminView>('CONTROL');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    // Stats
    const [stats, setStats] = useState({
        gmv: 0,
        pendingCommissions: 0,
        activeHandovers: 0,
        conversionRate: 84,
        totalDemands: 0
    });

    const [newCar, setNewCar] = useState({
        make: "",
        model: "",
        year: 2024,
        price: 0,
        mileage: 0,
        transmission: "Automatic",
        fuel_type: "Gasoline",
        location: "CDMX",
        description: "Unidad certificada por StarterKar.",
        status: "published"
    });

    const [referralPayouts, setReferralPayouts] = useState<any[]>([]);
    const [demandRequests, setDemandRequests] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [userSearchQuery, setUserSearchQuery] = useState("");
    const [debugError, setDebugError] = useState<string | null>(null);
    const [payoutLoading, setPayoutLoading] = useState<string | null>(null);
    const [concurrencyStats, setConcurrencyStats] = useState<Record<string, {isLocked: boolean, interestedCount: number}>>({});

    const handleSearchUsers = async () => {
        if (!userSearchQuery) return;
        setLoading(true);
        try {
            const results = await searchUsersAction(userSearchQuery);
            setUsers(results);
        } catch (err: any) {
            toast.error("Error al buscar usuarios");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateUserRole = async (userId: string, newRole: any) => {
        setActionLoading(userId);
        try {
            await updateUserRole(userId, newRole);
            toast.success(`Rol actualizado a ${newRole}`);
            await handleSearchUsers();
        } catch (err: any) {
            toast.error(err.message || "Error al actualizar rol");
        } finally {
            setActionLoading(null);
        }
    };

    async function loadData() {
        setLoading(true);
        setDebugError(null);
        try {
            // Load individual components to isolate errors
            const fetchers = [
                getAdminInventoryAction().catch(e => { console.error("Inv error:", e); return null; }),
                getLegalTransactionsAction().catch(e => { console.error("Tx error:", e); return null; }),
                getInvestorApplicationsAction().catch(e => { console.error("Apps error:", e); return null; }),
                getPendingReferralPayouts().catch(e => { console.error("Payouts error:", e); return null; }),
                supabase.from('demand_registry').select('*').order('created_at', { ascending: false })
            ];

            const [cars, txs, apps, payouts, demands] = await Promise.all(fetchers);
            
            if (cars === null) setDebugError(prev => (prev ? prev + " | " : "") + "Error en Inventario");
            if (txs === null) setDebugError(prev => (prev ? prev + " | " : "") + "Error en Transacciones");
            if (apps === null) setDebugError(prev => (prev ? prev + " | " : "") + "Error en Inversionistas");
            if (payouts === null) setDebugError(prev => (prev ? prev + " | " : "") + "Error en Pagos Referidos");

            setInventory(cars || []);
            setTransactions(txs || []);
            setInvestorApps(apps || []);
            setReferralPayouts(payouts || []);
            setDemandRequests(demands?.data || []);

            // Load concurrency stats
            const statsData = await getGlobalConcurrencyStatsAction();
            setConcurrencyStats(statsData);

            // Calculate Stats
            const txList = txs || [];
            const gmv = txList.reduce((acc: number, tx: any) => acc + (tx.car_price || 0), 0);
            const pendingComm = txList
                .filter((tx: any) => tx.status === 'RELEASED' && !tx.commission_paid)
                .reduce((acc: number, tx: any) => acc + ((tx.car_price || 0) * 0.035), 0);
            const activeHO = txList.filter((tx: any) => tx.status === 'HANDOVER_SCHEDULED').length;

            setStats({
                gmv,
                pendingCommissions: pendingComm,
                activeHandovers: activeHO,
                conversionRate: 84,
                totalDemands: demands?.data?.length || 0
            });
        } catch (err: any) {
            console.error("Critical Admin Error:", err);
            setDebugError(`Error Crítico: ${err.message || String(err)}`);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    const handleApproveInvestor = async (id: string) => {
        setActionLoading(id);
        try {
            await approveInvestorApplicationAction(id);
            toast.success("Inversionista aprobado con éxito");
            await loadData();
        } catch (err: any) {
            toast.error(err.message || "Error al aprobar");
        } finally {
            setActionLoading(null);
        }
    };

    const handleRejectInvestor = async (id: string) => {
        setActionLoading(id);
        try {
            await rejectInvestorApplicationAction(id);
            toast.success("Solicitud rechazada");
            await loadData();
        } catch (err: any) {
            toast.error(err.message || "Error al rechazar");
        } finally {
            setActionLoading(null);
        }
    };

    const [editingCar, setEditingCar] = useState<any>(null);
    const [cepLoading, setCepLoading] = useState<string | null>(null);

    const handleUpdateCar = async (updatedData: any) => {
        setActionLoading(editingCar.id);
        try {
            await updateCarAction(editingCar.id, updatedData);
            toast.success("Vehículo actualizado correctamente");
            setEditingCar(null);
            await loadData();
        } catch (err: any) {
            toast.error("Error al actualizar", { description: err.message });
        } finally {
            setActionLoading(null);
        }
    };


    const handleDeleteCar = async (id: string) => {
        const confirmMsg = "¿Seguro que deseas eliminar este vehículo? Todas sus dependencias (favoritos, etc.) serán eliminadas también.";
        if (!window.confirm(confirmMsg)) return;
        
        console.log(`[V4.7] User confirmed deletion for car: ${id}`);
        setActionLoading(id);
        
        try {
            const result = await deleteCarAction(id);
            console.log("[V4.7] Deletion result:", result);
            
            if (result.success) {
                toast.success("Vehículo eliminado correctamente");
                await loadData();
            } else {
                const errorDesc = `${result.message || "Error desconocido."} ${result.hint ? `| Hint: ${result.hint}` : ''} ${result.code ? `[Code: ${result.code}]` : ''}`;
                console.error("[V4.7] Delete failed:", result);
                toast.error("No se pudo eliminar", { 
                    description: errorDesc,
                    duration: 6000
                });
                setDebugError(`Error en Deletion: ${errorDesc}`);
            }

        } catch (err: any) {
            const errorMsg = err.message || "Error de servidor";
            console.error("[V4.7] Critical delete error:", err);
            toast.error("No se pudo eliminar", { description: errorMsg });
            window.alert(`Error crítico: ${errorMsg}`);
        } finally {
            console.log("[V4.7] Resetting actionLoading");
            setActionLoading(null);
        }
    };

    const handleUpdateCarStatus = async (id: string, status: string) => {
        setActionLoading(id);
        try {
            const result = await updateCarStatusAction(id, status);
            if (result.success) {
                toast.success(`Estatus de vehículo actualizado a ${status.toUpperCase()}`);
                await loadData();
            }
        } catch (err: any) {
            toast.error("Error al actualizar estatus", { description: err.message });
        } finally {
            setActionLoading(null);
        }
    };

    const handleValidateCEP = async (transactionId: string) => {
        setCepLoading(transactionId);
        try {
            const result = await validateCEPAction(transactionId, { clave_rastreo: "CEP-AUTO-" + Math.random().toString(36).substring(7).toUpperCase() });
            if (result.success) {
                toast.success("Pago SPEI Validado. Transacción lista.");
                await loadData();
            } else {
                toast.error("Error al validar CEP");
            }
        } catch (err: any) {
            toast.error(err.message || "Error en validación");
        } finally {
            setCepLoading(null);
        }
    };

    const handleRegisterPayment = async (txId: string, amount: number) => {
        setActionLoading(txId);
        try {
            await registerCommissionPaymentAction(txId, { method: 'MANUAL_ADMIN', amount });
            toast.success("Pago de comisión registrado correctamente");
            await loadData();
        } catch (err: any) {
            toast.error("Error al registrar pago");
        } finally {
            setActionLoading(null);
        }
    };

    const cycleStatus = async (txId: string, currentStatus: string) => {
        const nextStatusMap: Record<string, string> = {
            'P2P_VALIDATED': 'HANDOVER_SCHEDULED',
            'HANDOVER_SCHEDULED': 'RELEASED'
        };
        
        const nextStatus = nextStatusMap[currentStatus];
        if (!nextStatus) return;

        setActionLoading(txId);
        try {
            await overrideTransactionStatusAction(txId, nextStatus);
            toast.success(`Estatus actualizado a ${STATUS_MAP[nextStatus]?.label || nextStatus}`);
            await loadData();
        } catch (err) {
            toast.error("Error al actualizar estatus");
        } finally {
            setActionLoading(null);
        }
    };

    // handleUpdateCarStatus (v4.9.5 - Consolidated above)


    const handleProcessReferralPayout = async (payoutId: string, amount: number, name: string) => {
        setPayoutLoading(payoutId);
        try {
            const result = await processReferralPayout(payoutId, amount, `Recompensa para ${name}`);
            if (result.success) {
                toast.success("Pago de referido procesado");
                if (result.paymentUrl) {
                    window.open(result.paymentUrl, '_blank');
                }
                await loadData();
            }
        } catch (err: any) {
            toast.error(err.message || "Error al procesar pago");
        } finally {
            setPayoutLoading(null);
        }
    };

    const handleCreateCar = async (carData: any) => {
        setActionLoading("CREATE");
        setDebugError(null);
        try {
            console.log("[Admin] Sending car data:", carData);
            const result = await createCarAction(carData);
            console.log("[Admin] Create Result:", result);
            toast.success("Vehículo publicado con éxito");
            setIsCreateModalOpen(false);
            await loadData();
        } catch (err: any) {
            console.error("[Admin] Create Car Error:", err);
            setDebugError(`Error al publicar: ${err.message || String(err)}`);
            toast.error("Error al publicar", { description: err.message });
        } finally {
            setActionLoading(null);
        }
    };

    const handleMatchDemand = async (demandId: string) => {
        const carId = window.prompt("Ingresa el ID del vehículo para este Match:");
        if (!carId) return;

        setActionLoading(demandId);
        try {
            await matchDemandAction(demandId, carId);
            toast.success("Demanda vinculada correctamente");
            await loadData();
        } catch (err: any) {
            toast.error("Error al vincular", { description: err.message });
        } finally {
            setActionLoading(null);
        }
    };

    const handleAssignGestor = async (txId: string) => {
        setActionLoading(txId);
        try {
            toast.success("Gestor asignado. El cliente será notificado.");
            await loadData();
        } catch (err: any) {
            toast.error("Error al asignar gestor");
        } finally {
            setActionLoading(null);
        }
    };



    return (
        <div className="flex min-h-screen bg-zinc-950 text-white font-sans selection:bg-indigo-500/30">
            {/* Sidebar Navigation */}
            <aside className="w-72 border-r border-zinc-800 flex flex-col p-6 fixed h-screen bg-zinc-950/50 backdrop-blur-xl z-20">
                        <div className="mb-12 px-2">
                    <h1 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-2">
                        <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center italic text-white text-xl">S</div>
                        StarterKar <span className="text-[10px] bg-indigo-600/20 text-indigo-400 px-2 py-0.5 rounded-full not-italic tracking-widest font-black border border-indigo-500/30 ml-1">ADMIN v4.9.5</span>
                    </h1>
                </div>

                <nav className="space-y-1 flex-1">
                    <SidebarItem 
                        icon={Zap} 
                        label="Torre de Control" 
                        active={view === 'CONTROL'} 
                        onClick={() => setView('CONTROL')} 
                        badge="3"
                    />
                    <SidebarItem 
                        icon={CarFront} 
                        label="Inventario" 
                        active={view === 'INVENTORY'} 
                        onClick={() => setView('INVENTORY')} 
                    />
                    <SidebarItem 
                        icon={UserCheck} 
                        label="Inversionistas" 
                        active={view === 'INVESTORS'} 
                        onClick={() => setView('INVESTORS')} 
                        badge={investorApps.filter(a => a.status === 'pending').length.toString()}
                    />
                    <SidebarItem 
                        icon={Users} 
                        label="Gestión Usuarios" 
                        active={view === 'USERS'} 
                        onClick={() => setView('USERS')} 
                    />
                    <SidebarItem 
                        icon={DollarSign} 
                        label="Cobranza 3.5%" 
                        active={view === 'BILLING'} 
                        onClick={() => setView('BILLING')} 
                    />
                    <SidebarItem 
                        icon={Zap} 
                        label="Servicios Upsell" 
                        active={view === 'UPSELLS'} 
                        onClick={() => setView('UPSELLS')} 
                    />
                    <SidebarItem 
                        icon={Users} 
                        label="Referidos" 
                        active={view === 'REFERRALS'} 
                        onClick={() => setView('REFERRALS')} 
                        badge={referralPayouts.length.toString()}
                    />
                    <SidebarItem 
                        icon={MessageSquare} 
                        label="Solicitudes" 
                        active={view === 'DEMANDS'} 
                        onClick={() => setView('DEMANDS')} 
                        badge={demandRequests.filter(d => d.status === 'pending').length.toString()}
                    />
                </nav>

                <div className="mt-auto pt-8 border-t border-zinc-900">
                    <div className="p-5 bg-indigo-600/5 border border-indigo-500/10 rounded-3xl backdrop-blur-md">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Sistema Operativo</p>
                            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-ping" />
                        </div>
                        <p className="text-xs font-bold text-white mb-2 italic">Nodos Banxico Online</p>
                        <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full w-[94%] bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                        </div>
                    </div>
                </div>
                <div className="mt-auto pt-6 border-t border-zinc-800">
                    <button 
                        onClick={async () => {
                            await supabase.auth.signOut();
                            window.location.href = '/login';
                        }}
                        className="w-full flex items-center gap-4 px-6 py-4 rounded-[1.25rem] text-zinc-500 hover:bg-red-500/10 hover:text-red-500 transition-all group"
                    >
                        <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-black uppercase tracking-[0.1em]">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 ml-72 overflow-y-auto p-12 relative z-10 custom-scrollbar">
                {debugError && (
                    <div className="mb-8 p-6 bg-red-500/10 border-2 border-red-500/50 rounded-3xl animate-in shake duration-500">
                        <div className="flex items-center gap-4 text-red-500">
                            <AlertTriangle className="h-6 w-6" />
                            <div>
                                <p className="text-sm font-black uppercase tracking-widest">Error de Sistema Detectado</p>
                                <p className="text-xs font-bold mt-1 opacity-80">{debugError}</p>
                            </div>
                            <button onClick={() => setDebugError(null)} className="ml-auto text-[10px] font-black underline uppercase tracking-widest">Cerrar</button>
                        </div>
                    </div>
                )}

                {/* Dashboard Header */}
                <header className="flex justify-between items-center mb-16">
                    <div className="animate-in fade-in slide-in-from-left-4 duration-700">
                        <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">
                            {view === 'CONTROL' && "Torre de Control"}
                            {view === 'INVENTORY' && "Inventario Maestro"}
                            {view === 'INVESTORS' && "Red de Capital"}
                            {view === 'BILLING' && "Gestión de Tesorería"}
                            {view === 'UPSELLS' && "Servicios Plus"}
                            {view === 'REFERRALS' && "Programa de Referidos"}
                            {view === 'DEMANDS' && "Solicitudes de Auto (Demanda)"}
                        </h2>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="h-1.5 w-1.5 bg-indigo-500 rounded-full" />
                            <p className="text-zinc-500 font-black uppercase text-[9px] tracking-[0.3em]">
                                {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-indigo-600/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                            <input 
                                className="h-14 w-96 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl pl-12 pr-4 text-sm font-medium focus:ring-2 ring-indigo-500/50 outline-none transition-all placeholder:text-zinc-600" 
                                placeholder="Buscar Folio, VIN o Cliente..." 
                            />
                        </div>
                        <button 
                            onClick={() => {
                                if (confirm("¿Forzar recarga nuclear del sistema? Se limpiará la caché y se cerrarán sesiones temporales.")) {
                                    localStorage.clear();
                                    sessionStorage.clear();
                                    window.location.reload(true as any);
                                }
                            }}
                            className="h-14 px-6 bg-red-600/10 border border-red-500/30 rounded-2xl flex items-center gap-3 text-red-500 hover:bg-red-600 hover:text-white transition-all group"
                        >
                            <Zap className="h-5 w-5 group-hover:animate-bounce" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Forzar Recarga</span>
                        </button>
                        <button className="h-14 w-14 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center hover:bg-zinc-800 hover:border-zinc-700 transition-all active:scale-95 shadow-xl">
                            <Filter className="h-5 w-5 text-zinc-400" />
                        </button>
                    </div>
                </header>



                {/* Content Views */}
                {view === 'CONTROL' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        {/* KPI Grid */}
                        <div className="grid grid-cols-5 gap-6">
                            <KpiCard label="GMV Acumulado" value={`$${(stats.gmv / 1000000).toFixed(1)}M`} trend="+18%" icon={DollarSign} color="indigo" />
                            <KpiCard label="Entregas Activas" value={stats.activeHandovers.toString()} trend="HOY" icon={Calendar} color="emerald" />
                            <KpiCard label="Solicitudes Activas" value={stats.totalDemands.toString()} trend="DEMANDA" icon={MessageSquare} color="indigo" />
                            <KpiCard label="Comisiones Pend." value={`$${(stats.pendingCommissions / 1000).toFixed(0)}K`} trend="RECAUDAR" icon={AlertTriangle} color="amber" alert />
                            <KpiCard label="Tasa de Cierre" value={`${stats.conversionRate}%`} trend="+2.4%" icon={Zap} color="indigo" />
                        </div>

                        <div className="grid grid-cols-3 gap-8">
                            {/* Action Center - Triage */}
                            <div className="col-span-2 space-y-6">
                                <div className="bg-zinc-900/40 backdrop-blur-3xl border border-zinc-800/50 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                    
                                    <div className="flex justify-between items-center mb-10 relative z-10">
                                        <h3 className="text-xl font-black uppercase italic flex items-center gap-4">
                                            <div className="h-12 w-12 bg-indigo-600/20 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                                                <Zap className="h-6 w-6 text-indigo-500 animate-pulse" />
                                            </div>
                                            Centro de Triage Operativo
                                        </h3>
                                        <div className="flex items-center gap-3">
                                            {/* [NEW] Alert for completed sales */}
                                            {transactions.some(tx => tx.status === 'RELEASED') && (
                                                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full animate-bounce">
                                                    <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Comisión de Éxito Lista</span>
                                                </div>
                                            )}
                                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">
                                                {transactions.filter(tx => tx.status === 'P2P_WAITING_PROOF' || tx.status === 'HANDOVER_SCHEDULED').length} Bloqueos Detectados
                                            </span>
                                        </div>
                                    </div>


                                    <div className="space-y-4 relative z-10">
                                        {transactions.filter(tx => {
                                            const txStatus = tx.status?.toLowerCase();
                                            const carStatus = tx.cars?.status?.toLowerCase();
                                            return txStatus === 'p2p_waiting_proof' || 
                                                   txStatus === 'handover_scheduled' ||
                                                   (txStatus === 'released' && carStatus === 'reserved');
                                        }).map(tx => (
                                            <div key={tx.id} className="group bg-zinc-950/50 border border-zinc-800/50 p-8 rounded-[2rem] hover:border-indigo-500/50 transition-all hover:bg-zinc-900/50">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex gap-8 items-center">
                                                        <div className={cn(
                                                            "h-16 w-16 border rounded-[1.5rem] flex items-center justify-center shadow-inner",
                                                            tx.status?.toLowerCase() === 'p2p_waiting_proof' ? "bg-amber-500/5 border-amber-500/20" : "bg-emerald-500/5 border-emerald-500/20"
                                                        )}>
                                                            {tx.status?.toLowerCase() === 'p2p_waiting_proof' ? <CreditCard className="h-8 w-8 text-amber-500" /> : <ShieldCheck className="h-8 w-8 text-emerald-500" />}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-1">
                                                                <p className={cn(
                                                                    "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                                                                    tx.status?.toLowerCase() === 'p2p_waiting_proof' ? "text-amber-500 border-amber-500/20 bg-amber-500/5" : "text-emerald-500 border-emerald-500/20 bg-emerald-500/5"
                                                                )}>
                                                                    {STATUS_MAP[tx.status?.toLowerCase() || '']?.label || tx.status}
                                                                </p>
                                                                <span className="text-zinc-700 text-xs">•</span>
                                                                <span className="text-zinc-500 text-[10px] font-bold">Folio: {tx.id.slice(0, 8)}</span>
                                                                <span className="text-zinc-700 text-xs">•</span>
                                                                <div className="flex items-center gap-1.5 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">
                                                                    <div className={cn("h-1.5 w-1.5 rounded-full", tx.cars?.status?.toLowerCase() === 'sold' ? "bg-zinc-500" : "bg-amber-500 animate-pulse")} />
                                                                    <span className="text-[9px] font-black uppercase text-zinc-400">Auto: {STATUS_MAP[tx.cars?.status?.toLowerCase() || '']?.label || tx.cars?.status}</span>
                                                                </div>
                                                            </div>
                                                            <h4 className="text-xl font-black text-white italic tracking-tighter">
                                                                {tx.cars?.make} {tx.cars?.model} <span className="text-zinc-600 font-medium not-italic ml-2">({tx.cars?.year})</span>
                                                            </h4>
                                                            <p className="text-xs text-zinc-500 font-medium mt-1">Transacción P2P por <span className="text-zinc-200">${tx.car_price.toLocaleString()}</span></p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-3">
                                                        {tx.cars?.status?.toLowerCase() === 'reserved' && tx.status?.toLowerCase() === 'released' && (
                                                            <button 
                                                                onClick={() => handleUpdateCarStatus(tx.cars.id, 'SOLD')}
                                                                className="h-14 px-6 bg-zinc-800 text-zinc-400 text-[10px] font-black rounded-2xl uppercase tracking-widest hover:bg-zinc-700 transition-all border border-zinc-700"
                                                            >
                                                                MARCAR VENDIDO
                                                            </button>
                                                        )}
                                                        {tx.status === 'P2P_WAITING_PROOF' ? (
                                                            <button 
                                                                onClick={() => handleValidateCEP(tx.id)}
                                                                disabled={cepLoading === tx.id}
                                                                className="h-14 px-8 bg-indigo-600 text-white text-xs font-black rounded-2xl uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-xl shadow-indigo-600/20"
                                                            >
                                                                {cepLoading === tx.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                                                VALIDAR CEP
                                                            </button>
                                                        ) : (
                                                            <button 
                                                                onClick={() => cycleStatus(tx.id, tx.status)}
                                                                className="h-14 px-8 bg-emerald-600 text-white text-xs font-black rounded-2xl uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-xl shadow-emerald-600/20"
                                                            >
                                                                <CheckCircle2 className="h-4 w-4" />
                                                                CONFIRMAR ENTREGA
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {transactions.filter(tx => {
                                            const txStatus = tx.status?.toLowerCase();
                                            const carStatus = tx.cars?.status?.toLowerCase();
                                            return txStatus === 'p2p_waiting_proof' || 
                                                   txStatus === 'handover_scheduled' ||
                                                   (txStatus === 'released' && carStatus === 'reserved');
                                        }).length === 0 && (
                                            <div className="py-20 text-center border border-dashed border-zinc-800/50 rounded-[2.5rem] bg-zinc-950/30">
                                                <Zap className="h-12 w-12 text-zinc-800 mx-auto mb-4 opacity-50" />
                                                <p className="text-zinc-600 font-black uppercase tracking-[0.3em] text-xs italic">Cero bloqueos en el flujo actual</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Validador SPEI Tool */}
                            <div className="space-y-8">
                                <div className="bg-zinc-900 border border-zinc-800/50 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-indigo-600/5 blur-3xl" />
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400 mb-8 relative z-10">Validador CEP Pro</h3>
                                    <div className="space-y-6 relative z-10">
                                        <div className="p-6 bg-zinc-950 rounded-3xl border border-zinc-800 space-y-4">
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">
                                                Herramienta de auditoría directa para comprobantes SPEI. Asegura la integridad del trato P2P.
                                            </p>
                                            <div className="h-px w-full bg-zinc-800" />
                                            <input 
                                                className="w-full bg-transparent border-none text-white font-black italic tracking-tighter text-xl placeholder:text-zinc-800 focus:ring-0" 
                                                placeholder="FOLIO-RASTREO..." 
                                            />
                                        </div>
                                        <button className="w-full h-16 bg-white text-black font-black uppercase italic tracking-tighter text-xl rounded-2xl hover:bg-zinc-200 transition-all active:scale-95 shadow-2xl">
                                            AUDITAR CEP
                                        </button>
                                    </div>
                                </div>

                                {/* Network Health Card */}
                                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8">
                                        <ShieldCheck className="h-20 w-20 text-white/10 group-hover:scale-125 transition-transform duration-1000" />
                                    </div>
                                    <div className="relative z-10">
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-80">Seguridad StarterKar</p>
                                        <span className="text-2xl font-black tracking-tighter text-white uppercase italic">STARTERKAR</span>
                                        <h4 className="text-2xl font-black italic tracking-tighter mb-6 uppercase">Infraestructura Protegida</h4>
                                        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
                                            <div className="h-2 w-2 bg-emerald-400 rounded-full animate-ping" />
                                            <p className="text-[10px] font-black tracking-widest uppercase">SSL / TLS 1.3 Online</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {view === 'INVENTORY' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <div className="flex justify-between items-center bg-zinc-900/50 backdrop-blur-3xl border border-zinc-800 p-10 rounded-[3rem] shadow-2xl">
                            <div className="flex gap-4 items-center">
                                <div>
                                    <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">Inventario de Activos</h3>
                                    <p className="text-sm text-zinc-500 font-medium mt-1">Control total sobre la flota certificada en plataforma.</p>
                                </div>
                                <button 
                                    onClick={async () => {
                                        const id = window.prompt("EMERGENCIA: Ingresa el ID completo del vehículo a eliminar:");
                                        if (id) {
                                            window.alert("Iniciando borrado manual para: " + id);
                                            await handleDeleteCar(id);
                                        }
                                    }}
                                    className="ml-8 h-12 px-6 bg-red-600/20 border border-red-500/50 text-red-500 text-[10px] font-black rounded-xl hover:bg-red-600 hover:text-white transition-all uppercase tracking-widest"
                                >
                                    ⚠️ BORRADO MANUAL POR ID
                                </button>
                            </div>
                            <button 
                                onClick={() => setIsCreateModalOpen(true)}
                                className="h-16 px-10 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-500 transition-all uppercase tracking-widest text-sm shadow-xl shadow-indigo-600/30"
                            >
                                + AGREGAR UNIDAD
                            </button>
                        </div>


                        <CarFormModal 
                            isOpen={isCreateModalOpen}
                            onClose={() => setIsCreateModalOpen(false)}
                            onSubmit={handleCreateCar}
                            isLoading={actionLoading === "CREATE"}
                            mode="create"
                        />

                        {editingCar && (
                            <CarFormModal 
                                isOpen={!!editingCar}
                                onClose={() => setEditingCar(null)}
                                onSubmit={handleUpdateCar}
                                initialData={editingCar}
                                isLoading={actionLoading === editingCar.id}
                                mode="edit"
                            />
                        )}


                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {inventory.map(car => (
                                <div key={car.id} className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-[2.5rem] overflow-hidden hover:border-indigo-500/40 transition-all group shadow-xl">
                                    <div className="h-60 bg-zinc-950 flex items-center justify-center relative group-hover:bg-zinc-900 transition-colors">
                                        {car.images && car.images.length > 0 ? (
                                            <img src={car.images[0]} alt={car.model} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        ) : (
                                            <CarFront className="h-24 w-24 text-zinc-800/50 group-hover:scale-110 group-hover:text-indigo-500/20 transition-all duration-700" />
                                        )}
                                        <div className="absolute top-6 left-6">
                                            {(() => {
                                                const normalized = car.status?.trim().toLowerCase();
                                                const info = STATUS_MAP[normalized] || STATUS_MAP[car.status];
                                                return (
                                                    <span className={cn(
                                                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md shadow-2xl",
                                                        info?.color || "bg-zinc-500/10 text-zinc-500 border-zinc-500/20"
                                                    )}>
                                                        {info?.label || car.status?.toUpperCase() || 'STOCK'}
                                                    </span>
                                                );
                                            })()}
                                        </div>
                                        <div className="absolute top-6 right-6 flex flex-col items-end gap-2">
                                            {concurrencyStats[car.id]?.isLocked && (
                                                <span className="px-3 py-1 bg-red-600 text-white text-[9px] font-black rounded-lg border border-red-500/30 animate-pulse flex items-center gap-1.5 shadow-lg shadow-red-600/20">
                                                    <Lock className="h-3 w-3" /> BLOQUEADO
                                                </span>
                                            )}
                                            {concurrencyStats[car.id]?.interestedCount > 0 && (
                                                <span className="px-3 py-1 bg-zinc-900/80 text-indigo-400 text-[9px] font-black rounded-lg border border-indigo-500/20 backdrop-blur-md flex items-center gap-1.5">
                                                    <Users className="h-3 w-3" /> {concurrencyStats[car.id].interestedCount} INTERESADOS
                                                </span>
                                            )}
                                        </div>

                                    </div>
                                    <div className="p-10">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h4 className="text-2xl font-black text-white italic tracking-tighter uppercase">{car.make} {car.model}</h4>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <p className="text-zinc-500 font-black uppercase text-[10px] tracking-widest italic">{car.year} • {car.location}</p>
                                                    <span className="text-zinc-800 text-[10px]">•</span>
                                                    <p className="text-indigo-400 font-black uppercase text-[10px] tracking-widest">ID: {car.id.slice(0, 8)}</p>
                                                </div>
                                                <p className="text-zinc-600 font-bold text-[9px] uppercase tracking-widest mt-2">Publicado: {new Date(car.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Valor de Mercado</p>
                                                <p className="text-xl font-black text-white italic">${car.price?.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-3 mt-8">
                                            <button 
                                                onClick={() => setEditingCar(car)}
                                                className="flex-1 h-12 bg-zinc-800 text-white text-[10px] font-black rounded-xl hover:bg-zinc-700 transition-all uppercase tracking-widest"
                                            >
                                                EDITAR FICHA
                                            </button>
                                            <button 
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleDeleteCar(car.id);
                                                }}
                                                disabled={actionLoading === car.id}
                                                className="h-12 w-12 bg-red-900/10 border border-red-900/30 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 relative z-10"
                                                title="Eliminar Vehículo"
                                            >
                                                {actionLoading === car.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-5 w-5" />
                                                )}
                                            </button>


                                        </div>
                                    </div>
                                </div>
                            ))
                        </div>
                    </div>
                )}

                {view === 'INVESTORS' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <div className="bg-zinc-900/50 backdrop-blur-3xl border border-zinc-800 p-10 rounded-[3rem] shadow-2xl flex items-center justify-between">
                            <div className="flex items-center gap-8">
                                <div className="h-20 w-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center border border-indigo-500/20">
                                    <Users className="h-10 w-10 text-indigo-500" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">Red de Capital (Inversionistas)</h3>
                                    <p className="text-sm text-zinc-500 font-medium mt-1">Gestión de solicitudes para el programa de inversión StarterKar.</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Solicitudes Pendientes</p>
                                <p className="text-4xl font-black text-white italic tracking-tighter">{investorApps.filter(a => a.status === 'pending').length}</p>
                            </div>
                        </div>

                        <div className="grid gap-6">
                            {investorApps.map(app => (
                                <div key={app.id} className="group bg-zinc-900/50 backdrop-blur-2xl border border-zinc-800 p-10 rounded-[3rem] flex items-center justify-between hover:border-indigo-500/40 transition-all shadow-xl relative overflow-hidden">
                                    <div className={cn(
                                        "absolute left-0 top-0 bottom-0 w-2",
                                        app.status === 'pending' ? "bg-amber-500/50" : app.status === 'approved' ? "bg-emerald-500/50" : "bg-red-500/50"
                                    )} />
                                    <div className="flex items-center gap-10">
                                        <div className="h-20 w-20 bg-zinc-950 rounded-2xl flex items-center justify-center border border-zinc-800 group-hover:border-indigo-500/20 transition-colors">
                                            <UserCheck className="h-10 w-10 text-zinc-800 group-hover:text-indigo-500/50 transition-colors" />
                                        </div>
                                        <div>
                                            <h4 className="text-2xl font-black text-white italic tracking-tighter uppercase">
                                                {app.profiles?.full_name || "Candidato Inversionista"}
                                            </h4>
                                            <div className="flex items-center gap-4 mt-2">
                                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Email: <span className="text-zinc-300">{app.profiles?.email || "N/A"}</span></p>
                                                <span className="h-1 w-1 bg-zinc-800 rounded-full" />
                                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Tier: <span className="text-indigo-400">{app.investor_tiers?.name || app.tier_id}</span></p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        {app.status === 'pending' ? (
                                            <div className="flex gap-3">
                                                <button 
                                                    onClick={() => handleRejectInvestor(app.id)}
                                                    disabled={actionLoading === app.id}
                                                    className="h-14 px-8 bg-zinc-800 text-zinc-300 text-xs font-black rounded-2xl hover:bg-red-500/10 hover:text-red-500 transition-all uppercase tracking-widest border border-zinc-700"
                                                >
                                                    RECHAZAR
                                                </button>
                                                <button 
                                                    onClick={() => handleApproveInvestor(app.id)}
                                                    disabled={actionLoading === app.id}
                                                    className="h-14 px-10 bg-indigo-600 text-white text-xs font-black rounded-2xl hover:bg-indigo-500 transition-all uppercase tracking-widest shadow-xl shadow-indigo-600/30 flex items-center gap-3"
                                                >
                                                    {actionLoading === app.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                                    APROBAR
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Estatus</p>
                                                <p className={cn(
                                                    "text-xl font-black italic tracking-tighter uppercase",
                                                    app.status === 'approved' ? "text-emerald-500" : "text-red-500"
                                                )}>
                                                    {app.status === 'approved' ? "APROBADO" : "RECHAZADO"}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                            {investorApps.length === 0 && (
                                <div className="py-32 text-center border-2 border-dashed border-zinc-800 rounded-[3rem] bg-zinc-900/20">
                                    <UserCheck className="h-12 w-12 text-zinc-800 mx-auto mb-4 opacity-50" />
                                    <p className="text-zinc-600 font-black uppercase tracking-[0.4em] italic">No hay solicitudes de inversionistas</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {view === 'USERS' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <div className="bg-zinc-900/50 backdrop-blur-3xl border border-zinc-800 p-10 rounded-[3rem] shadow-2xl space-y-8">
                            <div className="flex items-center gap-8">
                                <div className="h-20 w-20 bg-blue-500/10 rounded-3xl flex items-center justify-center border border-blue-500/20">
                                    <Users className="h-10 w-10 text-blue-500" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">Directorio Maestro de Usuarios</h3>
                                    <p className="text-sm text-zinc-500 font-medium mt-1">Búsqueda manual y asignación de rangos (Inversionista, Inspector, Admin).</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                                    <input 
                                        type="text"
                                        value={userSearchQuery}
                                        onChange={(e) => setUserSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearchUsers()}
                                        placeholder="Buscar por Nombre o ID de Usuario..."
                                        className="w-full h-16 bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-4 text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    />
                                </div>
                                <button 
                                    onClick={handleSearchUsers}
                                    className="h-16 px-10 bg-white text-black font-black rounded-2xl hover:bg-zinc-200 transition-all uppercase tracking-widest text-sm"
                                >
                                    BUSCAR
                                </button>
                            </div>
                        </div>

                        <div className="grid gap-6">
                            {users.map(u => (
                                <div key={u.id} className="group bg-zinc-900/40 border border-zinc-800/50 p-8 rounded-[2.5rem] flex items-center justify-between hover:border-indigo-500/30 transition-all">
                                    <div className="flex items-center gap-8">
                                        <div className="h-16 w-16 bg-zinc-950 rounded-2xl flex items-center justify-center border border-zinc-800 overflow-hidden">
                                            {u.avatar_url ? (
                                                <img src={u.avatar_url} alt={u.full_name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Users className="h-8 w-8 text-zinc-800" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black text-white italic tracking-tighter uppercase">{u.full_name || "Usuario Sin Nombre"}</h4>
                                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">ID: <span className="text-zinc-400">{u.id}</span></p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Rango Actual</p>
                                            <span className={cn(
                                                "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                                                u.role === 'investor' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
                                                u.role === 'admin' ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" : 
                                                "bg-zinc-800 text-zinc-500 border-zinc-700"
                                            )}>
                                                {u.role || 'buyer'}
                                            </span>
                                        </div>
                                        
                                        <div className="h-10 w-[1px] bg-zinc-800" />

                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleUpdateUserRole(u.id, 'investor')}
                                                disabled={actionLoading === u.id || u.role === 'investor'}
                                                className="h-12 px-6 bg-emerald-600 text-white text-[10px] font-black rounded-xl hover:bg-emerald-500 transition-all uppercase tracking-widest disabled:opacity-30"
                                            >
                                                PROMOVER A INVERSIONISTA
                                            </button>
                                            <button 
                                                onClick={() => handleUpdateUserRole(u.id, 'buyer')}
                                                disabled={actionLoading === u.id || u.role === 'buyer'}
                                                className="h-12 px-6 bg-zinc-800 text-zinc-400 text-[10px] font-black rounded-xl hover:bg-zinc-700 transition-all uppercase tracking-widest disabled:opacity-30"
                                            >
                                                REVERTIR A COMPRADOR
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                            {userSearchQuery && users.length === 0 && !loading && (
                                <div className="py-20 text-center border-2 border-dashed border-zinc-800 rounded-[3rem] bg-zinc-950/20">
                                    <p className="text-zinc-600 font-black uppercase tracking-[0.4em] italic text-xs">No se encontraron usuarios</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {view === 'BILLING' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <div className="bg-zinc-900/50 backdrop-blur-3xl border border-zinc-800 p-10 rounded-[3rem] shadow-2xl flex items-center justify-between">
                            <div className="flex items-center gap-8">
                                <div className="h-20 w-20 bg-amber-500/10 rounded-3xl flex items-center justify-center border border-amber-500/20">
                                    <DollarSign className="h-10 w-10 text-amber-500" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">Tesorería de Comisiones</h3>
                                    <p className="text-sm text-zinc-500 font-medium mt-1">Recaudación de Success Fees (3.5%) tras cierre P2P.</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Cuentas por Cobrar</p>
                                <p className="text-4xl font-black text-amber-500 italic tracking-tighter">${stats.pendingCommissions.toLocaleString()} MXN</p>
                            </div>
                        </div>

                        <div className="grid gap-6">
                            {transactions.filter(tx => tx.status === 'RELEASED' && !tx.commission_paid).map(tx => (
                                <div key={tx.id} className="group bg-zinc-900/50 backdrop-blur-2xl border border-zinc-800 p-10 rounded-[3rem] flex items-center justify-between hover:border-amber-500/40 transition-all shadow-xl relative overflow-hidden">
                                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-amber-500/50" />
                                    <div className="flex items-center gap-10">
                                        <div className="h-20 w-20 bg-zinc-950 rounded-2xl flex items-center justify-center border border-zinc-800 group-hover:border-amber-500/20 transition-colors">
                                            <CreditCard className="h-10 w-10 text-zinc-800 group-hover:text-amber-500/50 transition-colors" />
                                        </div>
                                        <div>
                                            <h4 className="text-2xl font-black text-white italic tracking-tighter uppercase">{tx.cars?.make} {tx.cars?.model}</h4>
                                            <div className="flex items-center gap-4 mt-2">
                                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Vendedor ID: <span className="text-zinc-300">{tx.seller_id.slice(0,8)}</span></p>
                                                <span className="h-1 w-1 bg-zinc-800 rounded-full" />
                                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Valor Venta: <span className="text-emerald-500">${tx.car_price.toLocaleString()}</span></p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-16">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Comisión Pendiente</p>
                                            <p className="text-3xl font-black text-white italic tracking-tighter">${(tx.car_price * 0.035).toLocaleString()} MXN</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <button className="h-14 px-8 bg-zinc-800 text-zinc-300 text-xs font-black rounded-2xl hover:bg-zinc-700 transition-all uppercase tracking-widest border border-zinc-700">RECORDAR</button>
                                            <button 
                                                onClick={() => handleRegisterPayment(tx.id, tx.car_price * 0.035)}
                                                className="h-14 px-10 bg-amber-600 text-white text-xs font-black rounded-2xl hover:bg-amber-500 transition-all uppercase tracking-widest shadow-xl shadow-amber-600/30"
                                            >
                                                REGISTRAR PAGO
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                            {transactions.filter(tx => tx.status === 'RELEASED' && !tx.commission_paid).length === 0 && (
                                <div className="py-32 text-center border-2 border-dashed border-zinc-800 rounded-[3rem] bg-zinc-900/20">
                                    <DollarSign className="h-12 w-12 text-zinc-800 mx-auto mb-4 opacity-50" />
                                    <p className="text-zinc-600 font-black uppercase tracking-[0.4em] italic">Cartera al corriente • 100% Recaudado</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {view === 'UPSELLS' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="h-16 w-16 bg-indigo-600/10 rounded-2xl flex items-center justify-center">
                                    <Zap className="h-8 w-8 text-indigo-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black uppercase italic">Despacho de Servicios VIP (Upsells)</h3>
                                    <p className="text-sm text-zinc-500 font-bold mt-1">Activación de garantías, seguros y gestoría administrativa.</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Gestoría VIP Column */}
                            <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-10">
                                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400 mb-10 flex items-center gap-4">
                                    <div className="h-10 w-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
                                        <FileText className="h-5 w-5 text-indigo-500" />
                                    </div>
                                    Gestoría VIP (Trámites)
                                </h4>
                                <div className="space-y-4">
                                    {transactions.filter(tx => tx.gestoria_cost > 0).map(tx => (
                                        <div key={tx.id} className="p-6 bg-zinc-950 border border-zinc-800 rounded-3xl hover:border-indigo-500/30 transition-all group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <p className="text-[10px] font-black text-indigo-400 uppercase mb-1 tracking-widest">{tx.id.slice(0,8)} • PAGO RECIBIDO</p>
                                                    <h5 className="text-lg font-black text-white italic uppercase tracking-tighter">{tx.cars?.make} {tx.cars?.model}</h5>
                                                </div>
                                                <span className="px-3 py-1 bg-zinc-900 text-zinc-500 text-[9px] font-black rounded-lg border border-zinc-800">PENDIENTE</span>
                                            </div>
                                            <button 
                                                onClick={() => handleAssignGestor(tx.id)}
                                                disabled={actionLoading === tx.id}
                                                className="w-full h-12 bg-indigo-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                                            >
                                                {actionLoading === tx.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "ASIGNAR GESTOR"}
                                            </button>
                                        </div>
                                    ))
                                    {transactions.filter(tx => tx.gestoria_cost > 0).length === 0 && (
                                        <div className="py-12 text-center border border-dashed border-zinc-800 rounded-3xl opacity-30">
                                            <p className="text-[10px] font-black uppercase tracking-widest">Sin trámites pendientes</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Warranties & Insurance Column */}
                            <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-10">
                                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-400 mb-10 flex items-center gap-4">
                                    <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                                        <ShieldCheck className="h-5 w-5 text-emerald-500" />
                                    </div>
                                    Garantías y Seguros
                                </h4>
                                <div className="space-y-4">
                                    {transactions.filter(tx => tx.warranty_cost > 0 || tx.insurance_cost > 0).map(tx => (
                                        <div key={tx.id} className="p-6 bg-zinc-950 border border-zinc-800 rounded-3xl hover:border-emerald-500/30 transition-all group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <p className="text-[10px] font-black text-emerald-400 uppercase mb-1 tracking-widest">
                                                        {tx.warranty_cost > 0 ? "GARANTÍA" : ""} {tx.insurance_cost > 0 ? "SEGURO" : ""}
                                                    </p>
                                                    <h5 className="text-lg font-black text-white italic uppercase tracking-tighter">{tx.cars?.make} {tx.cars?.model}</h5>
                                                </div>
                                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[9px] font-black rounded-lg border border-emerald-500/20">LISTO</span>
                                            </div>
                                            <button className="w-full h-12 bg-emerald-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20">EMITIR PÓLIZA PDF</button>
                                        </div>
                                    ))
                                    {transactions.filter(tx => tx.warranty_cost > 0 || tx.insurance_cost > 0).length === 0 && (
                                        <div className="py-12 text-center border border-dashed border-zinc-800 rounded-3xl opacity-30">
                                            <p className="text-[10px] font-black uppercase tracking-widest">Sin pólizas por generar</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {view === 'REFERRALS' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <div className="bg-zinc-900/50 backdrop-blur-3xl border border-zinc-800 p-10 rounded-[3rem] shadow-2xl flex items-center justify-between">
                            <div className="flex items-center gap-8">
                                <div className="h-20 w-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center border border-indigo-500/20">
                                    <Users className="h-10 w-10 text-indigo-500" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">Tesorería de Referidos</h3>
                                    <p className="text-sm text-zinc-500 font-medium mt-1">Gestión de pagos a socios y mecánicos por cierres exitosos.</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Pagos Pendientes</p>
                                <p className="text-4xl font-black text-white italic tracking-tighter">{referralPayouts.length}</p>
                            </div>
                        </div>

                        <div className="grid gap-6">
                            {referralPayouts.map(payout => (
                                <div key={payout.id} className="group bg-zinc-900/50 backdrop-blur-2xl border border-zinc-800 p-10 rounded-[3rem] flex items-center justify-between hover:border-indigo-500/40 transition-all shadow-xl relative overflow-hidden">
                                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-indigo-500/50" />
                                    <div className="flex items-center gap-10">
                                        <div className="h-20 w-20 bg-zinc-950 rounded-2xl flex items-center justify-center border border-zinc-800 group-hover:border-indigo-500/20 transition-colors">
                                            <Gift className="h-10 w-10 text-zinc-800 group-hover:text-indigo-500/50 transition-colors" />
                                        </div>
                                        <div>
                                            <h4 className="text-2xl font-black text-white italic tracking-tighter uppercase">
                                                {payout.referrer_profile?.full_name || "Socio Clinkar"}
                                            </h4>
                                            <div className="flex items-center gap-4 mt-2">
                                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Referido: <span className="text-zinc-300">{payout.referred_profile?.full_name || payout.referred_profile?.email}</span></p>
                                                <span className="h-1 w-1 bg-zinc-800 rounded-full" />
                                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Transacción: <span className="text-indigo-400">{payout.transaction_id?.slice(0, 8)}</span></p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-16">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Monto Recompensa</p>
                                            <p className="text-3xl font-black text-white italic tracking-tighter">${(payout.actual_reward || 500).toLocaleString()} MXN</p>
                                        </div>
                                        <button 
                                            onClick={() => handleProcessReferralPayout(payout.id, payout.actual_reward || 500, payout.referrer_profile?.full_name || 'Socio')}
                                            disabled={payoutLoading === payout.id}
                                            className="h-14 px-10 bg-indigo-600 text-white text-xs font-black rounded-2xl hover:bg-indigo-500 transition-all uppercase tracking-widest shadow-xl shadow-indigo-600/30 flex items-center gap-3"
                                        >
                                            {payoutLoading === payout.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpRight className="h-4 w-4" />}
                                            EMITIR PAGO
                                        </button>
                                    </div>
                                </div>
                            ))
                            {referralPayouts.length === 0 && (
                                <div className="py-32 text-center border-2 border-dashed border-zinc-800 rounded-[3rem] bg-zinc-900/20">
                                    <Users className="h-12 w-12 text-zinc-800 mx-auto mb-4 opacity-50" />
                                    <p className="text-zinc-600 font-black uppercase tracking-[0.4em] italic">No hay pagos de referidos pendientes</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {view === 'DEMANDS' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <div className="bg-zinc-900/50 backdrop-blur-3xl border border-zinc-800 p-10 rounded-[3rem] shadow-2xl flex items-center justify-between">
                            <div className="flex items-center gap-8">
                                <div className="h-20 w-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center border border-indigo-500/20">
                                    <MessageSquare className="h-10 w-10 text-indigo-500" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">Solicitudes de Auto (Búsqueda Maestro)</h3>
                                    <p className="text-sm text-zinc-500 font-medium mt-1">Peticiones de usuarios que no encontraron su unidad ideal en el inventario.</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Total Peticiones</p>
                                <p className="text-4xl font-black text-white italic tracking-tighter">{demandRequests.length}</p>
                            </div>
                        </div>

                        <div className="grid gap-6">
                            {demandRequests.map(demand => (
                                <div key={demand.id} className="group bg-zinc-900/50 backdrop-blur-2xl border border-zinc-800 p-10 rounded-[3rem] flex items-center justify-between hover:border-indigo-500/40 transition-all shadow-xl relative overflow-hidden">
                                    <div className={cn(
                                        "absolute left-0 top-0 bottom-0 w-2",
                                        demand.status === 'pending' ? "bg-amber-500/50" : "bg-emerald-500/50"
                                    )} />
                                    <div className="flex items-center gap-10">
                                        <div className="h-20 w-20 bg-zinc-950 rounded-2xl flex items-center justify-center border border-zinc-800 group-hover:border-indigo-500/20 transition-colors">
                                            <Search className="h-10 w-10 text-zinc-800 group-hover:text-indigo-500/50 transition-colors" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="text-2xl font-black text-white italic tracking-tighter uppercase">
                                                    {demand.brand} {demand.model}
                                                </h4>
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                                    demand.status === 'pending' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                                )}>
                                                    {demand.status === 'pending' ? "BUSCANDO" : "COMPLETADO"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">Años: <span className="text-zinc-300">{demand.year_min} - {demand.year_max}</span></p>
                                                <span className="h-1 w-1 bg-zinc-800 rounded-full" />
                                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">Presupuesto: <span className="text-emerald-500">${demand.budget_min?.toLocaleString()} - ${demand.budget_max?.toLocaleString()}</span></p>
                                                <span className="h-1 w-1 bg-zinc-800 rounded-full" />
                                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">Ubicación: <span className="text-zinc-300">{demand.location || 'N/A'}</span></p>
                                            </div>
                                            {demand.notes && (
                                                <p className="mt-4 text-xs text-zinc-400 font-medium line-clamp-1 italic bg-zinc-950/50 px-4 py-2 rounded-xl border border-zinc-800 inline-block">
                                                    &quot;{demand.notes}&quot;
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <button 
                                            onClick={() => handleMatchDemand(demand.id)}
                                            disabled={actionLoading === demand.id}
                                            className="h-14 px-8 bg-zinc-800 text-zinc-300 text-xs font-black rounded-2xl hover:bg-zinc-700 transition-all uppercase tracking-widest border border-zinc-700 flex items-center gap-2"
                                        >
                                            {actionLoading === demand.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "MARCAR MATCH"}
                                        </button>

                                        <button className="h-14 w-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20">
                                            <ExternalLink className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                            {demandRequests.length === 0 && (
                                <div className="py-32 text-center border-2 border-dashed border-zinc-800 rounded-[3rem] bg-zinc-900/20">
                                    <MessageSquare className="h-12 w-12 text-zinc-800 mx-auto mb-4 opacity-50" />
                                    <p className="text-zinc-600 font-black uppercase tracking-[0.4em] italic">No hay solicitudes de auto activas</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

function SidebarItem({ icon: Icon, label, active, onClick, badge }: { 
    icon: any, 
    label: string, 
    active?: boolean, 
    onClick: () => void,
    badge?: string
}) {
    return (
        <button 
            onClick={onClick}
            className={cn(
                "w-full flex items-center justify-between px-6 py-4 rounded-[1.25rem] transition-all group relative overflow-hidden",
                active ? "bg-indigo-600 text-white shadow-[0_10px_30px_rgba(79,70,229,0.3)] scale-[1.02]" : "text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-300"
            )}
        >
            <div className="flex items-center gap-4 relative z-10">
                <Icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", active ? "text-white" : "text-zinc-500")} />
                <span className="text-xs font-black uppercase tracking-[0.1em]">{label}</span>
            </div>
            {badge && (
                <span className={cn(
                    "px-2.5 py-0.5 rounded-md text-[9px] font-black relative z-10",
                    active ? "bg-white/20 text-white" : "bg-zinc-800 text-zinc-500"
                )}>
                    {badge}
                </span>
            )}
            {active && <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />}
        </button>
    );
}

function KpiCard({ label, value, trend, icon: Icon, color, active = true, alert = false }: { 
    label: string, 
    value: string, 
    trend: string, 
    icon: any, 
    color: 'indigo' | 'emerald' | 'amber' | 'red',
    active?: boolean,
    alert?: boolean
}) {
    const colors = {
        indigo: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20 shadow-indigo-500/5",
        emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5",
        amber: "text-amber-500 bg-amber-500/10 border-amber-500/20 shadow-amber-500/5",
        red: "text-red-500 bg-red-500/10 border-red-500/20 shadow-red-500/5",
    };

    return (
        <div className={cn(
            "p-8 rounded-[2.5rem] border backdrop-blur-xl transition-all hover:scale-[1.02] hover:shadow-2xl relative overflow-hidden group",
            colors[color],
            alert && "animate-pulse border-amber-500/50"
        )}>
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                <Icon className="h-32 w-32" />
            </div>
            
            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="h-12 w-12 rounded-2xl bg-black/20 flex items-center justify-center border border-white/5">
                    <Icon className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 bg-black/20 px-3 py-1 rounded-full">{trend}</span>
            </div>
            
            <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 mb-1">{label}</p>
                <h4 className="text-4xl font-black text-white italic tracking-tighter uppercase">{value}</h4>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        PENDING: "bg-zinc-800 text-zinc-400 border-zinc-700",
        P2P_WAITING_PROOF: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        P2P_VALIDATED: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
        HANDOVER_SCHEDULED: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        RELEASED: "bg-emerald-600 text-white border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]",
        DISPUTED: "bg-red-500/10 text-red-500 border-red-500/20 animate-pulse",
    };

    const icons: Record<string, any> = {
        PENDING: Clock,
        P2P_WAITING_PROOF: CreditCard,
        P2P_VALIDATED: ShieldCheck,
        HANDOVER_SCHEDULED: Calendar,
        RELEASED: CheckCircle2,
        DISPUTED: AlertTriangle,
    };

    const Icon = icons[status] || Activity;

    const labels: Record<string, string> = {
        PENDING: "EN ESPERA",
        P2P_WAITING_PROOF: "ESPERANDO PAGO",
        P2P_VALIDATED: "PAGO VALIDADO",
        HANDOVER_SCHEDULED: "EN ENTREGA",
        RELEASED: "FINALIZADA",
        DISPUTED: "DISPUTA",
    };

    return (
        <div className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-[0.1em] transition-all",
            styles[status] || "bg-zinc-800 text-zinc-400 border-zinc-700"
        )}>
            <Icon className="h-3.5 w-3.5" />
            {labels[status] || status}
        </div>
    )
}
