"use client";

import { useState, useEffect } from "react";
import { 
    Search, Filter, MoreHorizontal, CheckCircle2, Clock, 
    Ban, ShieldAlert, ExternalLink, Users, DollarSign, Loader2, 
    CarFront, LayoutDashboard, Zap, FileText, CreditCard, 
    ArrowUpRight, AlertTriangle, ShieldCheck, Download, 
    ChevronRight, Calendar, UserCheck, LogOut, Gift, Activity, MessageSquare,
    Trash2, Lock, Camera, Save, Upload as UploadIcon, XCircle, ShoppingCart,
    Printer
} from "lucide-react";
import { TechnicalInspectionForm } from "@/components/admin/TechnicalInspectionForm";
import { LegalReviewDashboard } from "@/components/admin/LegalReviewDashboard";
import { getLegalTransactionsAction, overrideTransactionStatusAction, validateCEPAction, registerCommissionPaymentAction, updateTransactionServicesAction } from "@/app/actions/transaction";
import { createCarAction, getAdminInventoryAction, deleteCarAction, updateCarAction, updateCarStatusAction } from "@/app/actions/cars";
import { 
    approveInvestorApplicationAction, rejectInvestorApplicationAction, 
    getInvestorApplicationsAction, getPendingReferralPayouts, 
    processReferralPayout, updateUserRole, searchUsersAction,
    matchDemandAction, getGlobalConcurrencyStatsAction, getRecentUsersAction
} from "@/app/actions/admin";
import { TemplateDownloads } from "@/components/admin/TemplateDownloads";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createBrowserClient } from "@/lib/supabase/client";
import { CarFormModal } from "@/components/admin/CarFormModal";

type AdminView = 'CONTROL' | 'INVENTORY' | 'ARCHIVE' | 'INVESTORS' | 'USERS' | 'BILLING' | 'UPSELLS' | 'REFERRALS' | 'DEMANDS' | 'INSPECTOR' | 'LEGAL';

