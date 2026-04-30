"use client";

import { 
    Activity, DollarSign, Clock, CheckCircle2, MoreHorizontal, ExternalLink, ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_MAP } from "@/lib/status-map";

interface AdminControlTowerProps {
    stats: any;
    transactions: any[];
    onOverrideStatus: (id: string, status: string) => void;
    onValidateCEP: (id: string) => void;
    onRegisterCommission: (id: string) => void;
    onDeleteTransaction: (id: string) => void;
    cepLoading: string | null;
}

export function AdminControlTower({
    stats,
    transactions,
    onOverrideStatus,
    onValidateCEP,
    onRegisterCommission,
    onDeleteTransaction,
    cepLoading
}: AdminControlTowerProps) {
    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Real-time Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="GMV Operativo" 
                    value={`$${(stats.gmv / 1000000).toFixed(1)}M`} 
                    icon={<DollarSign className="h-6 w-6" />}
                    color="text-indigo-500"
                />
                <StatCard 
                    title="Comisiones Pendientes" 
                    value={`$${(stats.pendingCommissions / 1000).toFixed(1)}K`} 
                    icon={<Activity className="h-6 w-6" />}
                    color="text-amber-500"
                />
                <StatCard 
                    title="Entregas Activas" 
                    value={stats.activeHandovers} 
                    icon={<Clock className="h-6 w-6" />}
                    color="text-emerald-500"
                />
                <div className="bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-800 flex flex-col justify-between group hover:border-indigo-500/30 transition-all cursor-help" title="Monitor de estabilidad del sistema">
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-14 w-14 rounded-2xl flex items-center justify-center bg-zinc-950 border border-zinc-800 text-emerald-500 group-hover:scale-110 transition-transform">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[8px] font-black rounded uppercase">Live</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Sistema Health</p>
                        <p className="text-4xl font-black italic uppercase tracking-tighter text-white">Optimal</p>
                    </div>
                </div>
            </div>

            {/* Live Transactions Feed */}
            <div className="bg-zinc-900 rounded-[3rem] border border-zinc-800 overflow-hidden shadow-2xl">
                <div className="p-10 border-b border-zinc-800 flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-black uppercase italic tracking-tighter">Monitor Transaccional Live</h3>
                        <p className="text-xs font-bold text-zinc-500 mt-1 uppercase tracking-widest">Sincronización P2P en tiempo real.</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-zinc-800 bg-zinc-950/50">
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Unidad</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Monto</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Estatus</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Comisión</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {transactions.map((tx) => (
                                <tr key={tx.id} className="group hover:bg-zinc-800/30 transition-colors">
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 bg-zinc-800 rounded-xl overflow-hidden">
                                                <img src={tx.cars?.images?.[0] || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80'} className="w-full h-full object-cover" alt="" />
                                            </div>
                                            <div>
                                                <p className="font-black text-sm uppercase italic">{tx.cars?.make || 'Auto'} {tx.cars?.model || 'Desconocido'}</p>
                                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Folio: #{tx.id.slice(0, 8)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <p className="font-black text-zinc-300 tracking-tighter">${(tx.car_price || 0).toLocaleString()}</p>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex flex-col gap-1.5">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[9px] font-black border w-fit uppercase tracking-widest",
                                                STATUS_MAP[tx.status]?.color || 'bg-zinc-800 border-zinc-700 text-zinc-500'
                                            )}>
                                                {STATUS_MAP[tx.status]?.label || tx.status}
                                            </span>
                                            {tx.cep_url && (
                                                <a href={tx.cep_url} target="_blank" className="text-[8px] font-black text-emerald-500 hover:underline flex items-center gap-1 uppercase">
                                                    <ExternalLink className="h-2 w-2" /> CEP Validado
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        {tx.status === 'RELEASED' ? (
                                            tx.commission_paid ? (
                                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Pagada ✅</span>
                                            ) : (
                                                <button 
                                                    onClick={() => onRegisterCommission(tx.id)}
                                                    className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[9px] font-black rounded-lg hover:bg-amber-500 hover:text-black transition-all uppercase"
                                                >
                                                    Registrar $ {(tx.car_price * 0.035).toLocaleString()}
                                                </button>
                                            )
                                        ) : (
                                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">Por Liquidar</span>
                                        )}
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => onValidateCEP(tx.id)}
                                                disabled={cepLoading === tx.id || !!tx.cep_url}
                                                className="h-10 px-4 bg-zinc-950 border border-zinc-800 text-[9px] font-black rounded-lg uppercase tracking-widest hover:border-indigo-500 transition-all disabled:opacity-50"
                                            >
                                                {cepLoading === tx.id ? "..." : "Validar CEP"}
                                            </button>
                                            <div className="relative group/menu">
                                                <button className="h-10 w-10 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center justify-center hover:bg-zinc-800 transition-all">
                                                    <MoreHorizontal className="h-4 w-4 text-zinc-500" />
                                                </button>
                                                <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-50 p-2">
                                                    <button onClick={() => onOverrideStatus(tx.id, 'P2P_VALIDATED')} className="w-full text-left p-3 text-[9px] font-black uppercase text-emerald-500 hover:bg-zinc-900 rounded-lg">Forzar Validación</button>
                                                    <button onClick={() => onOverrideStatus(tx.id, 'RELEASED')} className="w-full text-left p-3 text-[9px] font-black uppercase text-indigo-500 hover:bg-zinc-900 rounded-lg">Finalizar Trato</button>
                                                    <div className="h-px bg-zinc-800 my-1" />
                                                    <button 
                                                        onClick={() => {
                                                            if (window.confirm("¿Estás seguro de eliminar este registro transaccional? Esta acción no se puede deshacer.")) {
                                                                onDeleteTransaction(tx.id);
                                                            }
                                                        }} 
                                                        className="w-full text-left p-3 text-[9px] font-black uppercase text-zinc-500 hover:bg-red-500 hover:text-white rounded-lg flex items-center gap-2 transition-colors"
                                                    >
                                                        <Trash2 className="h-3 w-3" /> Eliminar Registro
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
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

function StatCard({ title, value, icon, color }: any) {
    return (
        <div className="bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-800 shadow-2xl group hover:border-indigo-500/30 transition-all">
            <div className="flex items-center justify-between mb-4">
                <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center bg-zinc-950 border border-zinc-800 group-hover:scale-110 transition-transform", color)}>
                    {icon}
                </div>
            </div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{title}</p>
            <p className="text-4xl font-black text-white italic tracking-tighter">{value}</p>
        </div>
    );
}
