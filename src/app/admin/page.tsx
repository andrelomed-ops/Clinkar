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
import { getLegalTransactionsAction, overrideTransactionStatusAction, validateCEPAction, registerCommissionPaymentAction, updateTransactionServicesAction, deleteTransactionAction } from "@/app/actions/transaction";
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

// Modular Views
import { AdminControlTower } from "@/components/admin/AdminControlTower";
import { AdminInventoryView } from "@/components/admin/AdminInventoryView";
import { AdminUserManagement } from "@/components/admin/AdminUserManagement";
import { AdminBillingView } from "@/components/admin/AdminBillingView";

type AdminView = 'CONTROL' | 'INVENTORY' | 'ARCHIVE' | 'INVESTORS' | 'USERS' | 'BILLING' | 'UPSELLS' | 'REFERRALS' | 'DEMANDS' | 'INSPECTOR' | 'LEGAL';

const ADMIN_VERSION = "6.0.2";

const VIEW_LABELS: Record<AdminView, string> = {
    'CONTROL': 'Torre de Control',
    'INVENTORY': 'Gestión de Inventario',
    'ARCHIVE': 'Archivo Histórico',
    'INVESTORS': 'Red de Inversionistas',
    'USERS': 'Control de Usuarios',
    'BILLING': 'Gestión de Cobranza',
    'UPSELLS': 'Servicios Upsell',
    'REFERRALS': 'Sistema de Referidos',
    'DEMANDS': 'Pedidos de Vehículos',
    'INSPECTOR': 'Inspecciones Técnicas',
    'LEGAL': 'Revisión Legal'
};