const STATUS_MAP: Record<string, { label: string, color: string }> = {
    'published': { label: 'PUBLICADO', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
    'certified': { label: 'CERTIFICADO', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
    'reserved': { label: 'RESERVADO', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
    'sold': { label: 'VENDIDO', color: 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20' },
    'archived': { label: 'ARCHIVADO', color: 'text-red-500 bg-red-500/10 border-red-500/20' },
    'draft': { label: 'BORRADOR', color: 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20' },
    'legal_review': { label: 'REVISIÓN LEGAL', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
    'inspection_scheduled': { label: 'INSPECCIÓN PROG.', color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
    'pending_inspection': { label: 'EN REVISIÓN', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
    'PENDING': { label: 'PENDIENTE', color: 'text-amber-500' },
    'P2P_WAITING_PROOF': { label: 'ESPERANDO PAGO', color: 'text-amber-500' },
    'P2P_VALIDATED': { label: 'PAGO VALIDADO', color: 'text-emerald-500' },
    'HANDOVER_SCHEDULED': { label: 'ENTREGA PROG.', color: 'text-emerald-500' },
    'RELEASED': { label: 'FINALIZADO', color: 'text-zinc-400' },
    'CANCELLED': { label: 'CANCELADO', color: 'text-red-500' },
    'DISPUTED': { label: 'DISPUTA', color: 'text-red-500' }
};

const ADMIN_VERSION = "5.9.9";

export default function AdminDashboardV5() {
    const supabase = createBrowserClient();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [inventory, setInventory] = useState<any[]>([]);
    const [investorApps, setInvestorApps] = useState<any[]>([]);
    const [view, setView] = useState<AdminView>('CONTROL');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [showInspectorForm, setShowInspectorForm] = useState<string | null>(null);
    const [inspectorLocation, setInspectorLocation] = useState("");
    const [inspectorCoords, setInspectorCoords] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [editingCar, setEditingCar] = useState<any>(null);
    const [cepLoading, setCepLoading] = useState<string | null>(null);
    const [payoutLoading, setPayoutLoading] = useState<string | null>(null);
    const [selectedCarForReport, setSelectedCarForReport] = useState<string | null>(null);
    const [concurrencyStats, setConcurrencyStats] = useState<Record<string, {isLocked: boolean, interestedCount: number}>>({});
    const [referralPayouts, setReferralPayouts] = useState<any[]>([]);
    const [demandRequests, setDemandRequests] = useState<any[]>([]);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [userSearchQuery, setUserSearchQuery] = useState("");
    const [debugError, setDebugError] = useState<string | null>(null);
    
    const [stats, setStats] = useState({
        gmv: 0,
        pendingCommissions: 0,
        activeHandovers: 0,
        conversionRate: 84,
        totalDemands: 0
    });

    useEffect(() => {
        async function fetchUserRole() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                setCurrentUser(profile);
                if (profile?.role === 'inspector') setView('INSPECTOR');
            }
        }
        fetchUserRole();
    }, [supabase]);

    async function loadData() {
        setLoading(true);
        setDebugError(null);
        try {
            const [cars, txs, apps, payouts, demands, initialUsers, appts] = await Promise.all([
                getAdminInventoryAction().catch(() => []),
                getLegalTransactionsAction().catch(() => []),
                getInvestorApplicationsAction().catch(() => []),
                getPendingReferralPayouts().catch(() => []),
                supabase.from('demand_registry')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .then(res => res.data || [])
                    .catch(() => []),
                getRecentUsersAction().catch(() => []),
                supabase.from('inspection_appointments')
                    .select('*, car:cars(make, model, year), seller:profiles!seller_id(full_name), inspector:profiles!inspector_id(full_name)')
                    .order('scheduled_date', { ascending: true })
                    .then(res => res.data || [])
                    .catch(() => [])
            ]);
            
            setInventory(cars || []);
            setTransactions(txs || []);
            setInvestorApps(apps || []);
            setReferralPayouts(payouts || []);
            setDemandRequests(demands?.data || []);
            setUsers(initialUsers || []);
            setAppointments(appts?.data || []);

            // Also fetch all current investors
            const { data: currentInvestors } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'investor')
                .order('full_name', { ascending: true });
            
            // Merge applications with active investors for the panel
            // This is a simplified approach; in a real app you'd want better mapping
            setInvestorApps(prev => [
                ...(apps || []),
                ...(currentInvestors || []).map(i => ({
                    id: `active-${i.id}`,
                    full_name: i.full_name,
                    email: i.email,
                    status: 'approved', // Mark them as approved since they have the role
                    tier_id: i.investor_tier,
                    is_active_role: true,
                    user_id: i.id
                }))
            ]);

            const statsData = await getGlobalConcurrencyStatsAction();
            setConcurrencyStats(statsData);

            const txList = txs || [];
            const gmv = txList.reduce((acc: number, tx: any) => acc + (tx.car_price || 0), 0);
            const pendingComm = txList.filter((tx: any) => tx.status === 'RELEASED' && !tx.commission_paid).reduce((acc: number, tx: any) => acc + ((tx.car_price || 0) * 0.035), 0);
            const activeHO = txList.filter((tx: any) => tx.status === 'HANDOVER_SCHEDULED').length;

            setStats({ gmv, pendingCommissions: pendingComm, activeHandovers: activeHO, conversionRate: 84, totalDemands: demands?.data?.length || 0 });
        } catch (err: any) {
            setDebugError(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { loadData(); }, []);

    const handleDeleteCar = async (id: string) => {
        if (!window.confirm("¿Seguro que deseas eliminar este vehículo?")) return;
        setActionLoading(id);
        try {
            const result = await deleteCarAction(id);
            if (result.success) { toast.success("Vehículo eliminado"); await loadData(); }
            else toast.error(result.message);
        } catch (err: any) { toast.error(err.message); } finally { setActionLoading(null); }
    };

    const handleUpdateCarStatus = async (id: string, status: string) => {
        setActionLoading(id);
        try {
            const result = await updateCarStatusAction(id, status);
            if (result.success) { toast.success(`Estatus: ${status.toUpperCase()}`); await loadData(); }
        } catch (err: any) { toast.error(err.message); } finally { setActionLoading(null); }
    };

    const handleValidateCEP = async (transactionId: string) => {
        setCepLoading(transactionId);
        try {
            const result = await validateCEPAction(transactionId, { clave_rastreo: "CEP-AUTO-" + Math.random().toString(36).substring(7).toUpperCase() });
            if (result.success) { toast.success("SPEI Validado"); await loadData(); }
        } catch (err: any) { toast.error(err.message); } finally { setCepLoading(null); }
    };

    const cycleStatus = async (txId: string, currentStatus: string) => {
        const nextStatus = currentStatus === 'P2P_VALIDATED' ? 'HANDOVER_SCHEDULED' : currentStatus === 'HANDOVER_SCHEDULED' ? 'RELEASED' : null;
        if (!nextStatus) return;
        setActionLoading(txId);
        try {
            await overrideTransactionStatusAction(txId, nextStatus);
            toast.success(`Estatus: ${nextStatus}`);
            await loadData();
        } catch (err) { toast.error("Error al actualizar"); } finally { setActionLoading(null); }
    };

    const handleSearchUsers = async () => {
        if (!userSearchQuery) return;
        setLoading(true);
        try { const results = await searchUsersAction(userSearchQuery); setUsers(results); } 
        catch (err: any) { toast.error("Error de búsqueda"); } finally { setLoading(false); }
    };

    const handleUpdateUserRole = async (userId: string, newRole: any, tier: any = null, location: string | null = null, coordinates: any = null) => {
        setActionLoading(userId);
        try {
            await updateUserRole(userId, newRole, tier, location, coordinates);
            toast.success("Rol actualizado");
            await handleSearchUsers();
        } catch (err: any) { toast.error(err.message); } finally { setActionLoading(null); }
    };

    const handleUpdateCar = async (updatedData: any) => {
        setActionLoading(editingCar.id);
        try {
            await updateCarAction(editingCar.id, updatedData);
            toast.success("Actualizado");
            setEditingCar(null);
            await loadData();
        } catch (err: any) { toast.error(err.message); } finally { setActionLoading(null); }
    };

    const handleCreateCar = async (carData: any) => {
        setActionLoading("CREATE");
        try {
            await createCarAction(carData);
            toast.success("Publicado");
            setIsCreateModalOpen(false);
            await loadData();
        } catch (err: any) { toast.error(err.message); } finally { setActionLoading(null); }
    };

    const handleMatchDemand = async (demandId: string) => {
        const carId = window.prompt("ID del vehículo:");
        if (!carId) return;
        setActionLoading(demandId);
        try { await matchDemandAction(demandId, carId); toast.success("Match realizado"); await loadData(); }
        catch (err: any) { toast.error(err.message); } finally { setActionLoading(null); }
    };

    const handleRegisterPayment = async (txId: string, amount: number) => {
        const method = window.prompt("Método de pago (SPEI, Efectivo, etc.):", "SPEI");
        if (!method) return;
        setActionLoading(txId);
        try {
            const res = await registerCommissionPaymentAction(txId, { method, amount });
            if (res.success) {
                toast.success("Pago registrado con éxito");
                await loadData();
            } else {
                toast.error(res.message || "Error al registrar pago");
            }
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="flex min-h-screen bg-zinc-950 text-white font-sans selection:bg-indigo-500/30">
            <aside className="w-72 border-r border-zinc-800 flex flex-col p-6 fixed h-screen bg-zinc-950/50 backdrop-blur-xl z-20">
                <div className="mb-12 px-2">
                    <h1 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-2">
                        <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center italic text-white text-xl">S</div>
                        StarterKar <span className="text-[10px] bg-indigo-600/20 text-indigo-400 px-2 py-0.5 rounded-full not-italic tracking-widest font-black border border-indigo-500/30 ml-1">v{ADMIN_VERSION}</span>
                    </h1>
                </div>
                <nav className="space-y-1 flex-1">
                    <SidebarItem icon={Zap} label="Control" active={view === 'CONTROL'} onClick={() => setView('CONTROL')} />
                    <SidebarItem icon={CarFront} label="Inventario" active={view === 'INVENTORY'} onClick={() => setView('INVENTORY')} />
                    <SidebarItem icon={UserCheck} label="Inversionistas" active={view === 'INVESTORS'} onClick={() => setView('INVESTORS')} badge={investorApps.filter(a => a.status === 'pending').length.toString()} />
                    <SidebarItem icon={Users} label="Usuarios" active={view === 'USERS'} onClick={() => setView('USERS')} />
                    <SidebarItem icon={FileText} label="Legales" active={view === 'LEGAL'} onClick={() => setView('LEGAL')} badge={appointments.filter(a => a.status === 'PENDING').length.toString()} />
                    <SidebarItem icon={ShieldCheck} label="Inspecciones" active={view === 'INSPECTOR'} onClick={() => setView('INSPECTOR')} />
                    <SidebarItem icon={CreditCard} label="Cobranza" active={view === 'BILLING'} onClick={() => setView('BILLING')} />
                    <SidebarItem icon={Gift} label="Referidos" active={view === 'REFERRALS'} onClick={() => setView('REFERRALS')} />
                    <SidebarItem icon={MessageSquare} label="Demandas" active={view === 'DEMANDS'} onClick={() => setView('DEMANDS')} />
                </nav>
                <button onClick={async () => { await supabase.auth.signOut(); window.location.href='/login'; }} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-zinc-500 hover:bg-red-500/10 hover:text-red-500 transition-all">
                    <LogOut className="h-5 w-5" /> <span className="text-xs font-black uppercase">Salir</span>
                </button>
            </aside>

            <main className="flex-1 ml-72 p-12">
                <header className="flex justify-between items-center mb-12">
                    <h2 className="text-4xl font-black uppercase italic tracking-tighter">{view}</h2>
                    <div className="flex gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                            <input className="h-12 w-64 bg-zinc-900 border border-zinc-800 rounded-xl pl-12 pr-4 text-xs font-bold" placeholder="Buscar..." />
                        </div>
                        <button onClick={() => window.location.reload()} className="h-12 px-6 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] font-black uppercase">Recargar</button>
                    </div>
                </header>

                {view === 'CONTROL' && (
                    <div className="space-y-12 animate-in fade-in duration-500">
                        <div className="grid grid-cols-5 gap-6">
                            <KpiCard label="GMV" value={`$${(stats.gmv/1000000).toFixed(1)}M`} trend="+12%" icon={DollarSign} color="indigo" />
                            <KpiCard label="Entregas" value={stats.activeHandovers.toString()} trend="HOY" icon={Calendar} color="emerald" />
                            <KpiCard label="Demandas" value={stats.totalDemands.toString()} trend="ACTIVA" icon={MessageSquare} color="indigo" />
                            <KpiCard label="Cuentas" value={`$${(stats.pendingCommissions/1000).toFixed(0)}K`} trend="PENDIENTE" icon={AlertTriangle} color="amber" alert />
                            <KpiCard label="Cierre" value={`${stats.conversionRate}%`} trend="OPTIMO" icon={Zap} color="indigo" />
                        </div>

                        <TemplateDownloads />

                        <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-10">
                            <h3 className="text-xl font-black uppercase italic mb-8">Triage de Operaciones</h3>
                            <div className="space-y-4">
                                {transactions.filter(tx => tx.status === 'P2P_WAITING_PROOF' || tx.status === 'HANDOVER_SCHEDULED').map(tx => (
                                    <div key={tx.id} className="p-6 bg-zinc-950 border border-zinc-800 rounded-3xl flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">{tx.status}</p>
                                            <h4 className="text-lg font-black italic">{tx.cars?.make} {tx.cars?.model}</h4>
                                        </div>
                                        <div className="flex gap-3">
                                            {tx.status === 'P2P_WAITING_PROOF' ? (
                                                <button onClick={() => handleValidateCEP(tx.id)} className="h-12 px-6 bg-indigo-600 text-white text-[10px] font-black rounded-xl">VALIDAR CEP</button>
                                            ) : (
                                                <button onClick={() => cycleStatus(tx.id, tx.status)} className="h-12 px-6 bg-emerald-600 text-white text-[10px] font-black rounded-xl">FINALIZAR</button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {view === 'INVENTORY' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="flex justify-between items-center bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
                            <h3 className="text-xl font-black uppercase italic">Gestión de Stock</h3>
                            <button onClick={() => setIsCreateModalOpen(true)} className="h-14 px-8 bg-indigo-600 text-white text-xs font-black rounded-xl">AGREGAR UNIDAD</button>
                        </div>
                        <div className="grid grid-cols-3 gap-8">
                            {inventory.map(car => (
                                <div key={car.id} className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden">
                                    <div className="h-48 bg-zinc-950 relative">
                                        {car.images?.[0] && <img src={car.images[0]} className="w-full h-full object-cover" />}
                                        <div className="absolute top-4 left-4">
                                            <span className={cn("px-3 py-1 rounded-full text-[8px] font-black border uppercase", STATUS_MAP[car.status?.toLowerCase()]?.color)}>{car.status}</span>
                                        </div>
                                    </div>
                                    <div className="p-8">
                                        <h4 className="text-lg font-black italic">{car.make} {car.model}</h4>
                                        <p className="text-[10px] font-bold text-zinc-500 mt-1 uppercase">{car.year} • {car.location}</p>
                                        
                                        {car.reconditioning_notes && (
                                            <div className="mt-4 flex items-center gap-2 text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 w-fit uppercase">
                                                <ShieldCheck className="h-3 w-3" /> Justicia & Certeza
                                            </div>
                                        )}

                                        <p className="text-2xl font-black mt-4">${car.price?.toLocaleString()}</p>
                                        <div className="flex gap-2 mt-6">
                                            <button 
                                                onClick={() => setEditingCar(car)}
                                                className="flex-1 h-12 bg-zinc-800 text-white text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-indigo-600 transition-all border border-zinc-700 hover:border-indigo-500 group/btn flex items-center justify-center gap-2 shadow-xl shadow-black/20"
                                            >
                                                <FileText className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                                                EDITAR
                                            </button>
                                            <button 
                                                onClick={() => window.open(`/admin/print/cedula/${car.id}`, '_blank')}
                                                className="h-12 w-12 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all"
                                                title="Imprimir Cédula de Certeza"
                                            >
                                                <Printer className="h-4 w-4" />
                                            </button>
                                            <button 
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleDeleteCar(car.id);
                                                }}
                                                disabled={actionLoading === car.id}
                                                className="h-12 w-12 bg-red-900/10 border border-red-900/30 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                                                title="Eliminar Vehículo"
                                            >
                                                {actionLoading === car.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {view === 'USERS' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="bg-zinc-900 p-10 rounded-[3rem] border border-zinc-800 space-y-6">
                            <h3 className="text-2xl font-black uppercase italic tracking-tighter">Control de Accesos & Suscripciones</h3>
                            <div className="flex gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                                    <input 
                                        value={userSearchQuery} 
                                        onChange={e => setUserSearchQuery(e.target.value)} 
                                        className="w-full h-16 bg-zinc-950 border border-zinc-800 rounded-2xl px-12 text-sm font-bold focus:border-indigo-500 transition-all outline-none" 
                                        placeholder="Buscar por correo, nombre o ID..." 
                                    />
                                </div>
                                <button onClick={handleSearchUsers} className="h-16 px-10 bg-white text-black font-black rounded-2xl text-xs uppercase hover:bg-indigo-500 hover:text-white transition-all active:scale-95 shadow-xl shadow-white/5">Buscar</button>
                            </div>
                        </div>
                        
                        <div className="grid gap-4">
                            {users.map(u => (
                                <div key={u.id} className="p-8 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] flex items-center justify-between group hover:border-zinc-700 transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className={cn(
                                            "h-16 w-16 rounded-2xl flex items-center justify-center border transition-all group-hover:scale-110",
                                            u.role === 'admin' ? "bg-indigo-600/10 border-indigo-500/20 text-indigo-500" :
                                            u.role === 'investor' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                                            u.role === 'inspector' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                                            "bg-zinc-950 border-zinc-800 text-zinc-500"
                                        )}>
                                            <Users className="h-8 w-8" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black italic tracking-tight">{u.full_name || 'Sin Nombre'}</h4>
                                            <p className="text-[11px] font-black text-indigo-400 uppercase tracking-widest mt-1">{u.email || u.id}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="px-2 py-0.5 rounded bg-zinc-950 text-[9px] font-black text-zinc-500 border border-zinc-800 uppercase">{u.role}</span>
                                                {u.role === 'investor' && (
                                                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-[9px] font-black text-amber-500 border border-amber-500/20 uppercase">TIER: {u.investor_tier || 'STARTER'}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {/* Quick Role Actions */}
                                        <div className="flex bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800 gap-1">
                                            <button 
                                                onClick={() => handleUpdateUserRole(u.id, 'admin')} 
                                                className={cn("h-10 px-4 text-[9px] font-black rounded-xl uppercase transition-all", u.role === 'admin' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-zinc-600 hover:text-zinc-300")}
                                            >ADMIN</button>
                                            <button 
                                                onClick={() => handleUpdateUserRole(u.id, 'inspector', null, u.location || 'CDMX')} 
                                                className={cn("h-10 px-4 text-[9px] font-black rounded-xl uppercase transition-all", u.role === 'inspector' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "text-zinc-600 hover:text-zinc-300")}
                                            >MECÁNICO</button>
                                            <button 
                                                onClick={() => handleUpdateUserRole(u.id, 'buyer')} 
                                                className={cn("h-10 px-4 text-[9px] font-black rounded-xl uppercase transition-all", u.role === 'buyer' ? "bg-zinc-800 text-white" : "text-zinc-600 hover:text-zinc-300")}
                                            >COMPRADOR</button>
                                        </div>

                                        {/* Specialized Investor Action */}
                                        <div className="flex flex-col gap-1">
                                            <button 
                                                onClick={() => {
                                                    const tier = window.prompt("Selecciona Tier: starter, pro, elite", u.investor_tier || "starter");
                                                    if (tier) handleUpdateUserRole(u.id, 'investor', tier.toLowerCase());
                                                }}
                                                className={cn(
                                                    "h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2",
                                                    u.role === 'investor' ? "bg-amber-500 text-black shadow-xl shadow-amber-500/20" : "bg-zinc-800 text-zinc-400 hover:bg-amber-500 hover:text-black"
                                                )}
                                            >
                                                <Zap className="h-4 w-4" />
                                                INVERSIONISTA
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {view === 'LEGAL' && (
                    <div className="animate-in fade-in duration-500">
                        <LegalReviewDashboard initialExpedientes={appointments.map(a => ({
                            id: a.id, carMake: a.car?.make || "N/A", carModel: a.car?.model || "N/A", carYear: a.car?.year || 0,
                            sellerName: a.seller?.full_name || "Desconocido", pldStatus: "PENDING", status: "PENDING_DOCS"
                        }))} />
                    </div>
                )}

                {view === 'INVESTORS' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="bg-zinc-900 p-10 rounded-[3rem] border border-zinc-800">
                            <div className="flex justify-between items-end mb-8">
                                <div>
                                    <h3 className="text-2xl font-black uppercase italic tracking-tighter">Red de Capital (Inversionistas)</h3>
                                    <p className="text-xs font-bold text-zinc-500 mt-2 uppercase tracking-widest">Gestión de solicitudes para el programa de inversión StarterKar.</p>
                                </div>
                                <div className="flex gap-2">
                                    <span className="px-4 py-2 bg-indigo-600/10 text-indigo-400 text-[10px] font-black rounded-lg border border-indigo-500/20">TOTAL: {investorApps.length}</span>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                {investorApps.length > 0 ? investorApps.map(app => (
                                    <div key={app.id} className="p-6 bg-zinc-950 border border-zinc-800 rounded-3xl flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                                        <div className="flex items-center gap-6">
                                            <div className={cn(
                                                "h-14 w-14 rounded-2xl flex items-center justify-center border font-black text-xl",
                                                app.status === 'approved' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                                            )}>
                                                {app.full_name?.[0] || "?"}
                                            </div>
                                            <div>
                                                <h4 className="font-black italic text-lg">{app.full_name}</h4>
                                                <div className="flex gap-3 mt-1">
                                                    <p className="text-[10px] font-bold text-zinc-500 uppercase">{app.email}</p>
                                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-600/10 px-2 py-0.5 rounded">TIER: {app.tier_id || 'STARTER'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {app.status === 'pending' ? (
                                                <>
                                                    <button 
                                                        onClick={() => approveInvestorApplicationAction(app.id).then(() => { toast.success("Aprobado"); loadData(); })}
                                                        className="h-10 px-6 bg-emerald-600 text-white text-[9px] font-black rounded-lg uppercase tracking-widest"
                                                    >
                                                        APROBAR
                                                    </button>
                                                    <button 
                                                        onClick={() => rejectInvestorApplicationAction(app.id).then(() => { toast.success("Rechazado"); loadData(); })}
                                                        className="h-10 px-6 bg-red-600/10 text-red-500 text-[9px] font-black rounded-lg border border-red-500/20 uppercase tracking-widest"
                                                    >
                                                        RECHAZAR
                                                    </button>
                                                </>
                                            ) : (
                                                <span className="px-4 py-2 bg-emerald-500/10 text-emerald-500 text-[9px] font-black rounded-lg border border-emerald-500/20 uppercase tracking-widest">ACTIVO</span>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-20 text-center border-2 border-dashed border-zinc-800 rounded-[3rem]">
                                        <Users className="h-12 w-12 text-zinc-800 mx-auto mb-4" />
                                        <p className="text-sm font-black text-zinc-500 uppercase tracking-widest">No hay solicitudes de inversionistas</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {view === 'BILLING' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="bg-zinc-900 p-10 rounded-[3rem] border border-zinc-800">
                            <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-8">Recaudación de Success Fees (3.5%)</h3>
                            <div className="space-y-4">
                                {transactions.filter(tx => tx.status === 'RELEASED').map(tx => (
                                    <div key={tx.id} className="p-8 bg-zinc-950 border border-zinc-800 rounded-[2.5rem] flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                                        <div className="flex items-center gap-6">
                                            <div className={cn(
                                                "h-16 w-16 rounded-2xl flex items-center justify-center border",
                                                tx.commission_paid ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                                            )}>
                                                <DollarSign className="h-8 w-8" />
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-black italic">{tx.cars?.make} {tx.cars?.model}</h4>
                                                <div className="flex gap-4 mt-1">
                                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">PRECIO: ${tx.car_price?.toLocaleString()}</p>
                                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">COMISIÓN: ${(tx.car_price * 0.035).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {tx.commission_paid ? (
                                                <div className="text-right">
                                                    <span className="px-4 py-2 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-lg border border-emerald-500/20 uppercase tracking-widest">PAGADO</span>
                                                    <p className="text-[9px] font-bold text-zinc-600 mt-2 uppercase">{tx.commission_payment_method} • {new Date(tx.commission_payment_date).toLocaleDateString()}</p>
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={() => handleRegisterPayment(tx.id, tx.car_price * 0.035)}
                                                    className="h-14 px-8 bg-indigo-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20"
                                                >
                                                    REGISTRAR PAGO
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {view === 'REFERRALS' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="bg-zinc-900 p-10 rounded-[3rem] border border-zinc-800">
                            <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-8">Programa de Referidos</h3>
                            <div className="grid grid-cols-1 gap-4">
                                {referralPayouts.length > 0 ? referralPayouts.map(payout => (
                                    <div key={payout.id} className="p-6 bg-zinc-950 border border-zinc-800 rounded-3xl flex items-center justify-between">
                                        <div>
                                            <h4 className="font-black italic uppercase">{payout.referrer_name}</h4>
                                            <p className="text-[10px] font-bold text-zinc-500 uppercase">Referido: {payout.referee_name}</p>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                setPayoutLoading(payout.id);
                                                processReferralPayout(payout.id, 500, `Pago por referir a ${payout.referee_name}`)
                                                    .then(res => {
                                                        if (res.success) toast.success("Pago procesado");
                                                        loadData();
                                                    })
                                                    .finally(() => setPayoutLoading(null));
                                            }}
                                            disabled={payoutLoading === payout.id}
                                            className="h-12 px-8 bg-indigo-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest disabled:opacity-50"
                                        >
                                            {payoutLoading === payout.id ? "PROCESANDO..." : "PAGAR $500"}
                                        </button>
                                    </div>
                                )) : (
                                    <div className="p-20 text-center border-2 border-dashed border-zinc-800 rounded-[3rem]">
                                        <Gift className="h-12 w-12 text-zinc-800 mx-auto mb-4" />
                                        <p className="text-sm font-black text-zinc-500 uppercase tracking-widest">No hay pagos de referidos pendientes</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {view === 'DEMANDS' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="bg-zinc-900 p-10 rounded-[3rem] border border-zinc-800">
                            <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-8">Demandas de Compra</h3>
                            <div className="space-y-4">
                                {demandRequests.map(demand => (
                                    <div key={demand.id} className="p-6 bg-zinc-950 border border-zinc-800 rounded-3xl flex items-center justify-between">
                                        <div>
                                            <h4 className="font-black italic uppercase">{demand.make} {demand.model}</h4>
                                            <p className="text-[10px] font-bold text-zinc-500 uppercase">Presupuesto: ${demand.budget?.toLocaleString()} • {demand.status}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            {demand.status === 'pending' && (
                                                <button 
                                                    onClick={() => handleMatchDemand(demand.id)}
                                                    className="h-12 px-6 bg-indigo-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest"
                                                >
                                                    HACER MATCH
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {view === 'INSPECTOR' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="grid gap-6">
                            {appointments.map(appt => (
                                <div key={appt.id} className="p-8 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="h-16 w-16 bg-zinc-950 rounded-2xl flex items-center justify-center border border-zinc-800"><CarFront className="h-8 w-8 text-zinc-800" /></div>
                                        <div>
                                            <h4 className="text-xl font-black italic">{appt.car?.make} {appt.car?.model}</h4>
                                            <p className="text-[10px] font-bold text-zinc-500 uppercase">{new Date(appt.scheduled_date).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedCarForReport(appt.car_id)} className="h-14 px-8 bg-emerald-600 text-white text-xs font-black rounded-xl">GESTIONAR REPORTE</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            <CarFormModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSubmit={handleCreateCar} isLoading={actionLoading === "CREATE"} mode="create" />
            {editingCar && <CarFormModal isOpen={!!editingCar} onClose={() => setEditingCar(null)} onSubmit={handleUpdateCar} initialData={editingCar} isLoading={actionLoading === editingCar.id} mode="edit" />}
            
            {selectedCarForReport && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                    <div className="w-full max-w-4xl relative">
                        <button onClick={() => setSelectedCarForReport(null)} className="absolute -top-12 right-0 text-white/50 hover:text-white uppercase text-[10px] font-black tracking-widest flex items-center gap-2"><XCircle className="h-5 w-5" /> CERRAR</button>
                        <TechnicalInspectionForm carId={selectedCarForReport} onSave={() => { setSelectedCarForReport(null); loadData(); }} />
                    </div>
                </div>
            )}
        </div>
    );
}

function SidebarItem({ icon: Icon, label, active, onClick, badge }: any) {
    return (
        <button onClick={onClick} className={cn("w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all group", active ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20" : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300")}>
            <div className="flex items-center gap-4"><Icon className="h-5 w-5" /><span className="text-[10px] font-black uppercase tracking-widest">{label}</span></div>
            {badge && <span className="h-5 w-5 flex items-center justify-center bg-black/20 rounded-full text-[9px] font-black">{badge}</span>}
        </button>
    );
}

function KpiCard({ label, value, trend, icon: Icon, color, alert }: any) {
    return (
        <div className={cn("p-8 rounded-[2.5rem] border backdrop-blur-md relative overflow-hidden group transition-all hover:scale-105", alert ? "bg-amber-500/10 border-amber-500/20" : "bg-zinc-900/40 border-zinc-800")}>
            <Icon className={cn("h-6 w-6 mb-6", alert ? "text-amber-500" : `text-indigo-500`)} />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{label}</p>
            <h4 className="text-3xl font-black italic tracking-tighter mt-1 text-white">{value}</h4>
            <p className={cn("text-[9px] font-black uppercase tracking-widest mt-2", alert ? "text-amber-500" : "text-emerald-500")}>{trend}</p>
        </div>
    );
}