export default function AdminDashboardV6() {
    const supabase = createBrowserClient();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [inventory, setInventory] = useState<any[]>([]);
    const [investorApps, setInvestorApps] = useState<any[]>([]);
    const [view, setView] = useState<AdminView>('CONTROL');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
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
            setReferralPayouts(payouts || []);
            setDemandRequests(demands || []);
            setUsers(initialUsers || []);
            setAppointments(appts || []);

            const { data: currentInvestors } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'investor')
                .order('full_name', { ascending: true });
            
            setInvestorApps([
                ...(apps || []),
                ...(currentInvestors || []).map(i => ({
                    id: `active-${i.id}`,
                    full_name: i.full_name,
                    email: i.email,
                    status: 'approved',
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

            setStats({ gmv, pendingCommissions: pendingComm, activeHandovers: activeHO, conversionRate: 84, totalDemands: demands?.length || 0 });
        } catch (err: any) {
            setDebugError(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { loadData(); }, []);

    // Handlers
    const handleCreateCar = async (data: any) => {
        setActionLoading("CREATE");
        try {
            const res = await createCarAction(data);
            if (res.success) { toast.success("Vehículo publicado"); setIsCreateModalOpen(false); await loadData(); }
        } catch (e: any) { toast.error(e.message); } finally { setActionLoading(null); }
    };

    const handleUpdateCar = async (data: any) => {
        setActionLoading(editingCar.id);
        try {
            const res = await updateCarAction(editingCar.id, data);
            if (res.success) { toast.success("Vehículo actualizado"); setEditingCar(null); await loadData(); }
        } catch (e: any) { toast.error(e.message); } finally { setActionLoading(null); }
    };

    const handleDeleteCar = async (id: string) => {
        if (!window.confirm("¿Confirmar eliminación permanente?")) return;
        setActionLoading(id);
        try {
            const result = await deleteCarAction(id);
            if (result.success) { toast.success("Vehículo eliminado"); await loadData(); }
            else toast.error(result.message);
        } catch (err: any) { toast.error(err.message); } finally { setActionLoading(null); }
    };

    const handleSearchUsers = async () => {
        if (!userSearchQuery) return;
        setLoading(true);
        try {
            const results = await searchUsersAction(userSearchQuery);
            setUsers(results);
        } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
    };

    const handleUpdateUserRole = async (targetId: string, role: any, tier: any = null, location: any = null) => {
        try {
            const res = await updateUserRole(targetId, role, tier, location);
            if (res.success) { toast.success(`Usuario actualizado a ${role.toUpperCase()}`); await loadData(); }
        } catch (e: any) { toast.error(e.message); }
    };

    const handleRegisterPayment = async (txId: string, amount: number) => {
        try {
            const res = await registerCommissionPaymentAction(txId, { amount, method: 'DIRECT_TRANSFER' });
            if (res.success) { toast.success("Pago registrado"); await loadData(); }
        } catch (e: any) { toast.error(e.message); }
    };

    const handleValidateCEP = async (txId: string) => {
        setCepLoading(txId);
        try {
            // Passing mock data if none provided to prevent crash
            const res = await validateCEPAction(txId, { clave_rastreo: "SIMULATED-CEP-VALIDATION-OK" });
            if (res.success) { toast.success("CEP Validado"); await loadData(); }
        } catch (e: any) { toast.error(e.message); } finally { setCepLoading(null); }
    };

    const handleOverrideStatus = async (txId: string, status: string) => {
        try {
            const res = await overrideTransactionStatusAction(txId, status);
            if (res.success) { toast.success(`Estatus forzado a ${status}`); await loadData(); }
        } catch (e: any) { toast.error(e.message); }
    };
    const handleDeleteTransaction = async (txId: string) => {
        try {
            const res = await deleteTransactionAction(txId);
            if (res.success) {
                toast.success("Transacción eliminada correctamente");
                await loadData();
            } else {
                toast.error(res.message || "Error al eliminar");
            }
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    const handleMatchDemand = async (demandId: string) => {
        const carId = window.prompt("Ingresa el ID del vehículo para el Match:");
        if (!carId) return;
        try {
            const res = await matchDemandAction(demandId, carId);
            if (res.success) { toast.success("Match realizado correctamente"); await loadData(); }
        } catch (e: any) { toast.error(e.message); }
    };

    if (loading && transactions.length === 0) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Sincronizando Torre de Control...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-indigo-500/30">
            {/* Minimalist Top Nav */}
            <header className="h-20 border-b border-zinc-900 bg-black/50 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-[100]">
                <div className="flex items-center gap-6">
                    <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                        <Zap className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none">Control <span className="text-indigo-500">Tower</span></h1>
                        <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Version {ADMIN_VERSION} • Admin Session</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-6">
                    <div className="hidden md:flex flex-col items-end">
                        <p className="text-[10px] font-black uppercase tracking-tight">{currentUser?.full_name || 'Admin StarterKar'}</p>
                        <p className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest">Súper Usuario Elite</p>
                    </div>
                    <button className="h-10 w-10 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800 hover:bg-zinc-800 transition-all">
                        <LogOut className="h-4 w-4 text-zinc-500" />
                    </button>
                </div>
            </header>

            <main className="flex min-h-[calc(100-5rem)]">
                {/* Left Sidebar */}
                <aside className="w-80 border-r border-zinc-900 p-8 hidden lg:block space-y-2 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto custom-scrollbar">
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-6 px-4">Operaciones Core</p>
                    <SidebarItem icon={LayoutDashboard} label="Monitor Live" active={view === 'CONTROL'} onClick={() => setView('CONTROL')} />
                    <SidebarItem icon={CarFront} label="Inventario" active={view === 'INVENTORY'} onClick={() => setView('INVENTORY')} />
                    <SidebarItem icon={Users} label="Usuarios" active={view === 'USERS'} onClick={() => setView('USERS')} />
                    <SidebarItem icon={DollarSign} label="Cobranza" active={view === 'BILLING'} onClick={() => setView('BILLING')} badge={transactions.filter(t => t.status === 'RELEASED' && !t.commission_paid).length} />
                    
                    <div className="h-px bg-zinc-900 my-8" />
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-6 px-4">Logística & Legal</p>
                    <SidebarItem icon={ShieldCheck} label="Revisión Legal" active={view === 'LEGAL'} onClick={() => setView('LEGAL')} />
                    <SidebarItem icon={CheckCircle2} label="Inspecciones" active={view === 'INSPECTOR'} onClick={() => setView('INSPECTOR')} />
                    <SidebarItem icon={ShoppingCart} label="Pedidos" active={view === 'DEMANDS'} onClick={() => setView('DEMANDS')} badge={demandRequests.filter(d => d.status === 'pending').length} />
                    <SidebarItem icon={Gift} label="Referidos" active={view === 'REFERRALS'} onClick={() => setView('REFERRALS')} badge={referralPayouts.length} />

                    <div className="h-px bg-zinc-900 my-8" />
                    <SidebarItem icon={FileText} label="Plantillas" active={view === 'ARCHIVE'} onClick={() => setView('ARCHIVE')} />
                    <button 
                        onClick={() => window.open('/admin/reports/annual', '_blank')}
                        className="w-full flex items-center gap-4 px-6 py-4 text-zinc-500 hover:bg-zinc-900 hover:text-white rounded-2xl transition-all"
                    >
                        <Activity className="h-5 w-5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Business Intelligence</span>
                    </button>
                </aside>

                {/* Main Content Area */}
                <div className="flex-1 p-8 md:p-12 max-w-7xl mx-auto overflow-x-hidden">
                    {debugError && (
                        <div className="mb-8 p-6 bg-red-900/20 border border-red-900/50 rounded-3xl flex items-center gap-4 text-red-500">
                            <AlertTriangle className="h-6 w-6" />
                            <p className="text-xs font-bold uppercase tracking-tight">{debugError}</p>
                        </div>
                    )}

                    {view === 'CONTROL' && (
                        <AdminControlTower 
                            stats={stats} 
                            transactions={transactions} 
                            onOverrideStatus={handleOverrideStatus}
                            onValidateCEP={handleValidateCEP}
                            onRegisterCommission={handleRegisterPayment}
                            onDeleteTransaction={handleDeleteTransaction}
                            cepLoading={cepLoading}
                        />
                    )}

                    {view === 'INVENTORY' && (
                        <AdminInventoryView 
                            inventory={inventory} 
                            actionLoading={actionLoading}
                            onEdit={setEditingCar}
                            onDelete={handleDeleteCar}
                            onCreate={() => setIsCreateModalOpen(true)}
                            onPrintCedula={(id) => window.open(`/admin/print/cedula/${id}`, '_blank')}
                        />
                    )}

                    {view === 'USERS' && (
                        <AdminUserManagement 
                            users={users}
                            searchQuery={userSearchQuery}
                            onSearchChange={setUserSearchQuery}
                            onSearch={handleSearchUsers}
                            onUpdateRole={handleUpdateUserRole}
                        />
                    )}

                    {view === 'BILLING' && (
                        <AdminBillingView 
                            transactions={transactions} 
                            onRegisterPayment={handleRegisterPayment} 
                        />
                    )}

                    {view === 'LEGAL' && (
                        <div className="animate-in fade-in duration-500">
                            <LegalReviewDashboard initialExpedientes={appointments.map(a => ({
                                id: a.id, 
                                carMake: a.car?.make || "N/A", 
                                carModel: a.car?.model || "N/A", 
                                carYear: a.car?.year || 0,
                                carId: a.car_id,
                                sellerName: a.seller?.full_name || "Desconocido", 
                                pldStatus: "PENDING", 
                                status: "PENDING_DOCS",
                                documents: []
                            }))} />
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

                    {view === 'DEMANDS' && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <div className="bg-zinc-900 p-10 rounded-[3rem] border border-zinc-800">
                                <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-8 text-indigo-500">Pedidos de Vehículos Activos</h3>
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

                    {view === 'ARCHIVE' && (
                        <div className="animate-in fade-in duration-500">
                            <TemplateDownloads />
                        </div>
                    )}
                </div>
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
